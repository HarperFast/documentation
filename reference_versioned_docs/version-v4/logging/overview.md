---
id: overview
title: Logging
---

<!-- Source: versioned_docs/version-4.7/administration/logging/index.md (primary) -->
<!-- Source: versioned_docs/version-4.7/administration/logging/standard-logging.md (primary for log format, rotation, stdStreams) -->
<!-- Source: release-notes/v4-tucker/4.1.0.md (confirmed logging revamp, consolidated into hdb.log) -->
<!-- Source: release-notes/v4-tucker/4.6.0.md (confirmed per-component logging, dynamic reload, HTTP logging, Node.js Console API) -->

Harper provides several distinct logging systems:

- **Standard logging** — Timestamped text events written to `hdb.log`. Used for diagnostics, monitoring, and observability.
- **Audit logging** — Structured record of every data change to a table (insert, update, delete), stored in Harper's database. Disabled by default.
- **Transaction logging** — Verbose history of all transactions for specified tables, including original records. Used for data recovery and auditing.

> Audit logging and transaction logging are documented in the [Database](TODO:reference_versioned_docs/version-v4/database/transaction.md 'Audit and transaction logging') section, as they are database-level concerns. This section covers standard logging only.

## Log File

Changed in: v4.1.0 — All logs consolidated into a single `hdb.log` file

All standard log output is written to `<ROOTPATH>/log/hdb.log` (default: `~/hdb/log/hdb.log`). The install log is written separately to the Harper application directory (typically in the npm directory: `npm/harperdb/logs`).

## Log Entry Format

Each log entry follows this structure:

```
<timestamp> [<level>] [<thread>/<id>] ...[<tags>]: <message>
```

Example:

```
2023-03-09T14:25:05.269Z [notify] [main/0]: HarperDB successfully started.
```

Fields:

| Field       | Description                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `timestamp` | ISO 8601 date/time when the event occurred.                                                     |
| `level`     | Severity level. See [Log Levels](#log-levels) below.                                            |
| `thread/id` | Name and ID of the thread that produced the log entry. See [Threads](#threads) below.           |
| `tags`      | Additional context tags (e.g., `custom-function`, `auth-event`). Most entries have no tags.     |
| `message`   | The log message.                                                                                |

### Log Levels

From least to most severe (most verbose to least verbose):

| Level    | Description                                              |
| -------- | -------------------------------------------------------- |
| `trace`  | Highly detailed internal execution tracing.              |
| `debug`  | Diagnostic information useful during development.        |
| `info`   | General operational events.                              |
| `warn`   | Potential issues that don't prevent normal operation.    |
| `error`  | Errors that affect specific operations.                  |
| `fatal`  | Critical errors causing process termination.             |
| `notify` | Important operational milestones (e.g., "server started"). Always logged regardless of level. |

The default log level is `warn`. Setting a level includes that level and all more-severe levels. For example, `warn` logs `warn`, `error`, `fatal`, and `notify`.

### Threads

| Thread name    | Description                                                                   |
| -------------- | ----------------------------------------------------------------------------- |
| `main`         | Primary thread managing all other threads and routing.                        |
| `http`         | Worker threads handling HTTP requests to the Operations API and components.   |
| `Clustering`   | Threads and processes handling replication.                                   |
| `job`          | Job threads for operations executed in a separate job thread.                 |

## Standard Streams

By default, logs are written only to the log file. To also log to `stdout`/`stderr` (useful for container logging drivers), set `logging.stdStreams: true`.

When logging to standard streams, run Harper in the foreground (`harperdb`, not `harperdb start`).

Added in: v4.6.0 — Logging to standard streams does **not** include timestamps. Console logging (`console.log`, etc.) does not get forwarded to log files by default.

## Logger API

Added in: v4.6.0 (Node.js Console API basis)

JavaScript components can use the `logger` global to write structured log entries:

```javascript
logger.trace('detailed trace message');
logger.debug('debug info', { someContext: 'value' });
logger.info('informational message');
logger.warn('potential issue');
logger.error('error occurred', error);
logger.fatal('fatal error');
logger.notify('server is ready');
```

The `logger` global provides `trace`, `debug`, `info`, `warn`, `error`, `fatal`, and `notify` methods. The logger is based on the Node.js Console API. See [Logging API](./api) for full details.

## Per-Component Logging

Added in: v4.6.0

Different components can have independent logging configurations with separate log files, levels, and output destinations. All logging defaults to the main logger configuration, but individual components can override it. See [Logging Configuration](./configuration#per-component-logging) for details.

## Clustering Logs

Harper's clustering system (NATS Hub and Leaf servers) is configurable separately with `clustering.logLevel`. Valid levels from least verbose: `error`, `warn`, `info`, `debug`, `trace`.

## Related

- [Logging Configuration](./configuration)
- [Logging API](./api)
- [Logging Operations](./operations)
- [Database / Transaction Logging](TODO:reference_versioned_docs/version-v4/database/transaction.md 'Audit and transaction logging')
