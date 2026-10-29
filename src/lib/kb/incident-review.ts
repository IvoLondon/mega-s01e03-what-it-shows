import reports from '#lib/data/reports-4471.json';
import notes from '#lib/data/desk-notes.json';
import { causeOf, groupByCause, uniqueById, type Report } from '#lib/kb/causes';
import { tenantOf } from '#lib/kb/locales';

export const exportedRows = reports as Report[];
export const merged = uniqueById(exportedRows).filter((r) => r.mergedInto === 4471);
export const groups = groupByCause(merged, tenantOf);
export const disagreements = merged.filter((r) => r.meta.intakeTag !== causeOf(r, tenantOf(r)));
export const oneDayReports = merged.filter((r) => notes.oneDayMove.includes(r.id));

// Use the desk's local calendar dates, matching QueueTimeline's Monday–Sunday weeks.
const WEEK = 7 * 86_400_000;
const start = Date.parse('2026-03-30');
const weekOf = (iso: string) => new Date(start + Math.floor((Date.parse(iso.slice(0, 10)) - start) / WEEK) * WEEK)
  .toISOString().slice(0, 10);
export const weeks = [...new Set(merged.map((r) => weekOf(r.receivedAt)))].sort().map((week) => ({
  week,
  received: merged.filter((r) => weekOf(r.receivedAt) === week).length,
  merged: merged.filter((r) => r.mergedAt && weekOf(r.mergedAt) === week).length
}));
export const julyBulkMerge = merged.filter((r) => r.mergedAt?.startsWith('2026-07-02')).length;
