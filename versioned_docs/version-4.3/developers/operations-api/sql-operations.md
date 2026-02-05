---
title: SQL Operations
---

:::warning
HarperDB encourages developers to utilize other querying tools over SQL for performance purposes. HarperDB SQL is intended for data investigation purposes and uses cases where performance is not a priority. SQL optimizations are on our roadmap for the future.
:::

# SQL Operations

## Select

Executes the provided SQL statement. The SELECT statement is used to query data from the database.

- `operation` _(required)_ - must always be `sql`
- `sql` _(required)_ - use standard SQL

### Body

```json
{
	"operation": "sql",
	"sql": "SELECT * FROM dev.dog WHERE id = 1"
}
```

### Response: 200

```json
[
	{
		"id": 1,
		"age": 7,
		"dog_name": "Penny",
		"weight_lbs": 38,
		"breed_id": 154,
		"owner_name": "Kyle",
		"adorable": true,
		"__createdtime__": 1611614106043,
		"__updatedtime__": 1611614119507
	}
]
```

---

## Insert

Executes the provided SQL statement. The INSERT statement is used to add one or more rows to a database table.

- `operation` _(required)_ - must always be `sql`
- `sql` _(required)_ - use standard SQL

### Body

```json
{
	"operation": "sql",
	"sql": "INSERT INTO dev.dog (id, dog_name) VALUE (22, 'Simon')"
}
```

### Response: 200

```json
{
	"message": "inserted 1 of 1 records",
	"inserted_hashes": [22],
	"skipped_hashes": []
}
```

---

## Update

Executes the provided SQL statement. The UPDATE statement is used to change the values of specified attributes in one or more rows in a database table.

- `operation` _(required)_ - must always be `sql`
- `sql` _(required)_ - use standard SQL

### Body

```json
{
	"operation": "sql",
	"sql": "UPDATE dev.dog SET dog_name = 'penelope' WHERE id = 1"
}
```

### Response: 200

```json
{
	"message": "updated 1 of 1 records",
	"update_hashes": [1],
	"skipped_hashes": []
}
```

---

## Delete

Executes the provided SQL statement. The DELETE statement is used to remove one or more rows of data from a database table.

- `operation` _(required)_ - must always be `sql`
- `sql` _(required)_ - use standard SQL

### Body

```json
{
	"operation": "sql",
	"sql": "DELETE FROM dev.dog WHERE id = 1"
}
```

### Response: 200

```json
{
	"message": "1 of 1 record successfully deleted",
	"deleted_hashes": [1],
	"skipped_hashes": []
}
```
