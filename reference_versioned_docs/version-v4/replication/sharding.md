---
title: Sharding
---

<!-- Source: versioned_docs/version-4.7/developers/replication/sharding.md (primary) -->
<!-- Source: release-notes/v4-tucker/4.4.0.md (confirmed sharding introduction as provisional in v4.4.0) -->
<!-- Source: release-notes/v4-tucker/4.5.0.md (confirmed expanded sharding functionality in v4.5.0) -->

# Sharding

Added in: v4.4.0 (provisional)

Changed in: v4.5.0 — expanded sharding functionality: Harper now honors write requests with residency information that will not be stored on the local node, and nodes can be declaratively configured as part of a shard.

Harper's replication system supports sharding — storing different data across different subsets of nodes — while still allowing data to be accessed from any node in the cluster. This enables horizontal scalability for storage and write performance, while maintaining optimal data locality and consistency.

When sharding is configured, requests for records that don't reside on the handling node are automatically forwarded to the appropriate node transparently. Clients do not need to know where data is stored.

By default (without sharding), Harper replicates all data to all nodes.

## Approaches to Sharding

There are two main approaches:

**Dynamic sharding** — the location (residency) of records is determined dynamically based on where the record was written, the record's data, or a custom function. Records can be relocated dynamically based on where they are accessed. Residency information is specific to each record.

**Static sharding** — each node is assigned to a specific numbered shard, and each record is replicated to the nodes in that shard based on the primary key, regardless of where the data was written or accessed. More predictable than dynamic sharding: data location is always determinable from the primary key.

## Dynamic Sharding

### Replication Count

The simplest way to limit replication is to configure a replication count. Set `replicateTo` in the `replication` section of `harperdb-config.yaml` to specify how many additional nodes data should be replicated to:

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

Assign a node to a numbered shard in `harperdb-config.yaml`:

```yaml
replication:
  shard: 1
```

Or assign shards per route:

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

Once shards are configured, use `setResidency` or `setResidencyById` (described below) to assign records to specific shards.

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

Define a residency function based solely on the primary key. Records (including metadata) are only replicated to the specified nodes — metadata does not need to be replicated everywhere, which allows data to be retrieved without needing access to record data or metadata on the requesting node.

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

By default, sharding allows data stored on specific nodes to be accessed from any node — requests are forwarded transparently. To disable this and only return data if it is stored on the local node, set `replicateFrom` to `false`.

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

- [Replication Overview](./overview.md) — How Harper's replication system works
- [Clustering Operations](./clustering.md) — Operations API for managing cluster nodes
