---
title: JavaScript Environment
---

<!-- Source: versioned_docs/version-4.7/reference/globals.md (primary) -->

# JavaScript Environment

Harper executes component JavaScript in distinct module caches, using Node.js's VM module loader. This provides contextualized module environments that share the same Node.js runtime but have their own set of modules isolated from other applications. This means each application runs in its own module context while still being able to access Harper's full set of APIs.

## Module Loading

Harper supports both ESM and CommonJS module formats. The full set of Harper APIs are accessible by importing from the `harper` package, for example::

```javascript
import { tables, Resource } from 'harper';
```

```javascript
const { tables, Resource } = require('harper');
```

The Harper APIs are also available as global variables. This can be a quick and easy way to use the APIs and is preserved for backward compatibility, but is not the recommended approach. There are also some APIs that are not fully functional as globals.

For components in their own directory, link the package to your local `harper` installation to ensure any typings use the current/correction version of Harper:

```bash
npm link harper
```

All installed components have `harper` automatically linked.

Whether you reach them as globals or as `harper` imports, `tables`, `databases`, and the other APIs are the **same live, process-wide objects** — Harper runs as a single process, so a record written through one component is immediately visible to every other. The automatic link points `harper` at the **running** installation (not a separately-installed copy), so `import { tables } from 'harper'` resolves to that live runtime from any module Harper loads. Application module contexts are seeded from the same process globals, not given an isolated set of these objects.

This includes bundler-built code. A Vite **server-side-render** entry, for example, can read data straight from Harper and render it into the HTML (no client-side fetch):

```typescript
import { tables } from 'harper';

export async function render(url: string): Promise<string> {
	const product = await tables.Product.get(idFromUrl(url));
	return renderToString(/* <App product={product} /> */);
}
```

When bundling for SSR, keep `harper` external so it resolves to the runtime instead of being bundled (symlinked dependencies are not reliably auto-externalized) — e.g. `ssr: { external: ['harper'] }` in `vite.config`.

## TypeScript Support

Harper runs `.ts` files directly via Node.js's built-in [type stripping](https://nodejs.org/api/typescript.html#type-stripping). No build step or transpiler is required.

Requirements and conventions:

- **Node.js 22.6 or later.** Type stripping is unavailable on earlier versions.
- **Use the `.ts` extension on the source files** referenced from `config.yaml`. The `jsResource` plugin loads `.js` and `.ts` files; point its `files` glob at the `.ts` files you want loaded:
  ```yaml
  jsResource:
    files: 'resources/*.ts'
  ```
- **Use explicit `.ts` extensions in imports** between local modules. Node's loader does not resolve `'./helper'` to `'./helper.ts'`:
  ```typescript
  import { helper } from './helper.ts';
  ```
- **Only type-stripping is performed.** Enum values, namespaces with runtime semantics, and other features that require code transformation are not supported — declarations and type annotations are simply removed.

Type imports from the `harper` package work as usual:

```typescript
import { type RequestTargetOrId, Resource, tables } from 'harper';

export class MyResource extends Resource {
	async get(target?: RequestTargetOrId): Promise<{ message: string }> {
		return { message: 'Hello from TS' };
	}
}
```

## Harper API

The following objects and functions are available as exports from the `harper` package (and also available as global variables).

### `tables`

An object whose properties are the tables in the default database (`data`). Each table defined in `schema.graphql` is accessible as a property and implements the Resource API.

See [Database API](../database/api.md) for full reference.

### `databases`

An object containing all databases defined in Harper. Each database is an object of its tables — `databases.data` is always equivalent to `tables`.

See [Database API](../database/api.md) for full reference.

### `transaction(fn)` {#transaction}

Executes a function inside a database transaction. Changes made within the function are committed atomically, or rolled back if an error is thrown.

See [Transactions](../database/transaction.md) for full reference.

### `createBlob(data, options?)`

<VersionBadge version="v4.5.0" />

Creates a [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) backed by Harper's storage engine. Use it to store large binary content (images, audio, video, etc.) in `Blob`-typed schema fields.

