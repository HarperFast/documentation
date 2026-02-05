---
title: Components
---

# Components

Harper components are a core Harper concept defined as flexible JavaScript based _extensions_ of the highly extensible core Harper platform. They are executed by Harper directly and have complete access to the Harper [Global APIs](../../reference/globals) (such as `Resource`, `databases`, and `tables`).

A key aspect to components are their extensibility; components can be built on other components. For example, a [Harper Application](../../developers/applications) is a component that uses many other components. The [application template](https://github.com/HarperDB/application-template) demonstrates many of Harper's built-in components such as `rest` (for automatic REST endpoint generation), `graphqlSchema` (for table schema definitions), and many more.

From management to development, the following pages document everything a developer needs to know about Harper components.

- [Managing Components](components/managing) - developing, installing, deploying, and executing Harper components locally and remotely
- [Technical Reference](components/reference) - detailed, technical reference for component development
- [Built-In Components](components/built-in) - documentation for all of Harper's built-in components (i.e. `rest`)

## Custom Components

The following list is all of Harper's officially maintained, custom components. They are all available on npm and GitHub.

- [`@harperdb/nextjs`](https://github.com/HarperDB/nextjs)
- [`@harperdb/apollo`](https://github.com/HarperDB/apollo)
- [`@harperdb/status-check`](https://github.com/HarperDB/status-check)
- [`@harperdb/prometheus-exporter`](https://github.com/HarperDB/prometheus-exporter)
- [`@harperdb/acl-connect`](https://github.com/HarperDB/acl-connect)
- [`@harperdb/astro`](https://github.com/HarperDB/astro)
