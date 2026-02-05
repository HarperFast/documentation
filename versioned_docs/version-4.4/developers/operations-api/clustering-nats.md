---
title: Clustering using NATS
---

# Clustering using NATS

## Cluster Set Routes

Adds a route/routes to either the hub or leaf server cluster configuration. This operation behaves as a PATCH/upsert, meaning it will add new routes to the configuration while leaving existing routes untouched.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `cluster_set_routes`
- `server` _(required)_ - must always be `hub` or `leaf`, in most cases you should use `hub` here
- `routes` _(required)_ - must always be an objects array with a host and port:
  - `host` - the host of the remote instance you are clustering to
  - `port` - the clustering port of the remote instance you are clustering to, in most cases this is the value in `clustering.hubServer.cluster.network.port` on the remote instance `harperdb-config.yaml`

### Body

```json
{
	"operation": "cluster_set_routes",
	"server": "hub",
	"routes": [
		{
			"host": "3.22.181.22",
			"port": 12345
		},
		{
			"host": "3.137.184.8",
			"port": 12345
		},
		{
			"host": "18.223.239.195",
			"port": 12345
		},
		{
			"host": "18.116.24.71",
			"port": 12345
		}
	]
}
```

### Response: 200

```json
{
	"message": "cluster routes successfully set",
	"set": [
		{
			"host": "3.22.181.22",
			"port": 12345
		},
		{
			"host": "3.137.184.8",
			"port": 12345
		},
		{
			"host": "18.223.239.195",
			"port": 12345
		},
		{
			"host": "18.116.24.71",
			"port": 12345
		}
	],
	"skipped": []
}
```

---

## Cluster Get Routes

Gets all the hub and leaf server routes from the config file.

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
{
	"hub": [
		{
			"host": "3.22.181.22",
			"port": 12345
		},
		{
			"host": "3.137.184.8",
			"port": 12345
		},
		{
			"host": "18.223.239.195",
			"port": 12345
		},
		{
			"host": "18.116.24.71",
			"port": 12345
		}
	],
	"leaf": []
}
```

---

## Cluster Delete Routes

Removes route(s) from hub and/or leaf server routes array in config file. Returns a deletion success message and arrays of deleted and skipped records.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `cluster_delete_routes`
- `routes` _(required)_ - Must be an array of route object(s)

### Body

```json
{
	"operation": "cluster_delete_routes",
	"routes": [
		{
			"host": "18.116.24.71",
			"port": 12345
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
			"host": "18.116.24.71",
			"port": 12345
		}
	],
	"skipped": []
}
```

---

## Add Node

Registers an additional Harper instance with associated subscriptions. Learn more about [Harper clustering here](../../reference/clustering/).

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `add_node`
- `node_name` _(required)_ - the node name of the remote node
- `subscriptions` _(required)_ - The relationship created between nodes. Must be an object array and include `schema`, `table`, `subscribe` and `publish`:
  - `schema` - the schema to replicate from
  - `table` - the table to replicate from
  - `subscribe` - a boolean which determines if transactions on the remote table should be replicated on the local table
  - `publish` - a boolean which determines if transactions on the local table should be replicated on the remote table
  - `start_time` _(optional)_ - How far back to go to get transactions from node being added. Must be in UTC YYYY-MM-DDTHH:mm:ss.sssZ format

### Body

```json
{
	"operation": "add_node",
	"node_name": "ec2-3-22-181-22",
	"subscriptions": [
		{
			"schema": "dev",
			"table": "dog",
			"subscribe": false,
			"publish": true,
			"start_time": "2022-09-02T20:06:35.993Z"
		}
	]
}
```

### Response: 200

```json
{
	"message": "Successfully added 'ec2-3-22-181-22' to manifest"
}
```

---

## Update Node

Modifies an existing Harper instance registration and associated subscriptions. This operation behaves as a PATCH/upsert, meaning it will insert or update the specified replication configurations while leaving other table replication configuration untouched. Learn more about [Harper clustering here](../../reference/clustering/).

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `update_node`
- `node_name` _(required)_ - the node name of the remote node you are updating
- `subscriptions` _(required)_ - The relationship created between nodes. Must be an object array and include `schema`, `table`, `subscribe` and `publish`:
  - `schema` - the schema to replicate from
  - `table` - the table to replicate from
  - `subscribe` - a boolean which determines if transactions on the remote table should be replicated on the local table
  - `publish` - a boolean which determines if transactions on the local table should be replicated on the remote table
  - `start_time` _(optional)_ - How far back to go to get transactions from node being added. Must be in UTC YYYY-MM-DDTHH:mm:ss.sssZ format

### Body

```json
{
	"operation": "update_node",
	"node_name": "ec2-18-223-239-195",
	"subscriptions": [
		{
			"schema": "dev",
			"table": "dog",
			"subscribe": true,
			"publish": false,
			"start_time": "2022-09-02T20:06:35.993Z"
		}
	]
}
```

### Response: 200

```json
{
	"message": "Successfully updated 'ec2-3-22-181-22'"
}
```

---

## Set Node Replication

A more adeptly named alias for add and update node. This operation behaves as a PATCH/upsert, meaning it will insert or update the specified replication configurations while leaving other table replication configuration untouched. The `database` (aka `schema`) parameter is optional, it will default to `data`.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `set_node_replication`
- `node_name` _(required)_ - the node name of the remote node you are updating
- `subscriptions` _(required)_ - The relationship created between nodes. Must be an object array and `table`, `subscribe` and `publish`:
  - `database` _(optional)_ - the database to replicate from
  - `table` _(required)_ - the table to replicate from
  - `subscribe` _(required)_ - a boolean which determines if transactions on the remote table should be replicated on the local table
  - `publish` _(required)_ - a boolean which determines if transactions on the local table should be replicated on the remote table
-

### Body

```json
{
	"operation": "set_node_replication",
	"node_name": "node1",
	"subscriptions": [
		{
			"table": "dog",
			"subscribe": true,
			"publish": true
		}
	]
}
```

### Response: 200

```json
{
	"message": "Successfully updated 'ec2-3-22-181-22'"
}
```

---

## Cluster Status

Returns an array of status objects from a cluster. A status object will contain the clustering node name, whether or not clustering is enabled, and a list of possible connections. Learn more about [Harper clustering here](../../reference/clustering).

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
	"node_name": "ec2-18-221-143-69",
	"is_enabled": true,
	"connections": [
		{
			"node_name": "ec2-3-22-181-22",
			"status": "open",
			"ports": {
				"clustering": 12345,
				"operations_api": 9925
			},
			"latency_ms": 13,
			"uptime": "30d 1h 18m 8s",
			"subscriptions": [
				{
					"schema": "dev",
					"table": "dog",
					"publish": true,
					"subscribe": true
				}
			]
		}
	]
}
```

