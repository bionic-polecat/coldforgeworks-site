# Current website publication

October 19, 2026. This supersedes the September static-only publication procedure
in the older domain-site notes and the original starter README. Account-aware
policies and hosted account deletion were approved and launched in October.

## Verified hosting

- Company: `coldforgeworks-site`, site ID `43b94185-a1f5-441f-ad6a-1e0903d4aad6`.
  Git production branch `main`, command `npm run build`, output `dist`.
  October 17 production deploy `6ad3932509b2695f6d7ea5ee`, commit `727c6ed`.
- Product: `superb-crumble-11cbe2`, site ID
  `223c917d-8805-4126-b168-f2678deee529`. No Git build settings returned.
  October 17 manual production deploy `6ad392c8cb4b7761e191ebe7`.

These are observations from the authenticated Netlify API, not assumptions from
the old documentation. No hosting settings or live deployments were changed by
the October 19 source work.

## Build and validate

The production context in `netlify.toml` explicitly enables the already-approved
free Cloudflare homepage measurement with `PUBLIC_WEBSITE_ANALYTICS=true`.
Deploy previews retain the default opt-out. For a local production build before
a manual deployment, supply that same public flag explicitly; a local preview
build must not silently enable it. The component still restricts actual beacon
loading to exact public HTTPS homepages, honors Do Not Track, and excludes
account/policy pages and identifier-bearing URLs/referrers.

Run `npm test`, then `npm run build` for company or `npm run build:backdoor` for
the product. Netlify's known `SITE_ID` selects and validates the corresponding
brand; conflicting or unknown site IDs fail. The default local build is company.
The company build now links to the already-live product website.

Every build verifies the approved policy-source hashes in
`publication-policy.json`, the actual output pages/canonicals, and the presence
of the server bundle. It imports that packaged function and exercises both
disabled/enabled deletion rendering, headers, invalid requests and the complete
mocked deletion sequence. No real email, account or database operation occurs.
Changing approved legal text requires deliberate review and updating its hash;
line-ending differences are normalized. This is a release guard, not an access
control or a replacement for reviewing policy changes.

Deploy the complete Netlify adapter output: `dist` together with generated
`.netlify/v1/functions` and its configuration. Uploading `dist` alone removes
dynamic account deletion. Preserve existing production-only function variables;
never copy production activation or private credentials to previews.

`prepare-marketing-publication.mjs` now exits unsuccessfully before producing
anything. Its old output restored July policy content and redirected deletion
to support. It is no longer a valid deployment path.

GitHub checks build and validate both brands independently on pull requests and
main pushes. Local source checks do not prove those remote jobs have run. The
checked-in build guard takes effect for Git production after the change is merged.

Before an authorized publication, retain the current deployment as rollback,
verify the selected brand and complete function output, then recheck the live
homepage, policies, deletion form/headers and navigation. This change does not
authorize publishing, changing legal copy, DNS, credentials or app releases.
