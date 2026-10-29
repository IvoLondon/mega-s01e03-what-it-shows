# Parser: month-first parsing for day-first tenants — 379 reports from #4471

## Engineering outcome — 5 October 2026

**Fixed. Close as completed.** The [course engineering update](https://hq.mega.dev/challenges/what-it-shows#engineering-update)
reports #4471 closed on 5 October and the parser fixed by
`fix(dates): parse dd/mm for eu locales`. This is the desk's reported disposition;
the product patch is not included here. The count below is the historical 4 October snapshot.

## Problem

The shared parser reads dates as month/day even when the tenant writes day/month.
Dates where both fields are at most 12 can silently land in the wrong month.
Keep this defect separate from booking-v3's misleading field hint.

## Report count and scope

**379 unique reports** in the 4 October 2026 export, received 1 April–4 October,
across **11 tenants**. The supplied tenant-based model assigns 204 app reports,
150 email reports, and 25 booking-v2 form reports to `parser`.
App and email reports for booking-v3 tenants are also in this group.

Count method: deduplicate `src/lib/data/reports-4471.json` by `id`, filter
`mergedInto === 4471`, look up each tenant, then run `causeOf`/`groupByCause` from
`src/lib/kb/causes.ts`. All tenants on file use day-first date order according to
the platform's `Intl.DateTimeFormat`.

Intake labels alone would miscount this: 356 assigned reports carry `parser`
and 23 carry `hint`. Browser locale is not the tenant's locale.
The complete report-ID membership is in `issues/report-assignments.json`.

## Example and reproduction to verify in the product

R-41200, Harbour Dental, en-GB, booking-v2, app:
“Our 7 April reminder went out on 4 July.”

1. Use a day-first tenant such as Harbour Dental (en-GB).
2. Through the app/shared parser path, enter `07/04/2026` for 7 April.
3. Inspect the stored booking date and resulting invite.

Expected: 7 April. Reported result: 4 July, consistent with reading the month first.
R-41205 provides a browser-locale counterexample: Morrow Tax's tenant is fr-FR,
but its browser is en-US and intake guessed `hint`; it still follows the parser path.

These are report-supported reproduction steps. The product runtime is not included
in this export, so this repository does not claim to have executed them.

## Investigation and acceptance

- Parse using the tenant's intended date order; validate ambiguous and invalid input.
- Check app, email, and booking-v2 form paths without changing tenant date semantics.
- Verify day-first dates round-trip through storage and invites without swapping month/day.
- Separately correct the booking-v3 field hint in issue #2; a parser fix alone is insufficient.

Five reports remain in the exported model's parser count but need mechanism checks:
R-41202, R-41209, R-41236, R-41344, R-41620. They describe one-day shifts or unusual
timing. Check original input, stored date, time zone, and sent invite before claiming
these are month/day swaps or asserting a separate root cause. They are not five
additional reports and have not been subtracted from the 379 filing assignments.

## Evidence

- `src/lib/kb/causes.ts`, `locales.ts`, and `src/lib/data/tenants/*.json`
- Signed review: `src/routes/kb/incidents/4471-review/+page.svx`
- Rendered review: `rendered/kb/incidents/4471-review/index.html`
- The 2 July merge is desk activity, not a defect-onset date. Reports arrived in April
  and continued through October. A `known` label does not show that a fix shipped.