See [Database API](../database/api.md) for full reference.

### `Resource`

The base class for all Harper resources, including tables and custom data sources. Extend `Resource` to implement custom data providers.

See [Resource API](../resources/resource-api.md) for full reference.

### `server`

Provides access to Harper's HTTP server middleware chain, WebSocket server, authentication helpers, resource registry, and cluster information. Also exposes `server.contentTypes` as an alias for the `contentTypes` global.

See [HTTP API](../http/api.md) for full reference.

### `contentTypes`

A `Map` of MIME type strings to content type handler objects. Harper uses this map for content negotiation — deserializing incoming request bodies and serializing outgoing responses. You can register custom handlers to support additional formats.

See [HTTP API](../http/api.md) for full reference.

### `logger`

Provides structured logging methods (`trace`, `debug`, `info`, `warn`, `error`, `fatal`, `notify`) that write to Harper's log file. Note that using the global variable may not provide full application tagging and configurability.

See [Logging API](../logging/api.md) for full reference.

### `resources`

A `Map` of all resources registered on this Harper server, keyed by their URL path. Each entry contains the resource class, path, and routing metadata. Use this to look up or enumerate registered resources programmatically.

### `secrets`

A read-only, name→value map of the scoped secrets granted to the current component (plus any `process.env`-resolved values it declared). Read secrets from the encrypted [secrets store](../security/secrets.md) without them landing in `process.env`:

```javascript
import { secrets } from 'harper';

const { STRIPE_KEY } = secrets;
```

A module-top-level destructure is the recommended idiom — it binds correctly under every component loader. See [Secrets](../security/secrets.md) for full reference.

### `config`

The configuration object for the current application, as provided by the component's configuration (e.g. `config.yaml`). Defaults to an empty object if no configuration is provided.

### `RequestTarget`

A class (extending `URLSearchParams`) that represents a parsed resource request — including the target record ID, query conditions, pagination (`limit`/`offset`), sort order, selected attributes, and caching directives. Use `RequestTarget` to construct typed resource requests when calling resource methods directly:

```javascript
import { tables, RequestTarget } from 'harper';

const target = new RequestTarget('/my-record-id?limit=10');
const results = await tables.myTable.search(target);
```

### `getContext()`

Returns the current async context object for the active request. The context holds request-scoped state including the active transaction, user, response, and timestamp. Returns an empty object if called outside of a request context.

```javascript
import { getContext } from 'harper';

const ctx = getContext();
console.log(ctx.user, ctx.transaction);
```

### `getUser()`

Returns the authenticated user from the current async request context, or `undefined` if called outside a request or the request is unauthenticated. Equivalent to `getContext().user`.

```javascript
import { getUser } from 'harper';

export class MyResource extends Resource {
	async get(id) {
		const user = getUser();
		if (!user) throw new Error('Unauthorized');
		// ...
	}
}
```

### `getResponse()`

Returns the outgoing `Response` object for the current request, or `undefined` if called outside a request context. Use this to set response headers or inspect the response mid-handler. Equivalent to `getContext().response`.

### Current Working Directory

Harper has a multi-threaded server architecture and uses the harper data root path as the current working directory. Components should not and cannot change the current working directory, and must not use `process.chdir()` or any package that does.

## Child Processes

Harper substitutes its own `child_process` module into components that need to launch a helper binary or a sidecar process. The substitute adds two things on top of Node's API: an allowlist, and a node-wide single-process lock keyed by a name you supply.

```javascript
import { spawn } from 'node:child_process';

const agent = spawn('datadog-agent', ['run'], {
	name: 'datadog-agent',
	version: 3,
});
```

### Which imports get the substitute

The substitution happens in Harper's module loader, so it only reaches code that loader handles:

