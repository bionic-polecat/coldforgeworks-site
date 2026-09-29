const targets = {
    beta: 'https://nmbqtjnenjmqbzyagyie.supabase.co',
    dev: 'https://ntytoytpniekxgidkqnt.supabase.co'
};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const headers = { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' };
const reply = (status, body) => new Response(JSON.stringify(body), { status, headers });
const unavailable = () => reply(503, { error: 'unavailable' });

// Server-only configuration. No client key, session, email or code is rendered.
export function deletionConfig(env, allowLocal = false) {
    if (env.BACKDOOR_MAP_DELETION_ENABLED !== 'true') return null;
    const target = env.BACKDOOR_MAP_DELETION_TARGET;
    if (target !== 'beta' && !(allowLocal && target === 'dev')) return null;
    const url = env.BACKDOOR_MAP_SUPABASE_URL, key = env.BACKDOOR_MAP_SUPABASE_ANON_KEY;
    if (url !== targets[target] || typeof key !== 'string' || key.length > 8192) return null;
    try {
        const parts = key.split('.');
        if (parts.length !== 3 || !parts.every(part => /^[A-Za-z0-9_-]+$/.test(part)) || parts[2].length !== 43) return null;
        const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
        const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
        if (header.alg !== 'HS256' || header.typ !== 'JWT' || claims.iss !== 'supabase' || claims.role !== 'anon' ||
            claims.ref !== new URL(url).hostname.split('.')[0] || claims.sub || claims.session_id) return null;
    } catch { return null; }
    return { url, key, allowLocal };
}

async function body(request) {
    if (!request.body) throw new Error('missing body');
    const reader = request.body.getReader(), chunks = [];
    let size = 0;
    try {
        while (true) {
            const next = await reader.read();
            if (next.done) break;
            size += next.value.byteLength;
            if (size > 1024) { await reader.cancel(); throw new Error('body too large'); }
            chunks.push(next.value);
        }
    } finally { reader.releaseLock(); }
    const raw = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { raw.set(chunk, offset); offset += chunk.byteLength; }
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(raw));
}

export function createDeletionHandler(config, fetcher = fetch) {
    return async request => {
        if (request.method !== 'POST') return reply(405, { error: 'method_not_allowed' });
        if (!config) return unavailable();
        const origin = new URL(request.url).origin;
        const permitted = ['https://coldforgeworks.com', 'https://www.coldforgeworks.com',
            'https://backdoormap.com', 'https://www.backdoormap.com'].includes(origin) ||
            (config.allowLocal && /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin));
        if (!permitted || request.headers.get('origin') !== origin ||
            request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
            return reply(403, { error: 'invalid_origin' });
        }
        let value;
        try {
            value = await body(request);
            if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
            const keys = Object.keys(value).sort().join(',');
            if (value.action === 'request_code' ? keys !== 'action,email' :
                value.action !== 'delete_account' || keys !== 'action,code,confirmation,email') throw new Error();
            if (typeof value.email !== 'string' || value.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())) throw new Error();
            if (value.action === 'delete_account' && (value.confirmation !== 'DELETE' ||
                typeof value.code !== 'string' || !/^\d{6,10}$/.test(value.code))) throw new Error();
        } catch { return reply(400, { error: 'invalid_request' }); }
        const email = value.email.trim();
        const call = (path, payload, token = config.key) => fetcher(`${config.url}${path}`, {
            method: 'POST', headers: { apikey: config.key, authorization: `Bearer ${token}`, 'content-type': 'application/json' },
            body: payload === undefined ? undefined : JSON.stringify(payload),
            signal: AbortSignal.timeout(10000), redirect: 'error', cache: 'no-store'
        });
        if (value.action === 'request_code') {
            // Auth owns email-send quotas. Known/unknown accounts and upstream
            // failures intentionally have the same status/body; never create users.
            try { const result = await call('/auth/v1/otp', { email, create_user: false }); await result.body?.cancel(); } catch {}
            return reply(202, { status: 'check_email' });
        }
        let token;
        try {
            let session;
            try {
                const verified = await call('/auth/v1/verify', { email, token: value.code, type: 'email' });
                if (!verified.ok) { await verified.body?.cancel(); return reply(400, { error: 'confirmation_failed' }); }
                session = await verified.json();
            } catch { return reply(400, { error: 'confirmation_failed' }); }
            if (typeof session?.access_token === 'string' && /^[A-Za-z0-9_.-]{1,8192}$/.test(session.access_token)) token = session.access_token;
            const user = session?.user;
            if (!token || !uuid.test(user?.id ?? '') || user?.is_anonymous !== false || !user?.email_confirmed_at ||
                typeof user?.email !== 'string' || user.email.toLowerCase() !== email.toLowerCase()) {
                return reply(400, { error: 'confirmation_failed' });
            }
            // The existing Edge endpoint independently validates Auth, a fresh
            // email-auth method and a live session before deleting this owner.
            const result = await call('/functions/v1/delete-backup-account', { userId: user.id, confirmation: 'DELETE' }, token);
            if (!result.ok) { await result.body?.cancel(); return reply(503, { error: 'deletion_unconfirmed' }); }
            const receipt = await result.json();
            if (receipt?.deleted !== true || receipt?.userId !== user.id) return reply(503, { error: 'deletion_unconfirmed' });
            return reply(200, { deleted: true });
        } catch { return reply(503, { error: 'deletion_unconfirmed' }); }
        finally {
            if (token) {
                // Best effort, this temporary session only. Never log/persist it.
                try { const result = await call('/auth/v1/logout?scope=local', undefined, token); await result.body?.cancel(); } catch {}
                token = undefined;
            }
        }
    };
}
