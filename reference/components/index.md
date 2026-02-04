---
title: Components
---

# Components

**Components** are the high-level concept for modules that extend the Harper core platform adding additional functionality. Components encapsulate both applications and extensions.

> We are actively working to disambiguate the terminology. When you see "component", such as in the Operations API or CLI, it generally refers to an application. We will do our best to clarify exactly which classification of a component whenever possible.

**Applications** are best defined as the implementation of a specific user-facing feature or functionality. Applications are built on top of extensions and can be thought of as the end product that users interact with. For example, a Next.js application that serves a web interface or an Apollo GraphQL server that provides a GraphQL API are both applications.

**Extensions** are the building blocks of the Harper component system. Applications depend on extensions to provide the functionality the application is implementing. For example, the built-in `graphqlSchema` extension enables applications to define their databases and tables using GraphQL schemas. Furthermore, the `@harperdb/nextjs` and `@harperdb/apollo` extensions are the building blocks that provide support for building Next.js and Apollo applications.

> As of Harper v4.6, a new, **experimental** component system has been introduced called **plugins**. Plugins are a **new iteration of the existing extension system**. They are simultaneously a simplification and an extensibility upgrade. Instead of defining multiple methods (`start` vs `startOnMainThread`, `handleFile` vs `setupFile`, `handleDirectory` vs `setupDirectory`), plugins only have to define a single `handleApplication` method. Plugins are **experimental**, and complete documentation is available on the [plugin API](components/plugins) page. In time we plan to deprecate the concept of extensions in favor of plugins, but for now, both are supported.

All together, the support for implementing a feature is the extension, and the actual implementation of the feature is the application.

For more information on the differences between applications and extensions, refer to the beginning of the [Applications](../developers/applications/) guide documentation section.

This technical reference section has detailed information on various component systems:

- [Built-In Extensions](components/built-in-extensions)
- [Configuration](components/configuration)
- [Managing Applications](components/applications)
- [Extensions](components/extensions)
- [(Experimental) Plugins](components/plugins)

## Custom Applications

- [`@harperdb/status-check`](https://github.com/HarperDB/status-check)
- [`@harperdb/prometheus-exporter`](https://github.com/HarperDB/prometheus-exporter)
- [`@harperdb/acl-connect`](https://github.com/HarperDB/acl-connect)

## Custom Extensions

- [`@harperdb/nextjs`](https://github.com/HarperDB/nextjs)
- [`@harperdb/apollo`](https://github.com/HarperDB/apollo)
- [`@harperdb/astro`](https://github.com/HarperDB/astro)
