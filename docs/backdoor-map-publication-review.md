# BackDoor Map public pages - operator review

Status: Pages finalized for initial publication on July 18, 2026. This is an internal operator record and is not part of the public pages.

## Verified data-flow checklist

| Area | Verified current behavior | Primary local evidence |
|---|---|---|
| Installation identifier | The app generates a random UUID, stores it in AsyncStorage, and reuses it for contributions. It is anonymous but installation-specific, not authentication. | `Backdoor Map/lib/device-id.ts`; `services/public-contribution-gateway.ts` |
| Accounts and login | No account or login flow is used. The Supabase client disables auth session persistence, refresh, and URL session detection. Internal `users` rows are created from device IDs for crowd workflows. | `lib/supabase/client.ts`; migration `20260523120000_milestone3_crowdsourcing.sql` |
| Buildings | Selected/geocoded address, city, state, optional postal code, search slug, and building coordinates can be stored. | migration `20260522120001_create_tables.sql`; `services/building-service.ts` |
| Entrance pins | Submitted entrance coordinates, status, confidence/count fields, timestamps, and creator installation ID are stored. Creator identity is not returned in the private entrance-report contract. | migrations `20260522120001_create_tables.sql`, `20260523120000_milestone3_crowdsourcing.sql`, `20260715205236_phase2_fetch_entrance_report.sql` |
| Pin votes | Confirm/reject vote, pin reference, installation ID, internal user reference, and timestamps are stored. One installation vote per pin is updated rather than duplicated. | migrations `20260522120001_create_tables.sql`, `20260523120000_milestone3_crowdsourcing.sql` |
| Pin corrections | Proposed coordinates, status, installation/internal user references, vote counts, and timestamps are stored. | migrations `20260522120001_create_tables.sql`, `20260531120000_milestone7_pin_corrections.sql` |
| Correction votes | Prefer-suggested/keep-current choice, correction reference, installation/internal user references, and timestamps are stored. | migration `20260601120000_milestone9_correction_review.sql` |
| Reviewer notes | Optional note text up to 280 characters, workflow, building/pin/correction references, installation/internal user references, and timestamp are stored privately. There is no client read policy. | migration `20260610120000_milestone10_placement_validation.sql`; `services/reviewer-note-service.ts` |
| Content reports | Private reports target exactly one active entrance pin or pending correction. The client exposes three exceptional reasons and no free text. The foundation schema still accepts a legacy fourth `incorrect_location` value, which the current UI does not expose. | migration `20260716230000_release_compliance_foundation.sql`; `services/content-report-service.ts` |
| Legal acceptances | When enabled and seeded, the server records installation ID, Terms version, Community Standards version, acceptance time, and optional app version. A local version cache is only a UI optimization. No legal rows are currently seeded. | migration `20260716230000_release_compliance_foundation.sql`; `services/legal-acceptance-service.ts`; `lib/legal-acceptance-storage.ts` |
| Denylist and moderation | Private denylist history can store installation ID, reason, start/expiry/revocation times. Moderation actions store target, action, reason code, operator database identity, and timestamp. Operator functions can reject content and optionally denylist its creator. | migration `20260716230000_release_compliance_foundation.sql` |
| Rate limits | Fixed-window counters store operation, subject type, opaque subject value, bucket, count, and update time. Device subjects are SHA-256 hashes. Trusted-IP limiting exists in code but is currently disabled; global counters do not identify an installation. | migration `20260716233000_release_compliance_gateway_support.sql`; `supabase/functions/_shared/gateway-runtime.ts`; rollout docs |
| LocationIQ search | Search text goes to the Supabase `locationiq-autocomplete` Edge Function and then to LocationIQ. A valid installation ID may reach Supabase for rate limiting but is not added to the LocationIQ upstream request. The product database does not store query text. | `services/geocoding/locationiq.ts`; `supabase/functions/locationiq-autocomplete/handler.ts` |
| Submitted coordinates | Building, entrance-pin, and correction coordinates deliberately submitted through product workflows are stored in Supabase. | base and correction migrations; product RPC services |
| Foreground GPS | Permission is requested only for foreground use after user action. Current/watch coordinates are used to update map state. No app code sends that live current-location value to Supabase. No background permission or background location task exists. | `hooks/use-user-location.ts`; `app/(tabs)/index.tsx`; `app.json` |
| Favorites and Recents | Address/building metadata, coordinates, custom saved name, timestamps, and selection count are stored in local AsyncStorage only, capped at 25. There is no server sync or account. | `lib/saved-places-storage.ts`; `constants/saved-places.ts` |
| Third-party services | Supabase hosts database/RPC/Edge services. LocationIQ processes search queries. Map display uses Apple Maps on iOS and Google Maps on Android. | `package.json`; `services/geocoding/locationiq.ts`; architecture docs |
| Analytics and crash reporting | No third-party analytics, advertising, Sentry, Crashlytics, or equivalent client SDK is present in package/config inspection. | `package.json`; `package-lock.json`; `app.json` |
| Tracking and advertising | No advertising SDK or behavioral tracking integration is present. These website pages add no cookies, analytics, forms, or third-party scripts. | app dependencies; website diff |
| Retention | Local saved data persists until user action/app removal subject to platform behavior. No fixed automatic retention schedule exists for contribution, legal, denylist, report, or moderation records. Rate counters use fixed windows, but automatic row cleanup is not implemented in migrations. | storage code; compliance migrations; database docs |

