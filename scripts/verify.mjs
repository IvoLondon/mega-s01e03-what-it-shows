import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom' });
try {
  const review = await server.ssrLoadModule('/src/lib/kb/incident-review.ts');
  const { causeOf, sameCause } = await server.ssrLoadModule('/src/lib/kb/causes.ts');
  const { tenantOf } = await server.ssrLoadModule('/src/lib/kb/locales.ts');
  const { DEDUPE_CASES } = await server.ssrLoadModule('/src/lib/kb/dedupe-cases.ts');
  const { deskRef } = await server.ssrLoadModule('/src/lib/kb/desk-ref.ts');

  // These invariants describe this export. A new desk export must trigger a fresh review.
  assert.equal(review.exportedRows.length, 427);
  assert.equal(review.merged.length, 412);
  assert.deepEqual(review.groups.map((g) => [g.cause, g.reports.length]), [['parser', 379], ['hint', 33]]);
  assert.equal(review.groups.reduce((n, g) => n + g.reports.length, 0), review.merged.length);
  assert.equal(review.disagreements.length, 38);
  assert.equal(review.oneDayReports.length, 5);
  assert(review.oneDayReports.every((r) => causeOf(r, tenantOf(r)) === 'parser'));
  assert.equal(review.julyBulkMerge, 184);
  assert.deepEqual(review.weeks.find((w) => w.week === '2026-06-29'), { week: '2026-06-29', received: 15, merged: 189 });
  assert.equal(review.weeks.reduce((n, w) => n + w.received, 0), 412);
  assert.equal(review.weeks.reduce((n, w) => n + w.merged, 0), 412);
  assert.deepEqual(DEDUPE_CASES.map((c) => sameCause(c.a, tenantOf(c.a), c.b, tenantOf(c.b))), [true, false, false, true, false]);

  // Overlapping pages repeat identical records; there are no silent conflicting updates.
  for (const report of review.exportedRows) {
    assert.deepEqual(report, review.merged.find((r) => r.id === report.id));
  }
  const reviewPath = 'src/routes/kb/incidents/4471-review/+page.svx';
  const source = await readFile(reviewPath, 'utf8');
  const signature = source.match(/^signature: '(.+)'$/m)?.[1];
  assert(signature);
  assert(source.trimEnd().endsWith('<RenderStamp {signature} />'));
  const html = await readFile('build/kb/incidents/4471-review/index.html', 'utf8');
  assert(html.includes(deskRef(signature)));
  assert(!html.includes('no desk ref:'));
  assert(html.includes('fix(dates): parse dd/mm for eu locales'));
  assert(html.includes('booking-v3 form retired'));
  assert(html.includes('not planned'));
  for (const text of ['379', '33', '412', '427', 'R-41620', 'reports received and merged into #4471']) assert(html.includes(text));
  const triage = await readFile('build/kb/triage/dedupe/index.html', 'utf8');
  assert(triage.includes('Nobody has re-read this page'));
  const index = await readFile('build/kb/index.html', 'utf8');
  assert(index.includes('/kb/incidents/4471-review'));

  await writeFile('issues/report-assignments.json', JSON.stringify({
    exported: '2026-10-04',
    deduplication: 'one report per id; all repeated rows are identical',
    groups: review.groups.map((g) => ({ cause: g.cause, count: g.reports.length, reportIds: g.reports.map((r) => r.id) })),
    oneDayMoveIds: review.oneDayReports.map((r) => r.id)
  }, null, 2) + '\n');
  console.log(`Verified export reconciliation, cause assignments, dedupe cases, timeline, stale warning, KB index, and rendered signature ${deskRef(signature)}.`);
} finally {
  await server.close();
}
