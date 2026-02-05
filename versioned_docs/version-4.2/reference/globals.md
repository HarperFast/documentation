---
title: Globals
---

# Globals

The primary way that JavaScript code can interact with HarperDB is through the global variables, which has several objects and classes that provide access to the tables, server hooks, and resources that HarperDB provides for building applications. As global variables, these can be directly accessed in any module.

These global variables are also available through the `harperdb` module/package, which can provide better typing in TypeScript. To use this with your own directory, make sure you link the package to your current `harperdb` installation:

```bash
npm link harperdb
```

The `harperdb` package is automatically linked for all installed components. Once linked, if you are using EcmaScript module syntax you can import function from `harperdb` like:

```javascript
import { tables, Resource } from 'harperdb';
```

Or if you are using CommonJS format for your modules:

```javascript
const { tables, Resource } = require('harperdb');
```

The global variables include:

### `tables`

This is an object that holds all the tables for the default database (called `data`) as properties. Each of these property values is a table class that subclasses the Resource interface and provides access to the table through the Resource interface. For example, you can get a record from a table (in the default database) called 'my-table' with:

```javascript
import { tables } from 'harperdb';
const { MyTable } = tables;
async function getRecord() {
	let record = await MyTable.get(recordId);
}
```

It is recommended that you [define a schema](../getting-started/) for all the tables that are required to exist in your application. This will ensure that the tables exist on the `tables` object. Also note that the property names follow a CamelCase convention for use in JavaScript and in the GraphQL Schemas, but these are translated to snake_case for the actual table names, and converted back to CamelCase when added to the `tables` object.

### `databases`

This is an object that holds all the databases in HarperDB, and can be used to explicitly access a table by database name. Each database will be a property on this object, each of these property values will be an object with the set of all tables in that database. The default database, `databases.data` should equal the `tables` export. For example, if you want to access the "dog" table in the "dev" database, you could do so:

```javascript
import { databases } from 'harperdb';
const { Dog } = databases.dev;
```

### `Resource`

This is the base class for all resources, including tables and external data sources. This is provided so that you can extend it to implement custom data source providers. See the [Resource API documentation](resource) for more details about implementing a Resource class.

### `auth(username, password?): Promise<User>`

This returns the user object with permissions/authorization information based on the provided username. If a password is provided, the password will be verified before returning the user object (if the password is incorrect, an error will be thrown).

### `logger`

This provides methods `trace`, `debug`, `info`, `warn`, `error`, `fatal`, and `notify` for logging. See the [logging documentation](../administration/logging/standard-logging) for more information.

### `server`

This provides a number of functions and objects to interact with the server including:

#### `server.config`

This provides access to the HarperDB configuration object. This comes from the [harperdb-config.yaml](../deployments/configuration) (parsed into object form).

#### `server.recordAnalytics(value, metric, path?, method?, type?)`

This records the provided value as a metric into HarperDB's analytics. HarperDB efficiently records and tracks these metrics and makes them available through [analytics API](./analytics). The values are aggregated and statistical information is computed when many operations are performed. The optional parameters can be used to group statistics. For the parameters, make sure you are not grouping on too fine of a level for useful aggregation. The parameters are:

- `value` - This is a numeric value for the metric that is being recorded. This can be a value measuring time or bytes, for example.
- `metric` - This is the name of the metric.
- `path` - This is an optional path (like a URL path). For a URL like /my-resource/, you would typically include a path of "my-resource", not including the id so you can group by all the requests to "my-resource" instead of individually aggregating by each individual id.
- `method` - Optional method to group by.
- `type` - Optional type to group by.
