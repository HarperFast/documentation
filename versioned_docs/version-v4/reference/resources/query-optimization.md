---
title: Query Optimization
---

## Query Optimization

Harper has powerful query functionality with excellent performance characteristics. However, like any database, different queries can vary significantly in performance. It is important to understand how querying works to help you optimize your queries for the best performance.

### Query Execution

At a fundamental level, querying involves defining conditions to find matching data and then executing those conditions against the database and delivering the results based on required fields, relationships, and ordering. Harper supports indexed fields, and these indexes are used to speed up query execution. When conditions are specified in a query, Harper will attempt to utilize indexes to optimize the speed of query execution. When a field is not indexed, a query specifies a condition on that field, and the database check each potential record to determine if it matches the condition.

When a query is performed with multiple conditions, Harper will attempt to optimize the ordering of these conditions. When using intersecting conditions (the default, an `and` operator, matching records must all match all conditions), Harper will attempt to to apply the most selective and performant condition first. This means that if one condition can use an index and is more selective than another, it will be used first to find the initial matching set of data and then filter based on the remaining conditions. If a condition can search an indexed field, with a selective condition, it will be used before conditions that aren't indexed, or as selective. The `search` method includes an `explain` flag that can be used to return a query execution order to understand how the query is being executed. This can be useful for debugging and optimizing queries.

For a union query, each condition is executed separately and the results are combined/merged.

### Condition, Operators, and Indexing

When a query is performed, the conditions specified in the query are evaluated against the data in the database. The conditions can be simple or complex, and can include scalar operators such as `=`, `!=`, `>`, `<`, `>=`, `<=`, as well as `starts_with`, `contains`, and `ends_with`. The use of these operators can affect the performance of the query, especially when used with indexed fields. If an indexed field is not used, the database will have to check each potential record to determine if it matches the condition. If the only condition is not indexed, or there are no conditions with an indexed field, the database will have to check every record with a full table scan and can be very slow for large datasets (it will get slower as the dataset grows, `O(n)`).

The use of indexed fields can significantly improve the performance of a query, providing fast performance even as the database grows in size (`O(log n)`). However, indexed fields require extra writes to the database when performing insert, update, or delete operations. This is because the index must be updated to reflect the changes in the data. This can slow down write operations, but the trade-off is often worth it if the field is frequently used in queries.

The different operators can also affect the performance of a query. For example, using the `=` operator on an indexed field is generally faster than using the `!=` operator, as the latter requires checking all records that do not match the condition. An index is a sorted listed of values, so the greater than and less than operators will also utilize indexed fields when possible. If the range is narrow, these operations can be very fast. A wide range could yield a large number of records and will naturally incur more overhead. The `starts_with` operator can also leverage indexed fields because it quickly find the correct matching entries in the sorted index. On other hand, the `contains` and `ends_with` and not equal (`!=` or `not_equal`) operators can not leverage the indexes, so they will require a full table scan to find the matching records if they are not used in conjunction in with a selective/indexed condition. There is a special case of `!= null` which can use indexes to find non-null records. However, there is generally only helpful for sparse fields where a small subset are non-null values. More generally, operators are more efficient if they are selecting on fields with a high cardinality.

Conditions can be applied to primary key fields or other indexed fields (known as secondary indexes). In general, querying on a primary key will be faster than querying on a secondary index, as the primary key is the most efficient way to access data in the database, and doesn't require cross-referencing to the main records.

### Relationships/Joins

Harper supports relationships between tables, allowing for "join" queries that. This does result in more complex queries with potentially larger performance overhead, as more lookups are necessary to connect matched or selected data with other tables. Similar principles apply to conditions which use relationships. Indexed fields and comparators that leverage the ordering are still valuable for performance. It is also important that if a condition on a table is connected to another table's foreign key, that that foreign key also be indexed. Likewise, if a query `select`s data from a related table that uses a foreign key to relate, that it is indexed. The same principles of higher cardinality applies here as well, more unique values allow for efficient lookups.

### Sorting

Queries can also specify a sort order. This can also significantly impact performance. If a query specifies a sort order on an indexed field, the database can use the index to quickly retrieve the data in the specified order. A sort order can be used in conjunction with a condition on the same (indexed) field can utilize the index for ordering. However, if the sort order is not on an indexed field, or the query specifies conditions on different fields, Harper will generally need to sort the data after retrieving it, which can be slow for large datasets. The same principles apply to sorting as they do to conditions. Sorting on a primary key is generally faster than sorting on a secondary index, if the condition aligns with the sort order.

### Streaming

One of the unique and powerful features of Harper's querying functionality is the ability to stream query results. When possible, Harper can return records from a query as they are found, rather than waiting for the entire query to complete. This can significantly improve performance for large queries, as it allows the application to start processing results or sending the initial data before the entire query is complete (improving time-to-first-byte speed, for example). However, using a sort order on a query with conditions that are not on an aligned index requires that the entire query result be loaded in order to perform the sorting, which defeats the streaming benefits.
