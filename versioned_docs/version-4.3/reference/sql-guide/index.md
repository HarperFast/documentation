---
title: SQL Guide
---

# SQL Guide

:::warning
HarperDB encourages developers to utilize other querying tools over SQL for performance purposes. HarperDB SQL is intended for data investigation purposes and uses cases where performance is not a priority. SQL optimizations are on our roadmap for the future.
:::

## HarperDB SQL Guide

The purpose of this guide is to describe the available functionality of HarperDB as it relates to supported SQL functionality. The SQL parser is still actively being developed, many SQL features may not be optimized or utilize indexes. This document will be updated as more features and functionality becomes available. Generally, the REST interface provides a more stable, secure, and performant interface for data interaction, but the SQL functionality can be useful for administrative ad-hoc querying, and utilizing existing SQL statements. **A high-level view of supported features can be found** [**here**](sql-guide/features-matrix)**.**

HarperDB adheres to the concept of database & tables. This allows developers to isolate table structures from each other all within one database.

## Select

HarperDB has robust SELECT support, from simple queries all the way to complex joins with multi-conditions, aggregates, grouping & ordering.

All results are returned as JSON object arrays.

Query for all records and attributes in the dev.dog table:

```
SELECT * FROM dev.dog
```

Query specific columns from all rows in the dev.dog table:

```
SELECT id, dog_name, age FROM dev.dog
```

Query for all records and attributes in the dev.dog table ORDERED BY age in ASC order:

```
SELECT * FROM dev.dog ORDER BY age
```

_The ORDER BY keyword sorts in ascending order by default. To sort in descending order, use the DESC keyword._

## Insert

HarperDB supports inserting 1 to n records into a table. The primary key must be unique (not used by any other record). If no primary key is provided, it will be assigned an auto-generated UUID. HarperDB does not support selecting from one table to insert into another at this time.

```
INSERT INTO dev.dog (id, dog_name, age, breed_id)
  VALUES(1, 'Penny', 5, 347), (2, 'Kato', 4, 347)
```

## Update

HarperDB supports updating existing table row(s) via UPDATE statements. Multiple conditions can be applied to filter the row(s) to update. At this time selecting from one table to update another is not supported.

```
UPDATE dev.dog
    SET owner_name = 'Kyle'
    WHERE id IN (1, 2)
```

## Delete

HarperDB supports deleting records from a table with condition support.

```
DELETE FROM dev.dog
  WHERE age < 4
```

## Joins

HarperDB allows developers to join any number of tables and currently supports the following join types:

- INNER JOIN LEFT
- INNER JOIN LEFT
- OUTER JOIN

Here’s a basic example joining two tables from our Get Started example- joining a dogs table with a breeds table:

```
SELECT d.id, d.dog_name, d.owner_name, b.name, b.section
    FROM dev.dog AS d
    INNER JOIN dev.breed AS b ON d.breed_id = b.id
    WHERE d.owner_name IN ('Kyle', 'Zach', 'Stephen')
    AND b.section = 'Mutt'
    ORDER BY d.dog_name
```
