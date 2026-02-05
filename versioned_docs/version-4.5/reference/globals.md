---
title: Globals
---

# Globals

The primary way that JavaScript code can interact with Harper is through the global variables, which has several objects and classes that provide access to the tables, server hooks, and resources that Harper provides for building applications. As global variables, these can be directly accessed in any module.

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

This is an object with all the tables in the default database (the default database is "data"). Each table that has been declared or created in your `schema.graphql` file will be available as a property on this object, and the value will be the table class that can be used to interact with that table. The table classes implement the Resource API.

**Schema Definition:**
Tables are defined in your `schema.graphql` file using the `@table` directive. For example:

```graphql
type Product @table {
	id: ID @primaryKey
	name: String
	price: Float
}
```

Once declared, `Product` will be available as `tables.Product` (or `databases.data.Product`). This mapping is automatic: every table defined in the default database in your schema will appear as a property on the `tables` object. For more info, read our complete [guide on defining schemas](../developers/applications/defining-schemas).

### Example

```js
const Product = tables.Product; // Same as databases.data.Product

// Create a new record (`id` is automatically generated when using `.create()`)
const created = await Product.create({ name: 'Shirt', price: 9.5 });

// Modify the record
await Product.patch(created.id, { price: Math.round(created.price * 0.8 * 100) / 100 }); // 20% off!

// Retrieve by primary key
const record = await Product.get(created.id);

logger.info('New price:', record.price);

// Query for all products with a `price` less than `8.00`
const query = {
	conditions: [{ attribute: 'price', comparator: 'less_than', value: 8.0 }],
};

for await (const record of Product.search(query)) {
	// ...
}
```

## `databases`

This is an object with all the databases that have been defined in Harper (in the running instance). Each database that has been declared or created in your `schema.graphql` file will be available as a property on this object. The property values are objects containing the tables in that database, where each property is a table, just like the `tables` object. In fact, `databases.data === tables` should always be true.

### Example

```js
const Product = databases.data.Product; // Default database
const Events = databases.analytics.Events; // Another database

// Create a new event record
const event = await Events.create({ eventType: 'login', timestamp: Date.now() });

// Query events
for await (const e of Events.search({ conditions: [{ attribute: 'eventType', value: 'login' }] })) {
	// Handle each event
}
```

## `Resource`

This is the base class for all resources, including tables and external data sources. This is provided so that you can extend it to implement custom data source providers. See the [Resource API documentation](./resource) for more details about implementing a Resource class.

## `auth(username, password?): Promise<User>`

This returns the user object with permissions/authorization information based on the provided username. If a password is provided, the password will be verified before returning the user object (if the password is incorrect, an error will be thrown).

## `logger`

This provides methods `trace`, `debug`, `info`, `warn`, `error`, `fatal`, and `notify` for logging. See the [logging documentation](../administration/logging/standard-logging) for more information.

## `server`

The `server` global object provides a number of functions and objects to interact with Harper's HTTP, networking, and authentication services.

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

### `Request` and `Response`

The `Request` and `Response` classes are based on the WHATWG APIs for the [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) and [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) classes. Requests and responses are based on these standard-based APIs to facilitate reuse with modern web code. While Node.js' HTTP APIs are powerful low-level APIs, the `Request`/`Response` APIs provide excellent composability characteristics, well suited for layered middleware and for clean mapping to [RESTful method handlers](./resource) with promise-based responses, as well as interoperability with other standards-based APIs like [streams](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) used with [`Blob`s](https://developer.mozilla.org/en-US/docs/Web/API/Blob). However, the Harper implementation of these classes is not a direct implementation of the WHATWG APIs, but implements additional/distinct properties for the the Harper server environment:

#### `Request`

A `Request` object is passed to the direct static REST handlers, and preserved as the context for instance methods, and has the following properties:

