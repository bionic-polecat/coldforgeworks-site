import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Exercise the packaged production function without hosted requests or real data.
const origin = 'https://backdoormap.com';
const api = `${origin}/api/backdoor-map/account-deletion`;
const owner = '11111111-1111-4111-8111-111111111111';
const email = 'disposable@example.invalid';
const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
const fakeKey = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ iss: 'supabase', role: 'anon', ref: 'nmbqtjnenjmqbzyagyie' })}.${'A'.repeat(43)}`;
const names = ['BACKDOOR_MAP_DELETION_ENABLED', 'BACKDOOR_MAP_DELETION_TARGET', 'BACKDOOR_MAP_SUPABASE_URL', 'BACKDOOR_MAP_SUPABASE_ANON_KEY'];
const previous = Object.fromEntries(names.map(name => [name, process.env[name]]));
const originalFetch = globalThis.fetch;
const calls = [];
let allowMockProvider = false;
globalThis.fetch = async (input, options) => {
  assert.equal(allowMockProvider, true, 'unexpected upstream request');
  const url = new URL(input);
  assert.equal(url.origin, 'https://nmbqtjnenjmqbzyagyie.supabase.co');
  calls.push(url.pathname);
  const payload = options.body ? JSON.parse(options.body) : undefined;
  if (url.pathname === '/auth/v1/otp') {
    assert.deepEqual(payload, { email, create_user: false });
    return Response.json({});
  }
  if (url.pathname === '/auth/v1/verify') {
    assert.equal(payload.email, email);
    return Response.json({ access_token: 'mock.session.token', user: {
      id: owner, email, is_anonymous: false, email_confirmed_at: '2026-01-01T00:00:00Z'
    } });
  }
  if (url.pathname === '/functions/v1/delete-backup-account') {
    assert.deepEqual(payload, { userId: owner, confirmation: 'DELETE' });
    return Response.json({ deleted: true, userId: owner });
  }
  if (url.pathname === '/auth/v1/logout') return new Response(null, { status: 204 });
  throw new Error('unexpected upstream path');
};

try {
  const { default: handler } = await import('../.netlify/v1/functions/ssr/ssr.mjs');
  const invoke = request => handler(request, { ip: '127.0.0.1' });
  const post = (body, requestOrigin = origin) => invoke(new Request(api, {
    method: 'POST', headers: { origin: requestOrigin, 'content-type': 'application/json' }, body: JSON.stringify(body)
  }));
  for (const name of names) delete process.env[name];
  const disabled = await invoke(new Request(`${origin}/backdoor-map/delete-account`));
  assert.equal(disabled.status, 200);
  assert.match(await disabled.text(), /Online confirmation is not available yet/);
  assert.equal((await post({ action: 'request_code', email })).status, 503);

  Object.assign(process.env, {
    BACKDOOR_MAP_DELETION_ENABLED: 'true', BACKDOOR_MAP_DELETION_TARGET: 'beta',
    BACKDOOR_MAP_SUPABASE_URL: 'https://nmbqtjnenjmqbzyagyie.supabase.co',
    BACKDOOR_MAP_SUPABASE_ANON_KEY: fakeKey
  });
  const enabled = await invoke(new Request(`${origin}/backdoor-map/delete-account`));
  assert.equal(enabled.status, 200);
  assert.equal(enabled.headers.get('cache-control'), 'no-store');
  assert.equal(enabled.headers.get('referrer-policy'), 'no-referrer');
  assert.equal(enabled.headers.get('x-frame-options'), 'DENY');
  assert.match(enabled.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  const html = await enabled.text();
  assert.match(html, /id="request-code"/);
  assert.match(html, /Permanently delete account and cloud backups/);
  assert.ok(!html.includes(fakeKey));
  assert.ok(!html.includes('mock.session.token'));
  assert.equal((await post({ action: 'request_code', email }, 'https://example.invalid')).status, 403);
  assert.equal((await post({ action: 'delete_account', email, code: '12345678' })).status, 400);
  assert.equal(calls.length, 0);

  allowMockProvider = true;
  assert.equal((await post({ action: 'request_code', email })).status, 202);
  const deleted = await post({ action: 'delete_account', email, code: '12345678', confirmation: 'DELETE' });
  assert.equal(deleted.status, 200);
  assert.equal(deleted.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await deleted.json(), { deleted: true });
  assert.deepEqual(calls, ['/auth/v1/otp', '/auth/v1/verify', '/functions/v1/delete-backup-account', '/auth/v1/logout']);
  const landing = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  assert.match(landing, /BackDoor Map/);
  assert.match(landing, /https:\/\/backdoormap\.com/);
  console.log('Packaged Netlify function: disabled/enabled rendering, headers, origin checks, confirmation and mocked deletion passed. No hosted requests made.');
} finally {
  globalThis.fetch = originalFetch;
  for (const name of names) {
    if (previous[name] === undefined) delete process.env[name];
    else process.env[name] = previous[name];
  }
}
