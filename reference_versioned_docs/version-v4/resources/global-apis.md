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

The `server` global provides extension points for HTTP, WebSocket, socket, and authentication services. See also [HTTP API](../http/api.md) for full server documentation.

### `server.http(listener, options?): HttpServer[]`

Add a handler to the HTTP middleware chain. Alias: `server.request`.

```javascript
server.http(
	(request, next) => {
		if (request.url === '/health') return new Response('ok');
		return next(request);
	},
	{ runFirst: true }
);
```

#### `RequestListener`

`(request: Request, next: RequestListener) => Promise<Response>`

Pass `request` to `next` to continue the chain.

#### `HttpOptions`

| Property | Type | Description |
|----------|------|-------------|
| `runFirst` | `boolean` | Add to front of middleware chain. Default: `false` |
| `port` | `number` | HTTP port. Default: `9926` |
| `securePort` | `number` | HTTPS port. Default: `9927` |

### `server.ws(listener, options?): HttpServer[]`

Add a WebSocket connection listener.

```javascript
server.ws((ws, request, chainCompletion) => {
	chainCompletion.then(() => {
		ws.on('message', (data) => {
			ws.send(`echo: ${data}`);
		});
	});
});
```

#### `WsListener`

`(ws: WebSocket, request: Request, chainCompletion: Promise, next: WsListener) => void`

#### `WsOptions`

| Property | Type | Description |
|----------|------|-------------|
| `maxPayload` | `number` | Max WebSocket payload size. Default: 100 MB |
| `runFirst` | `boolean` | Add to front of middleware chain. Default: `false` |
| `port` | `number` | HTTP port. Default: `9926` |
| `securePort` | `number` | HTTPS port. Default: `9927` |

### `server.socket(listener, options?): SocketServer`

Create a raw TCP or TLS socket server.

#### `SocketOptions`

| Property | Type | Description |
|----------|------|-------------|
| `port` | `number` | Port for `net.Server` |
| `securePort` | `number` | Port for `tls.Server` (takes precedence) |

### `server.upgrade(listener, options?): void`

Add a listener to the HTTP upgrade event. Used to delegate WebSocket upgrade to an external WebSocket server.

```javascript
server.upgrade(
	(request, socket, head, next) => {
		if (request.url === '/my-ws') {
			return externalWsServer.handleUpgrade(request, socket, head, () => {});
		}
		return next(request, socket, head);
	},
	{ runFirst: true }
);
```

### `server.resources: Resources`

The central registry of all exported resources. Used by REST, MQTT, and other protocols to route requests.

#### `server.resources.set(name, resource, exportTypes?)`

Register a resource by name. Optionally limit which protocols can use it:

```javascript
server.resources.set('MyResource', MyResource);
// or limit to specific protocols:
server.resources.set('MyResource', MyResource, { rest: true, mqtt: false });
```

#### `server.resources.getMatch(path, exportType?)`

Find the resource matching a given path. Optionally filter by export type:

```javascript
server.resources.getMatch('/MyResource/some-id');
server.resources.getMatch('/MyResource/some-id', 'rest');
```

### `server.getUser(username): Promise<User>`

Returns user information by username without verifying a password.

### `server.authenticateUser(username, password): Promise<User>`

Returns user information and verifies the password. Throws if incorrect.

Added in: v4.5.0

### `server.operation(operation, context?, authorize?): Promise<any>`

Execute a Harper Operations API call programmatically.

Parameters:
- `operation` — Object matching the operation's request body
- `context` — `{ username: string }` — Optional user context
- `authorize` — Whether to check user authorization. Default: `false`

### `server.recordAnalytics(value, metric, path?, method?, type?)`

Record a numeric metric into Harper's analytics system. Values are aggregated; avoid grouping at too fine a level.

See [Analytics Overview](TODO:reference_versioned_docs/version-v4/analytics/overview.md 'Analytics section') for more information.

### `server.config`

Access the parsed `harperdb-config.yaml` configuration as a JavaScript object.

### `server.nodes`

Array of node objects registered in the cluster.

### `server.shards`

Map of shard number to array of associated nodes.

### `server.hostname`

Hostname of the current node.

### `server.contentTypes`

Same as the global `contentTypes` map.

---

## `Request` and `Response`

Harper's HTTP handling uses WHATWG-based `Request` and `Response` classes, extended for the Harper server environment.

### `Request` properties

| Property | Description |
|----------|-------------|
| `url` | Request target (path + query string, e.g. `/path?query=string`) |
| `method` | HTTP method (`GET`, `POST`, etc.) |
| `headers` | [`Headers`](https://developer.mozilla.org/en-US/docs/Web/API/Headers) object |
| `pathname` | Path portion of URL without query string |
| `protocol` | `http` or `https` |
| `data` | Deserialized request body |
| `ip` | Client IP address (or last proxy IP) |
| `host` | Host from the `Host` header |
| `session` | Session record for cookie-based sessions; update with `request.session.update({ key: value })` |
| `_nodeRequest` | Underlying Node.js `http.IncomingMessage` (discouraged) |
| `_nodeResponse` | Underlying Node.js `http.ServerResponse` (discouraged) |

#### `request.sendEarlyHints(link, headers?): void`

Send an HTTP 103 Early Hints response before the main response, useful for resource preloading in cache source resolution.

#### `request.login(username, password): Promise<void>`

Authenticate a user and start a session. Sets a cookie on the response.

### `Response` properties

| Property | Description |
|----------|-------------|
| `status` | HTTP status code |
| `headers` | [`Headers`](https://developer.mozilla.org/en-US/docs/Web/API/Headers) object |
| `data` | Data to serialize using content negotiation |
| `body` | Raw body as `Buffer`, string, stream, or `Blob` |
