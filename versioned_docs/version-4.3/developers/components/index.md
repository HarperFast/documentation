---
title: Components
---

# Components

HarperDB is a highly extensible database application platform with support for a rich variety of composable modular components and components that can be used and combined to build applications and add functionality to existing applications. HarperDB tools, components, and add-ons can be found in a few places:

- [SDK libraries](components/sdks) are available for connecting to HarperDB from different languages.
- [Drivers](components/drivers) are available for connecting to HarperDB from different products and tools.
- [HarperDB-Add-Ons repositories](https://github.com/orgs/HarperDB-Add-Ons/repositories) lists various templates and add-ons for HarperDB.
- [HarperDB repositories](https://github.com/orgs/HarperDB-Add-Ons/repositories) include additional tools for HarperDB.
- You can also [search github.com for ever-growing list of projects that use, or work with, HarperDB](https://github.com/search?q=harperdb&type=repositories)
- [Google Data Studio](components/google-data-studio) is a visualization tool for building charts and tables from HarperDB data.

## Components

There are four general categories of components for HarperDB. The most common is applications. Applications are simply a component that delivers complete functionality through an external interface that it defines, and is usually composed of other components. See [our guide to building applications for getting started](../../developers/applications).

A data source component can implement the Resource API to customize access to a table or provide access to an external data source. External data source components are used to retrieve and access data from other sources.

The next two are considered extension components. Server protocol extension components provide and define ways for clients to access data and can be used to extend or create new protocols.

Server resource components implement support for different types of files that can be used as resources in applications. HarperDB includes support for using JavaScript modules and GraphQL Schemas as resources, but resource components may add support for different file types like HTML templates (like JSX), CSV data, and more.

## Server components

Server components can be easily be added and configured by simply adding an entry to your harperdb-config.yaml:

```yaml
my-server-component:
  package: 'HarperDB-Add-Ons/package-name' # this can be any valid github or npm reference
  port: 4321
```

## Writing Extension Components

You can write your own extensions to build new functionality on HarperDB. See the [writing extension components documentation](components/writing-extensions) for more information.
