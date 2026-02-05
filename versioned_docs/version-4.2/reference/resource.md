---
title: Resource Class
---

# Resource Class

## Resource Class

The Resource class is designed to model different data resources within HarperDB. The Resource class can be extended to create new data sources. Resources can be exported to define endpoints. Tables themselves extend the Resource class, and can be extended by users.

Conceptually, a Resource class provides an interface for accessing, querying, modifying, and monitoring a set of entities or records. Instances of a Resource class can represent a single record or entity, or a collection of records, at a given point in time, that you can interact with through various methods or queries. Resource instances can represent an atomic transactional view of a resource and facilitate transactional interaction. Therefore there are distinct resource instances created for every record or query that is accessed, and the instance methods are used for interaction with the data.

The RESTful HTTP server and other server interfaces will instantiate/load resources to fulfill incoming requests so resources can be defined as endpoints for external interaction. When resources are used by the server interfaces, they will be executed in transaction and the access checks will be performed before the method is executed.

Paths (URL, MQTT topics) are mapped to different resource instances. Using a path that does specify an ID like `/MyResource/3492` will be mapped to a Resource instance where the instance's ID will be `3492`, and interactions will use the instance methods like `get()`, `put()`, and `post()`. Using the root path (`/MyResource/`) will map to a Resource instance with an ID of `null`.

You can create classes that extend Resource to define your own data sources, typically to interface with external data sources (the Resource base class is available as a global variable in the HarperDB JS environment). In doing this, you will generally be extending and providing implementations for the instance methods below. For example:

```javascript
export class MyExternalData extends Resource {
	get() {
		// fetch data from an external source, using our primary key
		this.fetch(this.id);
	}
	put(data) {
		// send the data into the external source
	}
	delete() {
		// delete an entity in the external data source
	}
	subscribe(options) {
		// if the external data source is capable of real-time notification of changes, can subscribe
	}
}
// we can export this class from resources.json as our own endpoint, or use this as the source for
// a HarperDB data to store and cache the data coming from this data source:
tables.MyCache.sourcedFrom(MyExternalData);
```

You can also extend table classes in the same way, overriding the instance methods for custom functionality. The `tables` object is a global variable in the HarperDB JavaScript environment, along with `Resource`:

```javascript
export class MyTable extends tables.MyTable {
	get() {
		// we can add properties or change properties before returning data:
		this.newProperty = 'newValue';
		this.existingProperty = 44;
		return super.get(); // returns the record, modified with the changes above
	}
	put(data) {
		// can change data any way we want
		super.put(data);
	}
	delete() {
		super.delete();
	}
	post(data) {
		// providing a post handler (for HTTP POST requests) is a common way to create additional
		// actions that aren't well described with just PUT or DELETE
	}
}
```

Make sure that if are extending and `export`ing your table with this class, that you remove the `@export` directive in the your schema, so that you aren't exporting the same table/class twice.

## Global Variables

### `tables`

This is an object with all the tables in the default database (the default database is "data"). Each table that has been declared or created will be available as a (standard) property on this object, and the value will be the table class that can be used to interact with that table. The table classes implement the Resource API.

### `databases`

This is an object with all the databases that have been defined in HarperDB (in the running instance). Each database that has been declared or created will be available as a (standard) property on this object. The property values are an object with the tables in that database, where each property is a table, like the `tables` object. In fact, `databases.data === tables` should always be true.

### `Resource`

This is the Resource base class. This can be directly extended for custom resources, and is the base class for all tables.

### `server`

This object provides extension points for extension components that wish to implement new server functionality (new protocols, authentication, etc.). See the [extensions documentation for more information](../developers/components/writing-extensions).

### `transaction`

This provides a function for starting transactions. See the transactions section below for more information.

### `contentTypes`

This provides an interface for defining new content type handlers. See the [content type extensions documentation](../developers/components/writing-extensions) for more information.

### TypeScript Support

While these objects/methods are all available as global variables, it is easier to get TypeScript support (code assistance, type checking) for these interfaces by explicitly `import`ing them. This can be done by setting up a package link to the main HarperDB package in your app:

```
# you may need to go to your harperdb directory and set it up as a link first
npm link harperdb
```

And then you can import any of the main HarperDB APIs you will use, and your IDE should understand the full typings associated with them:

