---
title: Define Helpers
---

# Define Helpers

Helpers are functions for use within your routes. You may want to use the same helper in multiple route files, so this allows you to write it once, and include it wherever you need it.

- To use your helpers, they must be exported from your helper file. Please use any standard export mechanisms available for your module system. We like ESM, ECMAScript Modules. Our example below exports using `module.exports`.

- You must import the helper module into the file that needs access to the exported functions. With ESM, you'd use a `require` statement. See [this example](./define-routes#custom-prevalidation-hooks) in Define Routes.

Below is code from the customValidation helper that is referenced in [Define Routes](./define-routes). It takes the request and the logger method from the route declaration, and makes a call to an external API to validate the headers using fetch. The API in this example is just returning a list of ToDos, but it could easily be replaced with a call to a real authentication service.

```javascript
const customValidation = async (request, logger) => {
	let response = await fetch('https://jsonplaceholder.typicode.com/todos/1', {
		headers: { authorization: request.headers.authorization },
	});
	let result = await response.json();

	/*
	 *  throw an authentication error based on the response body or statusCode
	 */
	if (result.error) {
		const errorString = result.error || 'Sorry, there was an error authenticating your request';
		logger.error(errorString);
		throw new Error(errorString);
	}
	return request;
};

module.exports = customValidation;
```
