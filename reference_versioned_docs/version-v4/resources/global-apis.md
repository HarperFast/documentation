---
title: Global APIs
---

<!-- Source: versioned_docs/version-4.7/reference/globals.md (primary) -->
<!-- Source: versioned_docs/version-4.7/reference/transactions.md (transaction global) -->
<!-- Source: release-notes/v4-tucker/4.5.0.md (Table.getRecordCount, server.authenticateUser) -->

# Global APIs

Harper provides global variables accessible in all component JavaScript modules, without needing to import them. These globals provide access to tables, databases, transactions, the server, and content type handling.

For TypeScript support and better IDE autocomplete, these can also be explicitly imported:

```javascript
import { tables, databases, Resource, transaction, contentTypes, server } from 'harperdb';
```

To set up the TypeScript link (done automatically for installed components):

```bash
npm link harperdb
```

---

## `tables`

An object containing all tables defined in the default database (`data`). Each table defined in your `schema.graphql` with `@table` is accessible as a property, providing a class implementing the [Resource API](./resource-api.md).

`databases.data === tables` is always true.

```javascript
const Product = tables.Product;

// Create a record
const created = await Product.create({ name: 'Shirt', price: 9.5 });

// Update a record
await Product.patch(created.id, { price: 7.99 });

// Retrieve by primary key
const record = await Product.get(created.id);

// Query
for await (const record of Product.search({
	conditions: [{ attribute: 'price', comparator: 'less_than', value: 8.0 }],
})) {
	// ...
}
```

---

## `databases`

An object containing all databases defined in Harper. Each database is an object containing its tables (same structure as `tables`). `databases.data` is the default database and is the same object as `tables`.

```javascript
const Product = databases.data.Product;       // default database
const Events = databases.analytics.Events;    // another database

await Events.create({ eventType: 'login', timestamp: Date.now() });
```

---

## `Resource`

The base class for all resources, including tables and external data sources. Import or use as a global to create custom resource classes:

```javascript
export class MyExternalData extends Resource {
	static loadAsInstance = false;

	async get(target) {
		const response = await fetch(`https://api.example.com/${target.id}`);
		return response.json();
	}
}
```

See [Resource API](./resource-api.md) for complete documentation.

---

## `transaction(context?, callback: (txn) => any): Promise<any>`

Explicitly starts a transaction and executes `callback` within it. Useful when writing code outside of HTTP request handlers (e.g. timers, startup code), where no transaction has been automatically started.

```javascript
import { tables, transaction } from 'harperdb';
const { MyTable } = tables;

if (isMainThread) {
	setInterval(async () => {
		const data = await fetch('https://api.example.com/data').then((r) => r.json());
		await transaction((txn) => {
			for (const item of data) {
				MyTable.put(item, txn);
			}
		});
	}, 3600000);
}
```

If called with a context that already has a transaction, the existing transaction is reused.

The callback receives a `transaction` object with:

| Method/Property | Description |
|----------------|-------------|
| `commit(): Promise` | Commits the current transaction |
| `abort(): void` | Aborts the current transaction and resets it |
| `resetReadSnapshot(): void` | Resets to the latest data (discards the current read snapshot) |
| `timestamp: number` | Timestamp associated with the current transaction |

**Transaction scope**: Each transaction spans a database. Reads within a transaction share a consistent snapshot. Writes across multiple tables in the same database are committed atomically. Transactions across different databases use separate underlying transactions with no cross-database atomicity guarantee.

**Non-locking**: Harper transactions are non-locking. Concurrent writes from other transactions may occur between when you read and when you commit — last write wins for any concurrently written record.

**Transaction reuse**: After calling `transaction.commit()`, the transaction can be reused by default.

Added in: v4.2.0
Changed in: v4.5.0 — Transaction reuse after `commit()` enabled by default

---

## `auth(username, password?): Promise<User>`

Returns the user object for the given username. If `password` is provided, it is verified before returning the user (throws on incorrect password).

```javascript
const user = await auth('admin', 'secret');
// user.role, user.username, etc.
```

---

## `logger`

Provides structured logging methods. Based on the Node.js Console API.

Added in: v4.1.0 (logging revamped)
Changed in: v4.6.0 (Node.js Console API-based, no timestamp in stdout)

Methods: `trace`, `debug`, `info`, `warn`, `error`, `fatal`, `notify`

```javascript
logger.info('Record created:', record.id);
logger.error('Failed to fetch data:', error);
```

See [Logging API](TODO:reference_versioned_docs/version-v4/logging/api.md 'Logging section global API reference') for full documentation.

---

## `contentTypes`

A `Map` of content type handlers used for request/response serialization. Harper uses content negotiation to automatically serialize and deserialize based on `Content-Type` and `Accept` headers.

### Built-in content types

| MIME type | Format |
|-----------|--------|
| `application/json` | JSON |
| `application/cbor` | CBOR |
| `application/msgpack` | MessagePack |
| `text/csv` | CSV |
| `text/event-stream` | SSE |

### Custom content types

Add or replace handlers by setting entries on the `contentTypes` map:

```javascript
contentTypes.set('text/xml', {
	serialize(data) {
		return `<root>${someXMLSerializer(data)}</root>`;
	},
	q: 0.8, // quality factor for content negotiation (0–1)
});
```

Handler properties:

| Property | Type | Description |
|----------|------|-------------|
| `serialize(data)` | `(any) => Buffer \| string` | Convert data to response format |
| `serializeStream(data)` | `(any) => ReadableStream` | Stream version for large/async data |
| `deserialize(buffer)` | `(Buffer \| string) => any` | Convert request body to data. Used if `deserializeStream` is not defined. |
| `deserializeStream(stream)` | `(ReadableStream) => any` | Stream-based deserialization |
| `q` | `number` (0–1) | Quality factor for content negotiation. Default: 1 |

---

## `server`

The `server` global provides extension points for HTTP, WebSocket, socket, and authentication services. See [HTTP API](../http/api.md) for full documentation.
