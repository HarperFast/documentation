---
title: Built-In Extensions
---

# Built-In Extensions

Harper provides extended features using built-in extensions. They do **not** need to be installed with a package manager, and simply must be specified in a config to run. These are used throughout many Harper docs, guides, and examples. Unlike custom extensions which have their own semantic versions, built-in extensions follow Harper's semantic version.

For more information read the [Components, Applications, and Extensions](../../developers/applications/) documentation section.

- [Built-In Extensions](#built-in-extensions)
  - [dataLoader](#dataloader)
  - [fastifyRoutes](#fastifyroutes)
  - [graphql](#graphql)
  - [graphqlSchema](#graphqlschema)
  - [jsResource](#jsresource)
  - [loadEnv](#loadenv)
  - [rest](#rest)
  - [roles](#roles)
  - [static](#static)
    - [Options](#options)
    - [Examples](#examples)
      - [Basic Static File Serving](#basic-static-file-serving)
      - [Enable automatic `index.html` serving](#enable-automatic-indexhtml-serving)
      - [Enable automatic `.html` extension matching](#enable-automatic-html-extension-matching)
      - [Provide a custom `404 Not Found` page](#provide-a-custom-404-not-found-page)
      - [Fully customize not found response](#fully-customize-not-found-response)

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

Serve static files via HTTP.

Use the [Resource Extension](./extensions#resource-extension) configuration options [`files` and `urlPath`](./extensions#resource-extension-configuration) to specify the files to be served.

```
my-app/
├─ site/
│  ├─ index.html
│  ├─ about.html
│  ├─ blog/
│     ├─ post-1.html
│     ├─ post-2.html
├─ config.yaml
```

The `static` plugin can be configured to serve the `site/` directory by specifying:

```yaml
static:
  files: 'site/**'
```

Then you could access the files relative to the `site` directory, thus `GET localhost:9926/index.html` would return the contents of `site/index.html`, and `GET localhost:9926/blog/post-1.html` would return the contents of `site/blog/post-1.html`.

You can use the `urlPath` option to serve the files from a different URL path, for example:

```yaml
static:
  files: 'site/**'
  urlPath: 'app'
```

Now, `GET localhost:9926/app/index.html` would return the contents of `site/index.html`, and `GET localhost:9926/app/blog/post-1.html` would return the contents of `site/blog/post-1.html`.

Moreover, if the `site/` directory was nested another level, such as:

```
my-app/
├─ site/
│  ├─ pages/
│     ├─ index.html
│     ├─ about.html
│     ├─ blog/
│        ├─ post-1.html
│        ├─ post-2.html
│  ├─ cache-info/
│     ├─ index.json
│     ├─ about.json
│     ├─ ...
├─ config.yaml
```

Now a pattern such as `site/pages/**` will match all files within the `pages` directory (including subdirectories) so a request to `GET localhost:9926/index.html` will return the contents of `site/pages/index.html`, and `GET localhost:9926/blog/post-1.html` will return the contents of `site/pages/blog/post-1.html`.

Because this plugin is implemented using the new [Plugin API](./plugins.md), it automatically updates to application changes. From updating the `config.yaml` to adding, removing, or modifying files, everything is handled automatically and Harper should **not** require a restart.

### Options

In addition to the general Plugin configuration options (`files`, `urlPath`, and `timeout`), this plugin supports the following configuration options:

- `extensions` - `string[]` - _optional_ - An array of file extensions to try and serve when an exact path is not found. For example, `['html']` and the path `/site/page-1` will match `/site/page-1.html`.
- `fallthrough` - `boolean` - _optional_ - If `true`, the plugin will fall through to the next handler if the requested file is not found. Make sure to disable this option if you want to customize the 404 Not Found response with the `notFound` option. Defaults to `true`.
- `index` - `boolean` - _optional_ - If `true`, the plugin will serve an `index.html` file if it exists in the directory specified by the `files` pattern. Defaults to `false`.
- `notFound` - `string | { file: string; statusCode: number }` - _optional_ - Specify a custom file to be returned for 404 Not Found responses. If you want to specify a different statusCode when a given path cannot be found, use the object form and specify the `file` and `statusCode` properties (this is particularly useful for SPAs).

### Examples

The `static` plugin can be configured in various ways to provide different behaviors. Here are some common examples:

#### Basic Static File Serving

Serve all files contained within the `static/` directory as is.

```yaml
static:
  files: 'static/**'
```

Requests must match the file names exactly (relative to the `static/` directory).

#### Enable automatic `index.html` serving

Serve all files contained within the `static/` directory, and automatically serve an `index.html` file if it exists in the directory.

```yaml
static:
  files: 'static/**'
  index: true
```

Now given a directory structure like:

```
my-app/
├─ static/
│  ├─ index.html
│  ├─ blog/
│     ├─ index.html
│     ├─ post-1.html
```

Requests would map like:

```
GET / -> static/index.html
GET /blog -> static/blog/index.html
GET /blog/post-1.html -> static/blog/post-1.html
```

#### Enable automatic `.html` extension matching

Expanding on the previous example, if you specify the `extensions` option, the plugin will automatically try to match the requested path with the specified extensions.

```yaml
static:
  files: 'static/**'
  index: true
  extensions: ['html']
```

Now with the same directory structure, requests would map like:

```
GET / -> static/index.html
GET /blog -> static/blog/index.html
GET /blog/post-1 -> static/blog/post-1.html
```

#### Provide a custom `404 Not Found` page

Sometimes when a `404 Not Found` response is not sufficient, and you want to provide a custom page or resource, you can use the `notFound` option to specify a custom file to be returned when a requested path is not found.

```yaml
static:
  files: 'static/**'
  notFound: 'static/404.html'
```

Now if a request is made to a path that does not exist, such as `/non-existent`, the plugin will return the contents of `static/404.html` with a `404` status code.

#### Fully customize not found response

Most common in SPAs relying on client-side routing, you may want to override the default `404` status code when a path is not found.

You can do this by specifying the `notFound` option as an object with a `file` and `statusCode` property.

```yaml
static:
  files: 'static/**'
  notFound:
    file: 'static/index.html'
    statusCode: 200
```

Now if a request is made to a path that does not exist, such as `/non-existent`, the plugin will return the contents of `static/index.html` with a `200` status code. This is particularly useful for SPAs where you want to serve the main application file regardless of the requested path.
