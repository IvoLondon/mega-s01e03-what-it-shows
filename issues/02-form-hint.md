# Booking-v3 shows a month-first hint to day-first tenants — 33 reports from #4471

## Problem

Booking-v3 prints `MM/DD/YYYY`, but the form reads dates in the tenant's day-first
order. People following the displayed hint can book the wrong day. This is a
different defect from the shared month-first parser, despite similar subjects.

## Report count and scope

**33 unique reports** in the 4 October 2026 export, received 17 April–22 September.
All came through the form channel for these day-first booking-v3 tenants:

| Tenant | Locale | Reports |
| --- | --- | ---: |
| Alder Physio | de-DE | 12 |
| Copper Studio | es-ES | 11 |
| Pale Harbour | pt-PT | 10 |

Count method: deduplicate `src/lib/data/reports-4471.json` by `id`, filter
`mergedInto === 4471`, join the tenant files, then run `causeOf`/`groupByCause`.
App and email reports for these same tenants go to the parser issue, #1.
Booking-v2 prints `DD/MM/YYYY` and is outside this hint defect's scope.

Of the 33 assigned reports, 18 were intake-tagged `hint` and 15 `parser`.
Counting the 41 rows with a unique-report `hint` tag would therefore be wrong:
23 of those actually follow the parser path in the supplied tenant-based model.
The complete report-ID membership is in `issues/report-assignments.json`.

## Example and reproduction to verify in the product

R-41241, Alder Physio, de-DE, booking-v3, form, describes booking for 6 August
and people arriving on 8 June.

1. Open Alder Physio's booking-v3 form.
2. Observe the `MM/DD/YYYY` date hint.
3. Following that hint, enter `08/06/2026` for 6 August.
4. Inspect the date accepted by the form and the resulting booking.

Expected: the displayed hint and parser agree, preserving 6 August.
The supplied model says the form reads day first, producing 8 June instead.
R-41230 is an intake counterexample: Copper Studio, booking-v3, form, browser
en-GB, intake tag `parser`, but assigned to `hint` using tenant and channel.

These are report-supported reproduction steps. The product runtime is not included
in the export, so this repository does not claim to have executed them.

## Investigation and acceptance

- Make the field hint and accepted date order agree for each tenant locale.
- Verify booking-v3 form input, validation, and saved date across de-DE, es-ES, pt-PT.
- Test an ambiguous date such as `08/06/2026` and an unambiguous day greater than 12.
- Check the displayed guidance and parsed date together; retain correct booking-v2 behavior.
- Keep this ticket separate from #1; changing the shared parser does not fix the hint.

## Evidence

- `DATE_HINT` and `causeOf` in `src/lib/kb/causes.ts`
- Tenant settings in `src/lib/data/tenants/*.json`
- Signed review: `src/routes/kb/incidents/4471-review/+page.svx`
- Rendered review: `rendered/kb/incidents/4471-review/index.html`
- Same-subject reports can have different causes; different-subject reports can share
  one cause. The rendered DedupeExplorer shows both cases.