| How the module is reached                                                                                                                                                       | What you get                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| ESM `import` from component source (`applications.moduleLoader: vm`, the default, or `compartment`)                                                                             | Harper's constrained module |
| CommonJS `require('node:child_process')`                                                                                                                                        | Node's unmodified module    |
| Any import under `applications.moduleLoader: native`                                                                                                                            | Node's unmodified module    |
| A dependency loaded by the native loader — the default `applications.dependencyLoader: auto` uses the native loader for any package that does not list `harper` as a dependency | Node's unmodified module    |

A supervisor factored into an npm package that does not depend on `harper` therefore receives the real `child_process`: no allowlist, no lock, and one child per worker thread rather than one per node. Keep process-spawning code in component source (or in a package that depends on `harper`), and if the substitution is load-bearing for your component, probe for it at startup rather than assuming it.

### Allowlist

Every call is checked against [`applications.allowedSpawnCommands`](../configuration/options.md#applications) before anything else:

- The check is an exact match on the first space-separated token of `command`. `'node'` matches an allowlisted `node`; `'/usr/local/bin/node'` does not, and a path containing a space can never match.
- The list is read once at startup. Changing it requires a restart.
- `exec`, `execFile`, and `spawn` are all subject to it. `fork` is exempt, because it launches Node itself.
- `execSync` always throws — Harper does not permit synchronous spawning.

### One process per node: the `name` option

Harper runs a pool of worker threads, and component code runs on each of them. Without coordination, a component that spawns a sidecar would start one per thread. Harper prevents that with a PID-file lock, which is why `name` is mandatory:

- **`name` (string, required).** Spawning without it throws. It is also the lock filename, so it must be unique per logical process within the node.
- The lock file is `<rootPath>/pids/<name>.pid`. Line 1 is the child's PID; line 2, when `version` was passed, is the version.
- Exactly one caller wins the lock and spawns a real child process. Every other caller — other threads, and later calls with the same name — receives an `ExistingProcessWrapper` for the already-running process.
- When the real child exits, the thread that spawned it removes the PID file, so the next spawn call starts a fresh process.

### Replacing a running process: the `version` option

<VersionBadge version="v5.0.2" />

`version` lets a component replace a process it started earlier — after an upgrade, for example — instead of adopting it.

- **`version` must be an integer.** Line 2 of the PID file is parsed with `parseInt`, and the comparison is a strict `!==` against the value you pass. A string `'3'` never equals the parsed `3`, so every call kills the running child and respawns it, forever. There is no validation of this; pass a number.
- The comparison is equality, not ordering: a version lower than the recorded one also triggers replacement.
- On a mismatch Harper signals the running process (`SIGTERM`), removes the PID file, and re-acquires the lock so the new version spawns.
- Omitting `version` means "adopt whatever is running under this name".

### What `spawn` returns

The lock winner gets a real [`ChildProcess`](https://nodejs.org/api/child_process.html#class-childprocess). Everyone else gets an `ExistingProcessWrapper`, which is deliberately narrow:

| Member          | Notes                                                       |
| --------------- | ----------------------------------------------------------- |
| `pid`           | PID of the process that is actually running                 |
| `kill(signal?)` | Signals that process; returns `false` if it is already gone |
| `unref()`       | Stops the liveness poll — see below                         |
| `'exit'` event  | Emitted with `(null, null)` once the process is gone        |

It does **not** have `stdout`, `stderr`, `stdin`, or `spawnargs`. Code that reaches for them throws a `TypeError` on exactly the threads that lost the race, which is most of them — so a component that reads the child's output must do so only on the thread that owns the real `ChildProcess`. `spawnargs` is the practical way to tell the two apart:

```javascript
const child = spawn('datadog-agent', ['run'], { name: 'datadog-agent', version: 3 });

if (child.spawnargs) {
	child.stdout.on('data', (chunk) => logger.info(chunk.toString()));
} else {
	child.unref(); // adopted an existing process; release the liveness timer
}
```

The wrapper polls the process once a second with a `setInterval` that Harper does not unref, so a thread that never calls `unref()` keeps its event loop alive and delays shutdown. Call `unref()` on any wrapper you do not intend to watch.
