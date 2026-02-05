---
title: Blob
---

# Blob

Blobs are binary large objects that can be used to store any type of unstructured/binary data and is designed for large content. Blobs support streaming and feature better performance for content larger than about 20KB. Blobs are built off the native JavaScript `Blob` type, and HarperDB extends the native `Blob` type for integrated storage with the database. To use blobs, you would generally want to declare a field as a `Blob` type in your schema:

```graphql
type MyTable {
	id: Any! @primaryKey
	data: Blob
}
```

You can then create a blob which writes the binary data to disk, and can then be included (as a reference) in a record. For example, you can create a record with a blob like:

```javascript
let blob = createBlob(largeBuffer);
await MyTable.put({ id: 'my-record', data: blob });
```

The `data` attribute in this example is a blob reference, and can be used like any other attribute in the record, but it is stored separately, and the data must be accessed asynchronously. You can retrieve the blob data with the standard `Blob` methods:

```javascript
let buffer = await blob.bytes();
```

If you are creating a resource method, you can return a `Response` object with a blob as the body:

```javascript
export class MyEndpoint extends MyTable {
	async get(target) {
		let record = super.get(target);
		return {
			status: 200,
			headers: {},
			body: record.data, // record.data is a blob
		};
	}
}
```

When using the exported REST APIs for your tables, blobs will by default be treated with a UTF-8 encoding and contain text/plain content.

```bash
curl -X POST --location "http://localhost:9926/MyTable/" \
    -H "Content-Type: application/json" \
    -d '{
          "data": "Why hello there, world!"
        }'
```

To store arbitrary binary content (such as audio data) in a blob, using CBOR is recommended when making API requests. This will let you control the contents of the blob precisely.

If you need to use JSON, Base64 encoding your contents can be a great choice, but you'll need to do a bit of work to control the encoding of the underlying blob:

```typescript
export class MyTable extends tables.MyTable {
	static loadAsInstance = false;

	create(target: RequestTarget, record: Partial<MyTable>) {
		if (record.data) {
			record.data = Buffer.from(record.data, 'base64');
		}
		return super.create(target, record);
	}
}
```

Now you can create records and they'll be encoded appropriately. For example, here's a small .jpg encoded in base64:

```bash
curl -X POST --location "http://localhost:9926/MyTable/" \
    -H "Content-Type: application/json" \
    -d '{
          "data": "/9j/4QDKRXhpZgAATU0AKgAAAAgABgESAAMAAAABAAEAAAEaAAUAAAABAAAAVgEbAAUAAAABAAAAXgEoAAMAAAABAAIAAAITAAMAAAABAAEAAIdpAAQAAAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAeQAAAHAAAABDAyMjGRAQAHAAAABAECAwCgAAAHAAAABDAxMDCgAQADAAAAAQABAACgAgAEAAAAAQAAABCgAwAEAAAAAQAAABCkBgADAAAAAQAAAAAAAAAAAAD/2wCEAAEBAQEBAQIBAQIDAgICAwQDAwMDBAYEBAQEBAYHBgYGBgYGBwcHBwcHBwcICAgICAgJCQkJCQsLCwsLCwsLCwsBAgICAwMDBQMDBQsIBggLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLC//dAAQAAf/AABEIABAAEAMBIgACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/APz68CaN8Mp/DWveJviDqE0R0qGIwWsGEaR532J83uwwABXH+MtP8N6Hryad4cvJrm3lgjlX7WES4R2zujcIAvy8YIHQ+1eYeKdAu9VtTNpUvk3aAeWSxCblOVJA4O08jIrR0/R1txDc37m4u0QK8p7tjkgdBmv2zD4apGvUq1KjcXtHTTRWP0nEUqzxcatKbUEkuWy5fN3+Lmvt0tp2t//Z"
        }'
```

One of the important characteristics of blobs is they natively support asynchronous streaming of data. This is important for both creation and retrieval of large data. When we create a blob with `createBlob`, the returned blob will create the storage entry, but the data will be streamed to storage. This means that you can create a blob from a buffer or from a stream. You can also create a record that references a blob before the blob is fully written to storage. For example, you can create a blob from a stream:

```javascript
let blob = createBlob(stream);
// at this point the blob exists, but the data is still being written to storage
await MyTable.put({ id: 'my-record', data: blob });
// we now have written a record that references the blob
let record = await MyTable.get('my-record');
// we now have a record that gives us access to the blob. We can asynchronously access the blob's data or stream the data, and it will be available as blob the stream is written to the blob.
let stream = record.data.stream();
```

This can be powerful functionality for large media content, where content can be streamed into storage as it streamed out in real-time to users as it is received, or even for web content where low latency transmission of data from origin is critical. However, this also means that blobs are _not_ atomic or [ACID](https://en.wikipedia.org/wiki/ACID) compliant; streaming functionality achieves the opposite behavior of ACID/atomic writes that would prevent access to data as it is being written, and wait until data is fully available before a commit. Alternately, we can also use the `saveBeforeCommit` flag to indicate that the blob should be fully written to storage before committing a transaction to ensure that the whole blob is available before the transaction commits and writes the record:

```javascript
let blob = createBlob(stream, { saveBeforeCommit: true });
// this put will not commit and resolve until the blob is written and then the record is written
await MyTable.put({ id: 'my-record', data: blob });
```

Note that using `saveBeforeCommit` does not necessarily guarantee full ACID compliance. This can be combined with the `flush` flag to provide a stronger guarantee that a blob is flushed to disk before commiting a transaction. However, the error handling below provides a stronger guarantee of proper blob handling when the process of streaming/writing a blob is interrupted and using proper error handling is recommended, instead of relying `saveBeforeCommit`, for the best combination reliability and performance.

### Error Handling

Because blobs can be streamed and referenced prior to their completion, there is a chance that an error or interruption could occur while streaming data to the blob (after the record is committed). We can create an error handler for the blob to handle the case of an interrupted blob:

```javascript
export class MyEndpoint extends MyTable {
	async get(target) {
		const record = super.get(target);
		let blob = record.data;
		blob.on('error', () => {
			// if this was a caching table, we may want to invalidate or delete this record:
			MyTable.invalidate(target);
			// we may want to re-retrieve the blob
		});
		return {
			status: 200,
			headers: {},
			body: blob
		});
	}
}
```

### Blob `size`

Blobs that are created from streams may not have the standard `size` property available, because the size may not be known while data is being streamed. Consequently, the `size` property may be undefined until the size is determined. You can listen for the `size` event to be notified when the size is available:

```javascript
let record = await MyTable.get('my-record');
let blob = record.data;
blob.size; // will be available if it was saved with a known size
let stream = blob.stream(); // start streaming the data
if (blob.size === undefined) {
	blob.on('size', (size) => {
		// will be called once the size is available
	});
}
```

### Blob Coercion

When a field is defined to use the `Blob` type, any strings or buffers that are assigned to that field in a `put`, `patch`, or `publish`, will automatically be coerced to a `Blob`. This makes it easy to use a `Blob` type even with JSON data that may come HTTP request bodies or MQTT messages, that do not natively support a `Blob` type.

See the [configuration](../deployments/configuration) documentation for more information on configuring where blob are stored.