- `url` - This is the request target, which is the portion of the URL that was received by the server. If a client sends a request to `https://example.com:8080/path?query=string`, the actual received request is `GET /path?query=string` and the `url` property will be `/path?query=string`.
- `method` - This is the HTTP method of the request. This is a string like `GET`, `POST`, `PUT`, `DELETE`, etc.
- `headers` - This is a [`Headers`](https://developer.mozilla.org/en-US/docs/Web/API/Headers) object that contains the headers of the request.
- `pathname` - This is the path portion of the URL, without the query string. For example, if the URL is `/path?query=string`, the `pathname` will be `/path`.
- `protocol` - This is the protocol of the request, like `http` or `https`.
- `data` - This is the deserialized body of the request (based on the type of data specified by `Content-Type` header).
- `ip` - This is the remote IP address of the client that made the request (or the remote IP address of the last proxy to connect to Harper).
- `host` - This is the host of the request, like `example.com`.
- `sendEarlyHints(link: string, headers?: object): void` - This method sends an early hints response to the client, prior to actually returning a response. This is useful for sending a link header to the client to indicate that another resource should be preloaded. The `headers` argument can be used to send additional headers with the early hints response, in addition to the `link`. This is generally most helpful in a cache resolution function, where you can send hints _if_ the data is not in the cache and is resolving from an origin:

```javascript
class Origin {
 async get(request) {
  // if we are fetching data from origin, send early hints
  this.getContext().requestContext.sendEarlyHints('<link rel="preload" href="/my-resource" as="fetch">');
  let response = await fetch(request);
  ...
 }
}
Cache.sourcedFrom(Origin);
```

- `login(username, password): Promise<void>` - This method can be called to start an authenticated session. The login will authenticate the user by username and password. If the authentication was successful, a session will be created and a cookie will be set on the response header that references the session. All subsequent requests from the client that sends the cookie in requests will be authenticated as the user that logged in and the session record will be attached to the request. This method returns a promise that resolves when the login is successful, and rejects if the login is unsuccessful.
- `session` - This is the session object that is associated with current cookie-maintained session. This object is used to store session data for the current session. This is `Table` record instance, and can be updated by calling `request.session.update({ key: value })` or session can be retrieved with `request.session.get()`. If the cookie has not been set yet, a cookie will be set the first time a session is updated or a login occurs.
- `_nodeRequest` - This is the underlying Node.js [`http.IncomingMessage`](https://nodejs.org/api/http.html#http_class_http_incomingmessage) object. This can be used to access the raw request data, such as the raw headers, raw body, etc. However, this is discouraged and should be used with caution since it will likely break any other server handlers that depends on the layered `Request` call with `Response` return pattern.
- `_nodeResponse` - This is the underlying Node.js [`http.ServerResponse`](https://nodejs.org/api/http.html#http_class_http_serverresponse) object. This can be used to access the raw response data, such as the raw headers. Again, this is discouraged and can cause problems for middleware, should only be used if you are certain that other server handlers will not attempt to return a different `Response` object.

#### `Response`

REST methods can directly return data that is serialized and returned to users, or it can return a `Response` object (or a promise to a `Response`), or it can return a `Response`-like object with the following properties (or again, a promise to it):

- `status` - This is the HTTP status code of the response. This is a number like `200`, `404`, `500`, etc.
- `headers` - This is a [`Headers`](https://developer.mozilla.org/en-US/docs/Web/API/Headers) object that contains the headers of the response.
- `data` - This is the data to be returned of the response. This will be serialized using Harper's content negotiation.
- `body` - Alternately (to `data`), the raw body can be returned as a `Buffer`, string, stream (Node.js or [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)), or a [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob).

#### `HttpOptions`

Type: `Object`

Properties:

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

Add a listener to the WebSocket connection listener middleware chain. The WebSocket server is associated with the HTTP server specified by the `options.port` or `options.securePort`. Use the [`server.upgrade()`](./globals#serverupgradelistener-upgradelistener-options-upgradeoptions-void) method to add a listener to the upgrade middleware chain.

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

* The `chainCompletion` argument is a `Promise` of the associated HTTP server's request chain. Awaiting this promise enables the user to ensure the HTTP request has finished being processed before operating on the WebSocket.
* The `next` argument is similar to that of other `next` arguments in Harper's server middlewares. To continue execution of the WebSocket connection listener middleware chain, pass all of the other arguments to this one such as: `next(ws, request, chainCompletion)`

#### `WsOptions`

Type: `Object`

Properties:

- `maxPayload` - _optional_ - `number` - Set the max payload size for the WebSocket server. Defaults to 100 MB.
- `runFirst` - _optional_ - `boolean` - Add listener to the front of the middleware chain. Defaults to `false`
- `port` - _optional_ - `number` - Specify which WebSocket server middleware chain to add the listener to. Defaults to the Harper system default HTTP port configured by `harperdb-config.yaml`, generally `9926`
- `securePort` - _optional_ - `number` - Specify which WebSocket secure server middleware chain to add the listener to. Defaults to the Harper system default HTTP secure port configured by `harperdb-config.yaml`, generally `9927`

### `server.upgrade(listener: UpgradeListener, options: UpgradeOptions): void`

Add a listener to the HTTP Server [upgrade](https://nodejs.org/api/http.html#event-upgrade_1) event. If a WebSocket connection listener is added using [`server.ws()`](./globals#serverwslistener-wslistener-options-wsoptions-httpserver), a default upgrade handler will be added as well. The default upgrade handler will add a `__harperdb_request_upgraded` boolean to the `request` argument to signal the connection has already been upgraded. It will also check for this boolean _before_ upgrading and if it is `true`, it will pass the arguments along to the `next` listener.

This method should be used to delegate HTTP upgrade events to an external WebSocket server instance.

Example:

> This example is from the Harper Next.js component. See the complete source code [here](https://github.com/HarperDB/nextjs/blob/main/extension.js)

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

This provides access to the Harper configuration object. This comes from the [harperdb-config.yaml](../deployments/configuration) (parsed into object form).

### `server.recordAnalytics(value, metric, path?, method?, type?)`

This records the provided value as a metric into Harper's analytics. Harper efficiently records and tracks these metrics and makes them available through [analytics API](./analytics). The values are aggregated and statistical information is computed when many operations are performed. The optional parameters can be used to group statistics. For the parameters, make sure you are not grouping on too fine of a level for useful aggregation. The parameters are:

- `value` - This is a numeric value for the metric that is being recorded. This can be a value measuring time or bytes, for example.
- `metric` - This is the name of the metric.
- `path` - This is an optional path (like a URL path). For a URL like /my-resource/, you would typically include a path of "my-resource", not including the id so you can group by all the requests to "my-resource" instead of individually aggregating by each individual id.
- `method` - Optional method to group by.
- `type` - Optional type to group by.

### `server.getUser(username): Promise<User>`

This returns the user object with permissions/authorization information based on the provided username. This does not verify the password, so it is generally used for looking up users by username. If you want to verify a user by password, use [`server.authenticateUser`](./globals#serverauthenticateuserusername-password-user).

### `server.authenticateUser(username, password): Promise<User>`

This returns the user object with permissions/authorization information based on the provided username. The password will be verified before returning the user object (if the password is incorrect, an error will be thrown).

### `server.resources: Resources`

This provides access to the map of all registered resources. This is the central registry in Harper for registering any resources to be exported for use by REST, MQTT, or other components. Components that want to register resources should use the `server.resources.set(name, resource)` method to add to this map. Exported resources can be found by passing in a path to `server.resources.getMatch(path)` which will find any resource that matches the path or beginning of the path.

#### `server.resources.set(name, resource, exportTypes?)`

Register a resource with the server. For example:

```
class NewResource extends Resource {
}
server.resources.set('NewResource', Resource);
/ or limit usage:
server.resources.set('NewResource', Resource, { rest: true, mqtt: false, 'my-protocol': true });
```

#### `server.resources.getMatch(path, exportType?)`

Find a resource that matches the path. For example:

```
server.resources.getMatch('/NewResource/some-id');
/ or specify the export/protocol type, to allow it to be limited:
server.resources.getMatch('/NewResource/some-id', 'my-protocol');
```

### `server.contentTypes`

Returns the `Map` of registered content type handlers. Same as the [`contentTypes`](./globals#contenttypes) global.

## `contentTypes`

Returns a [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) of content type handlers for request/response serialization.

HarperDB uses content negotiation to automatically handle data serialization and deserialization for HTTP requests and other protocols. This process works by:

1. **Request Processing**: Comparing the `Content-Type` header with registered handlers to deserialize incoming data into structured formats for processing and storage
2. **Response Generation**: Comparing the `Accept` header with registered handlers to serialize structured data into the appropriate response format

### Built-in Content Types

HarperDB includes handlers for common formats:

- **JSON** (`application/json`)
- **CBOR** (`application/cbor`)
- **MessagePack** (`application/msgpack`)
- **CSV** (`text/csv`)
- **Event-Stream** (`text/event-stream`)
- And more...

### Custom Content Type Handlers

You can extend or replace content type handlers by modifying the `contentTypes` map from the `server` global (or `harperdb` export). The map is keyed by MIME type, with values being handler objects containing these optional properties:

#### Handler Properties

- **`serialize(data: any): Buffer | Uint8Array | string`**  
  Called to convert data structures into the target format for responses. Should return binary data (Buffer/Uint8Array) or a string.

- **`serializeStream(data: any): ReadableStream`**  
  Called to convert data structures into streaming format. Useful for handling asynchronous iterables or large datasets.

- **`deserialize(buffer: Buffer | string): any`**  
  Called to convert incoming request data into structured format. Receives a string for text MIME types (`text/*`) and a Buffer for binary types. Only used if `deserializeStream` is not defined.

- **`deserializeStream(stream: ReadableStream): any`**  
  Called to convert incoming request streams into structured format. Returns deserialized data (potentially as an asynchronous iterable).

- **`q: number`** _(default: 1)_  
  Quality indicator between 0 and 1 representing serialization fidelity. Used in content negotiation to select the best format when multiple options are available. The server chooses the content type with the highest product of client quality × server quality values.

For example, if you wanted to define an XML serializer (that can respond with XML to requests with `Accept: text/xml`) you could write:

```javascript
contentTypes.set('text/xml', {
	serialize(data) {
		return '<root>' ... some serialization '</root>';
	},
	q: 0.8,
});
```
