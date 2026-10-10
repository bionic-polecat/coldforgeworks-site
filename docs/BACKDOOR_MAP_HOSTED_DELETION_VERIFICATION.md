# Hosted account deletion — October 10, 2026

This update supersedes the historical September 27 disabled/local-only status in
BACKDOOR_MAP_ACCOUNT_DELETION.md. The owner approved publication after disposable
customer-beta verification and approved Netlify CLI authorization this session.

## Published and verified

- Host: Stream PC (STREAMINGPC).
- Project: `superb-crumble-11cbe2`, ID `223c917d-8805-4126-b168-f2678deee529`.
- Live route: https://backdoormap.com/backdoor-map/delete-account
- Activation deployment: `6ac9d7eea8b73820b5d7a67d`.
- Final readability correction: `6ac9d8fb5c0ed18993cac1a2`.
- Previous disabled deployment retained: `6ac1178e53392d972d34106f`.
- Company-site project was not deployed or reconfigured.

A new disposable account used normal email OTP authentication. One synthetic
backup was saved and read back. The hosted browser form sent a fresh code,
verified it, and displayed the successful account/backup deletion result.
Scoped database counts changed from one account/backup to zero accounts,
sessions and backups. The separate reviewer account and its synthetic restore
backup remained present. No real phone data was uploaded or deleted.

The hosted API rejects cross-origin requests (403), missing confirmation (400),
and replay of the consumed code (400). The enabled page preserves no-store,
no-referrer, DENY framing and its frame/form/base CSP. No provider key appears in
the returned HTML. The browser loaded no Cloudflare analytics beacon on this
route. At the observed 539-pixel viewport there was no horizontal overflow.
Dark-site legal-copy colors were overriding the light product layout; a scoped
color correction now renders dark text on white, verified in the live browser.

## Build and deployment

Use `PUBLIC_SITE_BRAND=backdoor-map` and `PUBLIC_WEBSITE_ANALYTICS=true` for the
standalone build. `npm test` passes all 34 checks. After `npm run build`, run
`node scripts/verify-netlify-build.mjs` to test the actual packaged function with
mocked upstream requests and no real credentials or hosted changes.

Deploy the full `dist` plus generated `.netlify/v1/functions` using the existing
project. Do not use the older static marketing-publication script to deploy this
feature. The initial activation used deployment-specific function variables.
All four required variables are now also persisted and read back in Netlify for
the **production context only**, so later production builds retain configuration.
The project's current plan does not permit selecting only the Functions scope;
its supported all-scopes setting is used. The only key is the existing **public
anon** key, never an administrator credential. No key value is committed here.
Previews and local development have no enabled production values configured.

Rollback is available using the previous deployment above. Verify the page and
API afterward; a dashboard action alone is not proof that rollback took effect.

## Dependency review

The previously installed Astro 5.12.9 / Netlify adapter 6.5.6 had outstanding
advisories before introducing the hosted server route. Updated to Astro 7.3.8
and adapter 8.2.9, plus compatible Tailwind/build dependency updates. Preserved
the previous HTML whitespace behavior. All seven existing public pages retain
their published visible copy after the update.

The resulting audit reports zero critical and 14 high findings in the development/
build dependency tree. None of those flagged package manifests is present among
the 20 packages in the deployed function. This packaging check is not an
exhaustive security audit; remaining upstream tooling advisories need follow-up.
Do not use `npm audit fix --force` to downgrade the adapter to an incompatible
version. See the [Astro migration guide](https://docs.astro.build/en/guides/upgrade-to/v7/)
and [Astro image-processing advisory](https://github.com/withastro/astro/security/advisories/GHSA-26w7-cxv4-gfx2).

This website verification does not constitute native app submission or paid
public-release approval. Remaining store, device and commerce gates still apply.
