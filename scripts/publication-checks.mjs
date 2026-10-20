import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const sites = {
  '43b94185-a1f5-441f-ad6a-1e0903d4aad6': 'company',
  '223c917d-8805-4126-b168-f2678deee529': 'backdoor-map'
};

export function publicationBrand(env, requested) {
  const siteId = env.SITE_ID || env.NETLIFY_SITE_ID;
  if (siteId) assert.ok(sites[siteId], 'Unrecognized publication site ID');
  const brand = requested || env.PUBLIC_SITE_BRAND || sites[siteId] || 'company';
  assert.ok(['company', 'backdoor-map'].includes(brand), 'Unknown publication brand');
  if (siteId) assert.equal(brand, sites[siteId], 'Publication brand does not match target site');
  return brand;
}

export function verifyApprovedSources(root) {
  const policy = JSON.parse(readFileSync(join(root, 'publication-policy.json'), 'utf8'));
  assert.equal(policy.policies.length, 5, 'All approved policy pages must be present');
  for (const file of policy.policies) {
    const text = readFileSync(join(root, file.path), 'utf8').replace(/\r\n/g, '\n');
    assert.equal(createHash('sha256').update(text).digest('hex'), file.sha256,
      `Approved policy changed: ${file.path}. Review the policy and update its release lock deliberately.`);
  }
}

export function verifyPublicationFiles(root, brand) {
  const dist = join(root, 'dist');
  const origin = brand === 'company' ? 'https://coldforgeworks.com' : 'https://backdoormap.com';
  const read = path => readFileSync(join(dist, path), 'utf8');
  const home = read('index.html');
  assert.ok(home.includes(`href="${origin}/"`), 'Wrong homepage canonical');
  assert.doesNotMatch(home, /dedicated website coming soon/, 'Live product site must not be called coming soon');
  assert.match(read('sitemap.xml'), new RegExp(origin.replaceAll('.', '\\.')));
  assert.ok(read('robots.txt').includes(`${origin}/sitemap.xml`), 'Wrong sitemap hostname');
  for (const page of ['privacy', 'terms', 'support', 'data-requests', 'community-standards']) {
    const html = read(`backdoor-map/${page}/index.html`);
    assert.doesNotMatch(html, /Release draft|Not yet effective|has no user accounts/i, page);
    assert.ok(html.includes(`${origin}/backdoor-map/${page}`), `${page}: wrong canonical`);
    if (page !== 'community-standards') assert.match(html, /\/backdoor-map\/delete-account/, `${page}: deletion link missing`);
  }
  assert.match(read('backdoor-map/privacy/index.html'), /Signing in alone does not upload saved places/);
  const redirects = existsSync(join(dist, '_redirects')) ? read('_redirects') : '';
  assert.doesNotMatch(redirects, /^\s*\/(?:backdoor-map\/delete-account|api\/backdoor-map\/account-deletion)\/?(?:\s|\*)/m,
    'Account deletion must use its server route, not a static redirect');
  assert.ok(existsSync(join(root, '.netlify/v1/functions/ssr/ssr.mjs')), 'Server function bundle is missing');
  return { brand, origin, staticPages: 5, serverBundle: true };
}
