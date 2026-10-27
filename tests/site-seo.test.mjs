import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { homepageGraph, PRODUCT_CANONICAL, serializeSearchData } from '../src/lib/site-seo.mjs';
import { searchUrls } from '../src/lib/site-search.mjs';

test('the duplicate product overview points to the product domain and stays out of the company sitemap', () => {
    const page = readFileSync(new URL('../src/components/BackDoorHome.astro', import.meta.url), 'utf8');
    assert.match(page, /canonicalUrl=\{PRODUCT_CANONICAL\}/);
    assert.equal(PRODUCT_CANONICAL, 'https://backdoormap.com/');
    assert.ok(!searchUrls('company').includes('https://coldforgeworks.com/backdoor-map'));
    assert.ok(searchUrls('backdoor-map').includes(PRODUCT_CANONICAL));
});

for (const [brand, url] of [['company', 'https://coldforgeworks.com/'], ['backdoor-map', PRODUCT_CANONICAL]]) {
    test(`${brand}: search identities are connected to the correct website and real publisher`, () => {
        const graph = homepageGraph(brand);
        assert.equal(graph['@context'], 'https://schema.org');
        const site = graph['@graph'].find(x => x['@type'] === 'WebSite');
        const page = graph['@graph'].find(x => x['@type'] === 'WebPage');
        const publisher = graph['@graph'].find(x => x['@type'] === 'Organization');
        assert.equal(site.url, url);
        assert.equal(page.url, url);
        assert.equal(page.isPartOf['@id'], site['@id']);
        assert.equal(page.publisher['@id'], publisher['@id']);
        assert.equal(publisher.url, 'https://coldforgeworks.com/');
        assert.doesNotMatch(JSON.stringify(graph), /aggregateRating|ratingValue|reviewCount|downloadCount|SearchAction|customer|backup|token/i);
    });
}

test('structured-data serialization cannot close its script element', () => {
    const value = { text: '</script><script>alert(1)</script>' };
    const result = serializeSearchData(value);
    assert.ok(!result.includes('<'));
    assert.deepEqual(JSON.parse(result), value);
});

test('invalid publication brands cannot create misleading search identities', () => {
    for (const brand of ['https://other.example', '<tag>', null, true]) assert.throws(() => homepageGraph(brand));
});
