---
title: Extensions API
---

# Extensions API

> As of Harper v4.6, a new iteration of the extension API was released called **Plugins**. They are simultaneously a simplification and an extensibility upgrade. Plugins are **experimental**, but we encourage developers to consider developing with the [plugin API](./plugins) instead of the extension API. In time we plan to deprecate the concept of extensions in favor of plugins, but for now, both are supported.

There are two key types of Extensions: **Resource Extension** and **Protocol Extensions**. The key difference is a **Protocol Extensions** can return a **Resource Extension**.

Furthermore, what defines an extension separately from a component is that it leverages any of the [Resource Extension](#resource-extension-api) or [Protocol Extension](#protocol-extension-api) APIs.

All extensions must define a `config.yaml` file and declare an `extensionModule` option. This must be a path to the extension module source code. The path must resolve from the root of the module directory.

For example, the [Harper Next.js Extension](https://github.com/HarperDB/nextjs) `config.yaml` specifies `extensionModule: ./extension.js`.

If the plugin is being written in something other than JavaScript (such as TypeScript), ensure that the path resolves to the built version, (i.e. `extensionModule: ./dist/index.js`)

## Resource Extension

A Resource Extension is for processing a certain type of file or directory. For example, the built-in [jsResource](./built-in-extensions#jsresource) extension handles executing JavaScript files.

Resource Extensions are comprised of four distinct function exports, [`handleFile()`](#handlefilecontents-urlpath-absolutepath-resources-void--promisevoid), [`handleDirectory()`](#handledirectoryurlpath-absolutepath-resources-boolean--void--promiseboolean--void), [`setupFile()`](#setupfilecontents-urlpath-absolutepath-resources-void--promisevoid), and [`setupDirectory()`](#setupdirectoryurlpath-absolutepath-resources-boolean--void--promiseboolean--void). The `handleFile()` and `handleDirectory()` methods are executed on **all worker threads**, and are _executed again during restarts_. The `setupFile()` and `setupDirectory()` methods are only executed **once** on the **main thread** during the initial system start sequence.

> Keep in mind that the CLI command `harperdb restart` or CLI argument `restart=true` only restarts the worker threads. If a component is deployed using `harperdb deploy`, the code within the `setupFile()` and `setupDirectory()` methods will not be executed until the system is completely shutdown and turned back on.

Other than their execution behavior, the `handleFile()` and `setupFile()` methods, and `handleDirectory()` and `setupDirectory()` methods have identical function definitions (arguments and return value behavior).

### Resource Extension Configuration

Any [Resource Extension](#resource-extension) can be configured with the `files` and `urlPath` options. These options control how _files_ and _directories_ are resolved in order to be passed to the extension's `handleFile()`, `setupFile()`, `handleDirectory()`, and `setupDirectory()` methods.

> Harper relies on the [fast-glob](https://github.com/mrmlnc/fast-glob) library for glob pattern matching.

- `files` - `string | string[] | Object` - _required_ - A [glob pattern](https://github.com/mrmlnc/fast-glob?tab=readme-ov-file#pattern-syntax) string, array of glob pattern strings, or a more expressive glob options object determining the set of files and directories to be resolved for the extension. If specified as an object, the `source` property is required. By default, Harper **matches files and directories**; this is configurable using the `only` option.
  - `source` - `string | string[]` - _required_ - The glob pattern string or array of strings.
  - `only` - `'all' | 'files' | 'directories'` - _optional_ - The glob pattern will match only the specified entry type. Defaults to `'all'`.
  - `ignore` - `string[]` - _optional_ - An array of glob patterns to exclude from matches. This is an alternative way to use negative patterns. Defaults to `[]`.
- `urlPath` - `string` - _optional_ - A base URL path to prepend to the resolved `files` entries.
  - If the value starts with `./`, such as `'./static/'`, the component name will be included in the base url path
  - If the value is `.`, then the component name will be the base url path
  - Note: `..` is an invalid pattern and will result in an error
  - Otherwise, the value here will be base url path. Leading and trailing `/` characters will be handled automatically (`/static/`, `/static`, and `static/` are all equivalent to `static`)

For example, to configure the [static](./built-in-extensions#static) component to serve all HTML files from the `web` source directory on the `static` URL endpoint:

```yaml
static:
  files: 'web/*.html'
  urlPath: 'static'
```

If there are files such as `web/index.html` and `web/blog.html`, they would be available at `localhost/static/index.html` and `localhost/static/blog.html` respectively.

Furthermore, if the component is located in the `test-component` directory, and the `urlPath` was set to `'./static/'` instead, then the files would be served from `localhost/test-component/static/*` instead.

The `urlPath` is optional, for example to configure the [graphqlSchema](./built-in-extensions#graphqlschema) component to load all schemas within the `src/schema` directory, only specifying a `files` glob pattern is required:

```yaml
graphqlSchema:
  files: 'src/schema/*.schema'
```

The `files` option also supports a more complex options object. These additional fields enable finer control of the glob pattern matching.

For example, to match files within `web`, and omit any within the `web/images` directory, the configuration could be:

```yaml
static:
  files:
	source: 'web/**/*'
	ignore: ['web/images']
```

In order to match only files:

```yaml
test-component:
  files:
	source: 'dir/**/*'
	only: 'files'
```

### Resource Extension API

In order for an extension to be classified as a Resource Extension it must implement at least one of the `handleFile()`, `handleDirectory()`, `setupFile()`, or `setupDirectory()` methods. As a standalone extension, these methods should be named and exported directly. For example:

```js
// ESM
export function handleFile() {}
export function setupDirectory() {}

// or CJS
function handleDirectory() {}
function setupFile() {}

module.exports = { handleDirectory, setupFile };
```

When returned by a [Protocol Extension](#protocol-extension), these methods should be defined on the object instead:

```js
export function start() {
	return {
		handleFile() {},
	};
}
```

#### `handleFile(contents, urlPath, absolutePath, resources): void | Promise<void>`

#### `setupFile(contents, urlPath, absolutePath, resources): void | Promise<void>`

These methods are for processing individual files. They can be async.

> Remember!
>
> `setupFile()` is executed **once** on the **main thread** during the main start sequence.
>
> `handleFile()` is executed on **worker threads** and is executed again during restarts.

Parameters:

- `contents` - `Buffer` - The contents of the file
- `urlPath` - `string` - The recommended URL path of the file
- `absolutePath` - `string` - The absolute path of the file
  <!-- TODO: Replace the Object type here with a more specific type representing the resources argument of loadComponent() -->
- `resources` - `Object` - A collection of the currently loaded resources

Returns: `void | Promise<void>`

#### `handleDirectory(urlPath, absolutePath, resources): boolean | void | Promise<boolean | void>`

#### `setupDirectory(urlPath, absolutePath, resources): boolean | void | Promise<boolean | void>`

These methods are for processing directories. They can be async.

If the function returns or resolves a truthy value, then the component loading sequence will end and no other entries within the directory will be processed.

> Remember!
>
> `setupFile()` is executed **once** on the **main thread** during the main start sequence.
>
> `handleFile()` is executed on **worker threads** and is executed again during restarts.

Parameters:

- `urlPath` - `string` - The recommended URL path of the directory
- `absolutePath` - `string` - The absolute path of the directory
  <!-- TODO: Replace the Object type here with a more specific type representing the resources argument of loadComponent() -->
- `resources` - `Object` - A collection of the currently loaded resources

Returns: `boolean | void | Promise<boolean | void>`

## Protocol Extension

A Protocol Extension is a more advanced form of a Resource Extension and is mainly used for implementing higher level protocols. For example, the [Harper Next.js Extension](https://github.com/HarperDB/nextjs) handles building and running a Next.js project. A Protocol Extension is particularly useful for adding custom networking handlers (see the [`server`](../globals#server) global API documentation for more information).

### Protocol Extension Configuration

In addition to the `files` and `urlPath` [Resource Extension configuration](#resource-extension-configuration) options, and the `package` [Custom Component configuration](#custom-component-configuration) option, Protocol Extensions can also specify additional configuration options. Any options added to the extension configuration (in `config.yaml`), will be passed through to the `options` object of the `start()` and `startOnMainThread()` methods.

For example, the [Harper Next.js Extension](https://github.com/HarperDB/nextjs#options) specifies multiple option that can be included in its configuration. For example, a Next.js app using `@harperdb/nextjs` may specify the following `config.yaml`:

```yaml
'@harperdb/nextjs':
  package: '@harperdb/nextjs'
  files: './'
  prebuilt: true
  dev: false
```

Many protocol extensions will use the `port` and `securePort` options for configuring networking handlers. Many of the [`server`](../globals#server) global APIs accept `port` and `securePort` options, so components replicated this for simpler pass-through.

### Protocol Extension API

A Protocol Extension is made up of two distinct methods, [`start()`](#startoptions-resourceextension--promiseresourceextension) and [`startOnMainThread()`](#startonmainthreadoptions-resourceextension--promiseresourceextension). Similar to a Resource Extension, the `start()` method is executed on _all worker threads_, and _executed again on restarts_. The `startOnMainThread()` method is **only** executed **once** during the initial system start sequence. These methods have identical `options` object parameter, and can both return a Resource Extension (i.e. an object containing one or more of the methods listed above).

#### `start(options): ResourceExtension | Promise<ResourceExtension>`

#### `startOnMainThread(options): ResourceExtension | Promise<ResourceExtension>`

Parameters:

- `options` - `Object` - An object representation of the extension's configuration options.

Returns: `Object` - An object that implements any of the [Resource Extension APIs](#resource-extension-api)
