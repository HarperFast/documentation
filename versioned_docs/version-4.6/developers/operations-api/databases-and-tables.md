---
title: Databases and Tables
---

# Databases and Tables

## Describe All

Returns the definitions of all databases and tables within the database. Record counts about 5000 records are estimated, as determining the exact count can be expensive. When the record count is estimated, this is indicated by the inclusion of a confidence interval of `estimated_record_range`. If you need the exact count, you can include an `"exact_count": true` in the operation, but be aware that this requires a full table scan (may be expensive).

- `operation` _(required)_ - must always be `describe_all`

### Body

```json
{
	"operation": "describe_all"
}
```

### Response: 200

```json
{
	"dev": {
		"dog": {
			"schema": "dev",
			"name": "dog",
			"hash_attribute": "id",
			"audit": true,
			"schema_defined": false,
			"attributes": [
				{
					"attribute": "id",
					"indexed": true,
					"is_primary_key": true
				},
				{
					"attribute": "__createdtime__",
					"indexed": true
				},
				{
					"attribute": "__updatedtime__",
					"indexed": true
				},
				{
					"attribute": "type",
					"indexed": true
				}
			],
			"clustering_stream_name": "dd9e90c2689151ab812e0f2d98816bff",
			"record_count": 4000,
			"estimated_record_range": [3976, 4033],
			"last_updated_record": 1697658683698.4504
		}
	}
}
```

---

## Describe database

Returns the definitions of all tables within the specified database.

- `operation` _(required)_ - must always be `describe_database`
- `database` _(optional)_ - database where the table you wish to describe lives. The default is `data`

### Body

```json
{
	"operation": "describe_database",
	"database": "dev"
}
```

### Response: 200

```json
{
	"dog": {
		"schema": "dev",
		"name": "dog",
		"hash_attribute": "id",
		"audit": true,
		"schema_defined": false,
		"attributes": [
			{
				"attribute": "id",
				"indexed": true,
				"is_primary_key": true
			},
			{
				"attribute": "__createdtime__",
				"indexed": true
			},
			{
				"attribute": "__updatedtime__",
				"indexed": true
			},
			{
				"attribute": "type",
				"indexed": true
			}
		],
		"clustering_stream_name": "dd9e90c2689151ab812e0f2d98816bff",
		"record_count": 4000,
		"estimated_record_range": [3976, 4033],
		"last_updated_record": 1697658683698.4504
	}
}
```

---

## Describe Table

Returns the definition of the specified table.

- `operation` _(required)_ - must always be `describe_table`
- `table` _(required)_ - table you wish to describe
- `database` _(optional)_ - database where the table you wish to describe lives. The default is `data`

### Body

```json
{
	"operation": "describe_table",
	"table": "dog"
}
```

### Response: 200

```json
{
	"schema": "dev",
	"name": "dog",
	"hash_attribute": "id",
	"audit": true,
	"schema_defined": false,
	"attributes": [
		{
			"attribute": "id",
			"indexed": true,
			"is_primary_key": true
		},
		{
			"attribute": "__createdtime__",
			"indexed": true
		},
		{
			"attribute": "__updatedtime__",
			"indexed": true
		},
		{
			"attribute": "type",
			"indexed": true
		}
	],
	"clustering_stream_name": "dd9e90c2689151ab812e0f2d98816bff",
	"record_count": 4000,
	"estimated_record_range": [3976, 4033],
	"last_updated_record": 1697658683698.4504
}
```

---

## Create database

Create a new database.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `create_database`
- `database` _(optional)_ - name of the database you are creating. The default is `data`

### Body

```json
{
	"operation": "create_database",
	"database": "dev"
}
```

### Response: 200

```json
{
	"message": "database 'dev' successfully created"
}
```

---

## Drop database

Drop an existing database. NOTE: Dropping a database will delete all tables and all of their records in that database.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - this should always be `drop_database`
- `database` _(required)_ - name of the database you are dropping
- `replicated` _(optional)_ - if true, Harper will replicate the component to all nodes in the cluster. Must be a boolean.

### Body

```json
{
	"operation": "drop_database",
	"database": "dev"
}
```

### Response: 200

```json
{
	"message": "successfully deleted 'dev'"
}
```

---

## Create Table

