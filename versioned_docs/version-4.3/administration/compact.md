---
title: Compact a database
---

# Compact a database

Database files can grow quickly as you use them, sometimes impeding performance.
HarperDB has multiple compact features that can be used to reduce database file size and potentially improve performance.
The compact process does not compress your data, it instead makes your database file smaller by eliminating free-space and fragmentation.

There are two options that HarperDB offers for compacting a Database.

_Note: Some of the storage configuration (such as compression) cannot be updated on existing databases,
this is where the following options are useful. They will create a new compressed copy of the database with any updated configuration._

More information on the storage configuration options can be [found here](../deployments/configuration#storage)

### Copy compaction

It is recommended that, to prevent any record loss, HarperDB is not running when performing this operation.

This will copy a HarperDB database with compaction. If you wish to use this new database in place of the original,
you will need to move/rename it to the path of the original database.

This command should be run in the [CLI](../deployments/harperdb-cli)

```bash
harperdb copy-db <source-database> <target-database-path>
```

For example, to copy the default database:

```bash
harperdb copy-db data /home/user/hdb/database/copy.mdb
```

### Compact on start

Compact on start is a more automated option that will compact **all** databases when HarperDB is started. HarperDB will
not start until compact is complete. Under the hood it loops through all non-system databases,
creates a backup of each one and calls copy-db. After the copy/compaction is complete it will move the new database
to where the original one is located and remove any backups.

Compact on start is initiated by config in harperdb-config.yaml

_Note: Compact on start will switch `compactOnStart` to `false` after it has run_

`compactOnStart` - _Type_: boolean; _Default_: false

`compactOnStartKeepBackup` - _Type_: boolean; _Default_: false

```yaml
storage:
  compactOnStart: true
  compactOnStartKeepBackup: false
```

Using CLI variables

```bash
--STORAGE_COMPACTONSTART true --STORAGE_COMPACTONSTARTKEEPBACKUP true
```

```bash
STORAGE_COMPACTONSTART=true
STORAGE_COMPACTONSTARTKEEPBACKUP=true
```
