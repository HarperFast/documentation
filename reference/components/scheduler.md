---
title: Scheduler
---

# Scheduler

<VersionBadge version="v5.2.0" />

The scheduler is a built-in plugin that runs recurring jobs declared in a component's configuration. Harper invokes a designated export from your component on a cron or interval schedule, and in a cluster each job fires exactly once per occurrence - on a single, automatically elected node - rather than once per node or worker.

Use it for the maintenance passes applications otherwise hand-roll with `setInterval`: nightly cleanups, periodic re-aggregation, cache refreshes, digest generation.

## Configuration

In your component's `config.yaml`, use the `scheduler` key to declare jobs:

```yaml
scheduler:
  jobs:
    - name: nightly-cleanup
      cron: '0 2 * * *'
      timezone: America/New_York
      handler: ./jobs.js#cleanupOldRecords
    - name: refresh-summaries
      interval: 90s
      handler: ./jobs.js#refreshSummaries
```

Each job entry supports:

### `name`

Type: `string` (required)

A name for the job, unique within the component. Used in logs and to key the job's run state.

### `cron`

Type: `string`

A five-field cron expression: minute, hour, day-of-month, month, day-of-week. Supports `*`, lists (`1,15`), ranges (`9-17`), steps (`*/15`, `0-59/5`), month and day names (`JAN`, `MON-FRI`), and the common macros (`@hourly`, `@daily`, `@midnight`, `@weekly`, `@monthly`, `@yearly`). Day-of-week `0` and `7` both mean Sunday. Following the POSIX cron rule, when both day-of-month and day-of-week are restricted, the job runs when either matches.

There is no seconds field. Expressions that can never fire (such as `0 0 30 2 *` - February 30th) are rejected when the component loads.

Exactly one of `cron` or `interval` is required.

### `interval`

Type: `string` (duration)

A simple cadence instead of a cron expression: a number of seconds, or a value like `90s`, `5m`, `1h`, `1d`. Minimum one second. Use this for "every N" maintenance passes that do not align to wall-clock times.

### `timezone`

Type: `string`

An IANA timezone (for example `America/Chicago`) the cron expression is evaluated in. Defaults to the server's timezone. Only valid with `cron`.

During daylight-saving transitions: a job scheduled inside the spring-forward gap (a wall-clock time that does not exist that day) runs at the shifted instant rather than being skipped, and a job scheduled inside the fall-back overlap (a wall-clock time that occurs twice) runs once, at the first occurrence.

### `handler`

Type: `string` (required)

The module and export to invoke, as `<module path>#<named export>`, relative to the component directory - for example `./jobs.js#cleanupOldRecords`. Omit the `#...` suffix to use the module's default export. The module is loaded in your component's environment, so it has access to the same globals (`tables`, `databases`, `server`, and so on) as the rest of your component code.

A bad handler reference (missing module, missing export, non-function export) fails the component load at deploy time rather than failing silently at the first scheduled fire.

## Writing a Handler

The handler is called with a single context argument and may return a promise:

```javascript
export async function cleanupOldRecords(context) {
	// context.jobName     - the configured job name
	// context.scheduledAt - the occurrence this run is for (Date)
	// context.catchUp     - true when this run is making up a missed occurrence
	const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
	for await (const record of tables.Events.search([{ attribute: 'timestamp', comparator: 'less', value: cutoff }])) {
		await tables.Events.delete(record.id);
	}
}
```

**Handlers should be idempotent.** Harper's clustering has no distributed lock, so leadership failover and daylight-saving fall-back can occasionally deliver the same logical occurrence twice. Design handlers so that running twice for one occurrence is harmless.

Runs of the same job never overlap: if a run is still going when its next occurrence arrives, that occurrence is skipped (with a log entry) rather than stacked.

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