Create a new table within a database.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `create_table`
- `database` _(optional)_ - name of the database where you want your table to live. If the database does not exist, it will be created. If the `database` property is not provided it will default to `data`.
- `table` _(required)_ - name of the table you are creating
- `primary_key` _(required)_ - primary key for the table
- `attributes` _(optional)_ - an array of attributes that specifies the schema for the table, that is the set of attributes for the table. When attributes are supplied the table will not be considered a "dynamic schema" table, and attributes will not be auto-added when records with new properties are inserted. Each attribute is specified as:
  - `name` _(required)_ - the name of the attribute
  - `indexed` _(optional)_ - indicates if the attribute should be indexed
  - `type` _(optional)_ - specifies the data type of the attribute (can be String, Int, Float, Date, ID, Any)
- `expiration` _(optional)_ - specifies the time-to-live or expiration of records in the table before they are evicted (records are not evicted on any timer if not specified). This is specified in seconds.

### Body

```json
{
	"operation": "create_table",
	"database": "dev",
	"table": "dog",
	"primary_key": "id"
}
```

### Response: 200

```json
{
	"message": "table 'dev.dog' successfully created."
}
```

---

## Drop Table

Drop an existing database table. NOTE: Dropping a table will delete all associated records in that table.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - this should always be `drop_table`
- `database` _(optional)_ - database where the table you are dropping lives. The default is `data`
- `table` _(required)_ - name of the table you are dropping
- `replicated` _(optional)_ - if true, Harper will replicate the component to all nodes in the cluster. Must be a boolean.

### Body

```json
{
	"operation": "drop_table",
	"database": "dev",
	"table": "dog"
}
```

### Response: 200

```json
{
	"message": "successfully deleted table 'dev.dog'"
}
```

---

## Create Attribute

Create a new attribute within the specified table. **The create_attribute operation can be used for admins wishing to pre-define database values for setting role-based permissions or for any other reason.**

_Note: Harper will automatically create new attributes on insert and update if they do not already exist within the database._

- `operation` _(required)_ - must always be `create_attribute`
- `database` _(optional)_ - name of the database of the table you want to add your attribute. The default is `data`
- `table` _(required)_ - name of the table where you want to add your attribute to live
- `attribute` _(required)_ - name for the attribute

### Body

```json
{
	"operation": "create_attribute",
	"database": "dev",
	"table": "dog",
	"attribute": "is_adorable"
}
```

### Response: 200

```json
{
	"message": "inserted 1 of 1 records",
	"skipped_hashes": [],
	"inserted_hashes": ["383c0bef-5781-4e1c-b5c8-987459ad0831"]
}
```

---

## Drop Attribute

Drop an existing attribute from the specified table. NOTE: Dropping an attribute will delete all associated attribute values in that table.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - this should always be `drop_attribute`
- `database` _(optional)_ - database where the table you are dropping lives. The default is `data`
- `table` _(required)_ - table where the attribute you are dropping lives
- `attribute` _(required)_ - attribute that you intend to drop

### Body

```json
{
	"operation": "drop_attribute",
	"database": "dev",
	"table": "dog",
	"attribute": "is_adorable"
}
```

### Response: 200

```json
{
	"message": "successfully deleted attribute 'is_adorable'"
}
```

---

## Get Backup

This will return a snapshot of the requested database. This provides a means for backing up the database through the operations API. The response will be the raw database file (in binary format), which can later be restored as a database file by copying into the appropriate hdb/databases directory (with Harper not running). The returned file is a snapshot of the database at the moment in time that the get_backup operation begins. This also supports backing up individual tables in a database. However, this is a more expensive operation than backing up a database in whole, and will lose any transactional atomicity between writes across tables, so generally it is recommended that you backup the entire database.

It is important to note that trying to copy a database file that is in use (Harper actively running and writing to the file) using standard file copying tools is not safe (the copied file will likely be corrupt), which is why using this snapshot operation is recommended for backups (volume snapshots are also a good way to backup Harper databases).

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - this should always be `get_backup`
- `database` _(required)_ - this is the database that will be snapshotted and returned
- `table` _(optional)_ - this will specify a specific table to backup
- `tables` _(optional)_ - this will specify a specific set of tables to backup

### Body

```json
{
	"operation": "get_backup",
	"database": "dev"
}
```

### Response: 200

```
The database in raw binary data format
```
