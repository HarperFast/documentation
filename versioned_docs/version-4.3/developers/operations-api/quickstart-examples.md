---
title: Quick Start Examples
---

# Quick Start Examples

HarperDB recommends utilizing [HarperDB Applications](../../developers/applications/) for defining databases, tables, and other functionality. However, this guide is a great way to get started using on the HarperDB Operations API.

## Create dog Table

We first need to create a table. Since our company is named after our CEO's dog, lets create a table to store all our employees' dogs. We'll call this table, `dogs`.

Tables in HarperDB are schema-less, so we don't need to add any attributes other than a primary_key (in pre 4.2 versions this was referred to as the hash_attribute) to create this table.

HarperDB does offer a `database` parameter that can be used to hold logical groupings of tables. The parameter is optional and if not provided the operation will default to using a database named `data`.

If you receive an error response, make sure your Basic Authentication user and password match those you entered during the installation process.

### Body

```json
{
	"operation": "create_table",
	"table": "dog",
	"primary_key": "id"
}
```

### Response: 200

```json
{
	"message": "table 'data.dog' successfully created."
}
```

---

## Create breed Table

Now that we have a table to store our dog data, we also want to create a table to track known breeds. Just as with the dog table, the only attribute we need to specify is the `primary_key`.

### Body

```json
{
	"operation": "create_table",
	"table": "breed",
	"primary_key": "id"
}
```

### Response: 200

```json
{
	"message": "table 'data.breed' successfully created."
}
```

---

## Insert 1 Dog

We're ready to add some dog data. Penny is our CTO's pup, so she gets ID 1 or we're all fired. We are specifying attributes in this call, but this doesn't prevent us from specifying additional attributes in subsequent calls.

### Body

```json
{
	"operation": "insert",
	"table": "dog",
	"records": [
		{
			"id": 1,
			"dog_name": "Penny",
			"owner_name": "Kyle",
			"breed_id": 154,
			"age": 7,
			"weight_lbs": 38
		}
	]
}
```

### Response: 200

```json
{
	"message": "inserted 1 of 1 records",
	"inserted_hashes": [1],
	"skipped_hashes": []
}
```

---

## Insert Multiple Dogs

Let's add some more Harper doggies! We can add as many dog objects as we want into the records collection. If you're adding a lot of objects, we would recommend using the .csv upload option (see the next section where we populate the breed table).

### Body

```json
{
	"operation": "insert",
	"table": "dog",
	"records": [
		{
			"id": 2,
			"dog_name": "Harper",
			"owner_name": "Stephen",
			"breed_id": 346,
			"age": 7,
			"weight_lbs": 55,
			"adorable": true
		},
		{
			"id": 3,
			"dog_name": "Alby",
			"owner_name": "Kaylan",
			"breed_id": 348,
			"age": 7,
			"weight_lbs": 84,
			"adorable": true
		},
		{
			"id": 4,
			"dog_name": "Billy",
			"owner_name": "Zach",
			"breed_id": 347,
			"age": 6,
			"weight_lbs": 60,
			"adorable": true
		},
		{
			"id": 5,
			"dog_name": "Rose Merry",
			"owner_name": "Zach",
			"breed_id": 348,
			"age": 8,
			"weight_lbs": 15,
			"adorable": true
		},
		{
			"id": 6,
			"dog_name": "Kato",
			"owner_name": "Kyle",
			"breed_id": 351,
			"age": 6,
			"weight_lbs": 32,
			"adorable": true
		},
		{
			"id": 7,
			"dog_name": "Simon",
			"owner_name": "Fred",
			"breed_id": 349,
			"age": 3,
			"weight_lbs": 35,
			"adorable": true
		},
		{
			"id": 8,
			"dog_name": "Gemma",
			"owner_name": "Stephen",
			"breed_id": 350,
			"age": 5,
			"weight_lbs": 55,
			"adorable": true
		},
		{
			"id": 9,
			"dog_name": "Yeti",
			"owner_name": "Jaxon",
			"breed_id": 200,
			"age": 5,
			"weight_lbs": 55,
			"adorable": true
		},
		{
			"id": 10,
			"dog_name": "Monkey",
			"owner_name": "Aron",
			"breed_id": 271,
			"age": 7,
			"weight_lbs": 35,
			"adorable": true
		},
		{
			"id": 11,
			"dog_name": "Bode",
			"owner_name": "Margo",
			"breed_id": 104,
			"age": 8,
			"weight_lbs": 75,
			"adorable": true
		},
		{
			"id": 12,
			"dog_name": "Tucker",
			"owner_name": "David",
			"breed_id": 346,
			"age": 2,
			"weight_lbs": 60,
			"adorable": true
		},
		{
			"id": 13,
			"dog_name": "Jagger",
			"owner_name": "Margo",
			"breed_id": 271,
			"age": 7,
			"weight_lbs": 35,
			"adorable": true
		}
	]
}
```

