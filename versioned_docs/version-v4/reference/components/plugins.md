---
title: Experimental Plugins
---

# Experimental Plugins

The new, experimental **plugin** API is an iteration of the existing extension system. It simplifies the API by removing the need for multiple methods (`start`, `startOnMainThread`, `handleFile`, `setupFile`, etc.) and instead only requires a single `handleApplication` method. Plugins are designed to be more extensible and easier to use, and they are intended to replace the concept of extensions in the future.

Similar to the existing extension API, a plugin must specify an `pluginModule` option within `config.yaml`. This must be a path to the plugin module source code. The path must resolve from the root of the module directory. For example: `pluginModule: plugin.js`.

If the plugin is being written in something other than JavaScript (such as TypeScript), ensure that the path resolves to the built version, (i.e. `pluginModule: ./dist/index.js`)

It is also recommended that all extensions have a `package.json` that specifies JavaScript package metadata such as name, version, type, etc. Since plugins are just JavaScript packages, they can do anything a JavaScript package can normally do. It can be written in TypeScript, and compiled to JavaScript. It can export an executable (using the [bin](https://docs.npmjs.com/cli/configuring-npm/package-json#bin) property). It can be published to npm. The possibilities are endless!

The key to a plugin is the [`handleApplication()`](#function-handleapplicationscope-scope-void--promisevoid) method. It must be exported by the `pluginModule`, and cannot coexist with any of the other extension methods such as `start`, `handleFile`, etc. The component loader will throw an error if both are defined.

The `handleApplication()` method is executed **sequentially** across all **worker threads** during the component loading sequence. It receives a single, `scope` argument that contains all of the relevant metadata and APIs for interacting with the associated component.

The method can be async and it is awaited by the component loader.

However, it is highly recommended to avoid event-loop-blocking operations within the `handleApplication()` method. See the examples section for best practices on how to use the `scope` argument effectively.

## Configuration

As plugins are meant to be used by applications in order to implement some feature, many plugins provide a variety of configuration options to customize their behavior. Some plugins even require certain configuration options to be set in order to function properly.

As a brief overview, the general configuration options available for plugins are:

- `files` - `string` | `string[]` | [`FilesOptionObject`](#interface-filesoptionobject) - _optional_ - A glob pattern string or array of strings that specifies the files and directories to be handled by the plugin's default `EntryHandler` instance.
- `urlPath` - `string` - _optional_ - A base URL path to prepend to the resolved `files` entries handled by the plugin's default `EntryHandler` instance.
- `timeout` - `number` - _optional_ - The timeout in milliseconds for the plugin's operations. If not specified, the system default is **30 seconds**. Plugins may override the system default themselves, but this configuration option is the highest priority and takes precedence.

### File Entries

Just like extensions, plugins support the `files` and `urlPath` options for file entry matching. The values specified for these options are used for the default `EntryHandler` instance created by the `scope.handleEntry()` method. As the reference documentation details, similar options can be used to create custom `EntryHandler` instances too.

The `files` option can be a glob pattern string, an array of glob pattern strings, or a more expressive glob options object.

- The patterns **cannot** contain `..` or start with `/`.
- The pattern `.` or `./` is transformed into `**/*` automatically.
- Often, it is best to omit a leading `.` or `./` in the glob pattern.

The `urlPath` option is a base URL path that is prepended to the resolved `files` entries.

- It **cannot** contain `..`.
- If it starts with `./` or is just `.`, the name of the plugin will be automatically prepended to it.

Putting this all together, to configure the [static](./built-in-extensions#static) built-in extension to serve files from the `web` directory but at the `/static/` path, the `config.yaml` would look like this:

```yaml
static:
  files: 'web/**/*'
  urlPath: '/static/'
```

Keep in mind the `urlPath` option is completely optional.

As another example, to configure the [graphqlSchema](./built-in-extensions#graphqlschema) built-in extension to serve only `*.graphql` files from within the top-level of the `src/schema` directory, the `config.yaml` would look like this:

```yaml
graphqlSchema:
  files: 'src/schema/*.graphql'
```

As detailed, the `files` option also supports a more complex object syntax for advanced use cases.

For example, to match files within the `web` directory, and omit any within `web/images`, you can use a configuration such as:

```yaml
static:
  files:
    source: 'web/**/*'
    ignore: 'web/images/**'
```

> If you're transitioning from the [extension](./extensions) system, the `files` option object no longer supports an `only` field. Instead, use the `entryEvent.entryType` or the specific `entryEvent.eventType` fields in [`onEntryEventHandler(entryEvent)`](#function-onentryeventhandlerentryevent-fileentryevent--directoryentryevent-void) method or any of the specific [`EntryHandler`](#class-entryhandler) events.

### Timeouts

The default timeout for all plugins is **30 seconds**. If the method does not complete within this time, the component loader will throw an error and unblock the component loading sequence. This is to prevent the component loader from hanging indefinitely if a plugin fails to respond or takes too long to execute.

The plugin module can export a `defaultTimeout` variable (in milliseconds) that will override the system default.

For example:

```typescript
export const defaultTimeout = 60_000; // 60 seconds
```

Additionally, users can specify a `timeout` option in their application's `config.yaml` file for a specific plugin. This option takes precedence over the plugin's `defaultTimeout` and the system default.

For example:

```yaml
customPlugin:
  package: '@harperdb/custom-plugin'
  files: 'foo.js'
  timeout: 45_000 # 45 seconds
```

## Example: Statically hosting files

This is a functional example of how the `handleApplication()` method and `scope` argument can be used to create a simple static file server plugin. This example assumes that the component has a `config.yaml` with the `files` option set to a glob pattern that matches the files to be served.

> This is a simplified form of the [static](./built-in-extensions#static) built-in extension.

```js
export function handleApplication(scope) {
	const staticFiles = new Map();

	scope.options.on('change', (key, value, config) => {
		if (key[0] === 'files' || key[0] === 'urlPath') {
			// If the files or urlPath options change, we need to reinitialize the static files map
			staticFiles.clear();
			logger.info(`Static files reinitialized due to change in ${key.join('.')}`);
		}
	});

	scope.handleEntry((entry) => {
		if (entry.entryType === 'directory') {
			logger.info(`Cannot serve directories. Update the files option to only match files.`);
			return;
		}

		switch (entry.eventType) {
			case 'add':
			case 'change':
				// Store / Update the file contents in memory for serving
				staticFiles.set(entry.urlPath, entry.contents);
				break;
			case 'unlink':
				// Remove the file from memory when it is deleted
				staticFiles.delete(entry.urlPath);
				break;
		}
	});

	scope.server.http(
		(req, next) => {
			if (req.method !== 'GET') return next(req);

			// Attempt to retrieve the requested static file from memory
			const staticFile = staticFiles.get(req.pathname);

			return staticFile
				? {
						statusCode: 200,
						body: staticFile,
					}
				: {
						statusCode: 404,
						body: 'File not found',
					};
		},
		{ runFirst: true }
	);
}
```

In this example, the entry handler method passed to `handleEntry` will manage the map of static files in memory using their computed `urlPath` and the `contents`. If the config file changes (and thus a new default file or url path is specified) the plugin will clear the file map as well to remove artifacts. Furthermore, it uses the `server.http()` middleware to hook into the HTTP request handling.

This example is heavily simplified, but it demonstrates how the different key parts of `scope` can be used together to provide a performant and reactive application experience.

## API

### TypeScript support

The classes and types referenced below are all exported by the `harperdb` package. Just import the ones you need like this:

```typescript
import { Scope, type Config } from 'harperdb';
```

### Function: `handleApplication(scope: Scope): void | Promise<void>`

Parameters:

- `scope` - [`Scope`](#class-scope) - An instance of the `Scope` class that provides access to the relative application's configuration, resources, and other APIs.

Returns: `void | Promise<void>`

This is the only method a plugin module must export. It can be async and is awaited by the component loader. The `scope` argument provides access to the relative application's configuration, resources, and other APIs.

### Class: `Scope`

- Extends [`EventEmitter`](https://nodejs.org/docs/latest/api/events.html#class-eventemitter)

#### Event: `'close'`

Emitted after the scope is closed via the `close()` method.

#### Event: `'error'`

- `error` - `unknown` - The error that occurred.

#### Event: `'ready'`

Emitted when the Scope is ready to be used after loading the associated config file. It is awaited by the component loader, so it is not necessary to await it within the `handleApplication()` method.

#### `scope.close()`

Returns: `this` - The current `Scope` instance.

Closes all associated entry handlers, the associated `scope.options` instance, emits the `'close'` event, and then removes all other listeners on the instance.

#### `scope.handleEntry([files][, handler])`

Parameters:

- `files` - [`FilesOption`](#interface-filesoption) | [`FileAndURLPathConfig`](#interface-fileandurlpathconfig) | [`onEntryEventHandler`](#function-onentryeventhandlerentryevent-fileentryevent--directoryentryevent-void) - _optional_
- `handler` - [`onEntryEventHandler`](#function-onentryeventhandlerentryevent-fileentryevent--directoryentryevent-void) - _optional_

Returns: [`EntryHandler`](#class-entryhandler) - An instance of the `EntryHandler` class that can be used to handle entries within the scope.

The `handleEntry()` method is the key to handling file system entries specified by a `files` glob pattern option in `config.yaml`. This method is used to register an entry event handler, specifically for the `EntryHandler` [`'all'`](#event-all) event. The method signature is very flexible, and allows for the following variations:

- `scope.handleEntry()` (with no arguments) Returns the default `EntryHandler` created by the `files` and `urlPath` options in the `config.yaml`.
- `scope.handleEntry(handler)` (where `handler` is an `onEntryEventHandler`) Returns the default `EntryHandler` instance (based on the options within `config.yaml`) and uses the provided `handler` for the [`'all'`](#event-all) event.
- `scope.handleEntry(files)` (where `files` is `FilesOptions` or `FileAndURLPathConfig`) Returns a new `EntryHandler` instance that handles the specified `files` configuration.
- `scope.handleEntry(files, handler)` (where `files` is `FilesOptions` or `FileAndURLPathConfig`, and `handler` is an `onEntryEventHandler`) Returns a new `EntryHandler` instance that handles the specified `files` configuration and uses the provided `handler` for the [`'all'`](#event-all) event.

For example:

```js
export function handleApplication(scope) {
	// Get the default EntryHandler instance
	const defaultEntryHandler = scope.handleEntry();

	// Assign a handler for the 'all' event on the default EntryHandler
	scope.handleEntry((entry) => {
		/* ... */
	});

	// Create a new EntryHandler for the 'src/**/*.js' files option with a custom `'all'` event handler.
	const customEntryHandler = scope.handleEntry(
		{
			files: 'src/**/*.js',
		},
		(entry) => {
			/* ... */
		}
	);

	// Create another custom EntryHandler for the 'src/**/*.ts' files option, but without a `'all'` event handler.
	const anotherCustomEntryHandler = scope.handleEntry({
		files: 'src/**/*.ts',
	});
}
```

And thus, if the previous code was used by a component with the following `config.yaml`:

```yaml
customPlugin:
  files: 'web/**/*'
```

Then the default `EntryHandler` instances would be created to handle all entries within the `web` directory.

#### `scope.requestRestart()`

Returns: `void`

Request a Harper restart. This **does not** restart the instance immediately, but rather indicates to the user that a restart is required. This should be called when the plugin cannot handle the entry event and wants to indicate to the user that the Harper instance should be restarted.

This method is called automatically by the `scope` instance if the user has not defined an `scope.options.on('change')` handler or if an event handler exists and is missing a necessary handler method.

#### `scope.resources`

Returns: `Map<string, Resource>` - A map of the currently loaded [Resource](../globals#resource) instances.

#### `scope.server`

Returns: `server` - A reference to the [server](../globals#server) global API.

#### `scope.options`

Returns: [`OptionsWatcher`](#class-optionswatcher) - An instance of the `OptionsWatcher` class that provides access to the application's configuration options. Emits `'change'` events when the respective plugin part of the component's config file is modified.

For example, if the plugin `customPlugin` is configured by an application with:

```yaml
customPlugin:
  files: 'foo.js'
```

And has the following `handleApplication(scope)` implementation:

```typescript
export function handleApplication(scope) {
	scope.options.on('change', (key, value, config) => {
		if (key[0] === 'files') {
			// Handle the change in the files option
			scope.logger.info(`Files option changed to: ${value}`);
		}
	});
}
```

Then modifying the `files` option in the `config.yaml` to `bar.js` would log the following:

```plaintext
Files option changed to: bar.js
```

#### `scope.logger`

Returns: `logger` - A scoped instance of the [`logger`](../globals#logger) class that provides logging capabilities for the plugin.

It is recommended to use this instead of the `logger` global.

#### `scope.name`

Returns: `string` - The name of the plugin as configured in the `config.yaml` file. This is the key under which the plugin is configured.

#### `scope.directory`

Returns: `string` - The directory of the application. This is the root directory of the component where the `config.yaml` file is located.

### Interface: `FilesOption`

- `string` | `string[]` | [`FilesOptionObject`](#interface-filesoptionobject)

### Interface: `FilesOptionObject`

- `source` - `string` | `string[]` - _required_ - The glob pattern string or array of strings.
- `ignore` - `string` | `string[]` - _optional_ - An array of glob patterns to exclude from matches. This is an alternative way to use negative patterns. Defaults to `[]`.

### Interface: `FileAndURLPathConfig`

- `files` - [`FilesOption`](#interface-filesoption) - _required_ - A glob pattern string, array of glob pattern strings, or a more expressive glob options object determining the set of files and directories to be resolved for the plugin.
- `urlPath` - `string` - _optional_ - A base URL path to prepend to the resolved `files` entries.

### Class: `OptionsWatcher`

- Extends [`EventEmitter`](https://nodejs.org/docs/latest/api/events.html#class-eventemitter)

#### Event: `'change'`

- `key` - `string[]` - The key of the changed option split into parts (e.g. `foo.bar` becomes `['foo', 'bar']`).
- `value` - [`ConfigValue`](#interface-configvalue) - The new value of the option.
- `config` - [`ConfigValue`](#interface-configvalue) - The entire configuration object of the plugin.

The `'change'` event is emitted whenever an configuration option is changed in the configuration file relative to the application and respective plugin.

Given an application using the following `config.yaml`:

```yaml
customPlugin:
  files: 'web/**/*'
otherPlugin:
  files: 'index.js'
```

The `scope.options` for the respective plugin's `customPlugin` and `otherPlugin` would emit `'change'` events when the `files` options relative to them are modified.

For example, if the `files` option for `customPlugin` is changed to `web/**/*.js`, the following event would be emitted _only_ within the `customPlugin` scope:

```js
scope.options.on('change', (key, value, config) => {
	key; // ['files']
	value; // 'web/**/*.js'
	config; // { files: 'web/**/*.js' }
});
```

#### Event: `'close'`

Emitted when the `OptionsWatcher` is closed via the `close()` method. The watcher is not usable after this event is emitted.

#### Event: `'error'`

- `error` - `unknown` - The error that occurred.

#### Event: `'ready'`

- `config` - [`ConfigValue`](#interface-configvalue) | `undefined` - The configuration object of the plugin, if present.

This event can be emitted multiple times. It is first emitted upon the initial load, but will also be emitted after restoring a configuration file or configuration object after a `'remove'` event.

#### Event: `'remove'`

The configuration was removed. This can happen if the configuration file was deleted, the configuration object within the file is deleted, or if the configuration file fails to parse. Once restored, the `'ready'` event will be emitted again.

#### `options.close()`

Returns: `this` - The current `OptionsWatcher` instance.

Closes the options watcher, removing all listeners and preventing any further events from being emitted. The watcher is not usable after this method is called.

#### `options.get(key)`

Parameters:

- `key` - `string[]` - The key of the option to get, split into parts (e.g. `foo.bar` is represented as `['foo', 'bar']`).

Returns: [`ConfigValue`](#interface-configvalue) | `undefined`

If the config is defined it will attempt to retrieve the value of the option at the specified key. If the key does not exist, it will return `undefined`.

#### `options.getAll()`

Returns: [`ConfigValue`](#interface-configvalue) | `undefined`

Returns the entire configuration object for the plugin. If the config is not defined, it will return `undefined`.

#### `options.getRoot()`

Returns: [`Config`](#interface-config) | `undefined`

Returns the root configuration object of the application. This is the entire configuration object, basically the parsed form of the `config.yaml`. If the config is not defined, it will return `undefined`.

#### Interface: `Config`

- `[key: string]` [`ConfigValue`](#interface-configvalue)

An object representing the `config.yaml` file configuration.

#### Interface: `ConfigValue`

- `string` | `number` | `boolean` | `null` | `undefined` | `ConfigValue[]` | [`Config`](#interface-config)

Any valid configuration value type. Essentially, the primitive types, an array of those types, or an object comprised of values of those types.

### Class: `EntryHandler`

Extends: [`EventEmitter`](https://nodejs.org/docs/latest/api/events.html#class-eventemitter)

Created by calling [`scope.handleEntry()`](#scopehandleentry) method.

#### Event: `'all'`

- `entry` - [`FileEntry`](#interface-fileentry) | [`DirectoryEntry`](#interface-directoryentry) - The entry that was added, changed, or removed.

The `'all'` event is emitted for all entry events, including file and directory events. This is the event that the handler method in `scope.handleEntry` is registered for. The event handler receives an `entry` object that contains the entry metadata, such as the file contents, URL path, and absolute path.

An effective pattern for this event is:

```js
async function handleApplication(scope) {
	scope.handleEntry((entry) => {
		switch (entry.eventType) {
			case 'add':
				// Handle file addition
				break;
			case 'change':
				// Handle file change
				break;
			case 'unlink':
				// Handle file deletion
				break;
			case 'addDir':
				// Handle directory addition
				break;
			case 'unlinkDir':
				// Handle directory deletion
				break;
		}
	});
}
```

#### Event: `'add'`

- `entry` - [`AddFileEvent`](#interface-addfileevent) - The file entry that was added.

The `'add'` event is emitted when a file is created (or the watcher sees it for the first time). The event handler receives an `AddFileEvent` object that contains the file contents, URL path, absolute path, and other metadata.

#### Event: `'addDir'`

- `entry` - [`AddDirectoryEvent`](#interface-adddirectoryevent) - The directory entry that was added.

The `'addDir'` event is emitted when a directory is created (or the watcher sees it for the first time). The event handler receives an `AddDirectoryEvent` object that contains the URL path and absolute path of the directory.

#### Event: `'change'`

- `entry` - [`ChangeFileEvent`](#interface-changefileevent) - The file entry that was changed.

The `'change'` event is emitted when a file is modified. The event handler receives a `ChangeFileEvent` object that contains the updated file contents, URL path, absolute path, and other metadata.

#### Event: `'close'`

Emitted when the entry handler is closed via the [`entryHandler.close()`](#entryhandlerclose) method.

#### Event: `'error'`

- `error` - `unknown` - The error that occurred.

#### Event: `'ready'`

Emitted when the entry handler is ready to be used. This is not automatically awaited by the component loader, but also is not required. Calling `scope.handleEntry()` is perfectly sufficient. This is generally useful if you need to do something _after_ the entry handler is absolutely watching and handling entries.

#### Event: `'unlink'`

- `entry` - [`UnlinkFileEvent`](#interface-unlinkfileevent) - The file entry that was deleted.

The `'unlink'` event is emitted when a file is deleted. The event handler receives an `UnlinkFileEvent` object that contains the URL path and absolute path of the deleted file.

#### Event: `'unlinkDir'`

- `entry` - [`UnlinkDirectoryEvent`](#interface-unlinkdirectoryevent) - The directory entry that was deleted.

The `'unlinkDir'` event is emitted when a directory is deleted. The event handler receives an `UnlinkDirectoryEvent` object that contains the URL path and absolute path of the deleted directory.

#### `entryHandler.name`

Returns: `string` - The name of the plugin as configured in the `config.yaml` file. This is the key under which the plugin is configured.

The name of the plugin.

#### `entryHandler.directory`

Returns: `string`

The directory of the application. This is the root directory of the component where the `config.yaml` file is located.

#### `entryHandler.close()`

Returns: `this` - The current `EntryHandler` instance.

Closes the entry handler, removing all listeners and preventing any further events from being emitted. The handler can be started again using the [`entryHandler.update()`](#entryhandlerupdateconfig) method.

#### `entryHandler.update(config)`

Parameters:

- `config` - [`FilesOption`](#interface-filesoption) | [`FileAndURLPathConfig`](#interface-fileandurlpathconfig) - The configuration object for the entry handler.

This method will update an existing entry handler to watch new entries. It will close the underlying watcher and create a new one, but will maintain any existing listeners on the EntryHandler instance itself.

This method returns a promise associated with the ready event of the updated handler.

#### Interface: `BaseEntry`

- `stats` - [`fs.Stats`](https://nodejs.org/docs/latest/api/fs.html#class-fsstats) | `undefined` - The file system stats for the entry.
- `urlPath` - `string` - The recommended URL path of the entry.
- `absolutePath` - `string` - The absolute path of the entry.

The foundational entry handle event object. The `stats` may or may not be present depending on the event, entry type, and platform.

The `urlPath` is resolved based on the configured pattern (`files:` option) combined with the optional `urlPath` option. This path is generally useful for uniquely representing the entry. It is used in the built-in components such as `jsResource` and `static`.

The `absolutePath` is the file system path for the entry.

#### Interface: `FileEntry`

Extends [`BaseEntry`](#interface-baseentry)

- `contents` - `Buffer` - The contents of the file.

A specific extension of the `BaseEntry` interface representing a file entry. We automatically read the contents of the file so the user doesn't have to bother with FS operations.

There is no `DirectoryEntry` since there is no other important metadata aside from the `BaseEntry` properties. If a user wants the contents of a directory, they should adjust the pattern to resolve files instead.

#### Interface: `EntryEvent`

Extends [`BaseEntry`](#interface-baseentry)

- `eventType` - `string` - The type of entry event.
- `entryType` - `string` - The type of entry, either a file or a directory.

A general interface representing the entry handle event objects.

#### Interface: `AddFileEvent`

Extends [`EntryEvent`](#interface-entryevent), [FileEntry](#interface-fileentry)

- `eventType` - `'add'`
- `entryType` - `'file'`

Event object emitted when a file is created (or the watcher sees it for the first time).

#### Interface: `ChangeFileEvent`

Extends [`EntryEvent`](#interface-entryevent), [FileEntry](#interface-fileentry)

- `eventType` - `'change'`
- `entryType` - `'file'`

Event object emitted when a file is modified.

#### Interface: `UnlinkFileEvent`

Extends [`EntryEvent`](#interface-entryevent), [FileEntry](#interface-fileentry)

- `eventType` - `'unlink'`
- `entryType` - `'file'`

Event object emitted when a file is deleted.

#### Interface: `FileEntryEvent`

- `AddFileEvent` | `ChangeFileEvent` | `UnlinkFileEvent`

A union type representing the file entry events. These events are emitted when a file is created, modified, or deleted. The `FileEntry` interface provides the file contents and other metadata.

#### Interface: `AddDirectoryEvent`

Extends [`EntryEvent`](#interface-entryevent)

- `eventType` - `'addDir'`
- `entryType` - `'directory'`

Event object emitted when a directory is created (or the watcher sees it for the first time).

#### Interface: `UnlinkDirectoryEvent`

Extends [`EntryEvent`](#interface-entryevent)

- `eventType` - `'unlinkDir'`
- `entryType` - `'directory'`

Event object emitted when a directory is deleted.

#### Interface: `DirectoryEntryEvent`

- `AddDirectoryEvent` | `UnlinkDirectoryEvent`

A union type representing the directory entry events. There are no change events for directories since they are not modified in the same way as files.

#### Function: `onEntryEventHandler(entryEvent: FileEntryEvent | DirectoryEntryEvent): void`

Parameters:

- `entryEvent` - [`FileEntryEvent`](#interface-fileentryevent) | [`DirectoryEntryEvent`](#interface-directoryentryevent)

Returns: `void`

This function is what is passed to the `scope.handleEntry()` method as the handler for the `'all'` event. This is also applicable to a custom `.on('all', handler)` method for any `EntryHandler` instance.
