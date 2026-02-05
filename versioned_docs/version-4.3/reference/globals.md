---
title: Globals
---

# Globals

The primary way that JavaScript code can interact with HarperDB is through the global variables, which has several objects and classes that provide access to the tables, server hooks, and resources that HarperDB provides for building applications. As global variables, these can be directly accessed in any module.

These global variables are also available through the `harperdb` module/package, which can provide better typing in TypeScript. To use this with your own directory, make sure you link the package to your current `harperdb` installation:

```bash
npm link harperdb
```

The `harperdb` package is automatically linked for all installed components. Once linked, if you are using EcmaScript module syntax you can import function from `harperdb` like:

```javascript
import { tables, Resource } from 'harperdb';
```

Or if you are using CommonJS format for your modules:

```javascript
const { tables, Resource } = require('harperdb');
```

The global variables include:

## `tables`

This is an object that holds all the tables for the default database (called `data`) as properties. Each of these property values is a table class that subclasses the Resource interface and provides access to the table through the Resource interface. For example, you can get a record from a table (in the default database) called 'my-table' with:

```javascript
import { tables } from 'harperdb';
const { MyTable } = tables;
async function getRecord() {
	let record = await MyTable.get(recordId);
}
```

It is recommended that you [define a database](../getting-started/) for all the tables that are required to exist in your application. This will ensure that the tables exist on the `tables` object. Also note that the property names follow a CamelCase convention for use in JavaScript and in the GraphQL Schemas, but these are translated to snake_case for the actual table names, and converted back to CamelCase when added to the `tables` object.

## `databases`

This is an object that holds all the databases in HarperDB, and can be used to explicitly access a table by database name. Each database will be a property on this object, each of these property values will be an object with the set of all tables in that database. The default database, `databases.data` should equal the `tables` export. For example, if you want to access the "dog" table in the "dev" database, you could do so:

```javascript
import { databases } from 'harperdb';
const { Dog } = databases.dev;
```

## `Resource`

This is the base class for all resources, including tables and external data sources. This is provided so that you can extend it to implement custom data source providers. See the [Resource API documentation](./resource) for more details about implementing a Resource class.

## `auth(username, password?): Promise<User>`

This returns the user object with permissions/authorization information based on the provided username. If a password is provided, the password will be verified before returning the user object (if the password is incorrect, an error will be thrown).

## `logger`

This provides methods `trace`, `debug`, `info`, `warn`, `error`, `fatal`, and `notify` for logging. See the [logging documentation](../administration/logging/standard-logging) for more information.

## `server`

The `server` global object provides a number of functions and objects to interact with Harper's HTTP service.

### `server.http(listener: RequestListener, options: HttpOptions): HttpServer[]`

Alias: `server.request`

Add a handler method to the HTTP server request listener middleware chain.

Returns an array of server instances based on the specified `options.port` and `options.securePort`.

Example:

```js
server.http(
	(request, next) => {
		return request.url === '/graphql' ? handleGraphQLRequest(request) : next(request);
	},
	{
		runFirst: true, // run this handler first
	}
);
```

#### `RequestListener`

Type: `(request: Request, next: RequestListener) => Promise<Response>`

The HTTP request listener to be added to the middleware chain. To continue chain execution pass the `request` to the `next` function such as `return next(request);`.

#### `Request`

An implementation of WHATWG [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) class.

#### `Response`

An implementation of WHATWG [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) class.

#### `HttpOptions`

Type: `Object`

Properties:

<!-- Internal Use Only - `mtls` - _optional_ - `boolean` -->
<!-- Internal Use Only - `isOperationsServer` - _optional_ - `boolean`  -->

- `runFirst` - _optional_ - `boolean` - Add listener to the front of the middleware chain. Defaults to `false`
- `port` - _optional_ - `number` - Specify which HTTP server middleware chain to add the listener to. Defaults to the Harper system default HTTP port configured by `harperdb-config.yaml`, generally `9926`
- `securePort` - _optional_ - `number` - Specify which HTTPS server middleware chain to add the listener to. Defaults to the Harper system default HTTP secure port configured by `harperdb-config.yaml`, generally `9927`

#### `HttpServer`

