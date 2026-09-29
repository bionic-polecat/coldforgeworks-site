# BackDoor Map outside-app account deletion

September 27, 2026. Implemented and tested locally; NOT published or enabled.
This does not authorize a deployment, customer deletion, provider configuration
change or real code email. Existing mobile deletion behavior is unchanged.

## Scope

- Page: `/backdoor-map/delete-account`.
- Same-origin server route: `/api/backdoor-map/account-deletion`.
- The browser sends only the entered email, fresh code and deliberate confirmation.
  It never receives a Supabase key, access token, refresh token or backup contents.
- Code requests call Auth with `create_user: false`. This cannot register an
  account. Existing, unknown, throttled and failed send outcomes have identical
  public status/body. This is not a constant-time guarantee or protection against
  enumeration using other existing Auth endpoints.
- Confirmed deletion verifies the code server-side, checks the confirmed email
  owner, and calls the existing `delete-backup-account` Edge Function. That
  function remains responsible for fresh-auth/live-session authorization and
  account deletion. The website never uses an admin key or direct database query.
- Tokens live only in one server request. The route attempts to sign out only
  that temporary session in `finally`. If transport fails before a token is
  received, or logout fails, provider expiry/revocation remains relevant; do not
  promise that this best-effort operation always revokes a session immediately.
- Unknown deletion outcome is not success or cancellation. No automatic retry;
  direct the customer to support before creating another account. Local places,
  exports and separate public contributions are never modified by the website.
- JSON-only, exact body shapes, a 1024-byte streamed limit, exact allowed origins,
  no-store responses, bounded upstream timeouts and no redirects are enforced.
  No credentials, request bodies, codes or provider errors are logged by this code.

## Activation gate

Default is off. Missing/incorrect configuration leaves an unavailable page and a
503 API response with no upstream request. These are **server environment names**,
not checked-in values or new credentials:

| Name | Requirement |
|---|---|
| `BACKDOOR_MAP_DELETION_ENABLED` | Exactly `true`, only after coordinated approval |
| `BACKDOOR_MAP_DELETION_TARGET` | `beta` for the customer backend |
| `BACKDOOR_MAP_SUPABASE_URL` | Exact existing beta URL, no arbitrary origin |
| `BACKDOOR_MAP_SUPABASE_ANON_KEY` | Existing legacy public anon key for that same project; service-role/session keys rejected |

Local Astro development also permits `dev` with the exact DEV URL and matching
anon key, but a production build/runtime cannot select DEV. Do not use a real key
for mocked local browser tests. No environment file or provider setting was added.

Before activation:

1. Review the locally prepared account-aware Privacy, Support, Terms and Data
   Requests pages. They now remove the older no-account claims and link directly
   to this route, but explicitly render as release drafts instead of claiming
   the historical July 18 effective date. Approve retention and final wording,
   assign the coordinated legal version/effective date and record any required
   renewed acceptance before removing draft status or publishing. Community
   Standards and historical legal seeds are unchanged. These links are not proof
   that the disabled route is ready for customer use.
2. Obtain scoped DEV test authorization, then verify real delivery, wrong/stale/
   reused codes, correct account deletion, cross-account protection and zero
   disposable residue using the deployed existing Edge endpoint. Do not use a
   customer's account or email codes in test artifacts.
3. Review Auth limits and Netlify abuse protection/capacity. Server-proxied Auth
   verification shares the server egress IP; local tests are NOT proof of adequate
   production quota or abuse capacity. No forwarded-IP bypass or new limiter was
   added. CAPTCHA/edge protection may require separate configuration approval.
4. Confirm Netlify's request-body/access-log retention, timeouts and server-side
   env availability, plus current runtime/dependency advisories. Do not log OTP
   bodies or enable analytics/session replay on this page.
5. Approve a monitored support/ownership-escalation process and provider retention
   disclosures. No retention deadline or inaccessible-email identity bypass is
   invented here. The page sets no-store, no-referrer, DENY framing and a scoped
   frame/form/base CSP. Confirm the host preserves these headers; this is not a
   site-wide script CSP or a hosting-configuration change.
6. Validate the hosted route while disabled, authorize enablement, then test only
   disposable approved accounts and confirm no private values reach HTML/assets.

## Local verification

`npm test` runs the isolated request-handler/configuration tests without hosted
traffic. `npm run build` packages the actual Netlify server routes and static site.
The new source adds no package dependency or lockfile change.