## Remaining operator and policy work

- Confirm final retention periods and cleanup operations for contributions, reviewer notes, legal acceptances, reports, denylist history, moderation actions, and expired rate-counter rows.
- Confirm how support staff will verify anonymous data requests without exposing or relying on raw device IDs.
- Confirm whether support email handling needs a written internal access, retention, and deletion procedure.
- Confirm provider-specific statements after reviewing current Supabase, Netlify, LocationIQ, Apple, and Google terms, privacy notices, data-processing terms, and log retention.
- Confirm the intended minimum user age and whether the service should be expressly limited to users 13 or older.
- Confirm whether any state-specific privacy notices or request rights are required for the intended launch geography.
- Confirm whether a business-transfer disclosure and legal/safety disclosure language matches company policy.
- Decide whether to remove the legacy `incorrect_location` report reason from the database/Edge contract in a later schema slice. The current app UI does not expose it.
- Confirm whether a dedicated postal address is required in the public policy or store listing.

## Attorney-review items

- Terms warranty disclaimer and limitation-of-liability scope.
- Contribution-content license scope and duration.
- Moderation, denial-of-contribution access, and service-change language.
- Children's/minors language and minimum age.
- Data-request rights, verification, exceptions, and jurisdiction-specific disclosures.
- Whether governing law, venue, severability, or other clauses should be added. No governing law or arbitration clause was guessed in this draft.

## Final public URLs

- Overview: `https://coldforgeworks.com/backdoor-map`
- Privacy Policy: `https://coldforgeworks.com/backdoor-map/privacy`
- Terms of Use: `https://coldforgeworks.com/backdoor-map/terms`
- Community Standards: `https://coldforgeworks.com/backdoor-map/community-standards`
- Support: `https://coldforgeworks.com/backdoor-map/support`
- Data Requests: `https://coldforgeworks.com/backdoor-map/data-requests`

## Later app and database configuration

Set these app environment variables only during an approved rollout:

- `EXPO_PUBLIC_PRIVACY_POLICY_URL=https://coldforgeworks.com/backdoor-map/privacy`
- `EXPO_PUBLIC_SUPPORT_URL=https://coldforgeworks.com/backdoor-map/support`
- `EXPO_PUBLIC_DATA_REQUESTS_URL=https://coldforgeworks.com/backdoor-map/data-requests`

Seed these exact URLs into `public.legal_documents` only during an approved Supabase rollout:

- Terms: `https://coldforgeworks.com/backdoor-map/terms`
- Community Standards: `https://coldforgeworks.com/backdoor-map/community-standards`

The legal rows also require an operator-approved version, SHA-256 content hash, publication timestamp, and current-version flag. The app treats the server's version and content hash as authoritative.

If only the domain or URL changes and the rendered legal content is byte-for-byte unchanged, the existing document version can generally be preserved so the application does not force reacceptance. The operator must publish the same content, recompute and verify that the SHA-256 remains identical, and update the URL without changing the version. Any substantive wording change should receive a new version and may require renewed acceptance.

## Future dedicated-domain migration guidance

The initial canonical URLs are the `https://coldforgeworks.com/backdoor-map/...` routes listed above. A future dedicated BackDoor Map domain should be handled as a separate, approved website and app rollout:

- Publish the same reviewed document content at the new HTTPS URLs before changing app or database configuration.
- Keep permanent redirects from the initial `coldforgeworks.com` legal URLs so existing links remain usable.
- Verify that the rendered Terms and Community Standards content has the same SHA-256 before preserving an existing legal version. A content change requires a new version and may require reacceptance.
- Update the three public-information app environment URLs and the two seeded legal-document URLs only through their approved rollout procedures; do not change those settings merely because the website routes exist.
