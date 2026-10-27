import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { searchUrls, sitemapXml, robotsText } from '../src/lib/site-search.mjs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

for (const [brand, host, count] of [['company', 'coldforgeworks.com', 2], ['backdoor-map', 'backdoormap.com', 2]]) {
    test(`${brand}: sitemap contains only approved canonical pages on its own domain`, () => {
        const urls = searchUrls(brand);
        assert.equal(urls.length, count);
        assert.equal(new Set(urls).size, count);
        for (const url of urls) {
            assert.equal(new URL(url).origin, `https://${host}`);
            assert.doesNotMatch(url, /privacy|terms|support|data-requests|delete-account|api/);
            assert.ok(sitemapXml(brand).includes(`<loc>${url}</loc>`));
        }
        assert.equal((sitemapXml(brand).match(/<loc>/g) || []).length, count);
        assert.equal(robotsText(brand), `User-agent: *\nAllow: /\nSitemap: https://${host}/sitemap.xml\n`);
    });
}

test('untrusted brand values cannot enter sitemap XML or robots', () => {
    for (const value of ['https://other.example', '<tag>', null, true]) {
        assert.throws(() => sitemapXml(value));
        assert.throws(() => robotsText(value));
    }
});

test('layout still supports draft/noindex controls while published account pages are indexable', () => {
  assert.match(read('src/layouts/BackDoorMapLayout.astro'), /noIndex=\{releaseDraft \|\| noIndex\}/);
  assert.doesNotMatch(read('src/pages/backdoor-map/delete-account.astro'), /noIndex=\{true\}/);
    for (const name of ['CompanyLayout', 'BackDoorSiteLayout']) {
        assert.match(read(`src/layouts/${name}.astro`), /<SearchMetadata[^>]*\{noIndex\}/);
    }
    assert.match(read('src/components/SearchMetadata.astro'), /name="robots" content="noindex, follow"/);
});

test('search metadata adds no tracking script, cookie or analytics vendor', () => {
    const source = read('src/components/SearchMetadata.astro');
    assert.match(source, /property="og:url"/);
    assert.match(source, /rel="canonical"/);
    assert.doesNotMatch(source, /<script|cookie|googletagmanager|google-analytics|posthog|plausible/i);
});
