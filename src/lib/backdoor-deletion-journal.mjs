const projects={beta:'nmbqtjnenjmqbzyagyie',dev:'ntytoytpniekxgidkqnt'};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const headers={'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'};
const reply=(status,value)=>new Response(JSON.stringify(value),{status,headers});

function isAnonKey(key,projectRef) {
    if(typeof key!=='string' || key.length>8192) return false;
    try {
        const parts=key.split('.');
        if(parts.length!==3 || !parts.every(part=>/^[A-Za-z0-9_-]+$/.test(part)) || parts[2].length!==43) return false;
        const header=JSON.parse(Buffer.from(parts[0],'base64url').toString('utf8'));
        const claims=JSON.parse(Buffer.from(parts[1],'base64url').toString('utf8'));
        return header.alg==='HS256' && header.typ==='JWT' && claims.iss==='supabase' && claims.role==='anon' &&
            claims.ref===projectRef && !claims.sub && !claims.session_id;
    } catch {return false;}
}

export function deletionJournalConfig(env,allowLocal=false) {
    if(env.BACKDOOR_MAP_JOURNAL_ENABLED!=='true') return null;
    const target=env.BACKDOOR_MAP_JOURNAL_TARGET;
    if(target==='beta' ? env.CONTEXT!=='production' :
        target!=='dev' || (!allowLocal && env.CONTEXT!=='deploy-preview')) return null;
    const key=env.BACKDOOR_MAP_JOURNAL_ANON_KEY;
    if(!isAnonKey(key,projects[target])) return null;
    return {target,projectRef:projects[target],url:`https://${projects[target]}.supabase.co`,key};
}

async function jsonBody(request) {
    if(!request.body) throw new Error('missing body');
    const reader=request.body.getReader(); let size=0; const chunks=[];
    try {
        while(true) {
            const next=await reader.read(); if(next.done) break;
            size+=next.value.byteLength;
            if(size>256){await reader.cancel();throw new Error('oversized body');}
            chunks.push(next.value);
        }
    } finally {reader.releaseLock();}
    const bytes=new Uint8Array(size); let offset=0;
    for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
    return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
}

function validRecord(value,projectRef,userId,now) {
    return value && typeof value==='object' && !Array.isArray(value) &&
        Object.keys(value).sort().join(',')==='kind,projectRef,requestedAt,userId,version' &&
        value.version===1 && value.kind==='delete_intent' && value.projectRef===projectRef && value.userId===userId &&
        typeof value.requestedAt==='string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value.requestedAt) &&
        Number.isFinite(Date.parse(value.requestedAt)) && Date.parse(value.requestedAt)<=now &&
        new Date(value.requestedAt).toISOString()===value.requestedAt;
}

// Neither email, confirmation codes, JWTs nor private snapshots enter storage.
// This records an intent before hard deletion, including uncertain outcomes.
export function createDeletionJournalHandler(config,storeProvider,fetcher=fetch,now=Date.now) {
    return async request=>{
        if(request.method!=='POST') return reply(405,{error:'method_not_allowed'});
        if(!config || !projects[config.target] || config.projectRef!==projects[config.target] ||
            config.url!==`https://${projects[config.target]}.supabase.co` ||
            !isAnonKey(config.key,config.projectRef)) return reply(503,{error:'unavailable'});
        const authorization=request.headers.get('authorization')??'';
        if(!/^Bearer [A-Za-z0-9_.-]+$/.test(authorization) || authorization.length>8192) return reply(401,{error:'sign_in_required'});
        let value;
        try {
            if(request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json') throw new Error();
            value=await jsonBody(request);
            if(!value || typeof value!=='object' || Array.isArray(value) ||
                Object.keys(value).sort().join(',')!=='confirmation,userId' || value.confirmation!=='DELETE' ||
                typeof value.userId!=='string' || !uuid.test(value.userId)) throw new Error();
        } catch {return reply(400,{error:'invalid_request'});}
        const userHeaders={apikey:config.key,authorization,'content-type':'application/json'};
        const call=(path,init)=>fetcher(config.url+path,{...init,signal:AbortSignal.timeout(5000),redirect:'error',cache:'no-store'});
        try {
            // Verify with Auth before decoding or relying on any signed claim.
            const auth=await call('/auth/v1/user',{headers:userHeaders});
            if(!auth.ok){await auth.body?.cancel();return reply(auth.status>=500?503:401,{error:'sign_in_required'});}
            const user=await auth.json();
            if(user.id!==value.userId || !user.email_confirmed_at || user.is_anonymous!==false) return reply(403,{error:'account_not_allowed'});
            let claims;
            try {
                const parts=authorization.slice(7).split('.'); if(parts.length!==3) throw new Error();
                claims=JSON.parse(Buffer.from(parts[1],'base64url').toString('utf8'));
            } catch {return reply(401,{error:'sign_in_required'});}
            const timestamp=now(); const seconds=Math.floor(timestamp/1000);
            if(!Number.isSafeInteger(timestamp) || claims.sub!==user.id || claims.iss!==`${config.url}/auth/v1` ||
                claims.aud!=='authenticated' || claims.role!=='authenticated' || claims.is_anonymous!==false ||
                typeof claims.session_id!=='string' || !uuid.test(claims.session_id) || !Number.isFinite(claims.exp) || claims.exp<=seconds ||
                !Array.isArray(claims.amr) || !claims.amr.some(entry=>entry &&
                    ['otp','email/signup','magiclink'].includes(entry.method) && Number.isSafeInteger(entry.timestamp) &&
                    entry.timestamp<=seconds && seconds-entry.timestamp<=600)) return reply(403,{error:'fresh_code_required'});
            const live=await call('/rest/v1/rpc/list_personal_backups_v1',{
                method:'POST',headers:userHeaders,body:JSON.stringify({p_owner:user.id})});
            if(!live.ok){await live.body?.cancel();return reply(live.status>=500?503:403,{error:'session_required'});}
            if(!Array.isArray(await live.json())) return reply(503,{error:'unavailable'});
            const store=await storeProvider(config.target);
            const key=`deletions/${user.id}`;
            const existing=await store.get(key,{type:'json',consistency:'strong'});
            if(existing!==null && existing!==undefined){
                if(!validRecord(existing,config.projectRef,user.id,timestamp)) return reply(503,{error:'journal_unconfirmed'});
            } else {
                const record={version:1,kind:'delete_intent',projectRef:config.projectRef,userId:user.id,requestedAt:new Date(timestamp).toISOString()};
                await store.setJSON(key,record);
                const confirmed=await store.get(key,{type:'json',consistency:'strong'});
                if(!validRecord(confirmed,config.projectRef,user.id,timestamp)) return reply(503,{error:'journal_unconfirmed'});
            }
            return reply(200,{recorded:true,userId:user.id,projectRef:config.projectRef});
        } catch {return reply(503,{error:'journal_unconfirmed'});}
    };
}
