---
title: Analytics
---

# Analytics

Harper provides extensive telemetry and analytics data to help monitor the status of the server and work loads, and to help understand traffic and usage patterns to identify issues and scaling needs, and identify queries and actions that are consuming the most resources.

Harper collects statistics for all operations, URL endpoints, and messaging topics, aggregating information by thread, operation, resource, and methods, in real-time. These statistics are logged in the `hdb_raw_analytics` and `hdb_analytics` table in the `system` database.

There are two "levels" of analytics in the Harper analytics table: the first is the immediate level of raw direct logging of real-time statistics. These analytics entries are recorded once a second (when there is activity) by each thread, and include all recorded activity in the last second, along with system resource information. The records have a primary key that is the timestamp in milliseconds since epoch. This can be queried (with `superuser` permission) using the search_by_conditions operation (this will search for 10 seconds worth of analytics) on the `hdb_raw_analytics` table:

```
POST http://localhost:9925
Content-Type: application/json

{
    "operation": "search_by_conditions",
    "schema": "system",
    "table": "hdb_raw_analytics",
    "conditions": [{
        "search_attribute": "id",
        "search_type": "between",
        "search_value": [168859400000, 1688594010000]
    }]
}
```

And a typical response looks like:

```
{
    "time": 1688594390708,
    "period": 1000.8336279988289,
    "metrics": [
      {
        "metric": "bytes-sent",
        "path": "search_by_conditions",
        "type": "operation",
        "median": 202,
        "mean": 202,
        "p95": 202,
        "p90": 202,
        "count": 1
      },
      ...
      {
        "metric": "memory",
        "threadId": 2,
        "rss": 1492664320,
        "heapTotal": 124596224,
        "heapUsed": 119563120,
        "external": 3469790,
        "arrayBuffers": 798721
      },
      {
        "metric": "utilization",
        "idle": 138227.52767700003,
        "active": 70.5066209952347,
        "utilization": 0.0005098165086230495
      }
    ],
    "threadId": 2,
    "totalBytesProcessed": 12182820,
    "id": 1688594390708.6853
}
```

The second level of analytics recording is aggregate data. The aggregate records are recorded once a minute, and aggregate the results from all the per-second entries from all the threads, creating a summary of statistics once a minute. The ids for these milliseconds since epoch can be queried from the `hdb_analytics` table. You can query these with an operation like:

```
POST http://localhost:9925
Content-Type: application/json

{
    "operation": "search_by_conditions",
    "schema": "system",
    "table": "hdb_analytics",
    "conditions": [{
        "search_attribute": "id",
        "search_type": "between",
        "search_value": [1688194100000, 1688594990000]
    }]
}
```

And a summary record looks like:

```
{
    "period": 60000,
    "metric": "bytes-sent",
    "method": "connack",
    "type": "mqtt",
    "median": 4,
    "mean": 4,
    "p95": 4,
    "p90": 4,
    "count": 1,
    "id": 1688589569646,
    "time": 1688589569646
}
```

# Standard Analytics Metrics

While applications can define their own metrics, Harper provides a set of standard metrics that are tracked for all services:

## HTTP

The following metrics are tracked for all HTTP requests:

