---
title: Logs
---

# Logs

## Read Harper Log

Returns log outputs from the primary Harper log based on the provided search criteria. [Read more about Harper logging here](../../administration/logging/standard-logging#read-logs-via-the-api).

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `read_Log`
- `start` _(optional)_ - result to start with. Default is 0, the first log in `hdb.log`. Must be a number
- `limit` _(optional)_ - number of results returned. Default behavior is 1000. Must be a number
- `level` _(optional)_ - error level to filter on. Default behavior is all levels. Must be `notify`, `error`, `warn`, `info`, `debug` or `trace`
- `from` _(optional)_ - date to begin showing log results. Must be `YYYY-MM-DD` or `YYYY-MM-DD hh:mm:ss`. Default is first log in `hdb.log`
- `until` _(optional)_ - date to end showing log results. Must be `YYYY-MM-DD` or `YYYY-MM-DD hh:mm:ss`. Default is last log in `hdb.log`
- `order` _(optional)_ - order to display logs desc or asc by timestamp. By default, will maintain `hdb.log` order
- `filter` _(optional)_ - a query string that must be a substring of each log line returned

### Body

```json
{
	"operation": "read_log",
	"start": 0,
	"limit": 1000,
	"level": "error",
	"from": "2021-01-25T22:05:27.464+0000",
	"until": "2021-01-25T23:05:27.464+0000",
	"order": "desc"
}
```

### Response: 200

```json
[
	{
		"level": "notify",
		"message": "Connected to cluster server.",
		"timestamp": "2021-01-25T23:03:20.710Z",
		"thread": "main/0",
		"tags": []
	},
	{
		"level": "warn",
		"message": "Login failed",
		"timestamp": "2021-01-25T22:24:45.113Z",
		"thread": "http/9",
		"tags": []
	},
	{
		"level": "error",
		"message": "unknown attribute 'name and breed'",
		"timestamp": "2021-01-25T22:23:24.167Z",
		"thread": "http/9",
		"tags": []
	}
]
```

---

## Read Transaction Log

Returns all transactions logged for the specified database table. You may filter your results with the optional from, to, and limit fields. [Read more about Harper transaction logs here](logs#read-transaction-log).

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `read_transaction_log`
- `schema` _(required)_ - schema under which the transaction log resides
- `table` _(required)_ - table under which the transaction log resides
- `from` _(optional)_ - time format must be millisecond-based epoch in UTC
- `to` _(optional)_ - time format must be millisecond-based epoch in UTC
- `limit` _(optional)_ - max number of logs you want to receive. Must be a number

### Body

```json
{
	"operation": "read_transaction_log",
	"schema": "dev",
	"table": "dog",
	"from": 1560249020865,
	"to": 1660585656639,
	"limit": 10
}
```

### Response: 200

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
		"operation": "insert",
		"user": "admin",
		"timestamp": 1660165619813,
		"records": [
			{
				"id": 2,
				"dog_name": "Harper",
				"owner_name": "Stephen",
				"breed_id": 346,
				"age": 7,
				"weight_lbs": 55,
				"adorable": true,
				"__updatedtime__": 1660165619797,
				"__createdtime__": 1660165619797
			},
			{
				"id": 3,
				"dog_name": "Alby",
				"owner_name": "Kaylan",
				"breed_id": 348,
				"age": 7,
				"weight_lbs": 84,
				"adorable": true,
				"__updatedtime__": 1660165619797,
				"__createdtime__": 1660165619797
			},
			{
				"id": 4,
				"dog_name": "Billy",
				"owner_name": "Zach",
				"breed_id": 347,
				"age": 6,
				"weight_lbs": 60,
				"adorable": true,
				"__updatedtime__": 1660165619797,
				"__createdtime__": 1660165619797
			},
			{
				"id": 5,
				"dog_name": "Rose Merry",
				"owner_name": "Zach",
				"breed_id": 348,
				"age": 8,
				"weight_lbs": 15,
				"adorable": true,
				"__updatedtime__": 1660165619797,
				"__createdtime__": 1660165619797
			},
			{
				"id": 6,
				"dog_name": "Kato",
				"owner_name": "Kyle",
				"breed_id": 351,
				"age": 6,
				"weight_lbs": 32,
				"adorable": true,
				"__updatedtime__": 1660165619797,
				"__createdtime__": 1660165619797
			},
			{
				"id": 7,
				"dog_name": "Simon",
				"owner_name": "Fred",
				"breed_id": 349,
				"age": 3,
				"weight_lbs": 35,
				"adorable": true,
				"__updatedtime__": 1660165619797,
				"__createdtime__": 1660165619797
			},
			{
				"id": 8,
				"dog_name": "Gemma",
				"owner_name": "Stephen",
				"breed_id": 350,
				"age": 5,
				"weight_lbs": 55,
				"adorable": true,
				"__updatedtime__": 1660165619797,
				"__createdtime__": 1660165619797
			},
			{
				"id": 9,
				"dog_name": "Yeti",
				"owner_name": "Jaxon",
				"breed_id": 200,
				"age": 5,
				"weight_lbs": 55,
				"adorable": true,
				"__updatedtime__": 1660165619797,
				"__createdtime__": 1660165619797
			},
			{
				"id": 10,
				"dog_name": "Monkey",
				"owner_name": "Aron",
				"breed_id": 271,
				"age": 7,
				"weight_lbs": 35,
				"adorable": true,
				"__updatedtime__": 1660165619797,
				"__createdtime__": 1660165619797
			},
			{
				"id": 11,
				"dog_name": "Bode",
				"owner_name": "Margo",
				"breed_id": 104,
				"age": 8,
				"weight_lbs": 75,
				"adorable": true,
				"__updatedtime__": 1660165619797,
				"__createdtime__": 1660165619797
			},
			{
				"id": 12,
				"dog_name": "Tucker",
				"owner_name": "David",
				"breed_id": 346,
				"age": 2,
				"weight_lbs": 60,
				"adorable": true,
				"__updatedtime__": 1660165619798,
				"__createdtime__": 1660165619798
			},
			{
				"id": 13,
				"dog_name": "Jagger",
				"owner_name": "Margo",
				"breed_id": 271,
				"age": 7,
				"weight_lbs": 35,
				"adorable": true,
				"__updatedtime__": 1660165619798,
				"__createdtime__": 1660165619798
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

---

## Delete Transaction Logs Before

Deletes transaction log data for the specified database table that is older than the specified timestamp.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `delete_transaction_log_before`
- `schema` _(required)_ - schema under which the transaction log resides. Must be a string
- `table` _(required)_ - table under which the transaction log resides. Must be a string
- `timestamp` _(required)_ - records older than this date will be deleted. Format is millisecond-based epoch in UTC

### Body

```json
{
	"operation": "delete_transaction_logs_before",
	"schema": "dev",
	"table": "dog",
	"timestamp": 1598290282817
}
```

### Response: 200

```json
{
	"message": "Starting job with id 26a6d3a6-6d77-40f9-bee7-8d6ef479a126"
}
```

---

## Read Audit Log

AuditLog must be enabled in the Harper configuration file to make this request. Returns a verbose history of all transactions logged for the specified database table, including original data records. You may filter your results with the optional search_type and search_values fields. [Read more about Harper transaction logs here.](../../administration/logging/transaction-logging#read_transaction_log)

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `read_audit_log`
- `schema` _(required)_ - schema under which the transaction log resides
- `table` _(required)_ - table under which the transaction log resides
- `search_type` _(optional)_ - possibilities are `hash_value`, `timestamp` and `username`
- `search_values` _(optional)_ - an array of string or numbers relating to search_type

### Body

```json
{
	"operation": "read_audit_log",
	"schema": "dev",
	"table": "dog"
}
```

### Response: 200

```json
[
	{
		"operation": "insert",
		"user_name": "admin",
		"timestamp": 1660585635882.288,
		"hash_values": [318],
		"records": [
			{
				"id": 318,
				"dog_name": "Polliwog",
				"__updatedtime__": 1660585635876,
				"__createdtime__": 1660585635876
			}
		]
	},
	{
		"operation": "insert",
		"user_name": "admin",
		"timestamp": 1660585716133.01,
		"hash_values": [444],
		"records": [
			{
				"id": 444,
				"dog_name": "Davis",
				"__updatedtime__": 1660585716128,
				"__createdtime__": 1660585716128
			}
		]
	},
	{
		"operation": "update",
		"user_name": "admin",
		"timestamp": 1660585740558.415,
		"hash_values": [444],
		"records": [
			{
				"id": 444,
				"fur_type": "coarse",
				"__updatedtime__": 1660585740556
			}
		],
		"original_records": [
			{
				"id": 444,
				"dog_name": "Davis",
				"__updatedtime__": 1660585716128,
				"__createdtime__": 1660585716128
			}
		]
	},
	{
		"operation": "delete",
		"user_name": "admin",
		"timestamp": 1660585759710.56,
		"hash_values": [444],
		"original_records": [
			{
				"id": 444,
				"dog_name": "Davis",
				"__updatedtime__": 1660585740556,
				"__createdtime__": 1660585716128,
				"fur_type": "coarse"
			}
		]
	}
]
```

---

## Read Audit Log by timestamp

AuditLog must be enabled in the Harper configuration file to make this request. Returns the transactions logged for the specified database table between the specified time window. [Read more about Harper transaction logs here](logs#read-transaction-log).

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `read_audit_log`
- `schema` _(required)_ - schema under which the transaction log resides
- `table` _(required)_ - table under which the transaction log resides
- `search_type` _(optional)_ - timestamp
- `search_values` _(optional)_ - an array containing a maximum of two values \[`from_timestamp`, `to_timestamp`] defining the range of transactions you would like to view.
  - Timestamp format is millisecond-based epoch in UTC
  - If no items are supplied then all transactions are returned
  - If only one entry is supplied then all transactions after the supplied timestamp will be returned

### Body

```json
{
	"operation": "read_audit_log",
	"schema": "dev",
	"table": "dog",
	"search_type": "timestamp",
	"search_values": [1660585740558, 1660585759710.56]
}
```

### Response: 200

```json
[
	{
		"operation": "insert",
		"user_name": "admin",
		"timestamp": 1660585635882.288,
		"hash_values": [318],
		"records": [
			{
				"id": 318,
				"dog_name": "Polliwog",
				"__updatedtime__": 1660585635876,
				"__createdtime__": 1660585635876
			}
		]
	},
	{
		"operation": "insert",
		"user_name": "admin",
		"timestamp": 1660585716133.01,
		"hash_values": [444],
		"records": [
			{
				"id": 444,
				"dog_name": "Davis",
				"__updatedtime__": 1660585716128,
				"__createdtime__": 1660585716128
			}
		]
	},
	{
		"operation": "update",
		"user_name": "admin",
		"timestamp": 1660585740558.415,
		"hash_values": [444],
		"records": [
			{
				"id": 444,
				"fur_type": "coarse",
				"__updatedtime__": 1660585740556
			}
		],
		"original_records": [
			{
				"id": 444,
				"dog_name": "Davis",
				"__updatedtime__": 1660585716128,
				"__createdtime__": 1660585716128
			}
		]
	},
	{
		"operation": "delete",
		"user_name": "admin",
		"timestamp": 1660585759710.56,
		"hash_values": [444],
		"original_records": [
			{
				"id": 444,
				"dog_name": "Davis",
				"__updatedtime__": 1660585740556,
				"__createdtime__": 1660585716128,
				"fur_type": "coarse"
			}
		]
	},
	{
		"operation": "update",
		"user_name": "admin",
		"timestamp": 1660586298457.224,
		"hash_values": [318],
		"records": [
			{
				"id": 318,
				"fur_type": "super fluffy",
				"__updatedtime__": 1660586298455
			}
		],
		"original_records": [
			{
				"id": 318,
				"dog_name": "Polliwog",
				"__updatedtime__": 1660585635876,
				"__createdtime__": 1660585635876
			}
		]
	}
]
```

---

## Read Audit Log by username

AuditLog must be enabled in the Harper configuration file to make this request. Returns the transactions logged for the specified database table which were committed by the specified user. [Read more about Harper transaction logs here](../../administration/logging/transaction-logging#read_transaction_log).

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `read_audit_log`
- `schema` _(required)_ - schema under which the transaction log resides
- `table` _(required)_ - table under which the transaction log resides
- `search_type` _(optional)_ - username
- `search_values` _(optional)_ - the Harper user for whom you would like to view transactions

### Body

```json
{
	"operation": "read_audit_log",
	"schema": "dev",
	"table": "dog",
	"search_type": "username",
	"search_values": ["admin"]
}
```

### Response: 200

```json
{
	"admin": [
		{
			"operation": "insert",
			"user_name": "admin",
			"timestamp": 1660585635882.288,
			"hash_values": [318],
			"records": [
				{
					"id": 318,
					"dog_name": "Polliwog",
					"__updatedtime__": 1660585635876,
					"__createdtime__": 1660585635876
				}
			]
		},
		{
			"operation": "insert",
			"user_name": "admin",
			"timestamp": 1660585716133.01,
			"hash_values": [444],
			"records": [
				{
					"id": 444,
					"dog_name": "Davis",
					"__updatedtime__": 1660585716128,
					"__createdtime__": 1660585716128
				}
			]
		},
		{
			"operation": "update",
			"user_name": "admin",
			"timestamp": 1660585740558.415,
			"hash_values": [444],
			"records": [
				{
					"id": 444,
					"fur_type": "coarse",
					"__updatedtime__": 1660585740556
				}
			],
			"original_records": [
				{
					"id": 444,
					"dog_name": "Davis",
					"__updatedtime__": 1660585716128,
					"__createdtime__": 1660585716128
				}
			]
		},
		{
			"operation": "delete",
			"user_name": "admin",
			"timestamp": 1660585759710.56,
			"hash_values": [444],
			"original_records": [
				{
					"id": 444,
					"dog_name": "Davis",
					"__updatedtime__": 1660585740556,
					"__createdtime__": 1660585716128,
					"fur_type": "coarse"
				}
			]
		},
		{
			"operation": "update",
			"user_name": "admin",
			"timestamp": 1660586298457.224,
			"hash_values": [318],
			"records": [
				{
					"id": 318,
					"fur_type": "super fluffy",
					"__updatedtime__": 1660586298455
				}
			],
			"original_records": [
				{
					"id": 318,
					"dog_name": "Polliwog",
					"__updatedtime__": 1660585635876,
					"__createdtime__": 1660585635876
				}
			]
		}
	]
}
```

---

## Read Audit Log by hash_value

AuditLog must be enabled in the Harper configuration file to make this request. Returns the transactions logged for the specified database table which were committed to the specified hash value(s). [Read more about Harper transaction logs here](../../administration/logging/transaction-logging#read_transaction_log).

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `read_audit_log`
- `schema` _(required)_ - schema under which the transaction log resides
- `table` _(required)_ - table under which the transaction log resides
- `search_type` _(optional)_ - hash_value
- `search_values` _(optional)_ - an array of hash_attributes for which you wish to see transaction logs

### Body

```json
{
	"operation": "read_audit_log",
	"schema": "dev",
	"table": "dog",
	"search_type": "hash_value",
	"search_values": [318]
}
```

### Response: 200

```json
{
	"318": [
		{
			"operation": "insert",
			"user_name": "admin",
			"timestamp": 1660585635882.288,
			"records": [
				{
					"id": 318,
					"dog_name": "Polliwog",
					"__updatedtime__": 1660585635876,
					"__createdtime__": 1660585635876
				}
			]
		},
		{
			"operation": "update",
			"user_name": "admin",
			"timestamp": 1660586298457.224,
			"records": [
				{
					"id": 318,
					"fur_type": "super fluffy",
					"__updatedtime__": 1660586298455
				}
			],
			"original_records": [
				{
					"id": 318,
					"dog_name": "Polliwog",
					"__updatedtime__": 1660585635876,
					"__createdtime__": 1660585635876
				}
			]
		}
	]
}
```

---

## Delete Audit Logs Before

AuditLog must be enabled in the Harper configuration file to make this request. Deletes audit log data for the specified database table that is older than the specified timestamp.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `delete_audit_logs_before`
- `schema` _(required)_ - schema under which the transaction log resides. Must be a string
- `table` _(required)_ - table under which the transaction log resides. Must be a string
- `timestamp` _(required)_ - records older than this date will be deleted. Format is millisecond-based epoch in UTC

### Body

```json
{
	"operation": "delete_audit_logs_before",
	"schema": "dev",
	"table": "dog",
	"timestamp": 1660585759710.56
}
```

### Response: 200

```json
{
	"message": "Starting job with id 7479e5f8-a86e-4fc9-add7-749493bc100f"
}
```