`tests/backdoor-release-copy.test.mjs` adds six source-level consistency checks:
no stale no-account claims, explicit draft status, real deletion links, accurate
opt-in/encryption boundaries, safe support/deletion wording and narrow legal-copy
wrapping. These checks are
not a legal review or proof of provider retention. The app owner accepted support
and email-monitoring responsibility September 27; delivery/alert destinations and
coverage still need operational verification. The contact address is unchanged.

September 27 local result: all 19 tests pass (13 handler/configuration and six copy
checks), and the unchanged Netlify-adapter build
passes. A real local request with the feature disabled returns 503/unavailable;
the page exposes no form and preserves no-store/framing headers. No code email,
Auth session, backup deletion or hosted query was performed.

Playwright checks use the real local Astro page and stub ONLY its same-origin API
responses, with all external browser requests blocked. Desktop 1280x900 and mobile
375x812 cover request/confirmation, required checkbox, cancel, success, expired
code, uncertain network outcome, clearing inputs, no browser storage and no
horizontal overflow. A doubled-root-font mobile check exposed a long support
email overflowing; scoped wrapping corrected it, and the repeat passed. These
do not claim real provider delivery/deletion, physical-device zoom behavior or
screen-reader operation. Astro's local developer toolbar is not production UI.

Screenshots are outside Git at `C:/Users/mbp31/AppData/Local/Temp/backdoor-deletion-*.png`.
The existing installed Netlify development emulator failed on Deno's unsupported
`--allow-scripts`. A temporary external Astro config omitted the adapter only for
local preview; the repository's real Netlify production build succeeded unchanged.
No dependency or deployment configuration was modified to hide that limitation.

The four account-aware policy/support pages were also inspected at desktop and
375x812 mobile sizes, each with normal and doubled root font size: all 16 layout
checks pass after fixing long email-address overflow in the shared legal-copy
wrapper. The Data Requests link opens the actual disabled deletion page with no
form. The preview server and browser session were stopped; policy screenshots
remain outside Git at `C:/Users/mbp31/AppData/Local/Temp/backdoor-policy-*.png`.
These are local rendering checks, not physical screen-reader or browser-zoom tests.

Local security diff review completed with no reportable findings. The subsequent
legal-copy overflow CSS and its test were manually reviewed. This is not a
hosted penetration test or operational sign-off. Auth quota, provider retention
and live disposable-account validation remain explicit activation gates.

## Dedicated-domain follow-up: September 28

The local site now supports a separate `backdoormap.com` Netlify build. Exact
HTTPS apex/www origins were added alongside the existing company origins;
the request URL origin must still equal the Origin header. No wildcard, HTTP,
cross-domain request or arbitrary subdomain is accepted. Default-disabled and
project/key guards are unchanged. An added test verifies accepted exact origins,
rejected lookalikes/cross-origins and disabled behavior with no upstream calls.

All 24 current tests pass: 14 handler/configuration, six copy and four site tests.
Both actual Netlify builds pass; 32 dedicated-site layout checks and four company
regression checks pass. The earlier security scan predates the domain addition
and does not constitute a fresh scan of that change. No live deletion test or
activation occurred. See [dedicated-site hosting notes](BACKDOOR_MAP_DOMAIN_SITE.md).

## Read-only operational follow-up: September 27

- Beta `nmbqtjnenjmqbzyagyie` is ACTIVE_HEALTHY. Its organization is on Free;
  the live backup page states that Free does not include project backups. Do not
  claim an operator-restorable seven-day backup window is currently configured.
- Beta Auth shows 30 OTP verifications and 30 sign-up/sign-in requests per five
  minutes per IP, with IP forwarding disabled. The email hourly value was not
  readable in this inspection. Shared server egress capacity still needs testing;
  no secret/admin key or IP-forwarding workaround was introduced.
- AWS console access requires sign-in; current alert/delivery limits could not
  be freshly checked. No new credential was created or retrieved.
- Nothing was published, enabled, emailed or deleted by these inspections.

References: Supabase's [email OTP documentation](https://supabase.com/docs/guides/auth/auth-email-passwordless)
and the BackDoor Map repository's `services/account-backup-service.ts` and
`supabase/functions/delete-backup-account/handler.ts`. The direct Auth payload
format was cross-checked against the installed Supabase client implementation.
