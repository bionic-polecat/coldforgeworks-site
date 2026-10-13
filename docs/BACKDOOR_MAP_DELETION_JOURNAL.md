# BackDoor Map deletion journal

## October 12 approved live deletion recovery safeguard

The owner approved the concrete safeguard and its two privacy paragraphs.
Production website deploy `6acd806f2ea2923826f37531` is live; all 29 stored static
digests match the reviewed package and 27 unrelated static files are unchanged.
The deletion form remains enabled with no-store/no-referrer; malformed input
returns HTTP 400. The beta journal rejects missing sign-in with HTTP 401 and GET with HTTP 405.

Beta `delete-backup-account` version 3 preserves verify_jwt=true and requires the
exact private production journal before hard deletion. All three deployed files
match reviewed source `21e1dc2`; website source is `5151d0e`. The ordinary disabled
entrypoint is not the deployed beta entrypoint. Activation began October 13
00:56:11.872 UTC (October 12 20:56:11 Eastern), after website verification.

A genuine fresh-OTP disposable beta account saved one synthetic private backup.
Deletion returned HTTP 200 only after its minimal independent cloud record existed;
two strong reads verified it. Its old session was denied. Scoped SQL found zero
fixture users, sessions, identities, private backups and one-time tokens.
Test code/token/hash material was erased. The minimal synthetic deletion intent
is deliberately retained; provider audit logs may remain. No customer or reviewer
account was changed. The real DEV failure/recovery checks also pass.

A protected activation audit is stored outside the database on Mini PC at
`/var/lib/backdoormap-deletion-journal-audit/activation-20261013T005611Z.json`.
The existing encrypted exporter then completed `bdm-20261013T010103Z-qjxwg4vx` (841,240 bytes)
with full private Drive readback. Source CI passed at immutable runtime/server
source `21e1dc2`: https://github.com/bionic-polecat/backdoor-map/actions/runs/38328808956.

This does not prove uninterrupted future enforcement or full hosted recovery.
Older snapshots with unproven deletion history remain quarantined. Administrative
deletions must be reconciled, and any later rollback/gap recorded. Neither app
store received a public submission or paid release. No subscription was added.

Earlier October 12 preparation: local checks and disposable DEV verification passed before the approved activation above.
The independent private, strongly read Netlify store records only account UUID, project reference and deletion-intent time. Online Auth, recent email-code authentication and a live session precede storage. A strong readback precedes the Edge receipt; the Edge function requires this receipt before hard deletion when its optional flag is enabled. No email, code, JWT, administrator key, private note or backup enters journal storage.

Configuration is disabled by default, separates DEV preview from beta production, rejects privileged/mismatched keys, and fails closed on missing/ambiguous storage confirmation. Existing valid intents are reused without rewriting. Eight gateway groups pass; full website suite42 tests and both brand builds pass.

Private DEV verification uses only disposable accounts. The later production activation received explicit owner approval after concrete DEV evidence. An intent is not proof of completed deletion. Retain protected records while recovery copies might still contain the account. A first record or checksum is not proof of continuous enforcement. Missing/gapped history keeps recovered private accounts quarantined.

The app repository maintains the offline reconciliation tool, isolated SQL tests and detailed activation/recovery procedure in docs/03_OPERATIONS/DELETION_JOURNAL_ROLLOUT.md. Neither this source commit nor a preview publishes the paid app.

The corrected private DEV preview6acd780d0c95bf7a5b0a0cb7 proves actual independent
strong storage/readback. Invalid owned storage blocked account deletion without
removing either fixture backup; valid confirmation preceded hard deletion. A
RAM-only clone applied the actual cloud intent, kept survivor/public data and
invalidated every recovered session. Fixture accounts, private backups and both
owned store keys were cleaned up; the temporary Edge verifier now returns503.
This is not proof of email delivery, production-wide coverage or hosted recovery.

Netlify Lambda functions lack automatic build-only CONTEXT. Supply the explicit
BACKDOOR_MAP_JOURNAL_CONTEXT fallback only in its matching deploy context.
A contradictory real CONTEXT wins and fails closed. Production deploy
6acd806f2ea2923826f37531 now has the enabled beta journal configuration and both
approved identifier/time-retention paragraphs. The prior production deploy
6acd6c2d70c5c38d958def96 remains a protected rollback reference, not current state.
