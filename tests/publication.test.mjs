import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicationBrand, sites, verifyApprovedSources, verifyPublicationFiles } from '../scripts/publication-checks.mjs';
const root = dirname(dirname(fileURLToPath(import.meta.url)));

test('site identity chooses the correct brand and rejects crossed or unknown targets', () => {
  assert.equal(publicationBrand({}), 'company');
  for (const [id, brand] of Object.entries(sites)) {
    assert.equal(publicationBrand({ SITE_ID: id }), brand);
    assert.throws(() => publicationBrand({ SITE_ID: id }, brand === 'company' ? 'backdoor-map' : 'company'), /does not match/);
  }
  assert.throws(() => publicationBrand({ SITE_ID: 'another-site' }), /Unrecognized/);
  assert.throws(() => publicationBrand({}, 'typo'), /Unknown/);
});

test('retired static exporter exits before it can emit an obsolete artifact', () => {
  const run = spawnSync(process.execPath, [join(root, 'scripts/prepare-marketing-publication.mjs'), 'company'], { encoding: 'utf8' });
  assert.equal(run.status, 1);
  assert.match(run.stderr, /retired.*remove current policies and account deletion/s);
  assert.equal(run.stdout, '');
});

test('current approved sources pass and a substituted old policy fails before building', () => {
  verifyApprovedSources(root);
  const temp = mkdtempSync(join(tmpdir(), 'publication-source-test-'));
  try {
    writeFileSync(join(temp, 'publication-policy.json'), readFileSync(join(root, 'publication-policy.json')));
    mkdirSync(join(temp, 'src/pages/backdoor-map'), { recursive: true });
    writeFileSync(join(temp, 'src/pages/backdoor-map/privacy.astro'), 'The app has no user accounts.');
    assert.throws(() => verifyApprovedSources(temp), /Approved policy changed/);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

test('old static marketing output without account functions fails artifact validation', () => {
  const temp = mkdtempSync(join(tmpdir(), 'publication-output-test-'));
  const put = (path, text) => { const target = join(temp, path); mkdirSync(dirname(target), { recursive: true }); writeFileSync(target, text); };
  try {
    const origin = 'https://coldforgeworks.com';
    put('dist/index.html', `<link rel="canonical" href="${origin}/">`);
    put('dist/robots.txt', `${origin}/sitemap.xml`); put('dist/sitemap.xml', origin);
    for (const page of ['privacy','terms','support','data-requests','community-standards'])
      put(`dist/backdoor-map/${page}/index.html`, `${origin}/backdoor-map/${page} /backdoor-map/delete-account Signing in alone does not upload saved places`);
    assert.throws(() => verifyPublicationFiles(temp, 'company'), /Server function bundle is missing/);
    put('.netlify/v1/functions/ssr/ssr.mjs', '// fixture');
    put('dist/_redirects', '/backdoor-map/delete-account /backdoor-map/support 302\n');
    assert.throws(() => verifyPublicationFiles(temp, 'company'), /static redirect/);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});
