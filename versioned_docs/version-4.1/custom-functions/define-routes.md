---
title: Define Routes
---

# Define Routes

HarperDB’s Custom Functions is built on top of [Fastify](https://www.fastify.io/), so our route definitions follow their specifications. Below is a very simple example of a route declaration.

Route URLs are resolved in the following manner:

- [**Instance URL**]:[**Custom Functions Port**]/[**Project Name**]/[**Route URL**]

- The route below, within the **dogs** project, with a route of **breeds** would be available at **[http://localhost:9926/dogs/breeds](http://localhost:9926/dogs/breeds)**.

In effect, this route is just a pass-through to HarperDB. The same result could have been achieved by hitting the core HarperDB API, since it uses **hdbCore.preValidation** and **hdbCore.request**, which are defined in the "helper methods" section, below.

```javascript
module.exports = async (server, { hdbCore, logger }) => {
	server.route({
		url: '/',
		method: 'POST',
		preValidation: hdbCore.preValidation,
		handler: hdbCore.request,
	});
};
```

## Custom Handlers

For endpoints where you want to execute multiple operations against HarperDB, or perform additional processing (like an ML classification, or an aggregation, or a call to a 3rd party API), you can define your own logic in the handler. The function below will execute a query against the dogs table, and filter the results to only return those dogs over 4 years in age.

**IMPORTANT: This route has NO preValidation and uses hdbCore.requestWithoutAuthentication, which- as the name implies- bypasses all user authentication. See the security concerns and mitigations in the "helper methods" section, below.**

```javascript
module.exports = async (server, { hdbCore, logger }) => {
    server.route({
        url: '/:id',
        method: 'GET',
        handler: (request) => {
            request.body= {
                operation: 'sql',
                sql: `SELECT * FROM dev.dog WHERE id = ${request.params.id}`
            };

          const result = await hdbCore.requestWithoutAuthentication(request);
          return result.filter((dog) => dog.age > 4);
        }
    });
}
```

## Custom preValidation Hooks

The simple example above was just a pass-through to HarperDB- the exact same result could have been achieved by hitting the core HarperDB API. But for many applications, you may want to authenticate the user using custom logic you write, or by conferring with a 3rd party service. Custom preValidation hooks let you do just that.

Below is an example of a route that uses a custom validation hook:

```javascript
const customValidation = require('../helpers/customValidation');

module.exports = async (server, { hdbCore, logger }) => {
	server.route({
		url: '/:id',
		method: 'GET',
		preValidation: (request) => customValidation(request, logger),
		handler: (request) => {
			request.body = {
				operation: 'sql',
				sql: `SELECT * FROM dev.dog WHERE id = ${request.params.id}`,
			};

			return hdbCore.requestWithoutAuthentication(request);
		},
	});
};
```

Notice we imported customValidation from the **helpers** directory. To include a helper, and to see the actual code within customValidation, see [Define Helpers](./define-helpers).

## Helper Methods

When declaring routes, you are given access to 2 helper methods: hdbCore and logger.

**hdbCore**

hdbCore contains three functions that allow you to authenticate an inbound request, and execute operations against HarperDB directly, by passing the standard Operations API.

- **preValidation**

  This takes the authorization header from the inbound request and executes the same authentication as the standard HarperDB Operations API. It will determine if the user exists, and if they are allowed to perform this operation. **If you use the request method, you have to use preValidation to get the authenticated user**.

- **request**

  This will execute a request with HarperDB using the operations API. The `request.body` should contain a standard HarperDB operation and must also include the `hdb_user` property that was in `request.body` provided in the callback.

- **requestWithoutAuthentication**

  Executes a request against HarperDB without any security checks around whether the inbound user is allowed to make this request. For security purposes, you should always take the following precautions when using this method:
  - Properly handle user-submitted values, including url params. User-submitted values should only be used for `search_value` and for defining values in records. Special care should be taken to properly escape any values if user-submitted values are used for SQL.

**logger**

This helper allows you to write directly to the Custom Functions log file, custom_functions.log. It’s useful for debugging during development, although you may also use the console logger. There are 5 functions contained within logger, each of which pertains to a different **logging.level** configuration in your harperdb-config.yaml file.

- logger.trace(‘Starting the handler for /dogs’)

- logger.debug(‘This should only fire once’)

- logger.warn(‘This should never ever fire’)

- logger.error(‘This did not go well’)

- logger.fatal(‘This did not go very well at all’)
