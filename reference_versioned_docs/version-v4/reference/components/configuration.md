---
title: Component Configuration
---

# Component Configuration

> For information on the distinction between the types of components (applications and extensions), refer to beginning of the [Applications](../../developers/applications) documentation section.

Harper components are configured with a `config.yaml` file located in the root of the component module directory. This file is how an components configures other components it depends on. Each entry in the file starts with a component name, and then configuration values are indented below it.

```yaml
name:
  option-1: value
  option-2: value
```

It is the entry's `name` that is used for component resolution. It can be one of the [built-in extensions](./built-in-extensions), or it must match a package dependency of the component as specified by `package.json`. The [Custom Component Configuration](#custom-component-configuration) section provides more details and examples.

For some built-in extensions they can be configured with as little as a top-level boolean; for example, the [rest](./built-in-extensions#rest) extension can be enabled with just:

```yaml
rest: true
```

Most components generally have more configuration options. Some options are ubiquitous to the Harper platform, such as the `files` and `urlPath` options for an [extension](./extensions) or [plugin](./plugins), or `package` for any [custom component](#custom-component-configuration).

[Extensions](./extensions) and [plugins](./plugins) require specifying the `extensionModule` or `pluginModule` option respectively. Refer to their respective API reference documentation for more information.

## Custom Component Configuration

Any custom component **must** be configured with the `package` option in order for Harper to load that component. When enabled, the name of package must match a dependency of the component. For example, to use the `@harperdb/nextjs` extension, it must first be included in `package.json`:

```json
{
	"dependencies": {
		"@harperdb/nextjs": "1.0.0"
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
  files: './'
  # ...
```

## Default Component Configuration

Harper components do not need to specify a `config.yaml`. Harper uses the following default configuration to load components.

```yaml
rest: true
graphqlSchema:
  files: '*.graphql'
roles:
  files: 'roles.yaml'
jsResource:
  files: 'resources.js'
fastifyRoutes:
  files: 'routes/*.js'
  urlPath: '.'
static:
  files: 'web/**'
```

Refer to the [built-in components](./built-in-extensions) documentation for more information on these fields.

If a `config.yaml` is defined, it will **not** be merged with the default config.
