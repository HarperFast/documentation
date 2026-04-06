Harper version 5.0 includes many updates to provide a cleaner, more consistent and secure environment. However, there are some breaking changes, and users should review the migration guide for details on how to update their applications. Note that applications that have race conditions that are prone to timing or rely on undocumented features or bugs are always prone to breakage at any point, including major version upgrades. This document describes the important changes to make for applications correctly built in documented APIs.

## Naming Changes

HarperDB now uses the name Harper, not HarperDB. And this change is reflected in the package name. So Harper should now be launched with:
The open source edition can be run with:
`npm i -g harper`
And the pro edition can be run with:
`npm i -g @harperfast/harper-pro

Application code should import from the `harper` package instead of `harperdb`:

```javascript
import { tables } from 'harper';
```

## Package Installation Install Scripts

By default, Harper now uses the `--ignore-scripts` flag when installing packages to prevent against accidental execution of scripts, which can be a significant security risk. If you are installing applications that require installation scripts to be executed (sometimes necessary for installing additional binaries for execution), use the `allowInstallScripts` option when deploying.

## `Table.get` return value

The return value of `Table.get` has been changed to return a record object instead of an instance of the table class (previously this behavior only occured in classes that had set `static loadAsInstance=false`). This means that the returned object will not have all the table instance methods available. Most functionality is still available through the `Table` class. One notable method that had been commonly used is `wasLoadedFromSource`. Information about whether the request was fulfilled from cache or origin is now available on the request `target` object. For example, if you have existing code like:

```javascript
const record = await Table.get(id);
// old method:
if (record.wasLoadedFromSource()) {
	// record was loaded from origin (not cache)
}
```

You should update this code to:

```javascript
const target = new RequestTarget(); // note that this is passed in if you are overriding the `get` method
target.id = id;
const record = await Table.get(target);
// new way of checking if it was loaded from source:
if (target.loadedFromSource) {
	// record was loaded from origin (not cache)
}
```

The record objects do have `getUpdatedTime` and `getExpiresAt` methods available.

### Frozen Records

The record object is also frozen. This means that you cannot add or remove properties from the record object, and if you want a modified version of the record, you must create or copy a new one. For example if you had code:

```javascript
const record = await Table.get(id);
record.property = 'changed';
```

You would need to change this to:

```javascript
let record = await Table.get(id);
record = { ...record, property: 'changed' };
```

## Transactions and Context

With RocksDB, transactions are now fully supported through the storage engine, providing a consistent ability to read and query data that has been written to the transaction. This does result in behavioral changes if code had previously not expected written data to be visible in queries until after a commit.

Harper v5 now uses asynchronous context tracking to automatically preserve context and the current transaction across calls and asynchronous operations. Context is used to track the current transaction. Previously, transactions were only applied to calls to other tables if they were explicitly included in the arguments. Now context is implicitly and automatically carried to other calls (this was also behavior in v4.x with `static loadAsInstance=false`). Previous code may have omitted context to another table call to exclude it from a transaction. Code should be updated to explicitly commit/finish a transaction to see new visible data or start a new transaction. For example, if you had a function that polled to determine when a record was updated:

```javascript
import { setTimeout as delay } from 'node:timers/promises';
class MyResource {
	static async get(target) {
		// this function is within a transaction, with a consistent snapshot of data that won't change, but previous code could
		// call Table.get without a context, it would not use the current transaction and would instead get the latest data
		while ((await Table.get(target)).status !== 'ready') {
			delay(100);
		}
		return Table.get(target);
	}
}
```

Now the internal `Table.get` will automatically use the current transaction, which will never change and won't receive updated data. So we should explicitly commit the transaction to see the updated data and/or start a new transaction for each get request to see the latest data:

```javascript
import { setTimeout as delay } from 'node:timers/promises';
import { getContext } from 'harper';
class MyResource {
	static async get(target) {
		// this function is still within a transaction, with a consistent snapshot of data that won't change, but we should
		// explicitly commit the transaction to see the updated data
		await getContext().transaction.commit();
		// now we can call Table.get and it will read the latest data.
		// we could also explicitly start a new transaction here for each get:
		while ((await transaction(() => Table.get(target))).status !== 'ready') {
			delay(100);
		}
		return Table.get(target);
	}
}
```

Automatic context tracking can greatly simplify code and automatically handling transactions, but there are subtle shifts in logic and explicitly committing/finishing transactions is important if you are executing code outside the context of a Harper request.

## Spawning new processes (via `node:child_process`)

The ability to spawn new processes is a dangerous pathway for exploitation and security vulnerabilities. Additionally, spawning processes from multiple threads presents unique challenges and hazards. In Harper version 5, spawning new processes (through node's `child_process` module) is more tightly controlled and managed.
First, any `spawn`, `exec`, or `execFile` may only spawn executables or commands that have been registered in the `applications.allowedSpawnCommands` configuration. This provides a much more secure evironment, preventing malicious intrusions.
Second, it is common to attempt to use spawn child processes with the expectations of code that is written to run in a single thread for an indefinite period of time. However, Harper runs multiple threads that may frequently be restarted. When attempting to start/run a supporting process, spawning every time a module loads leads multiplication of processes and orphaned processes. Harper now manages the spawning process to ensure a single process is spawned. To ensure that only a single process is started, the `spawn`, `exec`, etc. functions require a `name` property in the `options` argument, to create a named process that other threads can check and omit starting a new process if one is already started. If you really want to start a separate process from a previously started process, a new `name` must be provided.

## Response Objects

Harper has expanded support for using standard Response-like objects in the API. In particular, if you return an object from a REST method with a `headers` property, this will be used as the response headers.

## VM Module Loader

In Harper version 5, Harper now uses a VM module loader to load modules. This allows Harper to load modules with more controlled access and security, and provide application specific functionality, such as custom/configurable logging for each application. Configuration for the module loading is available in the `applications` section of the configuration, and can be disabled in the VM module loader is causing problems for legacy code.

# Recommend Changes

The migration information above highlights necessary changes to make to existing applications, if they have used any of these patterns or features. However, we also have new recommended best practices for applications. These are not necessary, but can help to ensure that your application is using the best patterns.

- We recommend using the `static` methods on Resources/Tables to implement endpoints. See the Resources API for more information.
- Context does not need to be explicitly passed to every call, and can be accessed through the `getContext` function available as an export from the `harper` package.
