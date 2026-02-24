---
id: overview
title: Environment Variables
---

<!-- Source: versioned_docs/version-4.7/reference/components/built-in-extensions.md (primary - loadEnv section) -->
<!-- Source: versioned_docs/version-4.5/developers/components/built-in.md (for v4.5 feature introduction) -->
<!-- Source: release_notes/4.5.0.md (confirmed loadEnv introduction) -->

# Environment Variables

Harper supports environment variables in two distinct ways:

1. **Component-level `.env` files** — load environment variables from `.env` files into your components using the built-in `loadEnv` plugin.
2. **Harper configuration via environment variables** — configure Harper itself using environment variables and special bulk-config variables. See [Configuration](TODO:reference_versioned_docs/version-v4/configuration/overview.md 'Configuration section overview, including environment variable configuration') for more information.

## The `loadEnv` Built-In Plugin

Added in: v4.5.0 (confirmed via release notes)

Harper includes a built-in `loadEnv` plugin that loads environment variables from `.env` files into `process.env` before other components start. This is the standard way to supply secrets and configuration to your Harper components without hardcoding values.

`loadEnv` does **not** need to be installed — it is built into Harper and only needs to be declared in your `config.yaml`.

### Basic Usage

```yaml
loadEnv:
  files: '.env'
```

This loads the `.env` file from the root of your component directory into `process.env`.

### Load Order

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

### Override Behavior

By default, `loadEnv` follows the standard dotenv convention: **existing environment variables take precedence** over values in `.env` files. This means variables already set in the shell or container environment will not be overwritten.

To override existing environment variables, use the `override` option:

```yaml
loadEnv:
  files: '.env'
  override: true
```

### Multiple Files

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

## Related

- [Components Overview](TODO:reference_versioned_docs/version-v4/components/overview.md 'Components, Applications, and Extensions overview')
- [Configuration](TODO:reference_versioned_docs/version-v4/configuration/overview.md 'Configuration section, including environment variable configuration conventions and HARPER_DEFAULT_CONFIG / HARPER_SET_CONFIG')
