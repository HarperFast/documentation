---
title: Naming a Node
---

# Naming a Node

Node name is the name given to a node. It is how nodes are identified within the cluster and must be unique to the cluster.

The name cannot contain any of the following characters: `.,*>` . Dot, comma, asterisk, greater than, or whitespace.

The name is set in the `harperdb-config.yaml` file using the `clustering.nodeName` configuration element.

_Note: If you want to change the node name make sure there are no subscriptions in place before doing so. After the name has been changed a full restart is required._

There are multiple ways to update this element, they are:

1. Directly editing the `harperdb-config.yaml` file.

```yaml
clustering:
  nodeName: Node1
```

_Note: When making any changes to the `harperdb-config.yaml` file HarperDB must be restarted for the changes to take effect._

1. Calling `set_configuration` through the operations API

```json
{
	"operation": "set_configuration",
	"clustering_nodeName": "Node1"
}
```

1. Using command line variables.

```
harperdb --CLUSTERING_NODENAME Node1
```

1. Using environment variables.

```
CLUSTERING_NODENAME=Node1
```
