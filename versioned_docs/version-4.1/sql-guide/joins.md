---
title: Joins
---

# Joins

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
