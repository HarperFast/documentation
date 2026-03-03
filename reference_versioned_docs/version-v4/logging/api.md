---
id: api
title: Logging API
---

<!-- Source: versioned_docs/version-4.7/reference/globals.md (logger global - primary) -->
<!-- Source: versioned_docs/version-4.7/administration/logging/standard-logging.md (log levels, thread context) -->
<!-- Source: release-notes/v4-tucker/4.6.0.md (confirmed logger based on Node.js Console API) -->

## `logger`

Added in: v4.6.0 (Node.js Console API basis; logger global available since v4.1.0)

The `logger` global is available in all JavaScript components without any imports. It writes structured log entries to the standard Harper log file (`hdb.log`) at the configured `logging.external` level and path. See [Logging Configuration](./configuration#logging-external) for per-component log configuration.

### Methods

```typescript
logger.trace(message: any, ...args: any[]): void
logger.debug(message: any, ...args: any[]): void
logger.info(message: any, ...args: any[]): void
logger.warn(message: any, ...args: any[]): void
logger.error(message: any, ...args: any[]): void
logger.fatal(message: any, ...args: any[]): void
logger.notify(message: any, ...args: any[]): void
```

Each method corresponds to a log level. Only entries at or above the configured `logging.level` (or `logging.external.level`) are written. See [Log Levels](./overview#log-levels) for the full hierarchy.

### Usage

```javascript
export class MyResource extends Resource {
	async get(id) {
		logger.debug('Fetching record', { id });
		const record = await super.get(id);
		if (!record) {
			logger.warn('Record not found', { id });
		}
		return record;
	}

	async put(record) {
		logger.info('Updating record', { id: record.id });
		try {
			return await super.put(record);
		} catch (err) {
			logger.error('Failed to update record', err);
			throw err;
		}
	}
}
```

### Log Entry Format

Entries written via `logger` appear in `hdb.log` with the standard format:

```
<timestamp> [<level>] [<thread>/<id>]: <message>
```

For external components, the thread context is set automatically based on which worker thread executes the code.

### TypeScript / Module Import

The `logger` global is also exported from the `harperdb` package for better TypeScript support:

```typescript
import { logger } from 'harperdb';

logger.info('Component started');
```

## Related

- [Logging Overview](./overview)
- [Logging Configuration](./configuration)
- [Logging Operations](./operations)