```
import { databases, tables, Resource } from 'harperdb';
```

## Resource Class (Instance) Methods

### Properties/attributes declared in schema

Properties that have been defined in your table's schema can be accessed and modified as direct properties on the Resource instances.

### `get(queryOrProperty?)`: Resource|AsyncIterable

This is called to return the record or data for this resource, and is called by HTTP GET requests. This may be optionally called with a `query` object to specify a query should be performed, or a string to indicate that the specified property value should be returned. When defining Resource classes, you can define or override this method to define exactly what should be returned when retrieving a record. The default `get` method (`super.get()`) returns the current record as a plain object.

The query object can be used to access any query parameters that were included in the URL. For example, with a request to `/my-resource/some-id?param1=value`, we can access URL/request information:

```javascript
get(query) {
	// note that query will only exist (as an object) if there is a query string
	let param1 = query?.get?.('param1'); // returns 'value'
	let id = this.getId(); // returns 'some-id'
	...
}
```

If `get` is called for a single record (for a request like `/Table/some-id`), the default action is to return `this` instance of the resource. If `get` is called on a collection (`/Table/?name=value`), the default action is to `search` and return an AsyncIterable of results.

### `search(query: Query)`: AsyncIterable

By default this is called by `get(query)` from a collection resource.

### `getId(): string|number|Array<string|number>`

Returns the primary key value for this resource.

### `put(data: object)`

This will assign the provided record or data to this resource, and is called for HTTP PUT requests. You can define or override this method to define how records should be updated. The default `put` method on tables (`super.put(data)`) writes the record to the table (updating or inserting depending on if the record previously existed) as part of the current transaction for the resource instance.

### `patch(data: object)`

This will update the existing record with the provided data's properties, and is called for HTTP PATCH requests. You can define or override this method to define how records should be updated. The default `patch` method on tables (`super.patch(data)`) updates the record. The properties will be applied to the existing record, overwriting the existing records properties, and preserving any properties in the record that are not specified in the `data` object. This is performed as part of the current transaction for the resource instance.

### `update(data: object, fullUpdate: boolean?)`

This is called by the default `put` and `patch` handlers to update a record. `put` calls with `fullUpdate` as `true` to indicate a full record replacement (`patch` calls it with the second argument as `false`). Any additional property changes that are made before the transaction commits will also be persisted.

### `delete(queryOrProperty?)`

This will delete this record or resource, and is called for HTTP DELETE requests. You can define or override this method to define how records should be deleted. The default `delete` method on tables (`super.put(record)`) deletes the record from the table as part of the current transaction.

### `publish(message)`

This will publish a message to this resource, and is called for MQTT publish commands. You can define or override this method to define how messages should be published. The default `publish` method on tables (`super.publish(message)`) records the published message as part of the current transaction; this will not change the data in the record but will notify any subscribers to the record/topic.

### `post(data)`

This is called for HTTP POST requests. You can define this method to provide your own implementation of how POST requests should be handled. Generally this provides a generic mechanism for various types of data updates.

### `invalidate()`

This method is available on tables. This will invalidate the current record in the table. This can be used with a caching table and is used to indicate that the source data has changed, and the record needs to be reloaded when next accessed.

### `subscribe(subscriptionRequest): Promise<Subscription>`

This will subscribe to the current resource, and is called for MQTT subscribe commands. You can define or override this method to define how subscriptions should be handled. The default `subscribe` method on tables (`super.publish(message)`) will set up a listener that will be called for any changes or published messages to this resource.

The returned (promise resolves to) Subscription object is an `AsyncIterable` that you can use a `for await` to iterate through. It also has a `queue` property which holds (an array of) any messages that are ready to be delivered immediately (if you have specified a start time, previous count, or there is a message for the current or "retained" record, these may be immediately returned).

The `subscriptionRequest` object supports the following properties (all optional):

