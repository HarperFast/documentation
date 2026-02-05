---
title: Content Types
---

# Content Types

Harper supports several different content types (or MIME types) for both HTTP request bodies (describing operations) as well as for serializing content into HTTP response bodies. Harper follows HTTP standards for specifying both request body content types and acceptable response body content types. Any of these content types can be used with any of the standard Harper operations.

:::tip Need a custom content type?

Harper's extensible content type system lets you add support for any serialization format (XML, YAML, proprietary formats, etc.) by registering custom handlers in the [`contentTypes`](./globals.md#contenttypes) global Map. See the linked API reference for detailed implementation types, handler properties, and examples.

:::

For request body content, the content type should be specified with the `Content-Type` header. For example with JSON, use `Content-Type: application/json` and for CBOR, include `Content-Type: application/cbor`. To request that the response body be encoded with a specific content type, use the `Accept` header. If you want the response to be in JSON, use `Accept: application/json`. If you want the response to be in CBOR, use `Accept: application/cbor`.

The following content types are supported:

## JSON - application/json

JSON is the most widely used content type, and is relatively readable and easy to work with. However, JSON does not support all the data types that are supported by Harper, and can't be used to natively encode data types like binary data or explicit Maps/Sets. Also, JSON is not as efficient as binary formats. When using JSON, compression is recommended (this also follows standard HTTP protocol with the `Accept-Encoding` header) to improve network transfer performance (although there is server performance overhead). JSON is a good choice for web development and when standard JSON types are sufficient and when combined with compression and debuggability/observability is important.

## CBOR - application/cbor

CBOR is a highly efficient binary format, and is a recommended format for most production use cases with Harper. CBOR supports the full range of Harper data types, including binary data, typed dates, and explicit Maps/Sets. CBOR is very performant and space efficient even without compression. Compression will still yield better network transfer size/performance, but compressed CBOR is generally not any smaller than compressed JSON. CBOR also natively supports streaming for optimal performance (using indefinite length arrays). The CBOR format has excellent standardization and Harper's CBOR provides an excellent balance of performance and size efficiency.

## MessagePack - application/x-msgpack

MessagePack is another efficient binary format like CBOR, with support for all Harper data types. MessagePack generally has wider adoption than CBOR and can be useful in systems that don't have CBOR support (or good support). However, MessagePack does not have native support for streaming of arrays of data (for query results), and so query results are returned as a (concatenated) sequence of MessagePack objects/maps. MessagePack decoders used with Harper's MessagePack must be prepared to decode a direct sequence of MessagePack values to properly read responses.

## Comma-separated Values (CSV) - text/csv

Comma-separated values is an easy to use and understand format that can be readily imported into spreadsheets or used for data processing. CSV lacks hierarchical structure for most data types, and shouldn't be used for frequent/production use, but when you need it, it is available.

In addition, with the REST interface, you can use file-style extensions to indicate an encoding like [https://host/path.csv](https://host/path.csv) to indicate CSV encoding. See the [REST documentation](../developers/rest) for more information on how to do this.
