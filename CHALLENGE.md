# S01E03 — what it shows

Review of the course's 4 October 2026 support knowledge base export, prepared by
IvoLondon and Codex on 29 October 2026. This is a fictional course dataset.

## Deliverables

- Parser issue draft: `issues/01-parser.md` — 379 unique reports.
- Form hint issue draft: `issues/02-form-hint.md` — 33 unique reports.
- Membership audit: `issues/report-assignments.json` — every unique report counted once.
- Signed page: `src/routes/kb/incidents/4471-review/+page.svx`.
- Complete rendered page: `rendered/kb/incidents/4471-review/index.html`, with assets in `rendered/_app/`.
- Self-contained reading copy: `rendered/4471-review.html` (explorer controls are static).

## Run and verify

Use Node 22.17+ LTS or Node 24+.

```sh
npm ci
npm run check
npm run build
npm run verify
npm run snapshot
npm run preview
```

Open `/kb/incidents/4471-review/`. To browse the committed rendered site, serve
`rendered/` as the server root, for example with
`python3 -m http.server 4173 --bind 127.0.0.1 --directory rendered`.

This scaffold supplies the SvelteKit 2 build configuration missing from the export.
The original exported files are preserved byte for byte. New evidence code reuses
the supplied classification, deduplication, tenant lookup, and signature functions.
Computed values are rendered by components rather than copied into page prose.
The rendered tree is intentionally committed because the challenge requests the
page as the desk will see it. Rebuild it after changing source or data.

## What the checks establish

The export reconciles to 412 unique reports from 427 rows; 15 overlapping copies
are identical. The supplied model assigns 379 to parser and 33 to hint; 38 intake
tags disagree. Five desk-flagged timing reports stay visible in the parser filing
assignment without claiming a proven mechanism. The July merge spike records desk
activity: 184 reports merged on 2 July; the week received 15 and merged 189.

Verification runs the actual exported functions, checks report membership and
dedupe cases, reconciles weekly totals, and checks prerendered HTML for the signed
stamp, stale-page warning, and new index entry. Browser checks exercise the live
explorer and inspect rendering and console output. No product runtime is supplied;
the issues contain reproduction steps to verify rather than claimed runtime tests.

Build tooling currently has six low-severity npm audit findings in the SvelteKit 2
dependency graph. This course artifact is a static KB with no enhanced form
submissions, authentication, or untrusted remote response headers. The preview
binds to loopback. No public deployment is needed by this challenge.
