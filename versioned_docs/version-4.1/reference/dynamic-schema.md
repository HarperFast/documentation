---
title: Dynamic Schema
---

# Dynamic Schema

HarperDB is built to make data ingestion simple. A primary driver of that is the Dynamic Schema. The purpose of this document is to provide a detailed explanation of the dynamic schema specifically related to schema definition and data ingestion.

The dynamic schema provides the structure of schema and table namespaces while simultaneously providing the flexibility of a data-defined schema. Individual attributes are reflexively created as data is ingested, meaning the table will adapt to the structure of data ingested. HarperDB tracks the metadata around schemas, tables, and attributes allowing for describe table, describe schema, and describe all operations.

### Schemas

HarperDB schemas are analogous to a namespace that groups tables together. A schema is required to create a table.

### Tables

HarperDB tables group records together with a common data pattern. To create a table users must provide a table name and a primary key.

- **Table Name**: Used to identify the table.
- **Primary Key**: This is a required attribute that serves as the unique identifier for a record and is also known as the `hash_attribute` in HarperDB.

Primary Key

The primary key (also referred to as the `hash_attribute`) is used to uniquely identify records. Uniqueness is enforced on the primary; inserts with the same primary key will be rejected. If a primary key is not provided on insert, a GUID will be automatically generated and returned to the user. The [HarperDB Storage Algorithm](./storage-algorithm) utilizes this value for indexing.

**Standard Attributes**

Additional attributes are reflexively added via insert and update operations (in both SQL and NoSQL) when new attributes are included in the data structure provided to HarperDB. As a result, schemas are additive, meaning new attributes are created in the underlying storage algorithm as additional data structures are provided. HarperDB offers `create_attribute` and `drop_attribute` operations for users who prefer to manually define their data model independent of data ingestion. When new attributes are added to tables with existing data the value of that new attribute will be assumed `null` for all existing records.

**Audit Attributes**

HarperDB automatically creates two audit attributes used on each record.

- `__createdtime__`: The time the record was created in [Unix Epoch with milliseconds](https://www.epochconverter.com/) format.
- `__updatedtime__`: The time the record was updated in [Unix Epoch with milliseconds](https://www.epochconverter.com/) format.

### Dynamic Schema Example

To better understand the behavior let’s take a look at an example. This example utilizes [HarperDB API operations](https://api.harperdb.io/).

**Create a Schema**

```bash
{
    "operation": "create_schema",
    "schema": "dev"
}
```

**Create a Table**

Notice the schema name, table name, and hash attribute name are the only required parameters.

```bash
{
    "operation": "create_table",
    "schema": "dev",
    "table": "dog",
    "hash_attribute": "id"
}
```

At this point the table does not have structure beyond what we provided, so the table looks like this:

**dev.dog**

![](/img/v4.1/reference/dynamic_schema_2_create_table.png.webp)

**Insert Record**

To define attributes we do not need to do anything beyond sending them in with an insert operation.

```bash
{
    "operation": "insert",
    "schema": "dev",
    "table": "dog",
    "records": [
      {"id": 1, "dog_name": "Penny", "owner_name": "Kyle"}
    ]
}
```

With a single record inserted and new attributes defined, our table now looks like this:

**dev.dog**

![](/img/v4.1/reference/dynamic_schema_3_insert_record.png.webp)

Indexes have been automatically created for `dog_name` and `owner_name` attributes.

**Insert Additional Record**

If we continue inserting records with the same data schema no schema updates are required. One record will omit the hash attribute from the insert to demonstrate GUID generation.

```bash
{
    "operation": "insert",
    "schema": "dev",
    "table": "dog",
    "records": [
        {"id": 2, "dog_name": "Monk", "owner_name": "Aron"},
        {"dog_name": "Harper","owner_name": "Stephen"}
    ]
}
```

In this case, there is no change to the schema. Our table now looks like this:

**dev.dog**

![](/img/v4.1/reference/dynamic_schema_4_insert_additional_record.png.webp)

**Update Existing Record**

In this case, we will update a record with a new attribute not previously defined on the table.

```bash
{
    "operation": "update",
    "schema": "dev",
    "table": "dog",
    "records": [
      {"id": 2, "weight_lbs": 35}
    ]
}
```

Now we have a new attribute called `weight_lbs`. Our table now looks like this:

**dev.dog**

![](/img/v4.1/reference/dynamic_schema_5_update_existing_record.png.webp)

**Query Table with SQL**

Now if we query for all records where `weight_lbs` is `null` we expect to get back two records.

```bash
{
    "operation": "sql",
    "sql": "SELECT * FROM dev.dog WHERE weight_lbs IS NULL"
}
```

This results in the expected two records being returned.

![](/img/v4.1/reference/dynamic_schema_6_query_table_with_sql.png.webp)
