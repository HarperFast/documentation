---
title: Analytics Operations
---

# Analytics Operations

## get_analytics

Retrieves analytics data from the server.

- `operation` _(required)_ - must always be `get_analytics`
- `metric` _(required)_ - any value returned by `list_metrics`
- `start_time` _(optional)_ - Unix timestamp in milliseconds
- `end_time` _(optional)_ - Unix timestamp in milliseconds
- `get_attributes` _(optional)_ - array of attribute names to retrieve
- `conditions` _(optional)_ - array of conditions to filter results (see [search_by_conditions docs](./nosql-operations) for details)

### Body

```json
{
	"operation": "get_analytics",
	"metric": "resource-usage",
	"start_time": 1769198332754,
	"end_time": 1769198532754,
	"get_attributes": ["id", "metric", "userCPUTime", "systemCPUTime"],
	"conditions": [
		{
			"attribute": "node",
			"operator": "equals",
			"value": "node1.example.com"
		}
	]
}
```

### Response 200

```json
[
	{
		"id": "12345",
		"metric": "resource-usage",
		"userCPUTime": 100,
		"systemCPUTime": 50
	},
	{
		"id": "67890",
		"metric": "resource-usage",
		"userCPUTime": 150,
		"systemCPUTime": 75
	}
]
```

## list_metrics

Returns a list of available metrics that can be queried.

- `operation` _(required)_ - must always be `list_metrics`
- `metric_types` _(optional)_ - array of metric types to filter results; one or both of `custom` and `builtin`; default is `builtin`

### Body

```json
{
	"operation": "list_metrics",
	"metric_types": ["custom", "builtin"]
}
```

### Response 200

```json
["resource-usage", "table-size", "database-size", "main-thread-utilization", "utilization", "storage-volume"]
```

## describe_metric

Provides detailed information about a specific metric, including its structure and available parameters.

- `operation` _(required)_ - must always be `describe_metric`
- `metric` _(required)_ - name of the metric to describe

### Body

```json
{
	"operation": "describe_metric",
	"metric": "resource-usage"
}
```

### Response 200

```json
{
	"attributes": [
		{
			"name": "id",
			"type": "number"
		},
		{
			"name": "metric",
			"type": "string"
		},
		{
			"name": "userCPUTime",
			"type": "number"
		},
		{
			"name": "systemCPUTime",
			"type": "number"
		},
		{
			"name": "node",
			"type": "string"
		}
	]
}
```
