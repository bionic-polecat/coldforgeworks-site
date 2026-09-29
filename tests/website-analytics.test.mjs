import assert from 'node:assert/strict';
import { test } from 'node:test';
import { analyticsEnabled, analyticsToken, analyticsSites } from '../src/lib/website-analytics.mjs';

test('analytics is explicit opt-in at build time', () => {
    for (const value of [undefined, '', 'false']) assert.equal(analyticsEnabled(value), false);
    assert.equal(analyticsEnabled('true'), true);
    for (const value of ['yes', 'TRUE', true, null]) assert.throws(() => analyticsEnabled(value));
});
test('only exact owned HTTPS homepages receive their own public token', () => {
    for (const [host, token] of Object.entries(analyticsSites)) assert.equal(analyticsToken(`https://${host}/`), token);
});
test('account actions, policy pages, previews and URL identifiers cannot load analytics', () => {
    for (const url of ['http://coldforgeworks.com/', 'https://coldforgeworks.com:444/', 'https://www.coldforgeworks.com/', 'https://coldforgeworks.com.evil.example/', 'http://127.0.0.1:4342/', 'https://backdoormap.com/?email=test@example.com', 'https://backdoormap.com/#token', 'https://backdoormap.com/backdoor-map/delete-account', 'https://backdoormap.com/backdoor-map/privacy', 'https://coldforgeworks.com/api/backdoor-map/account-deletion', 'broken']) assert.equal(analyticsToken(url), null, url);
    assert.equal(analyticsToken('https://backdoormap.com/', 'https://example.com/?code=123'), null);
    assert.equal(analyticsToken('https://backdoormap.com/', '', '1'), null);
    assert.equal(analyticsToken('https://backdoormap.com/', '', 'yes'), null);
});
