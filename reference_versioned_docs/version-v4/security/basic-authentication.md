<!-- Source: versioned_docs/version-4.7/developers/security/basic-auth.md (primary) -->

---
id: basic-authentication
title: Basic Authentication
---

# Basic Authentication

Available since: v4.1.0

Harper supports HTTP Basic Authentication. In the context of an HTTP transaction, basic access authentication is a method for an HTTP user agent to provide a username and password when making a request.

**Basic Auth is added to each HTTP request — you do not log in separately.** The `Authorization` header must be included on every request.

## How It Works

The `Authorization` header value is `Basic <credentials>`, where `<credentials>` is the Base64 encoding of the string `username:password`.

```
Authorization: Basic <base64(username:password)>
```

## Example

The following Node.js example shows how to construct the Authorization header using `btoa()`:

```javascript
function callHarperDB(call_object, operation, callback) {
	const options = {
		method: 'POST',
		hostname: call_object.endpoint_url,
		port: call_object.endpoint_port,
		path: '/',
		headers: {
			'content-type': 'application/json',
			'authorization': 'Basic ' + btoa(call_object.username + ':' + call_object.password),
			'cache-control': 'no-cache',
		},
	};

	const http_req = http.request(options, function (hdb_res) {
		let chunks = [];

		hdb_res.on('data', function (chunk) {
			chunks.push(chunk);
		});

		hdb_res.on('end', function () {
			const body = Buffer.concat(chunks);
			if (isJson(body)) {
				return callback(null, JSON.parse(body));
			} else {
				return callback(body, null);
			}
		});
	});

	http_req.on('error', function (chunk) {
		return callback('Failed to connect', null);
	});

	http_req.write(JSON.stringify(operation));
	http_req.end();
}
```

## cURL Example

```bash
curl --location --request POST 'http://localhost:9925' \
--header 'Content-Type: application/json' \
--header 'Authorization: Basic <base64(username:password)>' \
--data-raw '{
    "operation": "list_users"
}'
```

## When to Use Basic Auth

Basic authentication is the simplest option and is appropriate for:

- Server-to-server requests in trusted environments
- Development and testing
- Scenarios where token management overhead is undesirable

For user-facing applications or when tokens are preferred for performance reasons, see [JWT Authentication](./jwt-authentication.md).

## Security Notes

- Basic Auth credentials are sent on every request. Always use HTTPS in production to prevent credential interception. See [SSL / HTTPS](./ssl.md).
- Harper Studio uses Basic Auth internally.
