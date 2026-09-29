# BackDoor Map dedicated website

September 29, 2026. BackDoor Map marketing publication and the refreshed
ColdForgeWorks company site are live. The dated local-only observations below are
historical.

## Marketing publication update (September 28, 2026)

The owner authorized publication and free Cloudflare analytics. A deliberately
static marketing-only bundle is now live at `https://backdoormap.com/` through
Netlify project `superb-crumble-11cbe2`, deploy `6abb1e088ea7145b2d24ed05`.
This is not an app release or approval of the pending account-aware policies.

- Namecheap BasicDNS remains authoritative. Added only apex ALIAS to
  `apex-loadbalancer.netlify.com` and www CNAME to
  `superb-crumble-11cbe2.netlify.app`. Existing DKIM, DMARC, SPF and mail settings
  were preserved. HTTPS is enabled for both names; www redirects to the apex.
- `scripts/prepare-marketing-publication.mjs` exports an explicit file allowlist,
  rejects draft/deletion markup, and excludes server functions and account APIs.
  It keeps the five previously published company policy pages from commit
  `0b98f6cab3f8b9a407acca5a76f7e9ed137c1d58` byte-for-byte at the build level.
  BackDoor Map links redirect to those existing policies. The raw current
  adapter output remains unsuitable for public upload while drafts are pending.
- Publication artifact: `C:/Users/mbp31/AppData/Local/Temp/cgw-publish-backdoor-map-yWEpAG/`.
  ZIP SHA-256: `83A3D35E30EF63A2B31F06611E663F07DA6A0209BE03DE2C6B5D9FB421F9E392`.
  The adjacent manifest records every exported file's hash, not just Git HEAD;
  this publication includes reviewed uncommitted website work. No commit/push.
- Two free manual Cloudflare Web Analytics sites were created for the exact
  company and product hostnames. Public beacon identifiers are intentionally in
  `src/lib/website-analytics.mjs`; these are not API credentials. Automatic
  injection stays off. Build opt-in plus exact HTTPS root-path gating excludes
  preview hosts, account/policy paths, query strings, fragments, identifier-bearing
  referrers and Do Not Track visitors. No cookies, session replay or form capture
  was added. This deliberately undercounts visits and provides no historic backfill.
- Website-only privacy is at `/website-privacy`; app policy drafts remain local.
  The BackDoor Map production DOM loads its expected beacon. Privacy-page DOM
  has zero analytics scripts. Dashboard traffic ingestion has not yet been proven.
- Tests: 34/34 pass; both legacy-policy and current marketing builds pass;
  `git diff --check` passes. Hosted homepage, privacy, community standards,
  existing policy redirects, screenshots, robots and sitemap return 200.
  The excluded account API returns 404. All five homepage images load, no console
  errors were observed, and 375px responsive DOM has no horizontal overflow.
- Company refresh artifact is prepared at
  `C:/Users/mbp31/AppData/Local/Temp/cgw-publish-company-ubPwsU/` with the live
  product-domain link enabled. It was published to the existing Netlify project
  `coldforgeworks-site` (`43b94185-a1f5-441f-ad6a-1e0903d4aad6`) as deploy
  `6abb299d12979880d0ed895d`; its GitHub integration remains unchanged. The
  approved artifact SHA-256 is
  `CA1D55A3D7829687E05DE9DBCCD86CB4A9FC13DFF93057EB9BAAA976DC791844`.
- The live company root, website privacy page and preserved BackDoor Map policy
  pages match the prepared artifact; the root loads the configured Cloudflare
  beacon and has no horizontal overflow. The account-deletion API remains
  excluded and returns 404 on the public site.
- Search Console domain ownership is verified under `mpedone@coldforgeworks.com`
  after adding the Google-provided apex TXT record. Both authoritative DNS and
  Google's resolver expose that record; the connector confirms `siteOwner`.
  Google successfully read `https://backdoormap.com/sitemap.xml` and reports
  three discovered pages with Success status. This does not guarantee indexing
  or rankings. Google accepted the ColdForgeWorks sitemap with Success status and
  reported eight discovered pages on September 29, 2026.

