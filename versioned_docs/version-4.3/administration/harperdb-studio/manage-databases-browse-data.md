---
title: Manage Databases / Browse Data
---

# Manage Databases / Browse Data

Manage instance databases/tables and browse data in tabular format with the following instructions:

1. Navigate to the HarperDB Studio Organizations page.
2. Click the appropriate organization that the instance belongs to.
3. Select your desired instance.
4. Click **browse** in the instance control bar.

Once on the instance browse page you can view data, manage databases and tables, add new data, and more.

## Manage Databases and Tables

#### Create a Database

1. Click the plus icon at the top right of the databases section.
2. Enter the database name.
3. Click the green check mark.

#### Delete a Database

Deleting a database is permanent and irreversible. Deleting a database removes all tables and data within it.

1. Click the minus icon at the top right of the databases section.
2. Identify the appropriate database to delete and click the red minus sign in the same row.
3. Click the red check mark to confirm deletion.

#### Create a Table

1. Select the desired database from the databases section.
2. Click the plus icon at the top right of the tables section.
3. Enter the table name.
4. Enter the primary key.

   _The primary key is also often referred to as the hash attribute in the studio, and it defines the unique identifier for each row in your table._

5. Click the green check mark.

#### Delete a Table

Deleting a table is permanent and irreversible. Deleting a table removes all data within it.

1. Select the desired database from the databases section.
2. Click the minus icon at the top right of the tables section.
3. Identify the appropriate table to delete and click the red minus sign in the same row.
4. Click the red check mark to confirm deletion.

## Manage Table Data

The following section assumes you have selected the appropriate table from the database/table browser.

#### Filter Table Data

1. Click the magnifying glass icon at the top right of the table browser.
2. This expands the search filters.
3. The results will be filtered appropriately.

#### Load CSV Data

1. Click the data icon at the top right of the table browser. You will be directed to the CSV upload page where you can choose to import a CSV by URL or upload a CSV file.
2. To import a CSV by URL:
   1. Enter the URL in the **CSV file URL** textbox.
   2. Click **Import From URL**.
   3. The CSV will load, and you will be redirected back to browse table data.
3. To upload a CSV file:
   1. Click **Click or Drag to select a .csv file** (or drag your CSV file from your file browser).
   2. Navigate to your desired CSV file and select it.
   3. Click **Insert X Records**, where X is the number of records in your CSV.
   4. The CSV will load, and you will be redirected back to browse table data.

#### Add a Record

1. Click the plus icon at the top right of the table browser.
2. The Studio will pre-populate existing table attributes in JSON format.

   _The primary key is not included, but you can add it in and set it to your desired value. Auto-maintained fields are not included and cannot be manually set. You may enter a JSON array to insert multiple records in a single transaction._

3. Enter values to be added to the record.

   _You may add new attributes to the JSON; they will be reflexively added to the table._

4. Click the **Add New** button.

#### Edit a Record

1. Click the record/row you would like to edit.
2. Modify the desired values.

   _You may add new attributes to the JSON; they will be reflexively added to the table._

3. Click the **save icon**.

#### Delete a Record

Deleting a record is permanent and irreversible. If transaction logging is turned on, the delete transaction will be recorded as well as the data that was deleted.

1. Click the record/row you would like to delete.
2. Click the **delete icon**.
3. Confirm deletion by clicking the **check icon**.

## Browse Table Data

The following section assumes you have selected the appropriate table from the database/table browser.

#### Browse Table Data

The first page of table data is automatically loaded on table selection. Paging controls are at the bottom of the table. Here you can:

- Page left and right using the arrows.
- Type in the desired page.
- Change the page size (the amount of records displayed in the table).

#### Refresh Table Data

Click the refresh icon at the top right of the table browser.

#### Automatically Refresh Table Data

Toggle the auto switch at the top right of the table browser. The table data will now automatically refresh every 15 seconds. Filters and pages will remain set for refreshed data.
