---
title: Select
---

# Select

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

\*The ORDER BY keyword sorts in ascending order by default. To sort in descending order, use the DESC keyword.
