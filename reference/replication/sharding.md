---
title: Sharding
---

<!-- Source: versioned_docs/version-4.7/developers/replication/sharding.md (primary) -->
<!-- Source: release-notes/v4-tucker/4.4.0.md (confirmed sharding introduction as provisional in v4.4.0) -->
<!-- Source: release-notes/v4-tucker/4.5.0.md (confirmed expanded sharding functionality in v4.5.0) -->

# Sharding

<VersionBadge version="v4.4.0" /> (provisional)

<VersionBadge type="changed" version="v4.5.0" /> — expanded sharding functionality: Harper now honors write requests with residency information that will not be stored on the local node, and nodes can be declaratively configured as part of a shard.

Harper's replication system supports sharding — storing different data across different subsets of nodes — while still allowing data to be accessed from any node in the cluster. This enables horizontal scalability for storage and write performance, while maintaining optimal data locality and consistency.

A key read for a record not held locally can fetch its body from an owner. This does not provide cross-shard query fan-out or write forwarding. With [declarative residency](./residency.md#ownership-reads-and-writes), a non-owner write commits locally and replicates the complete body to its owners through the configured replication routes.

By default (without sharding), Harper replicates all data to all nodes.

## Approaches to Sharding

There are two main approaches:

**Dynamic sharding** — the location (residency) of records is determined dynamically based on where the record was written, the record's data, or a custom function. Records can be relocated dynamically based on where they are accessed. Residency information is specific to each record.

**Static sharding** — each node is assigned to a specific numbered shard, and each record is replicated to the nodes in that shard based on the primary key, regardless of where the data was written or accessed. More predictable than dynamic sharding: data location is always determinable from the primary key.

## Dynamic Sharding

### Replication Count

The simplest way to limit replication is to configure a replication count. Set `replicateTo` in the `replication` section of `harper-config.yaml` to specify how many additional nodes data should be replicated to:

```yaml
replication:
  replicateTo: 2
```

This ensures each record is stored on three nodes total (the node that first stored it, plus two others).

### Replication Control via REST Header

With the REST interface, you can specify replication targets and confirmation requirements per request using the `X-Replicate-To` header:

```http
PUT /MyTable/3
X-Replicate-To: 2;confirm=1
```

- `2` — replicate to two additional nodes
- `confirm=1` — wait for confirmation from one additional node before responding

Specify exact destination nodes by hostname:

```http
PUT /MyTable/3
X-Replicate-To: node1,node2
```

The `confirm` parameter can be combined with explicit node lists.

### Replication Control via Operations API

Specify `replicateTo` and `replicatedConfirmation` in the operation body:

```json
{
	"operation": "update",
	"schema": "dev",
	"table": "MyTable",
	"hashValues": [3],
	"record": {
		"name": "John Doe"
	},
	"replicateTo": 2,
	"replicatedConfirmation": 1
}
```

Or specify explicit nodes:

```jsonc
{
	// ...
	"replicateTo": ["node-1", "node-2"],
	// ...
}
```

### Programmatic Replication Control

Set `replicateTo` and `replicatedConfirmation` programmatically in a resource method:

```javascript
class MyTable extends tables.MyTable {
	put(record) {
		const context = this.getContext();
		context.replicateTo = 2; // or an array of node names
		context.replicatedConfirmation = 1;
		return super.put(record);
	}
}
```

## Static Sharding

### Basic Static Shard Configuration

Assign a node to a numbered shard in `harper-config.yaml`:

```yaml
replication:
  shard: 1
```

### Complete shard-id set

<VersionBadge version="v5.4.0" />

For the first default map of a new [declarative residency](./residency.md) table, configure `replication.shards` next to `replication.shard`:

```yaml
replication:
  shard: 0
  shards: [0, 1]
```

`replication.shards` is the complete set of shard IDs available to the deployment: unique integers from `0` through `65535`. Every node uses the same set; order does not matter. Its own `replication.shard` must be in the list.

The list is required only for a database that has declarative tables and no installed slot map. First activation computes the default map solely from the slot count and the sorted list and installs it as a versioned snapshot. Concurrent installers with equal inputs produce the same snapshot and digest. A database converted with a custom map does not need the list.

Once installed, the snapshot is authoritative. Changing the list never recomputes placement. Adding an ID only makes that shard available for future reassignment; it moves no records.

Setup exchanges include a digest of the list. Nodes with different lists refuse declarative writes on both sides, even after a map is installed. A configured list on one peer and no list on another also differs. A node whose own shard is outside its list, or which needs an initial map but has no list, also refuses placement. The condition appears in `cluster_status.residency` and is logged once. Plan for this write refusal during a rolling list change.

### Other shard configuration

Shards can also be assigned per route:

```yaml
replication:
  routes:
    - hostname: node1
      shard: 1
    - hostname: node2
      shard: 2
```

Or dynamically via the operations API by including `shard` in an `add_node` or `set_node` operation:

```json
{
	"operation": "add_node",
	"hostname": "node1",
	"shard": 1
}
```

Once shards are configured, use [declarative residency](./residency.md) for a schema policy applied on every thread, or the function APIs below for legacy application-controlled placement.

## Custom Sharding

### By Record Content (`setResidency`)

Define a custom residency function that is called with the full record. Return an array of node hostnames or a shard number.

With this approach, record metadata (including residency information) and indexed properties are replicated to all nodes, but the full record is only stored on the specified nodes.

Return node hostnames:

```javascript
MyTable.setResidency((record) => {
	return record.id % 2 === 0 ? ['node1'] : ['node2'];
});
```

Return a shard number (replicates to all nodes in that shard):

```javascript
MyTable.setResidency((record) => {
	return record.id % 2 === 0 ? 1 : 2;
});
```

### By Primary Key Only (`setResidencyById`)

Define a residency function based solely on the primary key. Records (including metadata) are only replicated to the specified nodes — metadata does not need to be replicated everywhere, which allows data to be retrieved without needing access to record data or metadata on the requesting node. This does not hold with [dedicated replication threads](./overview.md#dedicated-replication-threads) (`replication.threads` above `0`), which do not run the residency function.

Return a shard number:

```javascript
MyTable.setResidencyById((id) => {
	return id % 2 === 0 ? 1 : 2;
});
```

Return node hostnames:

```javascript
MyTable.setResidencyById((id) => {
	return id % 2 === 0 ? ['node1'] : ['node2'];
});
```

## Disabling Cross-Node Access

By default, a read for a record not stored locally fetches it from a node that holds it. To disable this and only return data if it is stored on the local node, set `replicateFrom` to `false`.

Via the operations API:

```json
{
	"operation": "search_by_id",
	"table": "MyTable",
	"ids": [3],
	"replicateFrom": false
}
```

Via the REST API:

```http
GET /MyTable/3
X-Replicate-From: none
```

## See Also

- [Declarative Residency](./residency.md)

- [Replication Overview](./overview.md) — How Harper's replication system works
- [Clustering Operations](./clustering.md) — Operations API for managing cluster nodes
