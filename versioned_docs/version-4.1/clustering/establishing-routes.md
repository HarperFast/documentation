---
title: Establishing Routes
---

# Establishing Routes

A route is a connection between two nodes. It is how the clustering network is established.

Routes do not need to cross connect all nodes in the cluster. You can select a leader node or a few leaders and all nodes connect to them, you can chain, etc… As long as there is one route connecting a node to the cluster all other nodes should be able to reach that node.

Using routes the clustering servers will create a mesh network between nodes. This mesh network ensures that if a node drops out all other nodes can still communicate with each other. That being said, we recommend designing your routing with failover in mind, this means not storing all your routes on one node but dispersing them throughout the network.

A simple route example is a two node topology, if Node1 adds a route to connect it to Node2, Node2 does not need to add a route to Node1. That one route configuration is all that’s needed to establish a bidirectional connection between the nodes.

A route consists of a `port` and a `host`.

`port` - the clustering port of the remote instance you are creating the connection with. This is going to be the `clustering.hubServer.cluster.network.port` in the HarperDB configuration on the node you are connecting with.

`host` - the host of the remote instance you are creating the connection with.This can be an IP address or a URL.

Routes are set in the `harperdb-config.yaml` file using the `clustering.hubServer.cluster.network.routes` element, which expects an object array, where each object has two properties, `port` and `host`.

```yaml
clustering:
  hubServer:
    cluster:
      network:
        routes:
          - host: 3.62.184.22
            port: 9932
          - host: 3.735.184.8
            port: 9932
```

![figure 1](/img/v4.1/clustering/figure1.png)

This diagram shows one way of using routes to connect a network of nodes. Node2 and Node3 do not reference any routes in their config. Node1 contains routes for Node2 and Node3, which is enough to establish a network between all three nodes.

There are multiple ways to set routes, they are:

1. Directly editing the `harperdb-config.yaml` file (refer to code snippet above).
1. Calling `cluster_set_routes` through the API.

```json
{
	"operation": "cluster_set_routes",
	"server": "hub",
	"routes": [{ "host": "3.735.184.8", "port": 9932 }]
}
```

_Note: When making any changes to HarperDB configuration HarperDB must be restarted for the changes to take effect._

1. From the command line.

```bash
--CLUSTERING_HUBSERVER_CLUSTER_NETWORK_ROUTES "[{\"host\": \"3.735.184.8\", \"port\": 9932}]"
```

1. Using environment variables.

```bash
CLUSTERING_HUBSERVER_CLUSTER_NETWORK_ROUTES=[{"host": "3.735.184.8", "port": 9932}]
```

The API also has `cluster_get_routes` for getting all routes in the config and `cluster_delete_routes` for deleting routes.

```json
{
	"operation": "cluster_delete_routes",
	"routes": [{ "host": "3.735.184.8", "port": 9932 }]
}
```
