import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDeletionHandler, deletionConfig } from '../src/lib/backdoor-account-deletion.mjs';

const ref = 'nmbqtjnenjmqbzyagyie', url = `https://${ref}.supabase.co`;
const key = (claims = {}) => `${Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify({ iss: 'supabase', role: 'anon', ref, ...claims })).toString('base64url')}.${'a'.repeat(43)}`;
const env = { BACKDOOR_MAP_DELETION_ENABLED: 'true', BACKDOOR_MAP_DELETION_TARGET: 'beta', BACKDOOR_MAP_SUPABASE_URL: url, BACKDOOR_MAP_SUPABASE_ANON_KEY: key() };
const user = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', email: 'disposable@example.test', email_confirmed_at: '2026-09-27', is_anonymous: false };
const token = 'synthetic.session.token';
const payload = { action: 'delete_account', email: user.email, code: '12345678', confirmation: 'DELETE' };
function request(data, options = {}) {
    return new Request(options.url ?? 'https://coldforgeworks.com/api/backdoor-map/account-deletion', {
        method: options.method ?? 'POST', headers: { origin: 'https://coldforgeworks.com', 'content-type': 'application/json', ...options.headers },
        body: options.method === 'GET' ? undefined : JSON.stringify(data)
    });
}
function fixture(options = {}) {
    const calls = [];
    const handler = createDeletionHandler(deletionConfig(env), async (input, init) => {
        const path = new URL(input).pathname + new URL(input).search;
        calls.push({ path, body: init.body && JSON.parse(init.body), headers: init.headers });
        assert.equal(new URL(input).origin, url);
        assert.equal(init.redirect, 'error'); assert.equal(init.cache, 'no-store');
        assert.ok(init.signal instanceof AbortSignal);
        if (path === '/auth/v1/otp') {
            if (options.otp === 'throw') throw new Error('sensitive provider text');
            return Response.json({ providerSecret: 'never expose' }, { status: options.otp ?? 200 });
        }
        if (path === '/auth/v1/verify') {
            if (options.verify === 'throw') throw new Error('private verification detail');
            return Response.json(options.session ?? { access_token: token, refresh_token: 'never-store', user }, { status: options.verify ?? 200 });
        }
        if (path === '/functions/v1/delete-backup-account') {
            assert.equal(init.headers.authorization, `Bearer ${token}`);
            assert.deepEqual(JSON.parse(init.body), { userId: user.id, confirmation: 'DELETE' });
            if (options.deletion === 'throw') throw new Error('lost response');
            return Response.json(options.receipt ?? { deleted: true, userId: user.id }, { status: options.deletion ?? 200 });
        }
        assert.equal(path, '/auth/v1/logout?scope=local');
        assert.equal(init.headers.authorization, `Bearer ${token}`);
        if (options.logoutFailure) throw new Error('revocation unavailable');
        return new Response(null, { status: 204 });
    });
    return { calls, handler };
}

test('disabled/missing/unknown configuration cannot enable deletion or mix projects', () => {
    assert.ok(deletionConfig(env));
    for (const override of [{ BACKDOOR_MAP_DELETION_ENABLED: undefined }, { BACKDOOR_MAP_DELETION_ENABLED: 'TRUE' },
        { BACKDOOR_MAP_DELETION_TARGET: 'dev' }, { BACKDOOR_MAP_DELETION_TARGET: 'production' },
        { BACKDOOR_MAP_SUPABASE_URL: `${url}/` }, { BACKDOOR_MAP_SUPABASE_URL: 'https://other.example' },
        { BACKDOOR_MAP_SUPABASE_ANON_KEY: key({ ref: 'other' }) }, { BACKDOOR_MAP_SUPABASE_ANON_KEY: key({ role: 'service_role' }) },
        { BACKDOOR_MAP_SUPABASE_ANON_KEY: key({ sub: user.id }) }, { BACKDOOR_MAP_SUPABASE_ANON_KEY: 'sb_secret_no' }]) {
        assert.equal(deletionConfig({ ...env, ...override }), null);
    }
    const dev = { ...env, BACKDOOR_MAP_DELETION_TARGET: 'dev', BACKDOOR_MAP_SUPABASE_URL: 'https://ntytoytpniekxgidkqnt.supabase.co', BACKDOOR_MAP_SUPABASE_ANON_KEY: key({ ref: 'ntytoytpniekxgidkqnt' }) };
    assert.equal(deletionConfig(dev), null); assert.ok(deletionConfig(dev, true));
});
test('unconfigured route never makes a hosted request', async () => {
    const handler = createDeletionHandler(null, () => { throw new Error('must not call'); });
    assert.equal((await handler(request(payload))).status, 503);
});
test('cross-site, missing-origin, wrong-method and non-JSON requests cannot send email or delete', async () => {
    const f = fixture();
    for (const options of [{ headers: { origin: 'https://other.example' } }, { headers: { origin: '' } },
        { headers: { 'content-type': 'text/plain' } }, { method: 'GET' },
        { url: 'https://attacker.example/api/backdoor-map/account-deletion', headers: { origin: 'https://attacker.example' } },
        { url: 'http://localhost:4321/api/backdoor-map/account-deletion', headers: { origin: 'http://localhost:4321' } }]) {
        assert.ok((await f.handler(request(payload, options))).status >= 400);
    }
    assert.deepEqual(f.calls, []);
});
test('malformed, oversized, extra-field and unconfirmed actions fail before network', async () => {
    const f = fixture();
    for (const value of [null, [], {}, { ...payload, confirmation: 'delete' }, { ...payload, userId: user.id },
        { ...payload, code: 'not-a-code' }, { ...payload, email: 'invalid' }, { ...payload, email: `${'a'.repeat(1000)}@example.test` },
        { action: 'request_code', email: user.email, code: '123456' }]) {
        assert.equal((await f.handler(request(value))).status, 400);
    }
    const streamed = new Request('https://coldforgeworks.com/api/backdoor-map/account-deletion', {
        method: 'POST', headers: { origin: 'https://coldforgeworks.com', 'content-type': 'application/json', 'content-length': '1' },
        body: new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode('x'.repeat(2048))); controller.close(); } }), duplex: 'half'
    });
    assert.equal((await f.handler(streamed)).status, 400);
    assert.deepEqual(f.calls, []);
});

