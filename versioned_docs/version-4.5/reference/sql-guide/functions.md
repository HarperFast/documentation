---
title: Harper SQL Functions
---

:::warning
Harper encourages developers to utilize other querying tools over SQL for performance purposes. Harper SQL is intended for data investigation purposes and uses cases where performance is not a priority. SQL optimizations are on our roadmap for the future.
:::

# Harper SQL Functions

This SQL keywords reference contains the SQL functions available in Harper.

## Functions

### Aggregate

| Keyword            | Syntax                                                          | Description                                                                                                                                             |
| ------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AVG`              | `AVG(expression)`                                               | Returns the average of a given numeric expression.                                                                                                      |
| `COUNT`            | `SELECT COUNT(column_name) FROM database.table WHERE condition` | Returns the number records that match the given criteria. Nulls are not counted.                                                                        |
| `GROUP_CONCAT`     | `GROUP_CONCAT(expression)`                                      | Returns a string with concatenated values that are comma separated and that are non-null from a group. Will return null when there are non-null values. |
| `MAX`              | `SELECT MAX(column_name) FROM database.table WHERE condition`   | Returns largest value in a specified column.                                                                                                            |
| `MIN`              | `SELECT MIN(column_name) FROM database.table WHERE condition`   | Returns smallest value in a specified column.                                                                                                           |
| `SUM`              | `SUM(column_name)`                                              | Returns the sum of the numeric values provided.                                                                                                         |
| `ARRAY`\*          | `ARRAY(expression)`                                             | Returns a list of data as a field.                                                                                                                      |
| `DISTINCT_ARRAY`\* | `DISTINCT_ARRAY(expression)`                                    | When placed around a standard `ARRAY()` function, returns a distinct (deduplicated) results set.                                                        |

\*For more information on `ARRAY()` and `DISTINCT_ARRAY()` see [this blog](https://www.harperdb.io/post/sql-queries-to-complex-objects).

### Conversion

| Keyword   | Syntax                                          | Description                                                            |
| --------- | ----------------------------------------------- | ---------------------------------------------------------------------- |
| `CAST`    | `CAST(expression AS datatype(length))`          | Converts a value to a specified datatype.                              |
| `CONVERT` | `CONVERT(data_type(length), expression, style)` | Converts a value from one datatype to a different, specified datatype. |

### Date & Time

| Keyword             | Syntax                                  | Description                                                                                                                                                                                                                                                                           |
| ------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CURRENT_DATE`      | `CURRENT_DATE()`                        | Returns the current date in UTC in "YYYY-MM-DD" String format.                                                                                                                                                                                                                        |
| `CURRENT_TIME`      | `CURRENT_TIME()`                        | Returns the current time in UTC in "HH:mm:ss.SSS" string format.                                                                                                                                                                                                                      |
| `CURRENT_TIMESTAMP` | `CURRENT_TIMESTAMP`                     | Referencing this variable will evaluate as the current Unix Timestamp in milliseconds. For more information, go here.                                                                                                                                                                 |
| `DATE`              | `DATE([date_string])`                   | Formats and returns the date string argument in UTC in 'YYYY-MM-DDTHH:mm:ss.SSSZZ' string format. If a date string is not provided, the function will return the current UTC date/time value in the return format defined above. For more information, go here.                       |
| `DATE_ADD`          | `DATE_ADD(date, value, interval)`       | Adds the defined amount of time to the date provided in UTC and returns the resulting Unix Timestamp in milliseconds. Accepted interval values: Either string value (key or shorthand) can be passed as the interval argument. For more information, go here.                         |
| `DATE_DIFF`         | `DATE_DIFF(date_1, date_2[, interval])` | Returns the difference between the two date values passed based on the interval as a Number. If an interval is not provided, the function will return the difference value in milliseconds. For more information, go here.                                                            |
| `DATE_FORMAT`       | `DATE_FORMAT(date, format)`             | Formats and returns a date value in the String format provided. Find more details on accepted format values in the moment.js docs. For more information, go here.                                                                                                                     |
| `DATE_SUB`          | `DATE_SUB(date, format)`                | Subtracts the defined amount of time from the date provided in UTC and returns the resulting Unix Timestamp in milliseconds. Accepted date_sub interval values- Either string value (key or shorthand) can be passed as the interval argument. For more information, go here.         |
| `DAY`               | `DAY(date)`                             | Return the day of the month for the given date.                                                                                                                                                                                                                                       |
| `DAYOFWEEK`         | `DAYOFWEEK(date)`                       | Returns the numeric value of the weekday of the date given("YYYY-MM-DD").NOTE: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, and 6=Saturday.                                                                                                                      |
| `EXTRACT`           | `EXTRACT(date, date_part)`              | Extracts and returns the date part requested as a String value. Accepted date_part values below show value returned for date = "2020-03-26T15:13:02.041+000" For more information, go here.                                                                                           |
| `GETDATE`           | `GETDATE()`                             | Returns the current Unix Timestamp in milliseconds.                                                                                                                                                                                                                                   |
| `GET_SERVER_TIME`   | `GET_SERVER_TIME()`                     | Returns the current date/time value based on the server's timezone in `YYYY-MM-DDTHH:mm:ss.SSSZZ` String format.                                                                                                                                                                      |
| `OFFSET_UTC`        | `OFFSET_UTC(date, offset)`              | Returns the UTC date time value with the offset provided included in the return String value formatted as `YYYY-MM-DDTHH:mm:ss.SSSZZ`. The offset argument will be added as minutes unless the value is less than 16 and greater than -16, in which case it will be treated as hours. |
| `NOW`               | `NOW()`                                 | Returns the current Unix Timestamp in milliseconds.                                                                                                                                                                                                                                   |
| `HOUR`              | `HOUR(datetime)`                        | Returns the hour part of a given date in range of 0 to 838.                                                                                                                                                                                                                           |
| `MINUTE`            | `MINUTE(datetime)`                      | Returns the minute part of a time/datetime in range of 0 to 59.                                                                                                                                                                                                                       |
| `MONTH`             | `MONTH(date)`                           | Returns month part for a specified date in range of 1 to 12.                                                                                                                                                                                                                          |
| `SECOND`            | `SECOND(datetime)`                      | Returns the seconds part of a time/datetime in range of 0 to 59.                                                                                                                                                                                                                      |
| `YEAR`              | `YEAR(date)`                            | Returns the year part for a specified date.                                                                                                                                                                                                                                           |

