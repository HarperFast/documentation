---
title: Basic Authentication
---

# Basic Authentication

HarperDB uses Basic Auth and JSON Web Tokens (JWTs) to secure our HTTP requests. In the context of an HTTP transaction, **basic access authentication** is a method for an HTTP user agent to provide a username and password when making a request.

** \_**You do not need to log in separately. Basic Auth is added to each HTTP request like create_database, create_table, insert etc… via headers.**\_ **

A header is added to each HTTP request. The header key is `Authorization` the header value is `Basic <<your username and password buffer token>>`.

## Authentication in HarperDB Studio

In the below code sample, you can see where we add the authorization header to the request. This needs to be added for each and every HTTP request for HarperDB.

_Note: This function uses btoa. Learn about_ [_btoa here_](https://developer.mozilla.org/en-US/docs/Web/API/btoa)_._

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
