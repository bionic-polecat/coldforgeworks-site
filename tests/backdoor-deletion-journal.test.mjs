import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeletionJournalHandler, deletionJournalConfig } from '../src/lib/backdoor-deletion-journal.mjs';

const projects={dev:'ntytoytpniekxgidkqnt',beta:'nmbqtjnenjmqbzyagyie'};
const userId='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', other='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const seconds=1800000000, timestamp=seconds*1000, requestedAt=new Date(timestamp).toISOString();
const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
const anon=(target='dev',overrides={})=>`${encode({alg:'HS256',typ:'JWT'})}.${encode({iss:'supabase',role:'anon',ref:projects[target],...overrides})}.${'x'.repeat(43)}`;
const config=(target='dev')=>deletionJournalConfig({BACKDOOR_MAP_JOURNAL_ENABLED:'true',BACKDOOR_MAP_JOURNAL_TARGET:target,
    CONTEXT:target==='dev'?'deploy-preview':'production',BACKDOOR_MAP_JOURNAL_ANON_KEY:anon(target)});
const claims=(target='dev')=>({sub:userId,iss:`https://${projects[target]}.supabase.co/auth/v1`,role:'authenticated',aud:'authenticated',
    session_id:other,is_anonymous:false,exp:seconds+3600,amr:[{method:'otp',timestamp:seconds}]});
const token=value=>`test.${encode(value)}.signature`;
const request=(value=claims(),body={userId,confirmation:'DELETE'},headers={})=>new Request('https://site.example/api/backdoor-map/deletion-journal',{
    method:'POST',headers:{authorization:`Bearer ${token(value)}`,'content-type':'application/json',...headers},body:JSON.stringify(body)});
const record=(target='dev')=>({version:1,kind:'delete_intent',projectRef:projects[target],userId,requestedAt});
function fixture(options={}) {
    const calls=[],saved=new Map(),writes=[];
    if(Object.hasOwn(options,'existing')) saved.set(`deletions/${userId}`,options.existing);
    const cfg=options.config??config(options.target??'dev');
    const store={get:async(key,settings)=>{
        calls.push('get'); assert.deepEqual(settings,{type:'json',consistency:'strong'});
        if(options.getError) throw new Error('private token and storage error');
        if(options.loseReadback && writes.length) return null;
        return saved.get(key)??null;
    },setJSON:async(key,value)=>{
        calls.push('set'); if(options.setError) throw new Error('private token and write error');
        writes.push({key,value}); saved.set(key,value);
    }};
    const handler=createDeletionJournalHandler(cfg,async target=>{
        calls.push(`store:${target}`); if(options.providerError) throw new Error('private provider error'); return store;
    },async(input,init)=>{
        const url=new URL(input); assert.equal(url.origin,cfg.url);
        assert.equal(init.redirect,'error'); assert.equal(init.cache,'no-store'); assert.ok(init.signal);
        const headers=new Headers(init.headers); assert.equal(headers.get('apikey'),cfg.key);
        assert.ok(headers.get('authorization').startsWith('Bearer test.'));
        if(url.pathname==='/auth/v1/user') {
            calls.push('auth'); if(options.authError) throw new Error('private Auth error');
            return Response.json(options.user??{id:userId,email_confirmed_at:'yes',is_anonymous:false},{status:options.authStatus??200});
        }
        assert.equal(url.pathname,'/rest/v1/rpc/list_personal_backups_v1'); calls.push('session');
        assert.deepEqual(JSON.parse(init.body),{p_owner:userId});
        return Response.json(options.sessionBody??[],{status:options.sessionStatus??200});
    },()=>timestamp);
    return {handler,calls,saved,writes};
}

