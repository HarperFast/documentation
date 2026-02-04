---
title: Audit Logging
---

# Audit Logging

### Audit log

The audit log uses a standard Harper table to track transactions. For each table a user creates, a corresponding table will be created to track transactions against that table.

Audit log is enabled by default. To disable the audit log, set `logging.auditLog` to false in the config file, `harperdb-config.yaml`. Then restart Harper for those changes to take place. Note, the audit is required to be enabled for real-time messaging.

### Audit Log Operations

#### read_audit_log

The `read_audit_log` operation is flexible, enabling users to query with many parameters. All operations search on a single table. Filter options include timestamps, usernames, and table hash values. Additional examples found in the [Harper API documentation](../../developers/operations-api/logs).

**Search by Timestamp**

```json
{
	"operation": "read_audit_log",
	"schema": "dev",
	"table": "dog",
	"search_type": "timestamp",
	"search_values": [1660585740558]
}
```

There are three outcomes using timestamp.

- `"search_values": []` - All records returned for specified table
- `"search_values": [1660585740558]` - All records after provided timestamp
- `"search_values": [1660585740558, 1760585759710]` - Records "from" and "to" provided timestamp

---

**Search by Username**

```json
{
	"operation": "read_audit_log",
	"schema": "dev",
	"table": "dog",
	"search_type": "username",
	"search_values": ["admin"]
}
```

The above example will return all records whose `username` is "admin."

---

**Search by Primary Key**

```json
{
	"operation": "read_audit_log",
	"schema": "dev",
	"table": "dog",
	"search_type": "hash_value",
	"search_values": [318]
}
```

The above example will return all records whose primary key (`hash_value`) is 318.

---

#### read_audit_log Response

The example that follows provides records of operations performed on a table. One thing of note is that the `read_audit_log` operation gives you the `original_records`.

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
		},
		{
			"id": 2,
			"age": 7,
			"__updatedtime__": 1607035559121
		}
	],
	"original_records": [
		{
			"__createdtime__": 1607035556801,
			"__updatedtime__": 1607035556801,
			"age": 5,
			"breed": "Mutt",
			"id": 2,
			"name": "Penny"
		},
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

#### delete_audit_logs_before

Just like with transaction logs, you can clean up your audit logs with the `delete_audit_logs_before` operation. It will delete audit log data according to the given parameters. The example below will delete records older than the timestamp provided.

```json
{
	"operation": "delete_audit_logs_before",
	"schema": "dev",
	"table": "cat",
	"timestamp": 1598290282817
}
```