Do not replace this controlled publication with a normal source push until the
pending policy/deletion review is complete. Preserve the existing Netlify deploy
as rollback; no database or app changes are part of website rollback.

## Hosting decision and observed state

Use a **separate Netlify project in the existing hosting account**, using this
Astro repository and its existing Netlify adapter. Do not replace the existing
ColdForgeWorks project or add BackDoor Map as an alias of that project.

- A read-only request to `https://coldforgeworks.com` returned HTTP 200, the
  company page title, `Server: Netlify` and a Netlify request ID.
- `backdoormap.com` uses `dns1.registrar-servers.com` and
  `dns2.registrar-servers.com`. Keep this external DNS arrangement. Adding the
  website does not require transferring the domain or moving email DNS.
- After owner sign-in, the existing account was inspected read-only: team
  `mpedone12`, project `coldforgeworks-site`, ID
  `43b94185-a1f5-441f-ad6a-1e0903d4aad6`. The legacy Free plan lists $0/month,
  500 projects, 100 GB bandwidth and 300 build minutes. The dashboard listed
  one project, 22 MB bandwidth and zero build minutes at this inspection. There
  is apparent capacity for the separate site without a plan purchase; verify
  creation-time terms/limits rather than promising indefinite free hosting.
- Continuous deployment is linked to `bionic-polecat/coldforgeworks-site`,
  production branch `main`. Base directory `/`, build `npm run build`, output
  `dist`, Node 22.x, Ubuntu Noble 24.04; build status active. Pull-request previews
  are enabled and build logs are public. Do not push unfinished drafts to `main`.
  The dashboard also offers a GitHub-account connection; no new connection,
  repository access or key was granted. Existing linkage was not altered.
- Visitor password protection requires an upgrade on this account. Do not
  assume deploy previews are private or use a guessable URL as access control.
  Keep policy drafts local until approved, or obtain explicit approval for a
  genuinely protected review mechanism. No upgrade was purchased.
- No site was created, uploaded, published or linked. No DNS, TLS, environment,
  email, Supabase, billing, app version or build number was changed.

## Build selection

| Target | Build-time `PUBLIC_SITE_BRAND` | Canonical origin | Root page |
|---|---|---|---|
| Existing company site | unset or `company` | `https://coldforgeworks.com` | Existing company homepage |
| Dedicated app site | `backdoor-map` | `https://backdoormap.com` | BackDoor Map homepage |

Unknown values fail the build. Selection is never derived from a request Host
header. Keep this variable site-scoped, not shared across the Netlify team.
Both builds use `npm run build`, publish `dist`, and retain the adapter-generated
server function for the disabled deletion route. A static drag-and-drop of only
`dist` is not a substitute for deploying the complete adapter output.

Local PowerShell examples:

```powershell
$env:PUBLIC_SITE_BRAND = 'backdoor-map'
npm test
npm run build
$env:PUBLIC_SITE_BRAND = 'company'
npm run build
Remove-Item Env:PUBLIC_SITE_BRAND
```

The product and help routes remain under `/backdoor-map/...` in both builds.
The dedicated root and `/backdoor-map` overview share the dedicated root
canonical. Existing app links to `coldforgeworks.com/backdoor-map/...` remain
supported; no app configuration change or redirect to unpublished policies was
made. The initial split preserved company homepage content; the owner's later
September 28 request explicitly authorizes the local company refresh described
below. No change to the live company site has been published.

## Company homepage refresh

The company homepage now emphasizes the two public-facing products rather than
repeated generic company copy and three equal-weight project cards. It links to
live `https://reviveme.gg/`, keeps that brand lowercase, accurately describes
BackDoor Map's personal saved places/notes and pre-release status, and moves
ForgeScout into a smaller internal-tools mention. Actual Android development
imagery, jump links, visible keyboard focus, a skip link and a canonical company
URL are included. Existing support contact and company identity remain intact.

