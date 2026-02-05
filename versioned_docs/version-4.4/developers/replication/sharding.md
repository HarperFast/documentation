---
title: Sharding
---

Harper's replication system supports various levels of replication or sharding. Harper can be configured or set up to replicate to different data to different subsets of nodes. This can be used facilitate horizontally scalability of storage and write performance, while maintaining optimal strategies of data locality and data consistency. When sharding is configured, Harper will replicate data to only a subset of nodes, based on the sharding configuration, and can then retrieve data from the appropriate nodes as needed to fulfill requests for data.

## Configuration

By default, Harper will replicate all data to all nodes. However, replication can easily be configured for "sharding", or storing different data in different locations or nodes. The simplest way to configure sharding and limit replication to improve performance and efficiency is to configure a replication-to count. This will limit the number of nodes that data is replicated to. For example, to specify that writes should replicate to 2 other nodes besides the node that first stored the data, you can set the `replicateTo` to 2 in the `replication` section of the `harperdb-config.yaml` file:

```yaml
replication:
  replicateTo: 2
```

This will ensure that data is replicated to two other nodes, so that each record will be stored on three nodes in total.

With a sharding configuration (or customization below) in place, requests will for records that don't reside on the server handling requests will automatically be forwarded to the appropriate node. This will be done transparently, so that the client will not need to know where the data is stored.

## Replication Control with Headers

With the REST interface, replication levels and destinations can also specified with the `X-Replicate-To` header. This can be used to indicate the number of additional nodes that data should be replicated to, or to specify the nodes that data should be replicated to. The `X-Replicate-To` header can be used with the `POST` and `PUT` methods. This header can also specify if the response should wait for confirmation from other nodes, and how many, with the `confirm` parameter. For example, to specify that data should be replicated to two other nodes, and the response should be returned once confirmation is received from one other node, you can use the following header:

```http
PUT /MyTable/3
X-Replicate-To: 2;confirm=1

...
```

You can also explicitly specify destination nodes by providing a comma-separated list of node hostnames. For example, to specify that data should be replicated to nodes `node1` and `node2`, you can use the following header:

```http
PUT /MyTable/3
X-Replicate-To: node1,node2
```

(This can also be used with the `confirm` parameter.)

## Replication Control with Operations

Likewise, you can specify replicateTo and confirm parameters in the operation object when using the Harper API. For example, to specify that data should be replicated to two other nodes, and the response should be returned once confirmation is received from one other node, you can use the following operation object:

```jsonc
{
	"operation": "update",
	"schema": "dev",
	"table": "MyTable",
	"hashValues": [3],
	"record": {
		"name": "John Doe",
	},
	"replicateTo": 2,
	"replicatedConfirmation": 1,
}
```

or you can specify nodes:

```jsonc
{
	// ...
	"replicateTo": ["node-1", "node-2"],
	// ...
}
```

## Programmatic Replication Control

Additionally, you can specify `replicateTo` and `replicatedConfirmation` parameters programmatically in the context of a resource. For example, you can define a put method:

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

## Custom Sharding

You can also define a custom sharding strategy by specifying a function to compute the "residency" or location of where records should be stored and reside. To do this we use the `setResidency` method, providing a function that will determine the residency of each record. The function you provide will be called with the record entry, and should return an array of nodes that the record should be replicated to (using their hostname). For example, to shard records based on the value of the `id` field, you can use the following code:

```javascript
MyTable.setResidency((record) => {
	return record.id % 2 === 0 ? ['node1'] : ['node2'];
});
```

With this approach, the record metadata, which includes the residency information, and any indexed properties, will be replicated to all nodes, but the full record will only be replicated to the nodes specified by the residency function.

### Custom Sharding By Primary Key

Alternately you can define a custom sharding strategy based on the primary key alone. This allows records to be retrieved without needing access to the record data or metadata. With this approach, data will only be replicated to the nodes specified by the residency function (the record metadata doesn't need to replicated to all nodes). To do this, you can use the `setResidencyById` method, providing a function that will determine the residency of each record based on the primary key. The function you provide will be called with the primary key, and should return an array of nodes that the record should be replicated to (using their hostname). For example, to shard records based on the value of the primary key, you can use the following code:

```javascript
MyTable.setResidencyById((id) => {
	return id % 2 === 0 ? ['node1'] : ['node2'];
});
```

### Disabling Cross-Node Access

Normally sharding allows data to be stored in specific nodes, but still allows access to the data from any node. However, you can also disable cross-node access so that data is only returned if is stored on the node where it is accessed. To do this, you can set the `replicateFrom` property on the context of operation to `false`:

```jsonc
{
	"operation": "search_by_id",
	"table": "MyTable",
	"ids": [3],
	"replicateFrom": false,
}
```

Or use a header with the REST API:

```http
GET /MyTable/3
X-Replicate-From: none
```
