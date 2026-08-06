---
title: Compaction
---

<!-- Source: versioned_docs/version-4.7/administration/compact.md (primary) -->
<!-- Source: release-notes/v4-tucker/4.3.0.md (compact database functionality added) -->

# Compaction

<VersionBadge version="v4.3.0" />

Database files grow over time as records are inserted, updated, and deleted. Deleted records and updated values leave behind free space (fragmentation) in the database file, which can increase file size and potentially affect performance. Compaction eliminates this free space, creating a smaller, contiguous database file.

> **Note:** Compaction does not compress your data. It removes internal fragmentation to make the file smaller. To enable compression on a database, use compaction to copy the database with updated storage configuration applied.

Compaction is also the mechanism to apply storage configuration changes (such as enabling compression) to existing databases, since some storage settings cannot be changed in-place.

## Copy Compaction

Creates a compacted copy of a database file. The original database is left unchanged.

> **Recommendation:** Stop Harper before performing copy compaction to prevent any record loss during the copy operation.

Run using the [CLI](../cli/commands.md):

```bash
harper copy-db <source-database> <target-database-path>
```

The `source-database` is the database name (not a file path). The target is the full file path where the compacted copy will be written, and it must not already exist — `copy-db` refuses to write into an existing file rather than merging the copy into whatever it holds.

To replace the original database with the compacted copy, move or rename the output file to the original database path after Harper is stopped.

**Example — compact the default `data` database:**

```bash
harper copy-db data /home/user/hdb/database/copy.mdb
```

Copy compaction applies to LMDB databases. RocksDB databases compact themselves and are skipped.

### File-backed blobs travel separately

A database's file-backed blob values (`Blob` and large `Bytes` attributes) are not stored inside the database file. They live in the configured blob roots — `storage.blobPaths[n]`, or `<rootPath>/blobs/<database>` when `blobPaths` is not configured — and are addressed by **database name**, not by the path of the database file.

`copy-db` therefore writes them alongside the copy:

```
<target-database-path>-blobs/<rootIndex>/…
```

`<rootIndex>` is the position of the source root in the database's blob-root list, preserved so a multi-root database restores each root to its original slot. A `README.md` in that directory records the mapping.

**The copy is not restorable without this directory.** To restore the copy under a database name, put each `<rootIndex>` tree into that name's matching blob root — for example, restoring the copy above as a database named `archive` with no `storage.blobPaths` configured:

```bash
cp -r /home/user/hdb/database/copy.mdb /home/user/hdb/database/archive.mdb
cp -r /home/user/hdb/database/copy.mdb-blobs/0/. /home/user/hdb/blobs/archive/
```

Restoring the copy under its original database name in the same installation needs only the database file, since the blob roots it already references are untouched.

## Compact on Start

Automatically compacts all non-system databases when Harper starts. Harper will not start until compaction is complete. Under the hood, it loops through all user databases, creates a backup of each, compacts it, replaces the original with the compacted copy, and removes the backup.

Configure in `harper-config.yaml`:

```yaml
storage:
  compactOnStart: true
  compactOnStartKeepBackup: false
```

Using CLI environment variables:

```bash
STORAGE_COMPACTONSTART=true STORAGE_COMPACTONSTARTKEEPBACKUP=true harper
```

### Options

| Option                     | Type    | Default | Description                                                                     |
| -------------------------- | ------- | ------- | ------------------------------------------------------------------------------- |
| `compactOnStart`           | Boolean | `false` | Compact all databases at startup. Automatically reset to `false` after running. |
| `compactOnStartKeepBackup` | Boolean | `false` | Retain the backup copy created during compact on start                          |

> **Note:** `compactOnStart` is automatically set back to `false` after it runs, so compaction only happens on the next start if you explicitly re-enable it.

## Related Documentation

- [Storage Algorithm](./storage-algorithm.md) — How Harper stores data using LMDB
- [CLI Commands](../cli/commands.md) — `copy-db` CLI command reference
- [Configuration](../configuration/options.md) — Full storage configuration options including compression settings
