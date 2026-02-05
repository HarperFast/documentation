---
title: Architecture
---

# Architecture

HarperDB's architecture consists of resources, which includes tables and user defined data sources and extensions, and server interfaces, which includes the RESTful HTTP interface, operations API, and MQTT. Servers are supported by routing and auth services.

```
           ┌──────────┐    ┌──────────┐
           │ Clients  │    │ Clients  │
           └────┬─────┘    └────┬─────┘
                │               │
                ▼               ▼
   ┌────────────────────────────────────────┐
   │                                        │
   │        Socket routing/management       │
   ├───────────────────────┬────────────────┤
   │                       │                │
   │ Server Interfaces   ─►│ Authentication │
   │ RESTful HTTP, MQTT    │ Authorization  │
   │                     ◄─┤                │
   │              ▲        └────────────────┤
   │   │          │                         │
   ├───┼──────────┼─────────────────────────┤
   │   │          │        ▲                │
   │   ▼   Resources ▲     │ ┌───────────┐  │
   │                 │     └─┤           │  │
   ├─────────────────┴────┐  │ App       │  │
   │                      ├─►│ resources │  │
   │  Database tables     │  └───────────┘  │
   │                      │      ▲          │
   ├──────────────────────┘      │          │
   │             ▲  ▼            │          │
   │       ┌────────────────┐    │          │
   │       │ External       │    │          │
   │       │ data sources   ├────┘          │
   │       │                │               │
   │       └────────────────┘               │
   │                                        │
   └────────────────────────────────────────┘
```