- `id` - The primary key of the record (or topic) that you want to subscribe to. If omitted, this will be a subscription to the whole table.
- `isCollection` - If this is enabled and the `id` was included, this will create a subscription to all the record updates/messages that are prefixed with the id. For example, a subscription request of `{id:'sub', isCollection: true}` would return events for any update with an id/topic of the form sub/\* (like `sub/1`).
- `startTime` - This will begin the subscription at a past point in time, returning all updates/messages since the start time (a catch-up of historical messages). This can be used to resume a subscription, getting all messages since the last subscription.
- `previousCount` - This specifies the number of previous updates/messages to deliver. For example, `previousCount: 10` would return the last ten messages. Note that `previousCount` can not be used in conjunction with `startTime`.
- `omitCurrent` - Indicates that the current (or retained) record should _not_ be immediately sent as the first update in the subscription (if no `startTime` or `previousCount` was used). By default, the current record is sent as the first update.

### `connect(incomingMessages?: AsyncIterable<any>): AsyncIterable<any>`

This is called when a connection is received through WebSockets or Server Sent Events (SSE) to this resource path. This is called with `incomingMessages` as an iterable stream of incoming messages when the connection is from WebSockets, and is called with no arguments when the connection is from a SSE connection. This can return an asynchronous iterable representing the stream of messages to be sent to the client.

### `set(property, value)`

This will assign the provided value to the designated property in the resource's record. During a write operation, this will indicate that the record has changed and the changes will be saved during commit. During a read operation, this will modify the copy of the record that will be serialized during serialization (converted to the output format of JSON, MessagePack, etc.).

### `allowCreate(user)`

This is called to determine if the user has permission to create the current resource. This is called as part of external incoming requests (HTTP). The default behavior for a generic resource is that this requires super-user permission and the default behavior for a table is to check the user's role's insert permission to the table.

### `allowRead(user)`

This is called to determine if the user has permission to read from the current resource. This is called as part of external incoming requests (HTTP GET). The default behavior for a generic resource is that this requires super-user permission and the default behavior for a table is to check the user's role's read permission to the table.

### `allowUpdate(user)`

This is called to determine if the user has permission to update the current resource. This is called as part of external incoming requests (HTTP PUT). The default behavior for a generic resource is that this requires super-user permission and the default behavior for a table is to check the user's role's update permission to the table.

### `allowDelete(user)`

This is called to determine if the user has permission to delete the current resource. This is called as part of external incoming requests (HTTP DELETE). The default behavior for a generic resource is that this requires super-user permission and the default behavior for a table is to check the user's role's delete permission to the table.

### `getUpdatedTime(): number`

This returns the last updated time of the resource (timestamp of last commit). This is returned as milliseconds from epoch.

### `wasLoadedFromSource(): boolean`

Indicates if the record had been loaded from source. When using caching tables, this indicates that there was a cache miss and the data had to be loaded from the source (or waiting on an inflight request from the source to finish).

### `getContext(): Context`

Returns the context for this resource. The context contains information about the current transaction, the user that initiated this action, and other metadata that should be retained through the life of an action.

#### `Context`

The `Context` object has the following (potential) properties:

- `user` - This is the user object, which includes information about the username, role, and authorizations.
- `transaction` - The current transaction If the current method was triggered by an HTTP request, the following properties are available:
- `lastModified` - This value is used to indicate the last modified or updated timestamp of any resource(s) that are accessed and will inform the response's `ETag` (or `Last-Modified`) header. This can be updated by application code if it knows that modification should cause this timestamp to be updated.

When a resource gets a request through HTTP, the request object is the context, which has the following properties:

- `url` - The local path/URL of the request (this will not include the protocol or host name, but will start at the path and includes the query string).
- `method` - The method of the HTTP request.
- `headers` - This is an object with the headers that were included in the HTTP request. You can access headers by calling `context.headers.get(headerName)`.
- `responseHeaders` - This is an object with the headers that will be included in the HTTP response. You can set headers by calling `context.responseHeaders.set(headerName, value)`.
- `pathname` - This provides the path part of the URL (no querystring).
- `host` - This provides the host name of the request (from the `Host` header).
- `ip` - This provides the ip address of the client that made the request.

When a resource is accessed as a data source:

- `requestContext` - For resources that are acting as a data source for another resource, this provides access to the context of the resource that is making a request for data from the data source resource.

### `operation(operationObject: Object, authorize?: boolean): Promise<any>`

