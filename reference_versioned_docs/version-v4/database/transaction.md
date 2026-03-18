---
title: Transaction Logging
---

<!-- Source: versioned_docs/version-4.7/administration/logging/transaction-logging.md (primary) -->
<!-- Source: versioned_docs/version-4.7/administration/logging/audit-logging.md (audit log) -->
<!-- Source: versioned_docs/version-4.1/transaction-logging.md (baseline — transaction logging available since v4.1) -->
<!-- Source: versioned_docs/version-4.1/audit-logging.md (baseline — audit logging available since v4.1) -->
<!-- Source: release-notes/v4-tucker/4.3.0.md (balanced audit log cleanup) -->
<!-- Source: release-notes/v4-tucker/4.5.0.md (transaction reuse, storage reclamation / audit log eviction) -->

# Transaction Logging

Harper provides two complementary mechanisms for recording a history of data changes on a table: the **audit log** and the **transaction log**. Both are available at the table level and serve different use cases.

| Feature                       | Audit Log                         | Transaction Log                |
| ----------------------------- | --------------------------------- | ------------------------------ |
| Storage                       | Standard Harper table (per-table) | Clustering streams (per-table) |
| Requires clustering           | No                                | Yes                            |
| Available since               | v4.1.0                            | v4.1.0                         |
| Stores original record values | Yes                               | No                             |
| Query by username             | Yes                               | No                             |
| Query by primary key          | Yes                               | No                             |
| Used for real-time messaging  | Yes (required)                    | No                             |

## Audit Log

Available since: v4.1.0

The audit log uses a standard Harper table to track every transaction against a user table. For each user table, Harper automatically creates and maintains a corresponding audit log table. The audit log captures the operation type, the user who made the change, the timestamp, and both the new and original record values.

The audit log is **enabled by default**. To disable it, set `logging.auditLog` to `false` in `harperdb-config.yaml` and restart Harper.

> The audit log is required for real-time messaging (WebSocket and MQTT subscriptions). Do not disable it if real-time features are in use.

### Audit Log Operations

#### `read_audit_log`

Queries the audit log for a specific table. Supports filtering by timestamp, username, or primary key value.

**By timestamp:**

```json
{
	"operation": "read_audit_log",
	"schema": "dev",
	"table": "dog",
	"search_type": "timestamp",
	"search_values": [1660585740558]
}
```

Timestamp behavior:

| `search_values` | Result                                   |
| --------------- | ---------------------------------------- |
| `[]`            | All records for the table                |
| `[timestamp]`   | All records after the provided timestamp |
| `[from, to]`    | Records between the two timestamps       |

**By username:**

```json
{
	"operation": "read_audit_log",
	"schema": "dev",
	"table": "dog",
	"search_type": "username",
	"search_values": ["admin"]
}
```

**By primary key:**

```json
{
	"operation": "read_audit_log",
	"schema": "dev",
	"table": "dog",
	"search_type": "hash_value",
	"search_values": [318]
}
```

**Response example:**

```json
{
	"operation": "update",
	"user_name": "HDB_ADMIN",
	"timestamp": 1607035559122.277,
	"hash_values": [1, 2],
	"records": [
		{
			"id": 1,
			"breed": "Muttzilla",
			"age": 6,
			"__updatedtime__": 1607035559122
		}
	],
	"original_records": [
		{
			"__createdtime__": 1607035556801,
			"__updatedtime__": 1607035556801,
			"age": 5,
			"breed": "Mutt",
			"id": 1,
			"name": "Harper"
		}
	]
}
```

The `original_records` field contains the record state before the operation was applied.

#### `delete_audit_logs_before`

Deletes audit log entries older than the specified timestamp.

Changed in: v4.3.0 — Audit log cleanup improved to reduce resource consumption during scheduled cleanups

Changed in: v4.5.0 — Storage reclamation: Harper automatically evicts older audit log entries when free storage drops below a configurable threshold

```json
{
	"operation": "delete_audit_logs_before",
	"schema": "dev",
	"table": "dog",
	"timestamp": 1598290282817
}
```

---

## Transaction Log

Available since: v4.1.0

The transaction log is built on top of clustering streams. When clustering is enabled, every transaction against a table is pushed to its stream, which collectively forms the transaction log. The transaction log is primarily useful when clustering is set up, as it relies on the stream infrastructure.

> To use the transaction log, clustering must be configured. See [Replication](TODO:reference_versioned_docs/version-v4/replication/overview.md 'Setting up clustering') for setup instructions.

Changed in: v4.5.0 — Transactions can now be reused after calling `transaction.commit()`

### Transaction Log Operations

#### `read_transaction_log`

Returns a prescribed set of transaction records based on a time range and optional limit.

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

**Response example:**

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

#### `delete_transaction_logs_before`

Deletes transaction log entries older than the specified timestamp.

> **Warning:** Clustering uses transaction log streams for node catchup. Deleting transaction log entries may prevent a node that went offline from catching up on missed transactions.

```json
{
	"operation": "delete_transaction_logs_before",
	"schema": "dev",
	"table": "dog",
	"timestamp": 1598290282817
}
```

---

## Enabling Audit Log Per Table

You can enable or disable the audit log for individual tables using the `@table` directive's `audit` argument in your schema:

```graphql
type Dog @table(audit: true) {
	id: ID @primaryKey
	name: String
}
```

This overrides the `logging.auditLog` global configuration for that specific table.

## Related Documentation

- [Logging](TODO:reference_versioned_docs/version-v4/logging/overview.md) — Application and system logging (separate from transaction/audit logging)
- [Replication](TODO:reference_versioned_docs/version-v4/replication/overview.md) — Clustering setup required for transaction logs
- [Configuration](TODO:reference_versioned_docs/version-v4/configuration/options.md 'logging.auditLog option') — Global audit log configuration
- [Operations API](TODO:reference_versioned_docs/version-v4/operations-api/overview.md) — Sending operations to Harper
