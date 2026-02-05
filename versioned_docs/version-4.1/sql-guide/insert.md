---
title: Insert
---

# Insert

HarperDB supports inserting 1 to n records into a table. The primary key must be unique (not used by any other record). If no primary key is provided, it will be assigned an auto-generated UUID. HarperDB does not support selecting from one table to insert into another at this time.

```
INSERT INTO dev.dog (id, dog_name, age, breed_id)
  VALUES(1, 'Penny', 5, 347), (2, 'Kato', 4, 347)
```