| `metric`           | `path`        | `method`       | `type`                                         | Unit         | Description                                             |
| ------------------ | ------------- | -------------- | ---------------------------------------------- | ------------ | ------------------------------------------------------- |
| `duration`         | resource path | request method | `cache-hit` or `cache-miss` if a caching table | milliseconds | Duration of request handler                             |
| `duration`         | route path    | request method | fastify-route                                  | milliseconds |                                                         |
| `duration`         | operation     |                | operation                                      | milliseconds |                                                         |
| `success`          | resource path | request method |                                                | %            |                                                         |
| `success`          | route path    | request method | fastify-route                                  | %            |                                                         |
| `success`          | operation     |                | operation                                      | %            |                                                         |
| `bytes-sent`       | resource path | request method |                                                | bytes        |                                                         |
| `bytes-sent`       | route path    | request method | fastify-route                                  | bytes        |                                                         |
| `bytes-sent`       | operation     |                | operation                                      | bytes        |                                                         |
| `transfer`         | resource path | request method | operation                                      | milliseconds | duration of transfer                                    |
| `transfer`         | route path    | request method | fastify-route                                  | milliseconds | duration of transfer                                    |
| `transfer`         | operation     |                | operation                                      | milliseconds | duration of transfer                                    |
| `socket-routed`    |               |                |                                                | %            | percentage of sockets that could be immediately routed  |
| `tls-handshake`    |               |                |                                                | milliseconds |                                                         |
| `tls-reused`       |               |                |                                                | %            | percentage of TLS that reuses sessions                  |
| `cache-hit`        | table name    |                |                                                | %            | The percentage of cache hits                            |
| `cache-resolution` | table name    |                |                                                | milliseconds | The duration of resolving requests for uncached entries |

The following are metrics for real-time MQTT connections:
| `metric` | `path` | `method` | `type` | Unit | Description |
|---|---|---|---|---|---|
| `mqtt-connections` | | | | count | The number of open direct MQTT connections |
| `ws-connections` | | | | count | number of open WS connections|
| `connection` | `mqtt` | `connect` | | % | percentage of successful direct MQTT connections |
| `connection` | `mqtt` | `disconnect` | | % | percentage of explicit direct MQTT disconnects |
| `connection` | `ws` | `connect` | | % | percentage of successful WS connections |
| `connection` | `ws` | `disconnect` | | % | percentage of explicit WS disconnects |
| `bytes-sent` | topic | mqtt command | `mqtt` | bytes | The number of bytes sent for a given command and topic |

The following are metrics for replication:

| `metric`         | `path`        | `method`      | `type`    | Unit  | Description                                           |
| ---------------- | ------------- | ------------- | --------- | ----- | ----------------------------------------------------- |
| `bytes-sent`     | node.database | `replication` | `egress`  | bytes | The number of bytes sent for replication              |
| `bytes-sent`     | node.database | `replication` | `blob`    | bytes | The number of bytes sent for replication of blobs     |
| `bytes-received` | node.database | `replication` | `ingress` | bytes | The number of bytes received for replication          |
| `bytes-received` | node.database | `replication` | `blob`    | bytes | The number of bytes received for replication of blobs |

The following are general resource usage statistics that are tracked:

| `metric`                  | primary attribute(s)                                                                             | other attribute(s)  | Unit    | Description                                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------ | ------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `database-size`           | `size`, `used`, `free`, `audit`                                                                  | `database`          | bytes   | The size of the database in bytes                                                                                             |
| `main-thread-utilization` | `idle`, `active`, `taskQueueLatency`, `rss`, `heapTotal`, `heapUsed`, `external`, `arrayBuffers` | `time`              | various | Main thread resource usage; including idle time, active time, task queue latency, RSS, heap, buffer and external memory usage |
| `resource-usage`          |                                                                                                  |                     | various | [See breakout below](#resource-usage)                                                                                         |
| `storage-volume`          | `available`, `free`, `size`                                                                      | `database`          | bytes   | The size of the storage volume in bytes                                                                                       |
| `table-size`              | `size`                                                                                           | `database`, `table` | bytes   | The size of the table in bytes                                                                                                |
| `utilization`             |                                                                                                  |                     | %       | How much of the time the worker was processing requests                                                                       |

<a id="resource-usage"></a>
`resource-usage` metrics are everything returned by [node:process.resourceUsage()](https://nodejs.org/api/process.html#processresourceusage)[^1] plus the following additional metrics:

| `metric`         | Unit | Description                                           |
| ---------------- | ---- | ----------------------------------------------------- |
| `time`           | ms   | Current time when metric was recorded (Unix time)     |
| `period`         | ms   | Duration of the metric period                         |
| `cpuUtilization` | %    | CPU utilization percentage (user and system combined) |

[^1]: The `userCPUTime` and `systemCPUTime` metrics are converted to milliseconds to match the other time-related metrics.
