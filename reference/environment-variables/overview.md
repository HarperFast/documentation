---
id: overview
title: Environment Variables
---

<!-- Source: versioned_docs/version-4.7/reference/components/built-in-extensions.md (primary - loadEnv section) -->
<!-- Source: versioned_docs/version-4.5/developers/components/built-in.md (for v4.5 feature introduction) -->
<!-- Source: release_notes/4.5.0.md (confirmed loadEnv introduction) -->

Harper supports loading environment variables in Harper applications `process.env` using the built-in `loadEnv` plugin. This is the standard way to supply secrets and configuration to your Harper components without hardcoding values. `loadEnv` does **not** need to be installed as it is built into Harper and only needs to be declared in your `config.yaml`.

:::note
If you are looking for information on how to configure your Harper installation using environment variables, see [Configuration](../configuration/overview.md) section for more information.
:::

## Configuration

| Option     | Type                 | Required | Description                                                                            |
| ---------- | -------------------- | -------- | -------------------------------------------------------------------------------------- |
| `files`    | `string \| string[]` | **Yes**  | Path(s) or glob pattern(s) to the env file(s) to load.                                 |
| `override` | `boolean`            | No       | If `true`, loaded values override existing environment variables. Defaults to `false`. |

## Basic Usage

```yaml
loadEnv:
  files: '.env'
```

This loads the `.env` file from the root of your component directory into `process.env`.

## Load Order

> **Important:** Specify `loadEnv` first in your `config.yaml` so that environment variables are loaded before any other components start.

```yaml
# config.yaml — loadEnv must come first
loadEnv:
  files: '.env'

rest: true

myApp:
  files: './src/*.js'
```

Because Harper is a single-process application, environment variables are loaded onto `process.env` and are shared across all components. As long as `loadEnv` is listed before dependent components, those components will have access to the loaded variables.

:::warning
`loadEnv` supplies **application** environment variables — values your component code reads from `process.env` (secrets, API endpoints, app settings). It does **not** configure Harper itself.

Harper's own instance-wide configuration is composed once at startup, **before** any component's `loadEnv` runs. As a result, config-shaping variables such as `HARPER_CONFIG`, `HARPER_SET_CONFIG`, and `HARPER_DEFAULT_CONFIG` delivered through a `.env` file are read too late to take effect and are ignored (Harper logs a warning when it detects any of them).

<VersionBadge type="changed" version="v5.2.0" />

To change Harper's configuration, set it in the [configuration file](../configuration/overview.md) or export the variable in the real process/container environment **before** Harper starts — not through `loadEnv`.
:::

## Override Behavior

By default, `loadEnv` follows the standard dotenv convention: **existing environment variables take precedence** over values in `.env` files. This means variables already set in the shell or container environment will not be overwritten.

To override existing environment variables, use the `override` option:

```yaml
loadEnv:
  files: '.env'
  override: true
```

## Multiple Files

As a Harper plugin, `loadEnv` supports multiple files using either glob patterns or a list of files in the configuration:

```yaml
loadEnv:
  files:
    - '.env'
    - '.env.local'
```

or

```yaml
loadEnv:
  files: 'env-vars/*'
```

Files are loaded in the order specified.

## Config-Shaping Variables Are Not Honored

<VersionBadge type="changed" version="v5.2.0" />

The three configuration env vars — `HARPER_DEFAULT_CONFIG`, `HARPER_CONFIG`, and `HARPER_SET_CONFIG` (see [Configuration](../configuration/overview.md)) — shape Harper's root configuration, which is composed once at startup, **before components load**. Delivering one of them through a `loadEnv` `.env` file therefore has **no effect**: configuration is strictly top-down (the instance's configuration controls components, never the reverse), so a component cannot shape instance-wide config.

As of 5.2.0 (and 5.1.x patch releases from 5.1.18) this is no longer silent: Harper logs a prominent warning at startup for each config-shaping variable found in a component `.env` file — naming the variable and the file — and again at component load time (which also covers components deployed after startup). Earlier versions ignored these variables without any message.

To configure the instance, use the supported channels instead: set the variable in the process environment (container env, service unit, shell), or put the equivalent keys in the instance's `harper-config.yaml`.

## Related

- [Components Overview](../components/overview.md)
- [Configuration](../configuration/overview.md)
