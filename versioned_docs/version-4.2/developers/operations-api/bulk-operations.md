---
title: Bulk Operations
---

# Bulk Operations

## CSV Data Load

Ingests CSV data, provided directly in the operation as an `insert`, `update` or `upsert` into the specified database table.

- `operation` _(required)_ - must always be `csv_data_load`
- `action` _(optional)_ - type of action you want to perform - `insert`, `update` or `upsert`. The default is `insert`
- `database` _(optional)_ - name of the database where you are loading your data. The default is `data`
- `table` _(required)_ - name of the table where you are loading your data
- `data` _(required)_ - csv data to import into HarperDB

### Body

```json
{
	"operation": "csv_data_load",
	"database": "dev",
	"action": "insert",
	"table": "breed",
	"data": "id,name,section,country,image\n1,ENGLISH POINTER,British and Irish Pointers and Setters,GREAT BRITAIN,https://www.fci.be/Nomenclature/Illustrations/001g07.jpg\n2,ENGLISH SETTER,British and Irish Pointers and Setters,GREAT BRITAIN,https://www.fci.be/Nomenclature/Illustrations/002g07.jpg\n3,KERRY BLUE TERRIER,Large and medium sized Terriers,IRELAND,\n"
}
```

### Response: 200

```json
{
	"message": "Starting job with id 2fe25039-566e-4670-8bb3-2db3d4e07e69",
	"job_id": "2fe25039-566e-4670-8bb3-2db3d4e07e69"
}
```

---

## CSV File Load

Ingests CSV data, provided via a path on the local filesystem, as an `insert`, `update` or `upsert` into the specified database table.

_Note: The CSV file must reside on the same machine on which HarperDB is running. For example, the path to a CSV on your computer will produce an error if your HarperDB instance is a cloud instance._

- `operation` _(required)_ - must always be `csv_file_load`
- `action` _(optional)_ - type of action you want to perform - `insert`, `update` or `upsert`. The default is `insert`
- `database` _(optional)_ - name of the database where you are loading your data. The default is `data`
- `table` _(required)_ - name of the table where you are loading your data
- `file_path` _(required)_ - path to the csv file on the host running harperdb

### Body

```json
{
	"operation": "csv_file_load",
	"action": "insert",
	"database": "dev",
	"table": "breed",
	"file_path": "/home/user/imports/breeds.csv"
}
```

### Response: 200

```json
{
	"message": "Starting job with id 3994d8e2-ec6a-43c4-8563-11c1df81870e",
	"job_id": "3994d8e2-ec6a-43c4-8563-11c1df81870e"
}
```

---

## CSV URL Load

Ingests CSV data, provided via URL, as an `insert`, `update` or `upsert` into the specified database table.

- `operation` _(required)_ - must always be `csv_url_load`
- `action` _(optional)_ - type of action you want to perform - `insert`, `update` or `upsert`. The default is `insert`
- `database` _(optional)_ - name of the database where you are loading your data. The default is `data`
- `table` _(required)_ - name of the table where you are loading your data
- `csv_url` _(required)_ - URL to the csv

### Body

```json
{
	"operation": "csv_url_load",
	"action": "insert",
	"database": "dev",
	"table": "breed",
	"csv_url": "https://s3.amazonaws.com/complimentarydata/breeds.csv"
}
```

### Response: 200

```json
{
	"message": "Starting job with id 332aa0a2-6833-46cd-88a6-ae375920436a",
	"job_id": "332aa0a2-6833-46cd-88a6-ae375920436a"
}
```

---

## Import from S3

This operation allows users to import CSV or JSON files from an AWS S3 bucket as an `insert`, `update` or `upsert`.

- `operation` _(required)_ - must always be `import_from_s3`
- `action` _(optional)_ - type of action you want to perform - `insert`, `update` or `upsert`. The default is `insert`
- `database` _(optional)_ - name of the database where you are loading your data. The default is `data`
- `table` _(required)_ - name of the table where you are loading your data
- `s3` _(required)_ - object containing required AWS S3 bucket info for operation:
  - `aws_access_key_id` - AWS access key for authenticating into your S3 bucket
  - `aws_secret_access_key` - AWS secret for authenticating into your S3 bucket
  - `bucket` - AWS S3 bucket to import from
  - `key` - the name of the file to import - _the file must include a valid file extension ('.csv' or '.json')_
  - `region` - the region of the bucket

### Body

```json
{
	"operation": "import_from_s3",
	"action": "insert",
	"database": "dev",
	"table": "dog",
	"s3": {
		"aws_access_key_id": "YOUR_KEY",
		"aws_secret_access_key": "YOUR_SECRET_KEY",
		"bucket": "BUCKET_NAME",
		"key": "OBJECT_NAME",
		"region": "BUCKET_REGION"
	}
}
```

### Response: 200

```json
{
	"message": "Starting job with id 062a1892-6a0a-4282-9791-0f4c93b12e16",
	"job_id": "062a1892-6a0a-4282-9791-0f4c93b12e16"
}
```
