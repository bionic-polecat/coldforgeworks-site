# BackDoor Map retention clarification

Published October 12, 2026 at23:24:47 UTC after the owner's explicit
"Approve privacy-page update" reply. Netlify production deploy
`6acd6c2d70c5c38d958def96` updates only the Privacy and Data Requests HTML files
against publication`6aca64a2208c9cbba230f905`. The other27 static digests,
function runtime/configuration and production environment are preserved.
Primary checkout work is preserved. No app-store submission or paid release.

## Changes

- Name the restricted local/private Google Drive server recovery copies and
  their possible account/private-backup contents. Distinguish them from the
  phone's optional account snapshots.
- State actual retention: one verified copy per latest seven successful backup
  days, cleanup after a new verified copy, Drive Trash normally30 additional days,
  and longer retention possible after failures/missed runs. No immediate or
  seven-calendar-day complete-erasure promise.
- Record LocationIQ's actual October12 support reply: query processing through
  the proxy, no forwarded account email/private notes/device ID/customer IP,
  up-to14-day security logs and optional support tracing up-to30days. No tracing
  was requested. Retain the provider's improvement/aggregate purposes.
- Update the two pages' Last updated field, preserving the July18 effective date,
  legal acceptance versions, active account deletion behavior and Maps wording.

## Evidence

BackDoorMap docs SERVER_BACKUP_SETUP.md and SERVER_RECOVERY_RUNBOOK.md describe
verified real copies, actual rotation and a real isolated full database restore.
The durable deletion ledger and hosted configuration recovery remain unfinished;
the procedure quarantines restored Auth/private data until authoritative deletion
history is available. This copy change does not close those gates.

LocationIQ mail: hello@locationiq.com to support@coldforgeworks.com, October12
02:53 Eastern, subject "Re: BackDoor Map API query retention and processing
purposes," reference90138:843724. Only the first two of twelve attachment pages
were reviewed. No new DPA was accepted and search remains non-ephemeral/shared
in the conservative Google Play draft; exact Google SDK disclosures remain open.

Google Drive's official Trash rule was checked October12:
https://support.google.com/drive/answer/2375102?hl=en

## Publication boundary

Use the existing tested Netlify publication workflow only after owner approval.
Preserve the currently active deletion route, its existing configuration and
security headers; do not run the historical marketing-only export, which
redirects deletion away. Do not deploy the primary checkout's unrelated dirty
files as part of this update.

## Publication verification

- All34 existing website tests and both company/app-domain builds pass in the
  isolated source worktree. No source rebuild of the dirty primary checkout
  was used for publication.
- The published HTML digests match the reviewed artifacts. The other27 static
  files match the prior deployment. Both live pages show the October12 update.
- Netlify required re-uploading the existing SSR function. The preserved
  October10 generated function was packaged using the existing official CLI.
  Two packages have identical contents for all283 files but different archive
  entry order/checksums. The uploaded digest is
  `74819999b711240313823a132398c5e90376bb7a0fc6f87e95d5aa72ec4db8d4`.
  The original live archive was unavailable for a content-level comparison;
  do not claim its ZIP digest was preserved. Source code was not rebuilt.
- The ready preview intentionally has no production-only deletion configuration.
  It fails closed with503 and exposes no confirmation form. The final deploy
  was created in production context; the preview was not restored onto the
  public alias.
- Production retains Node24/stream invocation,1024MB/us-east-2, the existing
  route/generator/bootstrap configuration and site environment. The live
  deletion form remains enabled with no-store/no-referrer. A malformed request
  returns400 before Auth/email/deletion activity; no real account was deleted.
- Published copy,29 static digests and function metadata verified at23:25:06 UTC.
  The prior production deploy is retained for rollback. Google provider/SDK
  reconciliation and safe hosted recovery remain separate release gates.