This method is available on tables and will execute a HarperDB operation, using the current table as the target of the operation (the `table` and `database` do not need to be specified). See the [operations API](https://api.harperdb.io/) for available operations that can be performed. You can set the second argument to `true` if you want the current user to be checked for authorization for the operation (if `true`, will throw an error if they are not authorized).

### `allowStaleWhileRevalidate(entry: { version: number, localTime: number, expiresAt: number, value: object }, id): boolean`

For caching tables, this can be defined to allow stale entries to be returned while revalidation is taking place, rather than waiting for revalidation. The `version` is the timestamp/version from the source, the `localTime` is when the resource was last refreshed, the `expiresAt` is when the resource expired and became stale, and the `value` is the last value (the stale value) of the record/resource. All times are in milliseconds since epoch. Returning `true` will allow the current stale value to be returned while revalidation takes place concurrently. Returning `false` will cause the response to wait for the data source or origin to revalidate or provide the latest value first, and then return the latest value.

## Resource Static Methods and Properties

The Resource class also has static methods that mirror the instance methods with an initial argument that is the id of the record to act on. The static methods are generally the preferred and most convenient method for interacting with tables outside of methods that are directly extending a table.

The get, put, delete, subscribe, and connect methods all have static equivalents. There is also a `static search()` method for specifically handling searching a table with query parameters. By default, the Resource static methods default to calling the instance methods. Again, generally static methods are the preferred way to interact with resources and call them from application code. These methods are available on all user Resource classes and tables.

### `get(id: Id, context?: Resource|Context)`

This will retrieve a resource instance by id. For example, if you want to retrieve comments by id in the retrieval of a blog post you could do:

```javascript
const { MyTable } = tables;
...
// in class:
	async get() {
		for (let commentId of this.commentIds) {
			let comment = await Comment.get(commentId, this);
			// now you can do something with the comment record
		}
	}
```

Type definition for `Id`:

```
Id = string|number|array<string|number>
```

### `put(record: object, context?: Resource|Context): Promise<void>`

### `put(id: Id, record: object, context?: Resource|Context): Promise<void>`

This will save the provided record or data to this resource. This will fully replace the existing record. Make sure to `await` this function to ensure it finishes execution within the surrounding transaction.

### `patch(recordUpdate: object, context?: Resource|Context): Promise<void>`

### `patch(id: Id, recordUpdate: object, context?: Resource|Context): Promise<void>`

This will save the provided updates to the record. The `recordUpdate` object's properties will be applied to the existing record, overwriting the existing records properties, and preserving any properties in the record that are not specified in the `recordUpdate` object. Make sure to `await` this function to ensure it finishes execution within the surrounding transaction.

### `delete(id: Id, context?: Resource|Context): Promise<void>`

Deletes this resource's record or data. Make sure to `await` this function to ensure it finishes execution within the surrounding transaction.

### `publish(message: object, context?: Resource|Context): Promise<void>`

### `publish(topic: Id, message: object, context?: Resource|Context): Promise<void>`

Publishes the given message to the record entry specified by the id in the context. Make sure to `await` this function to ensure it finishes execution within the surrounding transaction.

### `subscribe(subscriptionRequest, context?: Resource|Context): Promise<Subscription>`

Subscribes to a record/resource.

### `search(query: Query, context?: Resource|Context): AsyncIterable`

This will perform a query on this table or collection. The query parameter can be used to specify the desired query.

### `primaryKey`

This property indicates the name of the primary key attribute for a table. You can get the primary key for a record using this property name. For example:

```
let record34 = await Table.get(34);
record34[Table.primaryKey] -> 34
```

There are additional methods that are only available on table classes (which are a type of resource).

### `Table.sourcedFrom(Resource, options)`

This defines the source for a table. This allows a table to function as a cache for an external resource. When a table is configured to have a source, any request for a record that is not found in the table will be delegated to the source resource to retrieve and the result will be cached/stored in the table. All writes to the table will also first be delegated to the source (if the source defines write functions like `put`, `delete`, etc.). The options parameter can include an `expiration` property that will configure the table with a time-to-live expiration window for automatic deletion or invalidation of older entries.

If the source resource implements subscription support, real-time invalidation can be performed to ensure the cache is guaranteed to be fresh (and this can eliminate or reduce the need for time-based expiration of data).

### `parsePath(path, context, query) {`

This is called by static methods when they are responding to a URL (from HTTP request, for example), and translates the path to an id. By default, this will convert a multi-segment path to multipart id (an array), which facilitates hierarchical id-based data access, and also parses `.property` suffixes for accessing properties and specifying preferred content type in the URL. However, in some situations you may wish to preserve the path directly as a string. You can override `parsePath` for simpler path to id preservation:

```javascript
	static parsePath(path) {
		return path; // return the path as the id
	}
```

### `isCollection(resource: Resource): boolean`

This returns a boolean indicating if the provide resource instance represents a collection (can return a query result) or a single record/entity.

### Context and Transactions

Whenever you implement an action that is calling other resources, it is recommended that you provide the "context" for the action. This allows a secondary resource to be accessed through the same transaction, preserving atomicity and isolation.

This also allows timestamps that are accessed during resolution to be used to determine the overall last updated timestamp, which informs the header timestamps (which facilitates accurate client-side caching). The context also maintains user, session, and request metadata information that is communicated so that contextual request information (like headers) can be accessed and any writes are properly attributed to the correct user.

When using an export resource class, the REST interface will automatically create a context for you with a transaction and request metadata, and you can pass this to other actions by simply including `this` as the source argument (second argument) to the static methods.

For example, if we had a method to post a comment on a blog, and when this happens we also want to update an array of comment IDs on the blog record, but then add the comment to a separate comment table. We might do this:

```javascript
const { Comment } = tables;

export class BlogPost extends tables.BlogPost {
	post(comment) {
		// add a comment record to the comment table, using this resource as the source for the context
		Comment.put(comment, this);
		this.comments.push(comment.id); // add the id for the record to our array of comment ids
		// Both of these actions will be committed atomically as part of the same transaction
	}
}
```

Please see the [transaction documentation](transactions) for more information on how transactions work in HarperDB.

### Query

The `get`/`search` methods accept a Query object that can be used to specify a query for data. The query is an object that has the following properties, which are all optional:

- `conditions`: This is an array of objects that specify the conditions to use the match records (if conditions are omitted or it is an empty array, this is a search for everything in the table). Each condition object has the following properties:
  - `attribute`: Name of the property/attribute to match on.
  - `value`: The value to match.
  - `comparator`: This can specify how the value is compared. This defaults to "equals", but can also be "greater_than", "greater_than_equal", "less_than", "less_than_equal", "starts_with", "contains", "ends_with", "between", and "not_equal".
- `operator`: Specifies if the conditions should be applied as an `"and"` (records must match all conditions), or as an "or" (records must match at least one condition). This defaults to `"and"`.
- `limit`: This specifies the limit of the number of records that should be returned from the query.
- `offset`: This specifies the number of records that should be skipped prior to returning records in the query. This is often used with `limit` to implement "paging" of records.
- `select`: This specifies the specific properties that should be included in each record that is returned. This can be a string value, to specify that the value of the specified property should be returned for each iteration/element in the results. This can be an array, to specify a set of properties that should be included in the returned objects. The array can specify an `select.asArray = true` property and the query results will return a set of arrays of values of the specified properties instead of objects; this can be used to return more compact results.

The query results are returned as an `AsyncIterable`. In order to access the elements of the query results, you must use a `for await` loop (it does _not_ return an array, you can not access the results by index).

For example, we could do a query like:

```javascript
let { Product } = tables;
let results = Product.search({
	conditions: [
		{ attribute: 'rating', value: 4.5, comparator: 'greater_than' },
		{ attribute: 'price', value: 100, comparator: 'less_than' },
	],
	offset: 20,
	limit: 10,
	select: ['id', 'name', 'price', 'rating'],
});
for await (let record of results) {
	// iterate through each record in the query results
}
```

`AsyncIterable`s can be returned from resource methods, and will be properly serialized in responses. When a query is performed, this will open/reserve a read transaction until the query results are iterated, either through your own `for await` loop or through serialization. Failing to iterate the results this will result in a long-lived read transaction which can degrade performance (including write performance), and may eventually be aborted.

### Interacting with the Resource Data Model

When extending or interacting with table resources, when a resource instance is retrieved and instantiated, it will be loaded with the record data from its table. You can interact with this record through the resource instance. For any properties that have been defined in the table's schema, you can direct access or modify properties through standard property syntax. For example, let's say we defined a product schema:

```graphql
type Product @table {
	id: ID @primaryKey
	name: String
	rating: Int
	price: Float
}
```

If we have extended this table class with our get() we can interact with any these specified attributes/properties:

```javascript
export class CustomProduct extends Product {
	get(query) {
		let name = this.name; // this is the name of the current product
		let rating = this.rating; // this is the rating of the current product
		this.rating = 3; // we can also modify the rating for the current instance
		// (with a get this won't be saved by default, but will be used when serialized)
		return super.get(query);
	}
}
```

Likewise, we can interact with resource instances in the same way when retrieving them through the static methods:

```javascript
let product1 = await Product.get(1);
let name = product1.name; // this is the name of the product with a primary key of 1
let rating = product1.rating; // this is the rating of the product with a primary key of 1
product1.rating = 3; // modify the rating for this instance (this will be saved without a call to update())
```

If there are additional properties on (some) products that aren't defined in the schema, we can still access them through the resource instance, but since they aren't declared, there won't be getter/setter definition for direct property access, but we can access properties with the `get(propertyName)` method and modify properties with the `set(propertyName, value)` method:

```javascript
let product1 = await Product.get(1);
let additionalInformation = product1.get('additionalInformation'); // get the additionalInformation property value even though it isn't defined in the schema
product1.set('newProperty', 'some value'); // we can assign any properties we want with set
```

And likewise, we can do this in an instance method, although you will probably want to use super.get()/set() so you don't have to write extra logic to avoid recursion:

```javascript
export class CustomProduct extends Product {
	get(query) {
		let additionalInformation = super.get('additionalInformation'); // get the additionalInformation property value even though it isn't defined in the schema
		super.set('newProperty', 'some value'); // we can assign any properties we want with set
	}
}
```

Note that you may also need to use `get`/`set` for properties that conflict with existing method names. For example, your schema defines an attribute called `getId` (not recommended), you would need to access that property through `get('getId')` and `set('getId', value)`.

If you want to save the changes you make, you can call the \`update()\`\` method:

```javascript
let product1 = await Product.get(1);
product1.rating = 3;
product1.set('newProperty', 'some value');
product1.update(); // save both of these property changes
```

Updates are automatically saved inside modifying methods like put and post:

```javascript
export class CustomProduct extends Product {
	post(data) {
		this.name = data.name;
		this.set('description', data.description);
		// both of these changes will be saved automatically as this transaction commits
	}
}
```

We can also interact with properties in nested objects and arrays, following the same patterns. For example we could define more complex types on our product:

```graphql
type Product @table {
	id: ID @primaryKey
	name: String
	rating: Int
	price: Float
	brand: Brand;
	variations: [Variation];
}
type Brand {
	name: String
}
type Variation {
	name: String
	price: Float
}
```

We can interact with these nested properties:

```javascript
export class CustomProduct extends Product {
	post(data) {
		let brandName = this.brand.name;
		let firstVariationPrice = this.variations[0].price;
		let additionalInfoOnBrand = this.brand.get('additionalInfo'); // not defined in schema, but can still try to access property
		// make some changes
		this.variations.splice(0, 1); // remove first variation
		this.variations.push({ name: 'new variation', price: 9.99 }); // add a new variation
		this.brand.name = 'new brand name';
		// all these change will be saved
	}
}
```

If you need to delete a property, you can do with the `delete` method:

```javascript
let product1 = await Product.get(1);
product1.delete('additionalInformation');
product1.update();
```

You can also get "plain" object representation of a resource instance by calling `toJSON`, which will return a simple object with all the properties (whether defined in the schema) as direct normal properties:

```javascript
let product1 = await Product.get(1);
let plainObject = product1.toJSON();
for (let key in plainObject) {
	// can iterate through the properties of this record
}
```

### Throwing Errors

You may throw errors (and leave them uncaught) from the response methods and these should be caught and handled by protocol the handler. For REST requests/responses, this will result in an error response. By default the status code will be 500. You can assign a property of `statusCode` to errors to indicate the HTTP status code that should be returned. For example:

```javascript
if (notAuthorized()) {
	let error = new Error('You are not authorized to access this');
	error.statusCode = 403;
	throw error;
}
```
