---
title: Component Reference
---

# Component Reference

The technical definition of a Harper component is fairly loose. In the absolute, simplest form, a component is any JavaScript module that is compatible with the [default component configuration](#default-component-configuration). For example, a module with a singular `resources.js` file is technically a valid component.

Harper provides many features as _built-in components_, these can be used directly without installing any other dependencies.

Other features are provided by _custom components_. These can be npm packages such as [@harperdb/nextjs](https://github.com/HarperDB/nextjs) and [@harperdb/apollo](https://github.com/HarperDB/apollo) (which are maintained by Harper), or something maintained by the community. Custom components follow the same configuration rules and use the same APIs that Harper's built-in components do. The only difference is that they must be apart of the component's dependencies.

> Documentation is available for all [built-in](./built-in) and [custom](./#custom-components) Harper components.

<!-- TODO: add a callout to a list of third-party components here. Maybe also a link to something like an awesome-harper for community things? -->

## Component Configuration

Harper components are configured with a `config.yaml` file located in the root of the component module directory. This file is how a component configures other components it depends on. Each entry in the file starts with a component name, and then configuration values are indented below it.

```yaml
name:
  option-1: value
  option-2: value
```

It is the entry's `name` that is used for component resolution. It can be one of the [built-in components](./built-in), or it must match a package dependency of the component as specified by `package.json`. The [Custom Component Configuration](#custom-component-configuration) section provides more details and examples.

For some built-in components they can be configured with as little as a top-level boolean; for example, the [rest](./built-in#rest) extension can be enabled with just:

```yaml
rest: true
```

Other components (built-in or custom), will generally have more configuration options. Some options are ubiquitous to the Harper platform, such as the `files`, `path`, and `root` options for a [Resource Extension](#resource-extension-configuration), or `package` for a [custom component](#custom-component-configuration). Additionally, [custom options](#protocol-extension-configuration) can be defined for [Protocol Extensions](#protocol-extension).

### Custom Component Configuration

Any custom component **must** be configured with the `package` option in order for Harper to load that component. When enabled, the name of package must match a dependency of the component. For example, to use the `@harperdb/nextjs` extension, it must first be included in `package.json`:

```json
{
	"dependencies": {
		"@harperdb/nextjs": "^1.0.0"
	}
}
```

Then, within `config.yaml` it can be enabled and configured using:

```yaml
'@harperdb/nextjs':
  package: '@harperdb/nextjs'
  # ...
```

Since npm allows for a [variety of dependency configurations](https://docs.npmjs.com/cli/configuring-npm/package-json#dependencies), this can be used to create custom references. For example, to depend on a specific GitHub branch, first update the `package.json`:

```json
{
	"dependencies": {
		"harper-nextjs-test-feature": "HarperDB/nextjs#test-feature"
	}
}
```

And now in `config.yaml`:

```yaml
harper-nextjs-test-feature:
  package: '@harperdb/nextjs'
  files: '/*'
  # ...
```

### Default Component Configuration

Harper components do not need to specify a `config.yaml`. Harper uses the following default configuration to load components.

```yaml
rest: true
graphql: true
graphqlSchema:
  files: '*.graphql'
roles:
  files: 'roles.yaml'
jsResource:
  files: 'resources.js'
fastifyRoutes:
  files: 'routes/*.js'
  path: '.'
static:
  files: 'web/**'
```

Refer to the [built-in components](./built-in) documentation for more information on these fields.

If a `config.yaml` is defined, it will **not** be merged with the default config.

## Extensions

A Harper Extension is a extensible component that is intended to be used by other components. The built-in components [graphqlSchema](./built-in#graphqlschema) and [jsResource](./built-in#jsresource) are both examples of extensions.

There are two key types of Harper Extensions: **Resource Extension** and **Protocol Extensions**. The key difference is a **Protocol Extensions** can return a **Resource Extension**.

Functionally, what makes an extension a component is the contents of `config.yaml`. Unlike the Application Template referenced earlier, which specified multiple components within the `config.yaml`, an extension will specify an `extensionModule` option.

- `extensionModule` - `string` - _required_ - A path to the extension module source code. The path must resolve from the root of the extension module directory.

For example, the [Harper Next.js Extension](https://github.com/HarperDB/nextjs) `config.yaml` specifies `extensionModule: ./extension.js`.

If the extension is being written in something other than JavaScript (such as TypeScript), ensure that the path resolves to the built version, (i.e. `extensionModule: ./dist/index.js`)

It is also recommended that all extensions have a `package.json` that specifies JavaScript package metadata such as name, version, type, etc. Since extensions are just JavaScript packages, they can do anything a JavaScript package can normally do. It can be written in TypeScript, and compiled to JavaScript. It can export an executable (using the [bin](https://docs.npmjs.com/cli/configuring-npm/package-json#bin) property). It can be published to npm. The possibilities are endless!

Furthermore, what defines an extension separately from a component is that it leverages any of the [Resource Extension](#resource-extension-api) or [Protocol Extension](#protocol-extension-api) APIs. The key is in the name, **extensions are extensible**.

### Resource Extension

A Resource Extension is for processing a certain type of file or directory. For example, the built-in [jsResource](./built-in#jsresource) extension handles executing JavaScript files.

Resource Extensions are comprised of four distinct function exports, [`handleFile()`](#handlefilecontents-urlpath-path-resources-void--promisevoid), [`handleDirectory()`](#handledirectoryurlpath-path-resources-boolean--void--promiseboolean--void), [`setupFile()`](#setupfilecontents-urlpath-path-resources-void--promisevoid), and [`setupDirectory()`](#setupdirectoryurlpath-path-resources-boolean--void--promiseboolean--void). The `handleFile()` and `handleDirectory()` methods are executed on **all worker threads**, and are _executed again during restarts_. The `setupFile()` and `setupDirectory()` methods are only executed **once** on the **main thread** during the initial system start sequence.

> Keep in mind that the CLI command `harperdb restart` or CLI argument `restart=true` only restarts the worker threads. If a component is deployed using `harperdb deploy`, the code within the `setupFile()` and `setupDirectory()` methods will not be executed until the system is completely shutdown and turned back on.

Other than their execution behavior, the `handleFile()` and `setupFile()` methods, and `handleDirectory()` and `setupDirectory()` methods have identical function definitions (arguments and return value behavior).

#### Resource Extension Configuration

Any [Resource Extension](#resource-extension) can be configured with the `files`, `path`, and `root` options. These options control how _files_ and _directories_ are resolved in order to be passed to the extension's `handleFile()`, `setupFile()`, `handleDirectory()`, and `setupDirectory()` methods.

- `files` - `string` - _required_ - Specifies the set of files and directories that should be handled by the component. Can be a glob pattern.
- `path` - `string` - _optional_ - Specifies the URL path to be handled by the component.
- `root` - `string` - _optional_ - Specifies the root directory for mapping file paths to the URLs.

For example, to configure the [static](./built-in#static) component to server all files from `web` to the root URL path:

```yaml
static:
  files: 'web/**'
  root: 'web'
```

Or, to configure the [graphqlSchema](./built-in#graphqlschema) component to load all schemas within the `src/schema` directory:

```yaml
graphqlSchema:
  files: 'src/schema/*.schema'
```

#### Resource Extension API

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

##### `handleFile(contents, urlPath, path, resources): void | Promise<void>`

##### `setupFile(contents, urlPath, path, resources): void | Promise<void>`

These methods are for processing individual files. They can be async.

> Remember!
>
> `setupFile()` is executed **once** on the **main thread** during the main start sequence.
>
> `handleFile()` is executed on **worker threads** and is executed again during restarts.

Parameters:

- `contents` - `Buffer` - The contents of the file
- `urlPath` - `string` - The recommended URL path of the file
- `path` - `string` - The relative path of the file
  <!-- TODO: Replace the Object type here with a more specific type representing the resources argument of loadComponent() -->
- `resources` - `Object` - A collection of the currently loaded resources

Returns: `void | Promise<void>`

##### `handleDirectory(urlPath, path, resources): boolean | void | Promise<boolean | void>`

##### `setupDirectory(urlPath, path, resources): boolean | void | Promise<boolean | void>`

These methods are for processing directories. They can be async.

If the function returns or resolves a truthy value, then the component loading sequence will end and no other entries within the directory will be processed.

> Remember!
>
> `setupFile()` is executed **once** on the **main thread** during the main start sequence.
>
> `handleFile()` is executed on **worker threads** and is executed again during restarts.

Parameters:

- `urlPath` - `string` - The recommended URL path of the file
- `path` - `string` - The relative path of the directory
  <!-- TODO: Replace the Object type here with a more specific type representing the resources argument of loadComponent() -->
- `resources` - `Object` - A collection of the currently loaded resources

Returns: `boolean | void | Promise<boolean | void>`

### Protocol Extension

A Protocol Extension is a more advanced form of a Resource Extension and is mainly used for implementing higher level protocols. For example, the [Harper Next.js Extension](https://github.com/HarperDB/nextjs) handles building and running a Next.js project. A Protocol Extension is particularly useful for adding custom networking handlers (see the [`server`](../../reference/globals#server) global API documentation for more information).

#### Protocol Extension Configuration

In addition to the `files`, `path`, and `root` [Resource Extension configuration](#resource-extension-configuration) options, and the `package` [Custom Component configuration](#custom-component-configuration) option, Protocol Extensions can also specify additional configuration options. Any options added to the extension configuration (in `config.yaml`), will be passed through to the `options` object of the `start()` and `startOnMainThread()` methods.

For example, the [Harper Next.js Extension](https://github.com/HarperDB/nextjs#options) specifies multiple option that can be included in its configuration. For example, a Next.js app using `@harperdb/nextjs` may specify the following `config.yaml`:

```yaml
'@harperdb/nextjs':
  package: '@harperdb/nextjs'
  files: '/*'
  prebuilt: true
  dev: false
```

Many protocol extensions will use the `port` and `securePort` options for configuring networking handlers. Many of the [`server`](../../reference/globals#server) global APIs accept `port` and `securePort` options, so components replicated this for simpler pass-through.

#### Protocol Extension API

A Protocol Extension is made up of two distinct methods, [`start()`](#startoptions-resourceextension--promiseresourceextension) and [`startOnMainThread()`](#startonmainthreadoptions-resourceextension--promiseresourceextension). Similar to a Resource Extension, the `start()` method is executed on _all worker threads_, and _executed again on restarts_. The `startOnMainThread()` method is **only** executed **once** during the initial system start sequence. These methods have identical `options` object parameter, and can both return a Resource Extension (i.e. an object containing one or more of the methods listed above).

##### `start(options): ResourceExtension | Promise<ResourceExtension>`

##### `startOnMainThread(options): ResourceExtension | Promise<ResourceExtension>`

Parameters:

- `options` - `Object` - An object representation of the extension's configuration options.

Returns: `Object` - An object that implements any of the [Resource Extension APIs](#resource-extension-api)
