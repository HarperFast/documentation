---
title: Writing Extensions
---

# Writing Extensions

HarperDB is a highly extensible database application platform with support for a rich variety of composable modular components and extensions that can be used and combined to build applications and add functionality to existing applications. Here we describe the different types of components/extensions that can be developed for HarperDB and how to create them.

There are three general categories of components for HarperDB:

- **protocol extensions** that provide and define ways for clients to access data
- **resource extensions** that handle and interpret different types of files
- **consumer data sources** that provide a way to access and retrieve data from other sources.

Server protocol extensions can be used to implement new protocols like MQTT, AMQP, Kafka, or maybe a retro-style Gopher interface. It can also be used to augment existing protocols like HTTP with "middleware" that can add authentication, analytics, or additional content negotiation, or add layer protocols on top of WebSockets.

Server resource extensions implement support for different types of files that can be used as resources in applications. HarperDB includes support for using JavaScript modules and GraphQL Schemas as resources, but resource extensions could be added to support different file types like HTML templates (like JSX), CSV data, and more.

Consumer data source components are used to retrieve and access data from other sources, and can be very useful if you want to use HarperDB to cache or use data from other databases like MySQL, Postgres, or Oracle, or subscribe to data from messaging brokers (again possibly Kafka, NATS, etc.).

These are not mutually exclusive, you may build components that fulfill any or all of these roles.

## Server Extensions

Server Extensions are implemented as JavaScript packages/modules and interact with HarperDB through a number of possible hooks. A component can be defined as an extension by specifying the extensionModule in the config.yaml:

```yaml
extensionModule: './entry-module-name.js'
```

### Module Initialization

Once a user has configured an extension, HarperDB will attempt to load the extension package specified by `package` property. Once loaded, there are several functions that can be exported that will be called by HarperDB:

`export function start(options: { port: number, server: {}})` If defined, this will be called on the initialization of the extension. The provided `server` property object includes a set of additional entry points for utilizing or layering on top of other protocols (and when implementing a new protocol, you can add your own entry points). The most common entry is to provide an HTTP middleware layer. This looks like:

```javascript
export function start(options: { port: number, server: {}}) {
	options.server.http(async (request, nextLayer) => {
		// we can directly return a response here, or do some processing on the request and delegate to the next layer
		let response = await nextLayer(request);
		return response;
	});
}
```