### Response: 200

```json
{
	"message": "inserted 12 of 12 records",
	"inserted_hashes": [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
	"skipped_hashes": []
}
```

---

## Bulk Insert Breeds Via CSV

We need to populate the 'breed' table with some data so we can reference it later. For larger data sets, we recommend using our CSV upload option.

Each header in a column will be considered as an attribute, and each row in the file will be a row in the table. Simply specify the file path and the table to upload to, and HarperDB will take care of the rest. You can pull the breeds.csv file from here: [https://s3.amazonaws.com/complimentarydata/breeds.csv](https://s3.amazonaws.com/complimentarydata/breeds.csv)

### Body

```json
{
	"operation": "csv_url_load",
	"table": "breed",
	"csv_url": "https://s3.amazonaws.com/complimentarydata/breeds.csv"
}
```

### Response: 200

```json
{
	"message": "Starting job with id e77d63b9-70d5-499c-960f-6736718a4369",
	"job_id": "e77d63b9-70d5-499c-960f-6736718a4369"
}
```

---

## Update 1 Dog Using NoSQL

HarperDB supports NoSQL and SQL commands. We're going to update the dog table to show Penny's last initial using our NoSQL API.

### Body

```json
{
	"operation": "update",
	"table": "dog",
	"records": [
		{
			"id": 1,
			"dog_name": "Penny B"
		}
	]
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

## Select a Dog by ID Using SQL

Now we're going to use a simple SQL SELECT call to pull Penny's updated data. Note we now see Penny's last initial in the dog name.

### Body

```json
{
	"operation": "sql",
	"sql": "SELECT * FROM data.dog where id = 1"
}
```

### Response: 200

```json
[
	{
		"owner_name": "Kyle",
		"adorable": null,
		"breed_id": 154,
		"__updatedtime__": 1610749428575,
		"dog_name": "Penny B",
		"weight_lbs": 38,
		"id": 1,
		"age": 7,
		"__createdtime__": 1610749386566
	}
]
```

---

## Select Dogs and Join Breed

Here's a more complex SQL command joining the breed table with the dog table. We will also pull only the pups belonging to Kyle, Zach, and Stephen.

### Body

```json
{
	"operation": "sql",
	"sql": "SELECT d.id, d.dog_name, d.owner_name, b.name, b.section FROM data.dog AS d INNER JOIN data.breed AS b ON d.breed_id = b.id WHERE d.owner_name IN ('Kyle', 'Zach', 'Stephen') AND b.section = 'Mutt' ORDER BY d.dog_name"
}
```

### Response: 200

```json
[
	{
		"id": 4,
		"dog_name": "Billy",
		"owner_name": "Zach",
		"name": "LABRADOR / GREAT DANE MIX",
		"section": "Mutt"
	},
	{
		"id": 8,
		"dog_name": "Gemma",
		"owner_name": "Stephen",
		"name": "SHORT HAIRED SETTER MIX",
		"section": "Mutt"
	},
	{
		"id": 2,
		"dog_name": "Harper",
		"owner_name": "Stephen",
		"name": "HUSKY MIX",
		"section": "Mutt"
	},
	{
		"id": 5,
		"dog_name": "Rose Merry",
		"owner_name": "Zach",
		"name": "TERRIER MIX",
		"section": "Mutt"
	}
]
```
