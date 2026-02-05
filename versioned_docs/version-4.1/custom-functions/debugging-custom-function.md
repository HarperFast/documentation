---
title: Debugging a Custom Function
---

# Debugging a Custom Function

HarperDB Custom Functions projects are managed by HarperDB’s process manager. As such, it may seem more difficult to debug Custom Functions than your standard project. The goal of this document is to provide best practices and recommendations for debugging your Custom Function.

For local debugging and development, it is recommended that you use standard console log statements for logging. For production use, you may want to use HarperDB's logging facilities, so you aren't logging to the console. The [HarperDB Custom Functions template](https://github.com/HarperDB/harperdb-custom-functions-template) includes the HarperDB logger module in the primary function parameters with the name `logger`. This logger can be used to output messages directly to the HarperDB log using standardized logging level functions, described below. The log level can be set in the [HarperDB Configuration File](../configuration).

HarperDB Logger Functions

- `trace(message)`: Write a 'trace' level log, if the configured level allows for it.
- `debug(message)`: Write a 'debug' level log, if the configured level allows for it.
- `info(message)`: Write a 'info' level log, if the configured level allows for it.
- `warn(message)`: Write a 'warn' level log, if the configured level allows for it.
- `error(message)`: Write a 'error' level log, if the configured level allows for it.
- `fatal(message)`: Write a 'fatal' level log, if the configured level allows for it.
- `notify(message)`: Write a 'notify' level log.

For debugging purposes, it is recommended to use `notify` as these messages will appear in the log regardless of log level configured.

## Viewing the Log

The HarperDB Log can be found on the [Studio Status page](../harperdb-studio/instance-metrics) or in the local Custom Functions log file, `<HDBROOT>/log/custom_functions.log`. Additionally, you can use the [`read_log` operation](https://api.harperdb.io/#7f718dd1-afa5-49ce-bc0c-564e17b1c9cf) to query the HarperDB log.

### Example 1: Execute Query and Log Results

This example performs a SQL query in HarperDB and logs the result. This example utilizes the `logger.notify` function to log the stringified version of the result. If an error occurs, it will output the error using `logger.error` and return the error.

```javascript
server.route({
	url: '/',
	method: 'GET',
	handler: async (request) => {
		request.body = {
			operation: 'sql',
			sql: 'SELECT * FROM dev.dog ORDER BY dog_name',
		};

		try {
			let result = await hdbCore.requestWithoutAuthentication(request);
			logger.notify(`Query Result: ${JSON.stringify(result)}`);
			return result;
		} catch (e) {
			logger.error(`Query Error: ${e}`);
			return e;
		}
	},
});
```

### Example 2: Execute Multiple Queries and Log Activity

This example performs two SQL queries in HarperDB with logging throughout to describe what is happening. This example utilizes the `logger.notify` function to log the stringified version of the operation and the result of each query. If an error occurs, it will output the error using `logger.error` and return the error.

```javascript
server.route({
	url: '/example',
	method: 'GET',
	handler: async (request) => {
		logger.notify('/example called!');
		const results = [];

		request.body = {
			operation: 'sql',
			sql: 'SELECT * FROM dev.dog WHERE id = 1',
		};
		logger.notify(`Query 1 Operation: ${JSON.stringify(request.body)}`);
		try {
			let result = await hdbCore.requestWithoutAuthentication(request);
			logger.notify(`Query 1: ${JSON.stringify(result)}`);
			results.push(result);
		} catch (e) {
			logger.error(`Query 1: ${e}`);
			return e;
		}

		request.body = {
			operation: 'sql',
			sql: 'SELECT * FROM dev.dog WHERE id = 2',
		};
		logger.notify(`Query 2 Operation: ${JSON.stringify(request.body)}`);
		try {
			let result = await hdbCore.requestWithoutAuthentication(request);
			logger.notify(`Query 2: ${JSON.stringify(result)}`);
			results.push(result);
		} catch (e) {
			logger.error(`Query 2: ${e}`);
			return e;
		}

		logger.notify('/example complete!');
		return results;
	},
});
```
