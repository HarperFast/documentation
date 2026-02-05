---
title: Analytics
---

# Analytics

HarperDB provides extensive telemetry and analytics data to help monitor the status of the server and work loads, and to help understand traffic and usage patterns to identify issues and scaling needs, and identify queries and actions that are consuming the most resources.

HarperDB collects statistics for all operations, URL endpoints, and messaging topics, aggregating information by thread, operation, resource, and methods, in real-time. These statistics are logged in the `hdb_raw_analytics` and `hdb_analytics` table in the `system` database.

There are two "levels" of analytics in the HarperDB analytics table: the first is the immediate level of raw direct logging of real-time statistics. These analytics entries are recorded once a second (when there is activity) by each thread, and include all recorded activity in the last second, along with system resource information. The records have a primary key that is the timestamp in milliseconds since epoch. This can be queried (with `superuser` permission) using the search_by_conditions operation (this will search for 10 seconds worth of analytics) on the `hdb_raw_analytics` table:

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

The following are general resource usage statistics that are tracked:

- `memory` - This includes RSS, heap, buffer and external data usage.
- `utilization` - How much of the time the worker was processing requests.
- mqtt-connections - The number of MQTT connections.

The following types of information is tracked for each HTTP request:

- `success` - How many requests returned a successful response (20x response code). TTFB - Time to first byte in the response to the client.
- `transfer` - Time to finish the transfer of the data to the client.
- bytes-sent - How many bytes of data were sent to the client.

Requests are categorized by operation name, for the operations API, by the resource (name) with the REST API, and by command for the MQTT interface.