Node.js [`http.Server`](https://nodejs.org/api/http.html#class-httpserver) or [`https.SecureServer`](https://nodejs.org/api/https.html#class-httpsserver) instance.

### `server.socket(listener: ConnectionListener, options: SocketOptions): SocketServer`

Creates a socket server on the specified `options.port` or `options.securePort`.

Only one socket server will be created. A `securePort` takes precedence.

#### `ConnectionListener`

Node.js socket server connection listener as documented in [`net.createServer`](https://nodejs.org/api/net.html#netcreateserveroptions-connectionlistener) or [`tls.createServer`](https://nodejs.org/api/tls.html#tlscreateserveroptions-secureconnectionlistener)

#### `SocketOptions`

- `port` - _optional_ - `number` - Specify the port for the [`net.Server`](https://nodejs.org/api/net.html#class-netserver) instance.
- `securePort` - _optional_ - `number` - Specify the port for the [`tls.Server`](https://nodejs.org/api/tls.html#class-tlsserver) instance.

#### `SocketServer`

Node.js [`net.Server`](https://nodejs.org/api/net.html#class-netserver) or [`tls.Server`](https://nodejs.org/api/tls.html#class-tlsserver) instance.

### `server.ws(listener: WsListener, options: WsOptions): HttpServer[]`

Add a listener to the WebSocket connection listener middleware chain. The WebSocket server is associated with the HTTP server specified by the `options.port` or `options.securePort`. Use the [`server.upgrade()`](#serverupgradelistener-upgradelistener-options-upgradeoptions-void) method to add a listener to the upgrade middleware chain.

Example:

```js
server.ws((ws, request, chainCompletion) => {
	chainCompletion.then(() => {
		ws.on('error', console.error);

		ws.on('message', function message(data) {
			console.log('received: %s', data);
		});

		ws.send('something');
	});
});
```

#### `WsListener`

Type: `(ws: WebSocket, request: Request, chainCompletion: ChainCompletion, next: WsListener): Promise<void>`

The WebSocket connection listener.

- The `ws` argument is the [WebSocket](https://github.com/websockets/ws/blob/master/doc/ws.md#class-websocket) instance as defined by the `ws` module.
- The `request` argument is Harper's transformation of the `IncomingMessage` argument of the standard ['connection'](https://github.com/websockets/ws/blob/master/doc/ws.md#event-connection) listener event for a WebSocket server.
- The `chainCompletion` argument is a `Promise` of the associated HTTP server's request chain. Awaiting this promise enables the user to ensure the HTTP request has finished being processed before operating on the WebSocket.
- The `next` argument is similar to that of other `next` arguments in Harper's server middlewares. To continue execution of the WebSocket connection listener middleware chain, pass all of the other arguments to this one such as: `next(ws, request, chainCompletion)`

#### `WsOptions`

Type: `Object`

Properties:

<!-- Internal Use Only - `mtls` - _optional_ - `boolean` -->
<!-- Internal Use Only - `isOperationsServer` - _optional_ - `boolean`  -->

- `maxPayload` - _optional_ - `number` - Set the max payload size for the WebSocket server. Defaults to 100 MB.
- `runFirst` - _optional_ - `boolean` - Add listener to the front of the middleware chain. Defaults to `false`
- `port` - _optional_ - `number` - Specify which WebSocket server middleware chain to add the listener to. Defaults to the Harper system default HTTP port configured by `harperdb-config.yaml`, generally `9926`
- `securePort` - _optional_ - `number` - Specify which WebSocket secure server middleware chain to add the listener to. Defaults to the Harper system default HTTP secure port configured by `harperdb-config.yaml`, generally `9927`

### `server.upgrade(listener: UpgradeListener, options: UpgradeOptions): void`

Add a listener to the HTTP Server [upgrade](https://nodejs.org/api/http.html#event-upgrade_1) event. If a WebSocket connection listener is added using [`server.ws()`](#serverwslistener-wslistener-options-wsoptions-httpserver), a default upgrade handler will be added as well. The default upgrade handler will add a `__harperdb_request_upgraded` boolean to the `request` argument to signal the connection has already been upgraded. It will also check for this boolean _before_ upgrading and if it is `true`, it will pass the arguments along to the `next` listener.

This method should be used to delegate HTTP upgrade events to an external WebSocket server instance.

Example:

> This example is from the HarperDB Next.js component. See the complete source code [here](https://github.com/HarperDB/nextjs/blob/main/extension.js)

```js
server.upgrade(
	(request, socket, head, next) => {
		if (request.url === '/_next/webpack-hmr') {
			return upgradeHandler(request, socket, head).then(() => {
				request.__harperdb_request_upgraded = true;

				next(request, socket, head);
			});
		}

		return next(request, socket, head);
	},
	{ runFirst: true }
);
```

#### `UpgradeListener`

Type: `(request, socket, head, next) => void`

The arguments are passed to the middleware chain from the HTTP server [`'upgrade'`](https://nodejs.org/api/http.html#event-upgrade_1) event.

#### `UpgradeOptions`

Type: `Object`

Properties:

- `runFirst` - _optional_ - `boolean` - Add listener to the front of the middleware chain. Defaults to `false`
- `port` - _optional_ - `number` - Specify which HTTP server middleware chain to add the listener to. Defaults to the Harper system default HTTP port configured by `harperdb-config.yaml`, generally `9926`
- `securePort` - _optional_ - `number` - Specify which HTTP secure server middleware chain to add the listener to. Defaults to the Harper system default HTTP secure port configured by `harperdb-config.yaml`, generally `9927`

### `server.config`

This provides access to the HarperDB configuration object. This comes from the [harperdb-config.yaml](../deployments/configuration) (parsed into object form).

### `server.recordAnalytics(value, metric, path?, method?, type?)`

This records the provided value as a metric into HarperDB's analytics. HarperDB efficiently records and tracks these metrics and makes them available through [analytics API](./analytics). The values are aggregated and statistical information is computed when many operations are performed. The optional parameters can be used to group statistics. For the parameters, make sure you are not grouping on too fine of a level for useful aggregation. The parameters are:

- `value` - This is a numeric value for the metric that is being recorded. This can be a value measuring time or bytes, for example.
- `metric` - This is the name of the metric.
- `path` - This is an optional path (like a URL path). For a URL like /my-resource/, you would typically include a path of "my-resource", not including the id so you can group by all the requests to "my-resource" instead of individually aggregating by each individual id.
- `method` - Optional method to group by.
- `type` - Optional type to group by.
