---
title: Enabling Clustering
---

# Enabling Clustering

Clustering does not run by default; it needs to be enabled.

To enable clustering the `clustering.enabled` configuration element in the `harperdb-config.yaml` file must be set to `true`.

There are multiple ways to update this element, they are:

1. Directly editing the `harperdb-config.yaml` file and setting enabled to `true`

```yaml
clustering:
  enabled: true
```

_Note: When making any changes to the `harperdb-config.yaml` file HarperDB must be restarted for the changes to take effect._

1. Calling `set_configuration` through the operations API

```json
{
	"operation": "set_configuration",
	"clustering_enabled": true
}
```

_Note: When making any changes to HarperDB configuration HarperDB must be restarted for the changes to take effect._

1. Using **command line variables**.

```
harperdb --CLUSTERING_ENABLED true
```

1. Using **environment variables**.

```
CLUSTERING_ENABLED=true
```

An efficient way to **install HarperDB**, **create the cluster user**, **set the node name** and **enable clustering** in one operation is to combine the steps using command line and/or environment variables. Here is an example using command line variables.

```
harperdb install --CLUSTERING_ENABLED true --CLUSTERING_NODENAME Node1 --CLUSTERING_USER cluster_account --CLUSTERING_PASSWORD letsCluster123!
```
