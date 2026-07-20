---
title: Scheduler
---

# Scheduler

<VersionBadge version="v5.2.0" />

The scheduler is a built-in plugin that runs recurring jobs declared in a component's configuration. Harper invokes a designated export from your component on a cron or interval schedule. In a cluster, execution is leader-coordinated: under normal operation each occurrence runs once, on a single automatically elected node, rather than once per node or worker. During leadership failover, daylight-saving fall-back, or split-brain recovery an occurrence can occasionally be delivered more than once - which is why handlers must be idempotent (see below).

Use it for the recurring work applications otherwise hand-roll with `setInterval`: taking daily snapshots of a dataset, pulling from an external API on a schedule, re-aggregating summary tables, generating digests or reports.

For expiring old records, prefer the table-level [`expiration` and `eviction` options](../database/schema.md#table) - record cleanup is built into Harper and does not need a scheduled job.

## Configuration

In your component's `config.yaml`, use the `scheduler` key to declare jobs:

```yaml
scheduler:
  jobs:
    - name: daily-metrics-snapshot
      cron: '0 2 * * *'
      timezone: America/New_York
      handler: ./jobs.js#snapshotMetrics
    - name: sync-exchange-rates
      interval: 15m
      handler: ./jobs.js#syncExchangeRates
```

Each job entry supports:

### `name`

Type: `string` (required)

A name for the job, unique within the component. Used in logs and to key the job's run state.

### `cron`

Type: `string`

A five-field cron expression: minute, hour, day-of-month, month, day-of-week. Supports `*`, lists (`1,15`), ranges (`9-17`), steps (`*/15`, `0-59/5`), month and day names (`JAN`, `MON-FRI`), and the common macros (`@hourly`, `@daily`, `@midnight`, `@weekly`, `@monthly`, `@yearly`). Day-of-week `0` and `7` both mean Sunday. Following the POSIX cron rule, when both day-of-month and day-of-week are restricted, the job runs when either matches.

There is no seconds field. Expressions that can never fire (such as `0 0 30 2 *` - February 30th) are rejected when the component loads.

Always quote the expression in YAML: a leading `*` (as in `*/5 * * * *`) is YAML alias syntax and `@daily` starts with a reserved character - unquoted, both fail with confusing YAML parse errors rather than anything about cron.

Exactly one of `cron` or `interval` is required.

### `interval`

Type: `string` (duration) or `number` (seconds)

A simple cadence instead of a cron expression: a number of seconds, or a duration string like `90s`, `5m`, `1h`, `1d`. Must be between one second and 365 days. Use this for "every N" maintenance passes that do not align to wall-clock times.

### `timezone`

Type: `string`

An IANA timezone (for example `America/Chicago`) the cron expression is evaluated in. Defaults to the server's timezone. Only valid with `cron`.

During daylight-saving transitions: a job scheduled inside the spring-forward gap (a wall-clock time that does not exist that day) runs at the shifted instant rather than being skipped, and a job scheduled inside the fall-back overlap (a wall-clock time that occurs twice) runs once, at the first occurrence.

### `handler`

Type: `string` (required)

The module and export to invoke, as `<module path>#<named export>`, relative to the component directory - for example `./jobs.js#snapshotMetrics`. Omit the `#...` suffix to use the module's default export. Do not put a space before the `#` (YAML would treat the rest of the line as a comment and silently drop the export name). The module is loaded in your component's environment, so it has access to the same globals (`tables`, `databases`, `server`, and so on) as the rest of your component code.

A bad handler reference (missing module, missing export, non-function export) fails the component load at deploy time rather than failing silently at the first scheduled fire.

## Writing a Handler

The handler is called with a single context argument and may return a promise:

```javascript
// Nightly snapshot: roll the current state of a table into a dated snapshot record
export async function snapshotMetrics(context) {
	// context.jobName     - the configured job name
	// context.scheduledAt - the occurrence this run is for (Date)
	// context.catchUp     - true when this run is making up a missed occurrence
	const day = context.scheduledAt.toISOString().slice(0, 10);
	let total = 0;
	let active = 0;
	for await (const device of tables.Devices.search({})) {
		total++;
		if (device.status === 'active') active++;
	}
	// Keyed by day, so a duplicate delivery of the same occurrence just rewrites
	// the same record - this is what makes the handler idempotent
	await tables.DailyDeviceSnapshot.put({ id: day, total, active });
}

// Scheduled pull from an external API into a Harper table
export async function syncExchangeRates(context) {
	const response = await fetch('https://api.example.com/rates');
	if (!response.ok) throw new Error(`rates API responded ${response.status}`);
	const rates = await response.json();
	// Spread the untrusted API payload first so our explicit keys win - otherwise
	// a rogue `id` in the response could redirect the write to another record
	await tables.ExchangeRates.put({ ...rates, id: 'latest', fetchedAt: context.scheduledAt });
}
```

**Handlers should be idempotent.** Harper's clustering has no distributed lock, so leadership failover and daylight-saving fall-back can occasionally deliver the same logical occurrence twice. Design handlers so that running twice for one occurrence is harmless.

Runs of the same job never overlap. Missed time is not queued up, but it is also not always skipped outright: when a run outlasts its cadence, an interval job's next run starts promptly after the previous one finishes (a slow handler can therefore run back-to-back), and a cron job makes up at most its single most recent missed occurrence (delivered with `context.catchUp` set to `true`).

## Cluster Behavior

One node in the cluster - the scheduler leader - runs all scheduled jobs; the others watch. Leader election is automatic and requires no configuration:

- The leader maintains a heartbeat in the replicated `system` database. If it stops heartbeating (crash, shutdown, partition) for more than five minutes, the next node in line promotes itself; with default timings, failover completes within about six and a half minutes.
- A restarting node defers to an actively heartbeating leader, so leadership is stable across deploys and restarts.
- On a single-node instance, that node simply runs the jobs.

### Missed Occurrences

If the most recent occurrence of a cron job was missed - the leader was down, a failover was in progress, or daylight-saving time skipped the slot - the scheduler fires one catch-up run for it (with `context.catchUp` set to `true`). Only the single most recent missed occurrence is made up, not every occurrence missed during an outage. Interval jobs resume their cadence from their last recorded run.

A newly deployed job waits for its first scheduled time; it does not fire immediately on deploy.

### Run State

Each job's last run time, status, duration, and last error (if any) are recorded in the `hdb_scheduler_state` system table, alongside the leader lease. This state replicates across the cluster so a newly promoted leader knows what has already run.