### Logical

| Keyword  | Syntax                                          | Description                                                                                |
| -------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `IF`     | `IF(condition, value_if_true, value_if_false)`  | Returns a value if the condition is true, or another value if the condition is false.      |
| `IIF`    | `IIF(condition, value_if_true, value_if_false)` | Returns a value if the condition is true, or another value if the condition is false.      |
| `IFNULL` | `IFNULL(expression, alt_value)`                 | Returns a specified value if the expression is null.                                       |
| `NULLIF` | `NULLIF(expression_1, expression_2)`            | Returns null if expression_1 is equal to expression_2, if not equal, returns expression_1. |

### Mathematical

| Keyword  | Syntax                          | Description                                                                                         |
| -------- | ------------------------------- | --------------------------------------------------------------------------------------------------- |
| `ABS`    | `ABS(expression)`               | Returns the absolute value of a given numeric expression.                                           |
| `CEIL`   | `CEIL(number)`                  | Returns integer ceiling, the smallest integer value that is bigger than or equal to a given number. |
| `EXP`    | `EXP(number)`                   | Returns e to the power of a specified number.                                                       |
| `FLOOR`  | `FLOOR(number)`                 | Returns the largest integer value that is smaller than, or equal to, a given number.                |
| `RANDOM` | `RANDOM(seed)`                  | Returns a pseudo random number.                                                                     |
| `ROUND`  | `ROUND(number, decimal_places)` | Rounds a given number to a specified number of decimal places.                                      |
| `SQRT`   | `SQRT(expression)`              | Returns the square root of an expression.                                                           |

### String

| Keyword       | Syntax                                                                           | Description                                                                                                                                                              |
| ------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `CONCAT`      | `CONCAT(string_1, string_2, ...., string_n)`                                     | Concatenates, or joins, two or more strings together, resulting in a single string.                                                                                      |
| `CONCAT_WS`   | `CONCAT_WS(separator, string_1, string_2, ...., string_n)`                       | Concatenates, or joins, two or more strings together with a separator, resulting in a single string.                                                                     |
| `INSTR`       | `INSTR(string_1, string_2)`                                                      | Returns the first position, as an integer, of string_2 within string_1.                                                                                                  |
| `LEN`         | `LEN(string)`                                                                    | Returns the length of a string.                                                                                                                                          |
| `LOWER`       | `LOWER(string)`                                                                  | Converts a string to lower-case.                                                                                                                                         |
| `REGEXP`      | `SELECT column_name FROM database.table WHERE column_name REGEXP pattern`        | Searches column for matching string against a given regular expression pattern, provided as a string, and returns all matches. If no matches are found, it returns null. |
| `REGEXP_LIKE` | `SELECT column_name FROM database.table WHERE REGEXP_LIKE(column_name, pattern)` | Searches column for matching string against a given regular expression pattern, provided as a string, and returns all matches. If no matches are found, it returns null. |
| `REPLACE`     | `REPLACE(string, old_string, new_string)`                                        | Replaces all instances of old_string within new_string, with string.                                                                                                     |
| `SUBSTRING`   | `SUBSTRING(string, string_position, length_of_substring)`                        | Extracts a specified amount of characters from a string.                                                                                                                 |
| `TRIM`        | `TRIM([character(s) FROM] string)`                                               | Removes leading and trailing spaces, or specified character(s), from a string.                                                                                           |
| `UPPER`       | `UPPER(string)`                                                                  | Converts a string to upper-case.                                                                                                                                         |