The company-only build flag `PUBLIC_BACKDOOR_SITE_LIVE` defaults to false/unset,
so its main product link uses the working `/backdoor-map` overview. After the
dedicated domain and public pages are verified, setting it to exactly `true`
selects `https://backdoormap.com/` and removes the website-coming-soon notice.
Unexpected values fail closed; the flag does not activate deletion or announce
that mobile store downloads are available. No remote flag was changed.

Current deterministic total: 26 tests. Two new checks cover exact link selection
and truthful company product copy. Desktop/mobile, normal/doubled-text browser
checks cover the refreshed company page, imagery, keyboard focus, anchor links,
overview navigation and isolation from the dedicated homepage and policy routes.
Screenshots are outside Git: `C:/Users/mbp31/AppData/Local/Temp/coldforge-refresh-*.png`.
Earlier 24-test and unchanged-homepage evidence below is dated before this
explicitly requested refresh, not a claim that the new company copy is identical.

## Publication sequence, not yet executed

1. Sign into the existing Netlify account and read the company project settings,
   build/runtime, plan and repository integration. Record the exact target IDs.
2. Finish policy/retention approval and the coordinated legal version/effective
   date. Privacy, Terms, Support and Data Requests currently say they are release
   drafts. Do not publish them as effective policies or silently change old legal
   versions. See `BACKDOOR_MAP_ACCOUNT_DELETION.md` for the separate activation gate.
3. After authorization, create a separate BackDoor Map project with the build
   selection above and deletion disabled. Do not copy team-wide secrets or turn
   on production auto-publishing of this dirty/unreviewed branch. A shared repo
   does not imply shared deployment approval: a push can build both projects.
4. Validate an access-controlled preview using the complete Netlify adapter
   output. Check static routes, actual server route, disabled deletion behavior,
   headers and absence of private environment values. Do not expose draft legal
   content on an unrestricted preview merely to test deployment.
5. After publication approval, add `backdoormap.com` and `www.backdoormap.com` to
   the new project, select the apex as primary, and use the exact DNS instructions
   provided for that project. Export/record existing DNS before any change.
   Change only necessary website records. Preserve all MX, SPF, DKIM, DMARC,
   SES MAIL FROM, verification and unrelated records. Do not change nameservers.
6. Verify HTTPS, apex/www redirect, canonical URLs, navigation, support and
   policy links, asset loading and no mixed content. Recheck account email DNS
   and existing ColdForgeWorks URLs. No invented App Store/Play links: add the
   actual approved links only when available.
7. Keep account deletion disabled until scoped disposable-account tests, quota,
   abuse, monitoring, retention and approval gates pass. Approved activation is
   separate from serving marketing pages. Roll back website publication using
   its previous known-good Netlify deploy, never a database restore.

## Local evidence

- `npm test`: 24/24 pass (14 deletion handler/configuration, six release-copy,
  four dedicated-site checks). No hosted email, Auth or database request.
- Real Netlify adapter production builds: dedicated and company modes pass.
- Playwright: 32/32 dedicated-route layout checks across eight routes, desktop
  1440x1000 and mobile 375x812, normal and doubled root font size. No page errors
  or horizontal document overflow; deletion has no form while disabled.
- All six FAQ keyboard open/close interactions and explore/support/home links
  pass. Company homepage and privacy page additionally pass at both widths,
  retaining the original dark layout and company policy canonical.
- Desktop/mobile screenshots were visually reviewed. Browser requests outside
  the two loopback test origins were blocked. These tests do not prove native
  screen-reader, physical zoom, hosted headers or real account deletion behavior.
- Screenshots: `C:/Users/mbp31/AppData/Local/Temp/backdoor-domain-desktop.png`,
  `backdoor-domain-mobile.png`, `backdoor-domain-mobile-large.png`, and the
  corresponding `*-viewport.png` files in that same directory, outside Git.
