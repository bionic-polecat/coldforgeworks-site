import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';

const source = name => readFileSync(new URL(`../src/pages/backdoor-map/${name}.astro`, import.meta.url), 'utf8');
const pages = ['privacy', 'terms', 'support', 'data-requests'];
const compact = value => value.replace(/\s+/g, ' ');

test('account-aware pages cannot silently retain the old no-account claims', () => {
  for (const name of pages) {
    const text = compact(source(name));
    assert.doesNotMatch(text, /has no user accounts|does not use accounts|does not have user passwords or accounts|not synced to a BackDoor Map account|Because there are no accounts/i, name);
    assert.match(text, /backup/i, name);
  }
});

test('published policy pages show the approved effective date and no draft marker', () => {
  for (const name of pages) {
    assert.doesNotMatch(source(name), /\breleaseDraft\b/, name);
    assert.match(source(name), /showDocumentStatus/, name);
  }
  const layout = readFileSync(new URL('../src/layouts/BackDoorMapLayout.astro', import.meta.url), 'utf8');
  assert.match(layout, /releaseDraft \? \([\s\S]*?Not yet effective or approved for publication/);
  assert.match(layout, /\) : showDocumentStatus &&/);
  const data = readFileSync(new URL('../src/data/backdoor-map.ts', import.meta.url), 'utf8');
  assert.match(data, /effectiveDate: 'July 18, 2026'/);
  assert.doesNotMatch(source('community-standards'), /\breleaseDraft\b/);
  assert.doesNotMatch(source('delete-account'), /noIndex=\{true\}/);
});

test('shared legal copy can wrap long contact links at enlarged mobile text sizes', () => {
  const layout = readFileSync(new URL('../src/layouts/BackDoorMapLayout.astro', import.meta.url), 'utf8');
  assert.match(layout, /\.legal-copy\s*\{\s*overflow-wrap:\s*anywhere;/);
});

test('all four pages expose the actual outside-app account deletion route', () => {
  for (const name of pages) assert.match(source(name), /href="\/backdoor-map\/delete-account"/, name);
  for (const name of pages) {
    for (const [, route] of source(name).matchAll(/href="\/backdoor-map\/([a-z-]+)"/g)) {
      assert.ok(existsSync(new URL(`../src/pages/backdoor-map/${route}.astro`, import.meta.url)), `${name}: ${route}`);
    }
  }
});

test('privacy copy separates explicit opt-in, private snapshots and community records', () => {
  const text = compact(source('privacy'));
  for (const required of [
    'Signing in alone does not upload saved places',
    'not end-to-end encrypted',
    'authorized service operators can access server-held content',
    'private to your account',
    'older cloud snapshot',
    'Provider disaster-recovery copies',
    'random request identifier',
    'not anonymous',
    'Amazon Simple Email Service',
  ]) assert.ok(text.includes(required), required);
  assert.doesNotMatch(text, /deleted within \d+|deleted after \d+|retained for \d+ days|unlimited cloud/i);
});

test('support and requests distinguish deletion from pause and never solicit recovery secrets', () => {
  const support = compact(source('support'));
  const requests = compact(source('data-requests'));
  assert.match(support, /Never send support a sign-in code, recovery key, session token, private note or backup file/);
  assert.match(support, /keep the app installed/);
  assert.match(requests, /without reinstalling the app/);
  assert.match(requests, /Pausing backup or signing out is not account deletion/);
  assert.match(requests, /unverified message cannot authorize deletion/);
  assert.match(requests, /exported files and separately submitted community contributions are not deleted/);
});