## Operators

### Logical Operators

| Keyword   | Syntax                                                                                    | Description                                                               |
| --------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `BETWEEN` | `SELECT column_name(s) FROM database.table WHERE column_name BETWEEN value_1 AND value_2` | (inclusive) Returns values(numbers, text, or dates) within a given range. |
| `IN`      | `SELECT column_name(s) FROM database.table WHERE column_name IN(value(s))`                | Used to specify multiple values in a WHERE clause.                        |
| `LIKE`    | `SELECT column_name(s) FROM database.table WHERE column_n LIKE pattern`                   | Searches for a specified pattern within a WHERE clause.                   |

## Queries

### General

| Keyword    | Syntax                                                                                                                       | Description                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `DISTINCT` | `SELECT DISTINCT column_name(s) FROM database.table`                                                                         | Returns only unique values, eliminating duplicate records.                          |
| `FROM`     | `FROM database.table`                                                                                                        | Used to list the database(s), table(s), and any joins required for a SQL statement. |
| `GROUP BY` | `SELECT column_name(s) FROM database.table WHERE condition GROUP BY column_name(s) ORDER BY column_name(s)`                  | Groups rows that have the same values into summary rows.                            |
| `HAVING`   | `SELECT column_name(s) FROM database.table WHERE condition GROUP BY column_name(s) HAVING condition ORDER BY column_name(s)` | Filters data based on a group or aggregate function.                                |
| `SELECT`   | `SELECT column_name(s) FROM database.table`                                                                                  | Selects data from table.                                                            |
| `WHERE`    | `SELECT column_name(s) FROM database.table WHERE condition`                                                                  | Extracts records based on a defined condition.                                      |

### Joins

| Keyword              | Syntax                                                                                                                                      | Description                                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CROSS JOIN`         | `SELECT column_name(s) FROM database.table_1 CROSS JOIN database.table_2`                                                                   | Returns a paired combination of each row from `table_1` with row from `table_2`. Note: CROSS JOIN can return very large result sets and is generally considered bad practice. |
| `FULL OUTER`         | `SELECT column_name(s) FROM database.table_1 FULL OUTER JOIN database.table_2 ON table_1.column_name = table_2.column_name WHERE condition` | Returns all records when there is a match in either `table_1` (left table) or `table_2` (right table).                                                                        |
| `[INNER] JOIN`       | `SELECT column_name(s) FROM database.table_1 INNER JOIN database.table_2 ON table_1.column_name = table_2.column_name`                      | Return only matching records from `table_1` (left table) and `table_2` (right table). The INNER keyword is optional and does not affect the result.                           |
| `LEFT [OUTER] JOIN`  | `SELECT column_name(s) FROM database.table_1 LEFT OUTER JOIN database.table_2 ON table_1.column_name = table_2.column_name`                 | Return all records from `table_1` (left table) and matching data from `table_2` (right table). The OUTER keyword is optional and does not affect the result.                  |
| `RIGHT [OUTER] JOIN` | `SELECT column_name(s) FROM database.table_1 RIGHT OUTER JOIN database.table_2 ON table_1.column_name = table_2.column_name`                | Return all records from `table_2` (right table) and matching data from `table_1` (left table). The OUTER keyword is optional and does not affect the result.                  |

### Predicates

| Keyword       | Syntax                                                                    | Description                |
| ------------- | ------------------------------------------------------------------------- | -------------------------- |
| `IS NOT NULL` | `SELECT column_name(s) FROM database.table WHERE column_name IS NOT NULL` | Tests for non-null values. |
| `IS NULL`     | `SELECT column_name(s) FROM database.table WHERE column_name IS NULL`     | Tests for null values.     |

### Statements

| Keyword  | Syntax                                                                                   | Description                         |
| -------- | ---------------------------------------------------------------------------------------- | ----------------------------------- |
| `DELETE` | `DELETE FROM database.table WHERE condition`                                             | Deletes existing data from a table. |
| `INSERT` | `INSERT INTO database.table(column_name(s)) VALUES(value(s))`                            | Inserts new records into a table.   |
| `UPDATE` | `UPDATE database.table SET column_1 = value_1, column_2 = value_2, .... WHERE condition` | Alters existing records in a table. |