test('owned product domain accepts exact same-origin requests without widening cross-origin access', async () => {
    for (const origin of ['https://backdoormap.com', 'https://www.backdoormap.com']) {
        const f = fixture();
        const response = await f.handler(request({ action: 'request_code', email: user.email }, {
            url: `${origin}/api/backdoor-map/account-deletion`, headers: { origin }
        }));
        assert.equal(response.status, 202);
        assert.equal(f.calls.length, 1);
    }
    for (const origin of ['http://backdoormap.com', 'https://backdoormap.com.evil.example', 'https://other.backdoormap.com']) {
        const f = fixture();
        assert.equal((await f.handler(request(payload, { url: `${origin}/api/backdoor-map/account-deletion`, headers: { origin } }))).status, 403);
        assert.equal(f.calls.length, 0);
    }
    const f = fixture();
    assert.equal((await f.handler(request(payload, { url: 'https://backdoormap.com/api/backdoor-map/account-deletion', headers: { origin: 'https://coldforgeworks.com' } }))).status, 403);
    assert.equal(f.calls.length, 0);
    assert.equal((await createDeletionHandler(null)(request(payload, { url: 'https://backdoormap.com/api/backdoor-map/account-deletion', headers: { origin: 'https://backdoormap.com' } }))).status, 503);
});
test('code request never creates an account and known/unknown/quota/provider outcomes look identical', async () => {
    for (const otp of [200, 400, 429, 500, 'throw']) {
        const f = fixture({ otp });
        const response = await f.handler(request({ action: 'request_code', email: user.email }));
        assert.equal(response.status, 202); assert.deepEqual(await response.json(), { status: 'check_email' });
        assert.equal(response.headers.get('cache-control'), 'no-store');
        assert.equal(f.calls.length, 1); assert.equal(f.calls[0].path, '/auth/v1/otp');
        assert.deepEqual(f.calls[0].body, { email: user.email, create_user: false });
    }
});
test('fresh verification precedes deletion and a private session never reaches the browser', async () => {
    const f = fixture(), response = await f.handler(request(payload));
    assert.equal(response.status, 200); assert.deepEqual(await response.json(), { deleted: true });
    assert.deepEqual(f.calls.map(c => c.path), ['/auth/v1/verify', '/functions/v1/delete-backup-account', '/auth/v1/logout?scope=local']);
    assert.deepEqual(f.calls[0].body, { email: user.email, token: payload.code, type: 'email' });
});
test('incorrect/expired/replayed codes and verification transport failures cannot reach deletion', async () => {
    for (const verify of [400, 429, 500, 'throw']) {
        const f = fixture({ verify }), response = await f.handler(request(payload));
        assert.equal(response.status, 400); assert.deepEqual(await response.json(), { error: 'confirmation_failed' });
        assert.deepEqual(f.calls.map(c => c.path), ['/auth/v1/verify']);
    }
});
test('mismatched, unconfirmed or anonymous ownership fails closed and disposes any temporary session', async () => {
    for (const change of [{ email: 'other@example.test' }, { email: null }, { id: '../users' }, { is_anonymous: true }, { email_confirmed_at: null }]) {
        const f = fixture({ session: { access_token: token, user: { ...user, ...change } } });
        const response = await f.handler(request(payload));
        assert.equal(response.status, 400);
        assert.deepEqual(f.calls.map(c => c.path), ['/auth/v1/verify', '/auth/v1/logout?scope=local']);
    }
});
test('missing session token never reaches deletion', async () => {
    const f = fixture({ session: { user } });
    assert.equal((await f.handler(request(payload))).status, 400);
    assert.deepEqual(f.calls.map(c => c.path), ['/auth/v1/verify']);
});
test('email comparison accommodates provider casing without accepting a different address', async () => {
    const f = fixture({ session: { access_token: token, user: { ...user, email: user.email.toUpperCase() } } });
    assert.equal((await f.handler(request(payload))).status, 200);
});
test('lost deletion response, failure or mismatched receipt never claim success; session cleanup still runs', async () => {
    for (const options of [{ deletion: 'throw' }, { deletion: 503 }, { receipt: {} }, { receipt: { deleted: true, userId: 'different' } }]) {
        const f = fixture(options), response = await f.handler(request(payload));
        assert.equal(response.status, 503); assert.deepEqual(await response.json(), { error: 'deletion_unconfirmed' });
        assert.equal(f.calls.at(-1).path, '/auth/v1/logout?scope=local');
    }
});
test('logout failure cannot overwrite a confirmed deletion result', async () => {
    const f = fixture({ logoutFailure: true }), response = await f.handler(request(payload));
    assert.equal(response.status, 200); assert.deepEqual(await response.json(), { deleted: true });
});
test('a repeated submission must verify its code again rather than reuse a previous session', async () => {
    const options = {}, f = fixture(options);
    assert.equal((await f.handler(request(payload))).status, 200);
    options.verify = 400;
    assert.equal((await f.handler(request(payload))).status, 400);
    assert.equal(f.calls.filter(c => c.path === '/auth/v1/verify').length, 2);
    assert.equal(f.calls.filter(c => c.path === '/functions/v1/delete-backup-account').length, 1);
});
