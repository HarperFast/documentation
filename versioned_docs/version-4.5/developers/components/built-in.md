---
title: Built-In Components
---

# Built-In Components

Harper provides extended features using built-in components. They do **not** need to be installed with a package manager, and simply must be specified in a config to run. These are used throughout many Harper docs, guides, and examples. Unlike external components which have their own semantic versions, built-in components follow Harper's semantic version.

- [Built-In Components](#built-in-components)
  - [fastifyRoutes](#fastifyroutes)
  - [graphql](#graphql)
  - [graphqlSchema](#graphqlschema)
  - [jsResource](#jsresource)
  - [loadEnv](#loadenv)
  - [rest](#rest)
  - [roles](#roles)
  - [static](#static)

<!-- ## authentication -->

<!-- ## clustering -->

## fastifyRoutes

Specify custom endpoints using [Fastify](https://fastify.dev/).

This component is a [Resource Extension](./reference#resource-extension) and can be configured with the [`files`, `path`, and `root`](./reference#resource-extension-configuration) configuration options.

Complete documentation for this feature is available here: [Define Fastify Routes](../applications/define-routes)

```yaml
fastifyRoutes:
  files: './routes/*.js'
```

## graphql

> GraphQL querying is **experimental**, and only partially implements the GraphQL Over HTTP / GraphQL specifications.

Enables GraphQL querying via a `/graphql` endpoint loosely implementing the GraphQL Over HTTP specification.

Complete documentation for this feature is available here: [GraphQL](../../reference/graphql)

```yaml
graphql: true
```

## graphqlSchema

Specify schemas for Harper tables and resources via GraphQL schema syntax.

This component is a [Resource Extension](./reference#resource-extension) and can be configured with the [`files`, `path`, and `root`](./reference#resource-extension-configuration) configuration options.

Complete documentation for this feature is available here: [Defining Schemas](../applications/defining-schemas)

```yaml
graphqlSchema:
  files: './schemas.graphql'
```

## jsResource

Specify custom, JavaScript based Harper resources.

Refer to the Application [Custom Functionality with JavaScript](../applications/#custom-functionality-with-javascript) guide, or [Resource Class](../../reference/resource) reference documentation for more information on custom resources.

This component is a [Resource Extension](./reference#resource-extension) and can be configured with the [`files`, `path`, and `root`](./reference#resource-extension-configuration) configuration options.

```yaml
jsResource:
  files: './resource.js'
```

## loadEnv

Load environment variables via files like `.env`.

This component is a [Resource Extension](./reference#resource-extension) and can be configured with the [`files`, `path`, and `root`](./reference#resource-extension-configuration) configuration options.

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

Complete documentation for this feature is available here: [REST](../rest)

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

This component is a [Resource Extension](./reference#resource-extension) and can be configured with the [`files`, `path`, and `root`](./reference#resource-extension-configuration) configuration options.

Complete documentation for this feature is available here: [Defining Roles](../applications/defining-roles)

```yaml
roles:
  files: './roles.yaml'
```

## static

Specify which files to server statically from the Harper HTTP endpoint. Built using the [send](https://www.npmjs.com/package/send) and [serve-static](https://www.npmjs.com/package/serve-static) modules.

This component is a [Resource Extension](./reference#resource-extension) and can be configured with the [`files`, `path`, and `root`](./reference#resource-extension-configuration) configuration options.

```yaml
static:
  files: './web/*'
```