- Local preview at `http://127.0.0.1:4342/` was restarted after the PC reboot.
  It is a temporary process, not a startup service or public hosting. The
  external preview config omits the Netlify adapter only to avoid the installed
  development emulator's Deno flag issue; production builds retain the adapter.

## Asset provenance and claims

`public/backdoor-map/service-entrance.webp` is a compressed generated bitmap of
a fictional generic service entrance, not a real location or app screenshot.
The original generated PNG remains outside Git at
`C:/Users/mbp31/.codex/generated_images/019f67c5-0923-7d52-907a-528d76b54ce1/exec-f8453290-1ecf-4768-bc07-1d70fb1ab4fd.png`.
Generation brief: wide 16:9 photorealistic architectural image of a generic
fictional U.S. city service facade; charcoal masonry, muted teal loading and
service doors on the right, yellow bollards, daylight, empty left wall for text;
no people, vehicles, logos, words, signage, maps or phone mockups. The saved
asset is an optimized WebP conversion, not a replacement for product evidence.

The three `*-preview.webp` images come from actual Android development evidence
in `C:/Users/mbp31/AppData/Local/Temp/backdoor-dev-build-evidence-20260927/`:
`android-search-dallas.png`, `android-normal-community-fixed.png` and
`android-offline-notes.png`. Notes contain disposable QA content, not customer
information. Development status is explicitly disclosed, and map attribution is
retained. `mark.svg` is a simple site icon, not a changed mobile application icon.

Copy presents personal saved entrances/notes as the core value. Community
coverage is not guaranteed; new searches need internet; offline map tiles are
not guaranteed; local-only records can be lost on uninstall. Backup is described
as being prepared for release, company sharing as future work, and $2.99 as the
planned U.S. one-time price. There is no checkout, waitlist, analytics script,
fabricated store URL or promised release date. Support retains the existing
monitored-address candidate `support@coldforgeworks.com`; no new mailbox is claimed.

References checked September 28:
[Astro on Netlify](https://docs.astro.build/en/guides/deploy/netlify/),
[site-scoped environment variables](https://docs.netlify.com/build/environment-variables/get-started/),
[external DNS](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/).

## Search and traffic readiness (September 28, 2026)

Read-only Search Console inspection confirmed owner access to coldforgeworks.com
and reviveme.gg; backdoormap.com was not in the connected property list.
ColdForgeWorks had 40 web-search impressions and zero recorded clicks for
May 29, 2025 through September 25, 2026. This is not an all-traffic visitor count
and cannot establish whether direct/referral visitors have arrived. No sitemap
was submitted for ColdForgeWorks. reviveme had 56 clicks and 1,325 impressions
for August 29 through September 25, with two submitted sitemaps showing no errors.

Netlify Web Analytics was disabled. Its dashboard offered activation for
$9/month for this project; nothing was purchased or activated. The free request
and bandwidth counters include non-browser traffic and our own checks, so they
are not evidence of a number of human visitors. Netlify documents up to 30 days
of backfill when analytics is enabled, not lifetime recovery:
https://docs.netlify.com/manage/monitoring/web-analytics/overview/

Local search preparation now includes domain-specific sitemap.xml and robots.txt,
canonical/Open Graph metadata, and noindex for release drafts and the account
deletion page. Sitemaps deliberately omit drafts, account actions, API routes,
and the standalone duplicate overview. noindex is not access protection and does
not authorize publishing unapproved drafts. No tracking scripts were introduced.

Validation: 31 tests pass; both Netlify production build modes pass; rendered
sitemaps, homepage metadata, draft exclusions and local dynamic deletion-page
noindex pass. Both curated static publications and both sitemap submissions are
complete. Cloudflare analytics beacon installation is verified on both live roots;
dashboard ingestion still needs ordinary real traffic and is not treated as a
release blocker. Analytics activation is a separate cost/privacy decision; do not
add session replay, form capture or account-action tracking.