test('journal configuration separates production and DEV and rejects privileged or mismatched keys',()=>{
    assert.equal(config('dev').projectRef,projects.dev); assert.equal(config('beta').projectRef,projects.beta);
    const env={BACKDOOR_MAP_JOURNAL_ENABLED:'true',BACKDOOR_MAP_JOURNAL_TARGET:'dev',CONTEXT:'deploy-preview',BACKDOOR_MAP_JOURNAL_ANON_KEY:anon()};
    for(const changes of [{BACKDOOR_MAP_JOURNAL_ENABLED:'false'},{BACKDOOR_MAP_JOURNAL_TARGET:'unknown'},
        {CONTEXT:'production'},{CONTEXT:'branch-deploy'},{BACKDOOR_MAP_JOURNAL_ANON_KEY:anon('beta')},
        {BACKDOOR_MAP_JOURNAL_ANON_KEY:anon('dev',{role:'service_role'})},{BACKDOOR_MAP_JOURNAL_ANON_KEY:anon('dev',{sub:userId})},
        {BACKDOOR_MAP_JOURNAL_ANON_KEY:'secret-key'},{BACKDOOR_MAP_JOURNAL_ANON_KEY:'x'.repeat(9000)}]) {
        assert.equal(deletionJournalConfig({...env,...changes}),null);
    }
    assert.equal(deletionJournalConfig({...env,BACKDOOR_MAP_JOURNAL_TARGET:'beta',BACKDOOR_MAP_JOURNAL_ANON_KEY:anon('beta')},true),null);
    assert.equal(deletionJournalConfig({...env,CONTEXT:undefined,BACKDOOR_MAP_JOURNAL_CONTEXT:'deploy-preview'}).target,'dev');
    assert.equal(deletionJournalConfig({...env,CONTEXT:undefined,BACKDOOR_MAP_JOURNAL_CONTEXT:'production'}),null);
    assert.equal(deletionJournalConfig({...env,CONTEXT:'production',BACKDOOR_MAP_JOURNAL_CONTEXT:'deploy-preview'}),null);
});
test('journal rejects methods, missing auth and malformed input without storage or upstream requests',async()=>{
    const f=fixture();
    for(const req of [new Request('https://site.example'),request(claims(),{userId,confirmation:'delete'}),
        request(claims(),{userId:[userId],confirmation:'DELETE'}),request(claims(),{userId,confirmation:'DELETE',email:'private'}),
        request(claims(),{userId:'../coverage',confirmation:'DELETE'}),request(claims(),'x'.repeat(300)),
        request(claims(),undefined,{authorization:''}),request(claims(),undefined,{'content-type':'text/plain'})]) {
        assert.ok((await f.handler(req)).status>=400);
    }
    assert.deepEqual(f.calls,[]);
    const disabled=fixture({config:{...config(),url:'https://other.example'}});
    assert.equal((await disabled.handler(request())).status,503); assert.deepEqual(disabled.calls,[]);
});
test('journal requires online confirmed-owner Auth, fresh email claims and a live session before storage',async()=>{
    for(const options of [{authStatus:401},{authStatus:500},{authError:true},
        {user:{id:other,email_confirmed_at:'yes',is_anonymous:false}},
        {user:{id:userId,email_confirmed_at:null,is_anonymous:false}},
        {user:{id:userId,email_confirmed_at:'yes',is_anonymous:true}},
        {sessionStatus:403},{sessionStatus:503},{sessionBody:{unexpected:true}}]) {
        const f=fixture(options); assert.ok((await f.handler(request())).status>=400);
        assert.ok(!f.calls.some(call=>call.startsWith('store:')));
    }
    for(const changes of [{sub:other},{iss:'https://other.example/auth/v1'},{role:'service_role'},
        {aud:'anon'},{session_id:[other]},{exp:seconds},{is_anonymous:true},{amr:[null]},
        {amr:[{method:'otp',timestamp:seconds-601}]},{amr:[{method:'token_refresh',timestamp:seconds}]},
        {amr:[{method:'otp',timestamp:seconds+1}]}]) {
        const f=fixture(); assert.equal((await f.handler(request({...claims(),...changes}))).status,403);
        assert.deepEqual(f.calls,['auth']);
    }
});
test('journal receipt follows a durable write and strong readback with only minimal account identifiers',async()=>{
    const f=fixture(),response=await f.handler(request()); assert.equal(response.status,200);
    assert.deepEqual(await response.json(),{recorded:true,userId,projectRef:projects.dev});
    assert.deepEqual(f.calls,['auth','session','store:dev','get','set','get']);
    assert.deepEqual(f.writes,[{key:`deletions/${userId}`,value:record()}]);
    assert.equal(response.headers.get('cache-control'),'no-store');
});
test('journal retries preserve an existing valid intent and do not overwrite its original time',async()=>{
    const older={...record(),requestedAt:new Date(timestamp-100000).toISOString()},f=fixture({existing:older});
    for(let attempt=0;attempt<2;attempt++) assert.equal((await f.handler(request())).status,200);
    assert.deepEqual(f.saved.get(`deletions/${userId}`),older); assert.equal(f.writes.length,0);
});
test('journal storage failure or lost acknowledgement never claims confirmation or leaks provider details',async()=>{
    for(const options of [{providerError:true},{getError:true},{setError:true},{loseReadback:true}]) {
        const f=fixture(options),response=await f.handler(request()),text=await response.text();
        assert.equal(response.status,503); assert.ok(!text.includes('private')); assert.ok(!text.includes('"recorded":true'));
    }
});
test('journal refuses corrupted, future-dated, cross-project or excessive existing records',async()=>{
    for(const existing of [{...record(),userId:other},{...record(),projectRef:projects.beta},{...record(),version:2},
        {...record(),email:'never stored'},{...record(),requestedAt:new Date(timestamp+1).toISOString()},
        {...record(),requestedAt:'2026-10-12'},[],false,'corrupt']) {
        const f=fixture({existing}); assert.equal((await f.handler(request())).status,503); assert.equal(f.writes.length,0);
    }
});
test('production uses its own store and project and does not mix DEV identifiers',async()=>{
    const f=fixture({target:'beta'}),response=await f.handler(request(claims('beta')));
    assert.equal(response.status,200); assert.deepEqual(f.writes[0].value,record('beta'));
    assert.ok(f.calls.includes('store:beta') && !f.calls.includes('store:dev'));
});