---

## Cluster Network

Returns an object array of enmeshed nodes. Each node object will contain the name of the node, the amount of time (in milliseconds) it took for it to respond, the names of the nodes it is enmeshed with and the routes set in its config file. Learn more about [Harper clustering here](../../reference/clustering).

_Operation is restricted to super_user roles only_

- `operation` _(required)_- must always be `cluster_network`
- `timeout` _(optional)_ - the amount of time in milliseconds to wait for a response from the network. Must be a number
- `connected_nodes` _(optional)_ - omit `connected_nodes` from the response. Must be a boolean. Defaults to `false`
- `routes` _(optional)_ - omit `routes` from the response. Must be a boolean. Defaults to `false`

### Body

```json
{
	"operation": "cluster_network"
}
```

### Response: 200

```json
{
	"nodes": [
		{
			"name": "local_node",
			"response_time": 4,
			"connected_nodes": ["ec2-3-142-255-78"],
			"routes": [
				{
					"host": "3.142.255.78",
					"port": 9932
				}
			]
		},
		{
			"name": "ec2-3-142-255-78",
			"response_time": 57,
			"connected_nodes": ["ec2-3-12-153-124", "ec2-3-139-236-138", "local_node"],
			"routes": []
		}
	]
}
```

---

## Remove Node

Removes a Harper instance and associated subscriptions from the cluster. Learn more about [Harper clustering here](../../reference/clustering).

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `remove_node`
- `node_name` _(required)_ - The name of the node you are de-registering

### Body

```json
{
	"operation": "remove_node",
	"node_name": "ec2-3-22-181-22"
}
```

### Response: 200

```json
{
	"message": "Successfully removed 'ec2-3-22-181-22' from manifest"
}
```

---

## Configure Cluster

Bulk create/remove subscriptions for any number of remote nodes. Resets and replaces any existing clustering setup.
Learn more about [Harper clustering here](../../reference/clustering).

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `configure_cluster`
- `connections` _(required)_ - must be an object array with each object containing `node_name` and `subscriptions` for that node

### Body

```json
{
	"operation": "configure_cluster",
	"connections": [
		{
			"node_name": "ec2-3-137-184-8",
			"subscriptions": [
				{
					"schema": "dev",
					"table": "dog",
					"subscribe": true,
					"publish": false
				}
			]
		},
		{
			"node_name": "ec2-18-223-239-195",
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

## Purge Stream

Will purge messages from a stream

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `purge_stream`
- `database` _(required)_ - the name of the database where the streams table resides
- `table` _(required)_ - the name of the table that belongs to the stream
- `options` _(optional)_ - control how many messages get purged. Options are:
  - `keep` - purge will keep this many most recent messages
  - `seq` - purge all messages up to, but not including, this sequence

### Body

```json
{
	"operation": "purge_stream",
	"database": "dev",
	"table": "dog",
	"options": {
		"keep": 100
	}
}
```

---
