import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';
import { publicationFor, websiteBrand, backdoorWebsiteLink } from '../src/data/site-brand.mjs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('default company publication and established app policy URLs remain intact', () => {
    for (const value of [undefined, '', 'company']) {
        const site = publicationFor(value);
        assert.equal(websiteBrand(value), 'company');
        assert.equal(site.standalone, false);
        assert.equal(site.urls.overview, 'https://coldforgeworks.com/backdoor-map');
        assert.equal(site.urls.privacy, 'https://coldforgeworks.com/backdoor-map/privacy');
    }
});

test('standalone build uses only the owned domain and preserves route compatibility', () => {
    const site = publicationFor('backdoor-map');
    assert.equal(site.standalone, true);
    assert.equal(site.homePath, '/');
    assert.equal(site.urls.overview, 'https://backdoormap.com/');
    for (const [key, value] of Object.entries(site.urls)) {
        const url = new URL(value);
        assert.equal(url.origin, 'https://backdoormap.com');
        if (key !== 'overview') assert.ok(existsSync(new URL(`../src/pages${url.pathname}.astro`, import.meta.url)), value);
    }
    for (const value of ['https://evil.example', 'backdoormap', 'BACKDOOR-MAP', null, true]) {
        assert.throws(() => publicationFor(value), /PUBLIC_SITE_BRAND/);
    }
});

test('launch preview does not invent store links, current availability or unlimited backup', () => {
    const home = read('src/components/BackDoorHome.astro');
    assert.match(home, /Public store downloads are not available yet/);
    assert.match(home, /\$4\.99/);
    assert.match(home, /planned U.S. launch price/);
    assert.match(home, /Offline map tiles are not guaranteed/);
    assert.match(home, /Actual Android development previews with test content/);
    assert.doesNotMatch(home, /apps\.apple\.com|play\.google\.com|<form|<script|download now/i);
    for (const [, asset] of home.matchAll(/src="(\/backdoor-map\/[^\"]+)"/g)) {
        assert.ok(existsSync(new URL(`../public${asset}`, import.meta.url)), asset);
    }
});

test('all home links target local routes, actual assets or declared section anchors', () => {
    const home = read('src/components/BackDoorHome.astro');
    for (const [, link] of home.matchAll(/href="([^\"]+)"/g)) {
        if (link.startsWith('#')) assert.ok(home.includes(`id="${link.slice(1)}"`), link);
        else assert.ok(existsSync(new URL(`../public${link}`, import.meta.url)) || existsSync(new URL(`../src/pages${link}.astro`, import.meta.url)), link);
    }
});

test('company product link stays on the working overview until dedicated publication is verified', () => {
    for (const value of [undefined, '', 'false']) {
        assert.deepEqual(backdoorWebsiteLink(value), { href: '/backdoor-map', live: false });
    }
    assert.deepEqual(backdoorWebsiteLink('true'), { href: 'https://backdoormap.com/', live: true });
    for (const value of ['TRUE', 'yes', 'https://other.example', null, true]) assert.throws(() => backdoorWebsiteLink(value));
});

test('company copy links the live community and distinguishes the unreleased app', () => {
    const home = read('src/components/CompanyHome.astro');
    assert.match(home, /href="https:\/\/reviveme\.gg\/"/);
    assert.doesNotMatch(home, /ReviveMe|Reviveme|REVIVEME/);
    assert.match(home, /Public app downloads are not available yet/);
    assert.match(home, /Community website \/ Available now/);
    assert.match(home, /private notes/);
    assert.match(home, /previously saved/i);
    assert.match(home, /href=\{backdoor.href\}/);
    assert.match(home, /canonicalUrl="https:\/\/coldforgeworks\.com\/"/);
    assert.doesNotMatch(home, /<form|<script|apps\.apple\.com|play\.google\.com/);
    for (const [, link] of home.matchAll(/href="(#[^\"]+)"/g)) assert.ok(home.includes(`id="${link.slice(1)}"`), link);
});
