---
title: Data Types
---

# Data Types

HarperDB supports a rich set of data types for use in records in databases. Various data types can be used from both direct JavaScript interfaces in Custom Functions and the HTTP operations APIs. Using JSON for communication naturally limits the data types to those available in JSON (HarperDB’s supports all of JSON data types), but JavaScript code and alternate data formats facilitate the use of additional data types. As of v4.1, HarperDB supports MessagePack and CBOR, which allows for all of HarperDB supported data types. This includes:

(Note that these labels are descriptive, they do not necessarily correspond to the GraphQL schema type names, but the schema type names are noted where possible)

## Boolean

true or false. The GraphQL schema type name is `Boolean`.

## String

Strings, or text, are a sequence of any unicode characters and are internally encoded with UTF-8. The GraphQL schema type name is `String`.

## Number

Numbers can be stored as signed integers up to 64-bit or floating point with 64-bit floating point precision, and numbers are automatically stored using the most optimal type. JSON is parsed by JS, so the maximum safe (precise) integer is 9007199254740991 (larger numbers can be stored, but aren’t guaranteed integer precision). Custom Functions may use BigInt numbers to store/access larger 64-bit integers, but integers beyond 64-bit can’t be stored with integer precision (will be stored as standard double-precision numbers). The GraphQL schema type name is `Float` (`Int` can also be used to describe numbers that should fit into signed 32-bit integers).

## Object/Map

Objects, or maps, that hold a set named properties can be stored in HarperDB. When provided as JSON objects or JavaScript objects, all property keys are stored as strings. The order of properties is also preserved in HarperDB’s storage. Duplicate property keys are not allowed (they are dropped in parsing any incoming data).

## Array

Arrays hold an ordered sequence of values and can be stored in HarperDB. There is no support for sparse arrays, although you can use objects to store data with numbers (converted to strings) as properties.

## Null

A null value can be stored in HarperDB property values as well.

## Date

Dates can be stored as a specific data type. This is not supported in JSON, but is supported by MessagePack and CBOR. Custom Functions can also store and use Dates using JavaScript Date instances. The GraphQL schema type name is `Date`.

## Binary Data

Binary data can be stored in property values as well. JSON doesn’t have any support for encoding binary data, but MessagePack and CBOR support binary data in data structures, and this will be preserved in HarperDB. Custom Functions can also store binary data by using NodeJS’s Buffer or Uint8Array instances to hold the binary data. The GraphQL schema type name is `Bytes`.

## Explicit Map/Set

Explicit instances of JavaScript Maps and Sets can be stored and preserved in HarperDB as well. This can’t be represented with JSON, but can be with CBOR.
