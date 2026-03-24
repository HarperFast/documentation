---
title: Storage Algorithm
---

<!-- Source: versioned_docs/version-4.7/reference/storage-algorithm.md (primary) -->
<!-- Source: release-notes/v4-tucker/4.3.0.md (storage performance improvements, compression by default, compact) -->

# Storage Algorithm

Harper's storage algorithm is the foundation of all database functionality. It is built on top of [LMDB](https://www.symas.com/lmdb) (Lightning Memory-Mapped Database), a high-performance key-value store, and extends it with automatic indexing, query-language-agnostic data access, and ACID compliance.

## Query Language Agnostic

Harper's storage layer is decoupled from any specific query language. Data inserted via NoSQL operations can be read via SQL, REST, or the Resource API — all accessing the same underlying storage. This architecture allows Harper to add new query interfaces without changing how data is stored.

## ACID Compliance

Harper provides full ACID compliance on each node using Multi-Version Concurrency Control (MVCC) through LMDB:

- **Atomicity**: All writes in a transaction either fully commit or fully roll back
- **Consistency**: Each transaction moves data from one valid state to another
- **Isolation**: Readers and writers operate independently — readers do not block writers and writers do not block readers
- **Durability**: Committed transactions are persisted to disk

Each Harper table has a single writer process, eliminating deadlocks and ensuring writes are executed in the order received. Multiple reader processes can operate concurrently for high-throughput reads.

## Universally Indexed

Changed in: v4.3.0 — Storage performance improvements including better free-space management

For [dynamic schema tables](./overview.md#dynamic-vs-defined-schemas), all top-level attributes are automatically indexed immediately upon ingestion — Harper reflexively creates the attribute and its index as new data arrives. For [schema-defined tables](./schema.md), indexes are created for all attributes marked with `@indexed`.

Indexes are type-agnostic, ordering values as follows:

1. Booleans
2. Numbers (ordered numerically)
3. Strings (ordered lexically)

### LMDB Storage Layout

Within the LMDB implementation, table records are grouped into a single LMDB environment file. Each attribute index is stored as a sub-database (`dbi`) within that environment.

## Compression

Changed in: v4.3.0 — Compression is now enabled by default for all records over 4KB

Harper compresses record data automatically for records over 4KB. Compression settings can be configured in the [storage configuration](TODO:reference_versioned_docs/version-v4/configuration/options.md 'storage configuration options'). Note that compression settings cannot be changed on existing databases without creating a new compacted copy — see [Compaction](./compaction.md).

## Performance Characteristics

Harper inherits the following performance properties from LMDB:

- **Memory-mapped I/O**: Data is accessed via memory mapping, enabling fast reads without data duplication between disk and memory
- **Buffer cache integration**: Fully exploits the OS buffer cache for reduced I/O
- **CPU cache optimization**: Built to maximize data locality within CPU caches
- **Deadlock-free writes**: Full serialization of writers guarantees write ordering without deadlocks
- **Zero-copy reads**: Readers access data directly from the memory map without copying

## Indexing Example

Given a table with records like this:

```
┌────┬────────┬────────┐
│ id │ field1 │ field2 │
├────┼────────┼────────┤
│  1 │ A      │ X      │
│  2 │ 25     │ X      │
│  3 │ -1     │ Y      │
│  4 │ A      │        │
│  5 │ true   │ 2      │
└────┴────────┴────────┘
```

Harper maintains three separate LMDB sub-databases for that table:

```
Table (LMDB environment file)
│
├── primary index: id
│   ┌─────┬──────────────────────────────────────┐
│   │ Key │ Value (full record)                  │
│   ├─────┼──────────────────────────────────────┤
│   │  1  │ { id:1, field1:"A",  field2:"X"    } │
│   │  2  │ { id:2, field1:25,   field2:"X"    } │
│   │  3  │ { id:3, field1:-1,   field2:"Y"    } │
│   │  4  │ { id:4, field1:"A"                 } │
│   │  5  │ { id:5, field1:true, field2:2      } │
│   └─────┴──────────────────────────────────────┘
│
├── secondary index: field1          secondary index: field2
│   ┌────────┬───────┐               ┌────────┬───────┐
│   │ Key    │ Value │               │ Key    │ Value │
│   ├────────┼───────┤               ├────────┼───────┤
│   │ -1     │  3    │               │  2     │  5    │
│   │  25    │  2    │               │  X     │  1    │
│   │  A     │  1    │               │  X     │  2    │
│   │  A     │  4    │               │  Y     │  3    │
│   │  true  │  5    │               └────────┴───────┘
│   └────────┴───────┘
```

Secondary indexes store the attribute value as the key and the record's primary key (`id`) as the value. To resolve a query result, Harper looks up the matching ids in the secondary index, then fetches the full records from the primary index.

Indexes are ordered — booleans first, then numbers (numerically), then strings (lexically) — enabling efficient range queries across all types.

## Related Documentation

- [Schema](./schema.md) — Defining indexed attributes and vector indexes
- [Compaction](./compaction.md) — Reclaiming free space and applying new storage configuration to existing databases
- [Configuration](TODO:reference_versioned_docs/version-v4/configuration/options.md 'storage section') — Storage configuration options (compression, memory maps, blob paths)
