---
title: Clustering
---

# Clustering

The following operations are available for configuring and managing [Harper replication](../replication/).

_**If you are using NATS for clustering, please see the**_ [_**NATS Clustering Operations**_](clustering-nats) _**documentation.**_

## Add Node

Adds a new Harper instance to the cluster. If `subscriptions` are provided, it will also create the replication relationships between the nodes. If they are not provided a fully replicating system will be created. [Learn more about adding nodes here](../replication/).

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `add_node`
- `hostname` or `url` _(required)_ - one of these fields is required. You must provide either the `hostname` or the `url` of the node you want to add
- `verify_tls` _(optional)_ - a boolean which determines if the TLS certificate should be verified. This will allow the Harper default self-signed certificates to be accepted. Defaults to `true`
- `authorization` _(optional)_ - an object or a string which contains the authorization information for the node being added. If it is an object, it should contain `username` and `password` fields. If it is a string, it should use HTTP `Authorization` style credentials
- `retain_authorization` _(optional)_ - a boolean which determines if the authorization credentials should be retained/stored and used everytime a connection is made to this node. If `true`, the authorization will be stored on the node record. Generally this should not be used, as mTLS/certificate based authorization is much more secure and safe, and avoids the need for storing credentials. Defaults to `false`.
- `revoked_certificates` _(optional)_ - an array of revoked certificates serial numbers. If a certificate is revoked, it will not be accepted for any connections.
- `shard` _(optional)_ - a number which can be used to indicate which shard this node belongs to. This is only needed if you are using sharding.
- `subscriptions` _(optional)_ - The relationship created between nodes. If not provided a fully replicated cluster will be setup. Must be an object array and include `database`, `table`, `subscribe` and `publish`:
  - `database` - the database to replicate
  - `table` - the table to replicate
  - `subscribe` - a boolean which determines if transactions on the remote table should be replicated on the local table
  - `publish` - a boolean which determines if transactions on the local table should be replicated on the remote table

### Body

```json
{
	"operation": "add_node",
	"hostname": "server-two",
	"verify_tls": false,
	"authorization": {
		"username": "admin",
		"password": "password"
	}
}
```

### Response: 200

```json
{
	"message": "Successfully added 'server-two' to cluster"
}
```

---

## Update Node

Modifies an existing Harper instance in the cluster.

_Operation is restricted to super_user roles only_

_Note: will attempt to add the node if it does not exist_

- `operation` _(required)_ - must always be `update_node`
- `hostname` _(required)_ - the `hostname` of the remote node you are updating
- `revoked_certificates` _(optional)_ - an array of revoked certificates serial numbers. If a certificate is revoked, it will not be accepted for any connections.
- `shard` _(optional)_ - a number which can be used to indicate which shard this node belongs to. This is only needed if you are using sharding.
- `subscriptions` _(required)_ - The relationship created between nodes. Must be an object array and include `database`, `table`, `subscribe` and `publish`:
  - `database` - the database to replicate from
  - `table` - the table to replicate from
  - `subscribe` - a boolean which determines if transactions on the remote table should be replicated on the local table
  - `publish` - a boolean which determines if transactions on the local table should be replicated on the remote table

### Body

```json
{
	"operation": "update_node",
	"hostname": "server-two",
	"subscriptions": [
		{
			"database": "dev",
			"table": "my-table",
			"subscribe": true,
			"publish": true
		}
	]
}
```

### Response: 200

```json
{
	"message": "Successfully updated 'server-two'"
}
```

---

## Remove Node

Removes a Harper node from the cluster and stops replication, [Learn more about remove node here](../replication/).

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `remove_node`
- `name` _(required)_ - The name of the node you are removing

### Body

```json
{
	"operation": "remove_node",
	"hostname": "server-two"
}
```

### Response: 200

```json
{
	"message": "Successfully removed 'server-two' from cluster"
}
```

---

## Cluster Status

Returns an array of status objects from a cluster.

`database_sockets` shows the actual websocket connections that exist between nodes.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `cluster_status`

### Body

```json
{
	"operation": "cluster_status"
}
```

### Response: 200

