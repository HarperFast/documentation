---
title: Defining Schemas
---

# Defining Schemas

Schemas define tables and their attributes. Schemas can be declaratively defined in Harper's using GraphQL schema definitions. Schemas definitions can be used to ensure that tables exist (that are required for applications), and have the appropriate attributes. Schemas can define the primary key, data types for attributes, if they are required, and specify which attributes should be indexed. The [introduction to applications provides](./) a helpful introduction to how to use schemas as part of database application development.

Schemas can be used to define the expected structure of data, but are also highly flexible and support heterogeneous data structures and by default allows data to include additional properties. The standard types for GraphQL schemas are specified in the [GraphQL schema documentation](https://graphql.org/learn/schema/).

An example schema that defines a couple tables might look like:

```graphql
# schema.graphql:
type Dog @table {
	id: ID @primaryKey
	name: String
	breed: String
	age: Int
}

type Breed @table {
	id: ID @primaryKey
}
```

In this example, you can see that we specified the expected data structure for records in the Dog and Breed table. For example, this will enforce that Dog records are required to have a `name` property with a string (or null, unless the type were specified to be non-nullable). This does not preclude records from having additional properties (see `@sealed` for preventing additional properties. For example, some Dog records could also optionally include a `favoriteTrick` property.

In this page, we will describe the specific directives that Harper uses for defining tables and attributes in a schema.

### Type Directives

#### `@table`

The schema for tables are defined using GraphQL type definitions with a `@table` directive:

```graphql
type TableName @table
```

By default the table name is inherited from the type name (in this case the table name would be "TableName"). The `@table` directive supports several optional arguments (all of these are optional and can be freely combined):

- `@table(table: "table_name")` - This allows you to explicitly specify the table name.
- `@table(database: "database_name")` - This allows you to specify which database the table belongs to. This defaults to the "data" database.
- `@table(expiration: 3600)` - Sets an expiration time on entries in the table before they are automatically cleared (primarily useful for caching tables). This is specified in seconds.
- `@table(audit: true)` - This enables the audit log for the table so that a history of record changes are recorded. This defaults to [configuration file's setting for `auditLog`](../../deployments/configuration#logging).

Database naming: the default "data" database is generally a good default choice for tables in applications that will not be reused in other applications (and don't need to worry about staying in a separate namespace). Application with many tables may wish to organize the tables into separate databases (but remember that transactions do not preserve atomicity across different databases, only across tables in the same database). For components that are designed for re-use, it is recommended that you use a database name that is specific to the component (e.g. "my-component-data") to avoid name collisions with other components.

#### `@export`

This indicates that the specified table should be exported as a resource that is accessible as an externally available endpoints, through REST, MQTT, or any of the external resource APIs.

This directive also accepts a `name` parameter to specify the name that should be used for the exported resource (how it will appear in the URL path). For example:

```
type MyTable @table @export(name: "my-table")
```

This table would be available at the URL path `/my-table/`. Without the `name` parameter, the exported name defaults to the name of the table type ("MyTable" in this example).

### Relationships: `@relationship`

Defining relationships is the foundation of using "join" queries in Harper. A relationship defines how one table relates to another table using a foreign key. Using the `@relationship` directive will define a property as a computed property, which resolves to the an record/instance from a target type, based on the referenced attribute, which can be in this table or the target table. The `@relationship` directive must be used in combination with an attribute with a type that references another table.

#### `@relationship(from: attribute)`

This defines a relationship where the foreign key is defined in this table, and relates to the primary key of the target table. If the foreign key is single-valued, this establishes a many-to-one relationship with the target table. The foreign key may also be a multi-valued array, in which case this will be a many-to-many relationship. For example, we can define a foreign key that references another table and then define the relationship. Here we create a `brandId` attribute that will be our foreign key (it will hold an id that references the primary key of the Brand table), and we define a relationship to the `Brand` table through the `brand` attribute:

```graphql
type Product @table @export {
	id: ID @primaryKey
	brandId: ID @indexed
	brand: Brand @relationship(from: brandId)
}
type Brand @table @export {
	id: ID @primaryKey
}
```

Once this is defined we can use the `brand` attribute as a [property in our product instances](../../reference/resources/) and allow for querying by `brand` and selecting brand attributes as returned properties in [query results](../rest).

Again, the foreign key may be a multi-valued array (array of keys referencing the target table records). For example, if we had a list of features that references a Feature table:

```graphql
type Product @table @export {
	id: ID @primaryKey
	featureIds: [ID] @indexed # array of ids
	features: [Feature] @relationship(from: featureIds) # array of referenced feature records
}
type Feature @table {
	id: ID @primaryKey
	...
}
```

#### `@relationship(to: attribute)`

This defines a relationship where the foreign key is defined in the target table and relates to primary key of this table. If the foreign key is single-valued, this establishes a one-to-many relationship with the target table. Note that the target table type must be an array element type (like `[Table]`). The foreign key may also be a multi-valued array, in which case this will be a many-to-many relationship. For example, we can define on a reciprocal relationship, from the example above, adding a relationship from brand back to product. Here we use continue to use the `brandId` attribute from the `Product` schema, and we define a relationship to the `Product` table through the `products` attribute:

```graphql
type Brand @table @export {
	id: ID @primaryKey
	name: String
	products: [Product] @relationship(to: brandId)
}
```

Once this is defined we can use the `products` attribute as a property in our brand instances and allow for querying by `products` and selecting product attributes as returned properties in query results.

Note that schemas can also reference themselves with relationships, allowing records to define relationships like parent-child relationships between records in the same table. Also note, that for a many-to-many relationship, you must not combine the `to` and `from` property in the same relationship directive.

### Computed Properties: `@computed`

The `@computed` directive specifies that a field is computed based on other fields in the record. This is useful for creating derived fields that are not stored in the database, but are computed when specific record fields is queried/accessed. The `@computed` directive must be used in combination with a field that is a function that computes the value of the field. For example:

```graphql
type Product @table {
	id: ID @primaryKey
	price: Float
	taxRate: Float
	totalPrice: Float @computed(from: "price + (price * taxRate)")
}
```

The `from` argument specifies the expression that computes the value of the field. The expression can reference other fields in the record. The expression is evaluated when the record is queried or indexed.

The `computed` directive may also be defined in a JavaScript module, which is useful for more complex computations. You can specify a computed attribute, and then define the function with the `setComputedAttribute` method. For example:

```graphql
type Product @table {
...
	totalPrice: Float @computed
}
```

```javascript
tables.Product.setComputedAttribute('totalPrice', (record) => {
	return record.price + record.price * record.taxRate;
});
```

Computed properties may also be indexed, which provides a powerful mechanism for creating indexes on derived fields with custom querying capabilities. This can provide a mechanism for composite indexes, custom full-text indexing, vector indexing, or other custom indexing strategies. A computed property can be indexed by adding the `@indexed` directive to the computed property. When using a JavaScript module for a computed property that is indexed, it is highly recommended that you specify a `version` argument to ensure that the computed attribute is re-evaluated when the function is updated. For example:

```graphql
type Product @table {
...
	totalPrice: Float @computed(version: 1) @indexed
}
```

If you were to update the `setComputedAttribute` function for the `totalPrice` attribute, to use a new formula, you must increment the `version` argument to ensure that the computed attribute is re-indexed (note that on a large database, re-indexing may be a lengthy operation). Failing to increment the `version` argument with a modified function can result in an inconsistent index. The computed function must be deterministic, and should not have side effects, as it may be re-evaluated multiple times during indexing.

Note that computed properties will not be included by default in a query result, you must explicitly include them in query results using the `select` query function.

Another example of using a computed custom index, is that we could index all the comma-separated words in a `tags` property by doing (similar techniques are used for full-text indexing):

```graphql
type Product @table {
	id: ID @primaryKey
	tags: String # comma delimited set of tags
	tagsSeparated: String[] @computed(from: "tags.split(/\\s*,\\s*/)") @indexed # split and index the tags
}
```

For more in-depth information on computed properties, visit our blog [here](https://www.harpersystems.dev/development/tutorials/how-to-create-custom-indexes-with-computed-properties)

### Field Directives

The field directives can be used for information about each attribute in table type definition.

#### `@primaryKey`

The `@primaryKey` directive specifies that an attribute is the primary key for a table. These must be unique and when records are created, this will be auto-generated if no primary key is provided. When a primary key is auto-generated, it will be a UUID (as a string) if the primary key type is `String` or `ID`. If the primary key type is `Int`, `Long`, or `Any`, then the primary key will be an auto-incremented number. Using numeric primary keys is more efficient than using UUIDs. Note that if the type is `Int`, the primary key will be limited to 32-bit, which can be limiting and problematic for large tables. It is recommended that if you will be relying on auto-generated keys, that you use a primary key type of `Long` or `Any` (the latter will allow you to also use strings as primary keys).

#### `@indexed`

The `@indexed` directive specifies that an attribute should be indexed. When an attribute is indexed, Harper will create secondary index from the data in this field for fast/efficient querying using this field. This is necessary if you want to execute queries using this attribute (whether that is through RESTful query parameters, SQL, or NoSQL operations).

A standard index will index the values in each field, so you can query directly by those values. If the field's value is an array, each of the values in the array will be indexed (you can query by any individual value).

#### Vector Indexing

The `@indexed` directive can also specify a `type`. To use vector indexing, you can specify the `type` as `HNSW` for Hierarchical Navigable Small World indexing. This will create a vector index for the attribute. For example:

```graphql
type Product @table {
	id: Long @primaryKey
	textEmbeddings: [Float] @indexed(type: "HNSW")
}
```

HNSW indexing finds the nearest neighbors to a search vector. To use this, you can query with a `sort` parameter, for example:

```javascript
let results = Product.search({
	sort: { attribute: 'textEmbeddings', target: searchVector },
	limit: 5, // get the five nearest neighbors
});
```

This can be used in combination with other conditions as well, for example:

```javascript
let results = Product.search({
	conditions: [{ attribute: 'price', comparator: 'lt', value: 50 }],
	sort: { attribute: 'textEmbeddings', target: searchVector },
	limit: 5, // get the five nearest neighbors
});
```

HNSW supports several additional arguments to the `@indexed` directive to adjust the HNSW parameters:

- `distance` - Define the distance function. This can be set to 'euclidean' or 'cosine' (uses negative of cosine similarity). The default is cosine.
- `efConstruction` - Maximum number of nodes to keep in the list for finding nearest neighbors. A higher value can yield better recall, and a lower value can have better performance. If `efSearchConstruction` is set, this is only applied to indexing. The default is 100.
- `M` - The preferred number of connections at each layer in the HNSW graph. A higher number uses more space but can be helpful when the intrinsic dimensionality of the data is higher. A lower number can be more efficient. The default is 16.
- `optimizeRouting` - This uses a heuristic to avoid graph connections that match existing indirect connections (connections through another node). This can yield more efficient graph traversals for the same M setting. This is a number between 0 and 1 and a higher value will more aggressively omit connections with alternate paths. Setting this to 0 will disable route optimizing and follow the traditional HNSW algorithm for creating connections. The default is 0.5.
- `mL` - The normalization factor for level generation, by default this is computed from `M`.
- `efSearchConstruction` - Maximum number of nodes to keep in the list for finding nearest neighbors for searching. The default is 50.

For example

```graphql
type Product @table {
	id: Long @primaryKey
	textEmbeddings: [Float] @indexed(type: "HNSW", distance: "euclidean", optimizeRouting: 0, efSearchConstruction: 100)
}
```

#### `@createdTime`

The `@createdTime` directive indicates that this property should be assigned a timestamp of the creation time of the record (in epoch milliseconds).

#### `@updatedTime`

The `@updatedTime` directive indicates that this property should be assigned a timestamp of each updated time of the record (in epoch milliseconds).

#### `@sealed`

The `@sealed` directive specifies that no additional properties should be allowed on records besides those specified in the type itself.

### Defined vs Dynamic Schemas

If you do not define a schema for a table and create a table through the operations API (without specifying attributes) or studio, such a table will not have a defined schema and will follow the behavior of a ["dynamic-schema" table](../../reference/dynamic-schema). It is generally best-practice to define schemas for your tables to ensure predictable, consistent structures with data integrity.

### Field Types

Harper supports the following field types in addition to user defined (object) types:

- `String`: String/text
- `Int`: A 32-bit signed integer (from -2147483648 to 2147483647)
- `Long`: A 54-bit signed integer (from -9007199254740992 to 9007199254740992)
- `Float`: Any number (any number that can be represented as a [64-bit double precision floating point number](https://en.wikipedia.org/wiki/Double-precision_floating-point_format). Note that all numbers are stored in the most compact representation available)
- `BigInt`: Any integer (negative or positive) with less than 300 digits (Note that `BigInt` is a distinct and separate type from standard numbers in JavaScript, so custom code should handle this type appropriately)
- `Boolean`: true or false
- `ID`: A string (but indicates it is not intended to be human readable)
- `Any`: Any primitive, object, or array is allowed
- `Date`: A Date object
- `Bytes`: Binary data as a Buffer or Uint8Array
- `Blob`: Binary data as a [Blob](../../reference/blob), designed for large blocks of data that can be streamed. It is recommend that you use this for binary data that will typically be larger than 20KB.

#### Renaming Tables

It is important to note that Harper does not currently support renaming tables. If you change the name of a table in your schema definition, this will result in the creation of a new, empty table.

### OpenAPI Specification

_The_ [_OpenAPI Specification_](https://spec.openapis.org/oas/v3.1.0) _defines a standard, programming language-agnostic interface description for HTTP APIs, which allows both humans and computers to discover and understand the capabilities of a service without requiring access to source code, additional documentation, or inspection of network traffic._

If a set of endpoints are configured through a Harper GraphQL schema, those endpoints can be described by using a default REST endpoint called `GET /openapi`.

_Note: The `/openapi` endpoint should only be used as a starting guide, it may not cover all the elements of an endpoint._
