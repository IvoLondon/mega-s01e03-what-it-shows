<script lang="ts">
  import { exportedRows, merged, groups, disagreements, oneDayReports, weeks, julyBulkMerge } from '#lib/kb/incident-review';
  import { causeOf } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
</script>

<h3>Export reconciliation</h3>
<p>
  <strong>{exportedRows.length}</strong> exported rows −
  <strong>{exportedRows.length - merged.length}</strong> overlapping copies =
  <strong>{merged.length}</strong> unique reports merged into #4471.
  <strong>{disagreements.length}</strong> intake tags disagree with the tenant-based classification.
</p>
<table>
  <thead><tr><th>Cause</th><th>Ticket</th><th>Reports</th><th>Scope</th></tr></thead>
  <tbody>
    {#each groups as group (group.cause)}
      <tr>
        <td><code>{group.cause}</code></td>
        <td><a href="https://github.com/IvoLondon/mega-s01e03-what-it-shows/issues/{group.cause === 'parser' ? 1 : 2}">{group.cause === 'parser' ? 'Parser ticket' : 'Form hint ticket'}</a></td>
        <td>{group.reports.length}</td>
        <td>{group.tenants} tenants · {group.firstSeen} → {group.lastSeen}</td>
      </tr>
    {/each}
  </tbody>
</table>

<h3>Received is different from merged</h3>
<p>
  <strong>{julyBulkMerge}</strong> reports were merged on 2 July, although reports had been arriving since April.
  The week starting 29 June received <strong>{weeks.find((w) => w.week === '2026-06-29')?.received}</strong>
  reports and merged <strong>{weeks.find((w) => w.week === '2026-06-29')?.merged}</strong>.
  That spike records desk activity; it does not establish a spike in failures.
</p>
<details>
  <summary>Weekly counts behind the chart</summary>
  <table>
    <thead><tr><th>Week starting</th><th>Received</th><th>Merged</th></tr></thead>
    <tbody>
      {#each weeks as week (week.week)}
        <tr><td>{week.week}</td><td>{week.received}</td><td>{week.merged}</td></tr>
      {/each}
    </tbody>
  </table>
</details>

<h3>Reports needing a closer look</h3>
<p>
  The desk flagged <strong>{oneDayReports.length}</strong> reports as one-day moves.
  The current classifier includes them in <code>parser</code> based on tenant and channel.
  Their wording is not proof of a month/day swap or a separate root cause.
  Keep them traceable while checking input, stored dates, time zones, and delivered invites.
</p>
<table>
  <thead><tr><th>Report</th><th>Tenant / channel</th><th>Report body</th><th>Filed cause</th></tr></thead>
  <tbody>
    {#each oneDayReports as report (report.id)}
      <tr><td>{report.id}</td><td>{report.tenant} / {report.channel}</td><td>{report.body}</td><td>{causeOf(report, tenantOf(report))}</td></tr>
    {/each}
  </tbody>
</table>
