---
title: Data Types
---

# Data Types

Harper supports a rich set of data types for use in records in databases. Various data types can be used from both direct JavaScript interfaces in Custom Functions and the HTTP operations APIs. Using JSON for communication naturally limits the data types to those available in JSON (Harper’s supports all of JSON data types), but JavaScript code and alternate data formats facilitate the use of additional data types. Harper supports MessagePack and CBOR, which allows for all of Harper supported data types. [Schema definitions can specify the expected types for fields, with GraphQL Schema Types](../developers/applications/defining-schemas), which are used for validation of incoming typed data (JSON, MessagePack), and is used for auto-conversion of untyped data (CSV, [query parameters](../developers/rest)). Available data types include:

(Note that these labels are descriptive, they do not necessarily correspond to the GraphQL schema type names, but the schema type names are noted where possible)

## Boolean

true or false. The GraphQL schema type name is `Boolean`.

## String

Strings, or text, are a sequence of any unicode characters and are internally encoded with UTF-8. The GraphQL schema type name is `String`.

## Number

Numbers can be stored as signed integers up to a 1000 bits of precision (about 300 digits) or floating point with 64-bit floating point precision, and numbers are automatically stored using the most optimal type. With JSON, numbers are automatically parsed and stored in the most appropriate format. Custom components and applications may use BigInt numbers to store/access integers that are larger than 53-bit. The following GraphQL schema type name are supported:

- `Float` - Any number that can be represented with [64-bit double precision floating point number](https://en.wikipedia.org/wiki/Double-precision_floating-point_format) ("double")
- `Int` - Any integer between from -2147483648 to 2147483647
- `Long` - Any integer between from -9007199254740992 to 9007199254740992
- `BigInt` - Any integer (negative or positive) with less than 300 digits

Note that `BigInt` is a distinct and separate type from standard numbers in JavaScript, so custom code should handle this type appropriately.

## Object/Map

Objects, or maps, that hold a set named properties can be stored in Harper. When provided as JSON objects or JavaScript objects, all property keys are stored as strings. The order of properties is also preserved in Harper’s storage. Duplicate property keys are not allowed (they are dropped in parsing any incoming data).

## Array

Arrays hold an ordered sequence of values and can be stored in Harper. There is no support for sparse arrays, although you can use objects to store data with numbers (converted to strings) as properties.

## Null

A null value can be stored in Harper property values as well.

## Date

Dates can be stored as a specific data type. This is not supported in JSON, but is supported by MessagePack and CBOR. Custom Functions can also store and use Dates using JavaScript Date instances. The GraphQL schema type name is `Date`.

## Binary Data

Binary data can be stored in property values as well, with two different data types that are available:

### Bytes

JSON doesn’t have any support for encoding binary data, but MessagePack and CBOR support binary data in data structures, and this will be preserved in HarperDB. Custom Functions can also store binary data by using NodeJS’s Buffer or Uint8Array instances to hold the binary data. The GraphQL schema type name is `Bytes`.

### Blobs

Binary data can also be stored with [`Blob`s](./blob), which can scale much better for larger content than `Bytes`, as it is designed to be streamed and does not need to be held entirely in memory. It is recommended that `Blob`s are used for content larger than 20KB.

## Explicit Map/Set

Explicit instances of JavaScript Maps and Sets can be stored and preserved in Harper as well. This can’t be represented with JSON, but can be with CBOR.
