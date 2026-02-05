---
title: Transaction Logging
---

# Transaction Logging

HarperDB offers two options for logging transactions executed against a table. The options are similar but utilize different storage layers.

## Transaction log

The first option is `read_transaction_log`. The transaction log is built upon clustering streams. Clustering streams are per-table message stores that enable data to be propagated across a cluster. HarperDB leverages streams for use with the transaction log. When clustering is enabled all transactions that occur against a table are pushed to its stream, and thus make up the transaction log.

If you would like to use the transaction log, but have not set up clustering yet, please see ["How to Cluster"](../../reference/clustering).

## Transaction Log Operations

### read_transaction_log

The `read_transaction_log` operation returns a prescribed set of records, based on given parameters. The example below will give a maximum of 2 records within the timestamps provided.

```json
{
	"operation": "read_transaction_log",
	"schema": "dev",
	"table": "dog",
	"from": 1598290235769,
	"to": 1660249020865,
	"limit": 2
}
```

_See example response below._

### read_transaction_log Response

```json
[
	{
		"operation": "insert",
		"user": "admin",
		"timestamp": 1660165619736,
		"records": [
			{
				"id": 1,
				"dog_name": "Penny",
				"owner_name": "Kyle",
				"breed_id": 154,
				"age": 7,
				"weight_lbs": 38,
				"__updatedtime__": 1660165619688,
				"__createdtime__": 1660165619688
			}
		]
	},
	{
		"operation": "update",
		"user": "admin",
		"timestamp": 1660165620040,
		"records": [
			{
				"id": 1,
				"dog_name": "Penny B",
				"__updatedtime__": 1660165620036
			}
		]
	}
]
```

_See example request above._

### delete_transaction_logs_before

The `delete_transaction_logs_before` operation will delete transaction log data according to the given parameters. The example below will delete records older than the timestamp provided.

```json
{
	"operation": "delete_transaction_logs_before",
	"schema": "dev",
	"table": "dog",
	"timestamp": 1598290282817
}
```

_Note: Streams are used for catchup if a node goes down. If you delete messages from a stream there is a chance catchup won't work._

Read on for `read_audit_log`, the second option, for logging transactions executed against a table.
