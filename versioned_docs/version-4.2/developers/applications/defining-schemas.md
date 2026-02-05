---
title: Defining Schemas
---

# Defining Schemas

Schemas define tables and their attributes. Schemas can be declaratively defined in HarperDB's using GraphQL schema definitions. Schemas definitions can be used to ensure that tables exist (that are required for applications), and have the appropriate attributes. Schemas can define the primary key, data types for attributes, if they are required, and specify which attributes should be indexed. The [introduction to applications provides](./) a helpful introduction to how to use schemas as part of database application development.

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

In this page, we will describe the specific directives that HarperDB uses for defining tables and attributes in a schema.

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

#### `@export`

This indicates that the specified table should be exported as a resource that is accessible as an externally available endpoints, through REST, MQTT, or any of the external resource APIs.

This directive also accepts a `name` parameter to specify the name that should be used for the exported resource (how it will appear in the URL path). For example:

```
type MyTable @table @export(name: "my-table")
```

This table would be available at the URL path `/my-table/`. Without the `name` parameter, the exported name defaults to the name of the table type ("MyTable" in this example).

#### `@sealed`

The `@sealed` directive specifies that no additional properties should be allowed on records besides those specified in the type itself..

### Field Directives

The field directives can be used for information about each attribute in table type definition.

#### `@primaryKey`

The `@primaryKey` directive specifies that an attribute is the primary key for a table. These must be unique and when records are created, this will be auto-generated with a UUID if no primary key is provided.

#### `@indexed`

The `@indexed` directive specifies that an attribute should be indexed. This is necessary if you want to execute queries using this attribute (whether that is through RESTful query parameters, SQL, or NoSQL operations).

#### `@createdTime`

The `@createdTime` directive indicates that this property should be assigned a timestamp of the creation time of the record (in epoch milliseconds).

#### `@updatedTime`

The `@updatedTime` directive indicates that this property should be assigned a timestamp of each updated time of the record (in epoch milliseconds).

### Defined vs Dynamic Schemas

If you do not define a schema for a table and create a table through the operations API (without specifying attributes) or studio, such a table will not have a defined schema and will follow the behavior of a ["dynamic-schema" table](../../reference/dynamic-schema). It is generally best-practice to define schemas for your tables to ensure predictable, consistent structures with data integrity.

### Field Types

HarperDB supports the following field types in addition to user defined (object) types:

- String: String/text.
- Int: A 32-bit signed integer (from -2147483648 to 2147483647).
- Long: A 54-bit signed integer (from -9007199254740992 to 9007199254740992).
- Float: Any number (any number that can be represented as a [64-bit double precision floating point number](https://en.wikipedia.org/wiki/Double-precision_floating-point_format). Note that all numbers are stored in the most compact representation available).
- Boolean: true or false.
- ID: A string (but indicates it is not intended to be legible).
- Any: Any primitive, object, or array is allowed.
- Date: A Date object.

#### Renaming Tables

It is important to note that HarperDB does not currently support renaming tables. If you change the name of a table in your schema definition, this will result in the creation of a new, empty table.