```json
{
	"type": "cluster-status",
	"connections": [
		{
			"replicateByDefault": true,
			"replicates": true,
			"url": "wss://server-2.domain.com:9933",
			"name": "server-2.domain.com",
			"subscriptions": null,
			"database_sockets": [
				{
					"database": "data",
					"connected": true,
					"latency": 0.7,
					"thread_id": 1,
					"nodes": ["server-2.domain.com"],
					"lastCommitConfirmed": "Wed, 12 Feb 2025 19:09:34 GMT",
					"lastReceivedRemoteTime": "Wed, 12 Feb 2025 16:49:29 GMT",
					"lastReceivedLocalTime": "Wed, 12 Feb 2025 16:50:59 GMT",
					"lastSendTime": "Wed, 12 Feb 2025 16:50:59 GMT"
				}
			]
		}
	],
	"node_name": "server-1.domain.com",
	"is_enabled": true
}
```

There is a separate socket for each database for each node. Each node is represented in the connections array, and each database connection to that node is represented in the `database_sockets` array. Additional timing statistics include:

- `lastCommitConfirmed`: When a commit is sent out, it should receive a confirmation from the remote server; this is the last receipt of confirmation of an outgoing commit.
- `lastReceivedRemoteTime`: This is the timestamp of the transaction that was last received. The timestamp is from when the original transaction occurred.
- `lastReceivedLocalTime`: This is local time when the last transaction was received. If there is a different between this and `lastReceivedRemoteTime`, it means there is a delay from the original transaction to \* receiving it and so it is probably catching-up/behind.
- `sendingMessage`: The timestamp of transaction is actively being sent. This won't exist if the replicator is waiting for the next transaction to send.

---

## Configure Cluster

Bulk create/remove subscriptions for any number of remote nodes. Resets and replaces any existing clustering setup.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `configure_cluster`
- `connections` _(required)_ - must be an object array with each object following the `add_node` schema.

### Body

```json
{
	"operation": "configure_cluster",
	"connections": [
		{
			"hostname": "server-two",
			"verify_tls": false,
			"authorization": {
				"username": "admin",
				"password": "password2"
			},
			"subscriptions": [
				{
					"schema": "dev",
					"table": "my-table",
					"subscribe": true,
					"publish": false
				}
			]
		},
		{
			"hostname": "server-three",
			"verify_tls": false,
			"authorization": {
				"username": "admin",
				"password": "password3"
			},
			"subscriptions": [
				{
					"schema": "dev",
					"table": "dog",
					"subscribe": true,
					"publish": true
				}
			]
		}
	]
}
```

### Response: 200

```json
{
	"message": "Cluster successfully configured."
}
```

---

## Cluster Set Routes

Adds a route/routes to the `replication.routes` configuration. This operation behaves as a PATCH/upsert, meaning it will add new routes to the configuration while leaving existing routes untouched.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `cluster_set_routes`
- `routes` _(required)_ - the routes field is an array that specifies the routes for clustering. Each element in the array can be either a string or an object with `hostname` and `port` properties.

### Body

```json
{
	"operation": "cluster_set_routes",
	"routes": [
		"wss://server-two:9925",
		{
			"hostname": "server-three",
			"port": 9930
		}
	]
}
```

### Response: 200

```json
{
	"message": "cluster routes successfully set",
	"set": [
		"wss://server-two:9925",
		{
			"hostname": "server-three",
			"port": 9930
		}
	],
	"skipped": []
}
```

---

## Cluster Get Routes

Gets the replication routes from the Harper config file.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `cluster_get_routes`

### Body

```json
{
	"operation": "cluster_get_routes"
}
```

### Response: 200

```json
[
	"wss://server-two:9925",
	{
		"hostname": "server-three",
		"port": 9930
	}
]
```

---

## Cluster Delete Routes

Removes route(s) from the Harper config file. Returns a deletion success message and arrays of deleted and skipped records.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `cluster_delete_routes`
- `routes` _(required)_ - Must be an array of route object(s)

### Body

```json
{
	"operation": "cluster_delete_routes",
	"routes": [
		{
			"hostname": "server-three",
			"port": 9930
		}
	]
}
```

### Response: 200

```json
{
	"message": "cluster routes successfully deleted",
	"deleted": [
		{
			"hostname": "server-three",
			"port": 9930
		}
	],
	"skipped": []
}
```
