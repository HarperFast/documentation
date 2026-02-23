<!-- Source: versioned_docs/version-4.7/administration/harper-studio/query-instance-data.md (primary) -->

---
title: Query Instance Data
---

# Query Instance Data

SQL queries can be executed directly through the Harper Studio with the following instructions:

1. Navigate to the [Harper Studio Organizations](https://studio.harperdb.io/organizations) page.
1. Click the appropriate organization that the instance belongs to.
1. Select your desired instance.
1. Click **query** in the instance control bar.
1. Enter your SQL query in the SQL query window.
1. Click **Execute**.

_Please note, the Studio will execute the query exactly as entered. For example, if you attempt to `SELECT *` from a table with millions of rows, you will most likely crash your browser._

## Browse Query Results Set

#### Browse Results Set Data

The first page of results set data is automatically loaded on query execution. Paging controls are at the bottom of the table. Here you can:

- Page left and right using the arrows.
- Type in the desired page.
- Change the page size (the amount of records displayed in the table).

#### Refresh Results Set

Click the refresh icon at the top right of the results set table.

#### Automatically Refresh Results Set

Toggle the auto switch at the top right of the results set table. The results set will now automatically refresh every 15 seconds. Filters and pages will remain set for refreshed data.

## Query History

Query history is stored in your local browser cache. Executed queries are listed with the most recent at the top in the **query history** section.

#### Rerun Previous Query

- Identify the query from the **query history** list.
- Click the appropriate query. It will be loaded into the **sql query** input box.
- Click **Execute**.

#### Clear Query History

Click the trash can icon at the top right of the **query history** section.

## Create Charts

The Harper Studio includes a charting feature where you can build charts based on your specified queries. Visit the Charts documentation for more information.
