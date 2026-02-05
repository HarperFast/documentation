---
title: Built-In Extensions
---

# Built-In Extensions

Harper provides extended features using built-in extensions. They do **not** need to be installed with a package manager, and simply must be specified in a config to run. These are used throughout many Harper docs, guides, and examples. Unlike custom extensions which have their own semantic versions, built-in extensions follow Harper's semantic version.

For more information read the [Components, Applications, and Extensions](../../developers/applications/) documentation section.

- [Built-In Extensions](#built-in-extensions)
  - [fastifyRoutes](#fastifyroutes)
  - [graphql](#graphql)
  - [graphqlSchema](#graphqlschema)
  - [jsResource](#jsresource)
  - [loadEnv](#loadenv)
  - [rest](#rest)
  - [roles](#roles)
  - [static](#static)

## dataLoader

Load data from JSON or YAML files into Harper tables as part of component deployment.

This component is an [Extension](..#extensions) and can be configured with the `files` configuration option.

Complete documentation for this feature is available here: [Data Loader](../../developers/applications/data-loader)

```yaml
dataLoader:
  files: 'data/*.json'
```

## fastifyRoutes

Specify custom endpoints using [Fastify](https://fastify.dev/).

This component is a [Resource Extension](./extensions#resource-extension) and can be configured with the [`files` and `urlPath`](./extensions#resource-extension-configuration) configuration options.

Complete documentation for this feature is available here: [Define Fastify Routes](../../developers/applications/define-routes)

```yaml
fastifyRoutes:
  files: 'routes/*.js'
```

## graphql

> GraphQL querying is **experimental**, and only partially implements the GraphQL Over HTTP / GraphQL specifications.

Enables GraphQL querying via a `/graphql` endpoint loosely implementing the GraphQL Over HTTP specification.

Complete documentation for this feature is available here: [GraphQL](../graphql)

```yaml
graphql: true
```

## graphqlSchema

Specify schemas for Harper tables and resources via GraphQL schema syntax.

This component is a [Resource Extension](./extensions#resource-extension) and can be configured with the [`files` and `urlPath`](./extensions#resource-extension-configuration) configuration options.

Complete documentation for this feature is available here: [Defining Schemas](../../developers/applications/defining-schemas)

```yaml
graphqlSchema:
  files: 'schemas.graphql'
```

## jsResource

Specify custom, JavaScript based Harper resources.

Refer to the Application [Custom Functionality with JavaScript](../../developers/applications/#custom-functionality-with-javascript) guide, or [Resource Class](../resources/) reference documentation for more information on custom resources.

This component is a [Resource Extension](./extensions#resource-extension) and can be configured with the [`files` and `urlPath`](./extensions#resource-extension-configuration) configuration options.

```yaml
jsResource:
  files: 'resource.js'
```

## loadEnv

Load environment variables via files like `.env`.

This component is a [Resource Extension](./extensions#resource-extension) and can be configured with the [`files` and `urlPath`](./extensions#resource-extension-configuration) configuration options.

Ensure this component is specified first in `config.yaml` so that environment variables are loaded prior to loading any other components.

```yaml
loadEnv:
  files: '.env'
```

This component matches the default behavior of dotenv where existing variables take precedence. Specify the `override` option in order to override existing environment variables assigned to `process.env`:

```yaml
loadEnv:
  files: '.env'
  override: true
```

> Important: Harper is a single process application. Environment variables are loaded onto `process.env` and will be shared throughout all Harper components. This means environment variables loaded by one component will be available on other components (as long as the components are loaded in the correct order).

<!-- ## login -->

<!-- ## mqtt -->

<!-- ## operationsApi -->

<!-- ## replication -->

## rest

Enable automatic REST endpoint generation for exported resources with this component.

Complete documentation for this feature is available here: [REST](../../developers/rest)

```yaml
rest: true
```

This component contains additional options:

To enable `Last-Modified` header support:

```yaml
rest:
  lastModified: true
```

To disable automatic WebSocket support:

```yaml
rest:
  webSocket: false
```

## roles

Specify roles for Harper tables and resources.

This component is a [Resource Extension](./extensions#resource-extension) and can be configured with the [`files` and `urlPath`](./extensions#resource-extension-configuration) configuration options.

Complete documentation for this feature is available here: [Defining Roles](../../developers/applications/defining-roles)

```yaml
roles:
  files: 'roles.yaml'
```

## static

Specify files to serve statically from the Harper HTTP endpoint.

Use the [Resource Extension](./extensions#resource-extension) configuration options [`files` and `urlPath`](./extensions#resource-extension-configuration) to specify the files to be served.

As specified by Harper's Resource Extension docs, the `files` option can be any glob pattern or a glob options object. This extension will serve all files matching the pattern, so make sure to be specific.

To serve the entire `web` directory, specify `files: 'web/**'`.

To serve only the html files within `web`, specify `files: 'web/*.html'` or `files: 'web/**/*.html'`.

The `urlPath` option is the base URL path entries will be resolved to. For example, a `urlPath: 'static'` will serve all files resolved from `files` to the URL path `localhost/static/`.

Given the `config.yaml`:

```yaml
static:
  files: 'web/*.html'
  urlPath: 'static'
```

And the file directory structure:

```
component/
├─ web/
│  ├─ index.html
│  ├─ blog.html
├─ config.yaml

```

The HTML files will be available at `localhost/static/index.html` and `localhost/static/blog.html` respectively.