Here, the `request` object will have the following structure (this is based on Node's request, but augmented to conform to a subset of the [WHATWG Request API](https://developer.mozilla.org/en-US/docs/Web/API/Request)):

```typescript
interface Request {
	method: string;
	headers: Headers; // use request.headers.get(headerName) to get header values
	body: Stream;
	data: any; // deserialized data from the request body
}
```

The returned `response` object should have the following structure (again, following a structural subset of the [WHATWG Response API](https://developer.mozilla.org/en-US/docs/Web/API/Response)):

```typescript
interface Response {
	status?: number;
	headers?: {}; // an object with header name/values
	data?: any; // object/value that will be serialized into the body
	body?: Stream;
}
```

If you were implementing an authentication extension, you could get authentication information from the request and use it to add the `user` property to the request:

```javascript
export function start(options: { port: number, server: {}, resources: Map}) {
	options.server.http((request, nextLayer) => {
		let authorization = request.headers.authorization;
		if (authorization) {
			// get some token for the user and determine the user
			// if we want to use harperdb's user database
			let user = server.getUser(username, password);
			request.user = user; // authenticate user object goes on the request
		}
		// continue on to the next layer
		return nextLayer(request);
	});
	// if you needed to add a login resource, could add it as well:
	resources.set('/login', LoginResource);
}
```

If you were implementing a new protocol, you can directly interact with the sockets and listen for new incoming TCP connections:

```javascript
export function start(options: { port: number, server: {}}) {
	options.server.socket((socket) => {
	});
})
```

### Resource Handling

Typically, servers not only communicate with clients, but serve up meaningful data based on the resources within the server. While resource extensions typically handle defining resources, once resources are defined, they can be consumed by server extensions. The `resources` argument provides access to the set of all the resources that have been defined. A server can call `resources.getMatch(path)` to get the resource associated with the URL path.

## Resource Extensions

Resource extensions allow us to handle different files and make them accessible to servers as resources, following the common [Resource API](../../reference/resource). To implement a resource extension, you export a function called `handleFile`. Users can then configure which files that should be handled by your extension. For example, if we had implemented an EJS handler, it could be configured as:

```yaml
	module: 'ejs-extension',
	path: '/templates/*.ejs'
```

And in our extension module, we could implement `handleFile`:

```javascript
export function handleFile?(contents, relative_path, file_path, resources) {
	// will be called for each .ejs file.
   // We can then add the generate resource:
   resources.set(relative_path, GeneratedResource);
}
```

We can also implement a handler for directories. This can be useful for implementing a handler for broader frameworks that load their own files, like Next.js or Remix, or a static file handler. HarperDB includes such an extension for fastify's auto-loader that loads a directory of route definitions. This hook looks like:

```javascript
export function handleDirectory?(relative_path, path, resources) {
}
```

Note that these hooks are not mutually exclusive. You can write an extension that implements any or all of these hooks, potentially implementing a custom protocol and file handling.

## Data Source Components

Data source components implement the Resource interface to provide access to various data sources, which may be other APIs, databases, or local storage. Components that implement this interface can then be used as a source for caching tables, can be accessed as part of endpoint implementations, or even used as endpoints themselves. See the [Resource documentation](../../reference/resource) for more information on implementing new resources.

## Content Type Extensions

HarperDB uses content negotiation to determine how to deserialize content incoming data from HTTP requests (and any other protocols that support content negotiation) and to serialize data into responses. This negotiation is performed by comparing the `Content-Type` header with registered content type handler to determine how to deserialize content into structured data that is processed and stored, and comparing the `Accept` header with registered content type handlers to determine how to serialize structured data. HarperDB comes with a rich set of content type handlers including JSON, CBOR, MessagePack, CSV, Event-Stream, and more. However, you can also add your own content type handlers by adding new entries (or even replacing existing entries) to the `contentTypes` exported map from the `server` global (or `harperdb` export). This map is keyed by the MIME type, and the value is an object with properties (all optional): `serialize(data): Buffer|Uint8Array|string`: If defined, this will be called with the data structure and should return the data serialized as binary data (NodeJS Buffer or Uint8Array) or a string, for the response. `serializeStream(data): ReadableStream`: If defined, this will be called with the data structure and should return the data serialized as a ReadableStream. This is generally necessary for handling asynchronous iteratables. `deserialize(Buffer|string): any`: If defined (and deserializeStream is not defined), this will be called with the raw data received from the incoming request and should return the deserialized data structure. This will be called with a string for text MIME types ("text/..."), and a Buffer for all others. `deserializeStream(ReadableStream): any`: If defined (and deserializeStream is not defined), this will be called with the raw data stream received from the incoming request and should return the deserialized data structure (potentially as an asynchronous iterable). `q: number`: This is an indication of this serialization quality between 0 and 1, and if omitted, defaults to 1. It is called "content negotiation" instead of "content demanding" because both client and server may have multiple supported content types, and the server needs to choose the best for both. This is determined by finding the content type (of all supported) with the highest product of client q and server q (1 is a perfect representation of the data, 0 is worst, 0.5 is medium quality).

For example, if you wanted to define an XML serializer (that can respond with XML to requests with `Accept: text/xml`) you could write:

```javascript
contentTypes.set('text/xml', {
	serialize(data) {
		return '<root>' ... some serialization '</root>';
	},
	q: 0.8,
});
```

## Trusted/Untrusted

Extensions will also be categorized as trusted or untrusted. For some HarperDB installations, administrators may choose to constrain users to only using trusted extensions for security reasons (such multi-tenancy requirements or added defense in depth). Most installations do not impose such constraints, but this may exist in some situations.

An extension can be automatically considered trusted if it conforms to the requirements of [Secure EcmaScript](https://www.npmjs.com/package/ses/v/0.7.0) (basically strict mode code that doesn't modify any global objects), and either does not use any other modules, or only uses modules from other trusted extensions/components. An extension can be marked as trusted by review by the HarperDB team as well, but developers should not expect that HarperDB can review all extensions. Untrusted extensions can access any other packages/modules, and may have many additional capabilities.
