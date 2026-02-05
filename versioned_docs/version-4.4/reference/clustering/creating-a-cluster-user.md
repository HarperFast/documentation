---
title: Creating a Cluster User
---

# Creating a Cluster User

Inter-node authentication takes place via Harper users. There is a special role type called `cluster_user` that exists by default and limits the user to only clustering functionality.

A `cluster_user` must be created and added to the `harperdb-config.yaml` file for clustering to be enabled.

All nodes that are intended to be clustered together need to share the same `cluster_user` credentials (i.e. username and password).

There are multiple ways a `cluster_user` can be created, they are:

1. Through the operations API by calling `add_user`

```json
{
	"operation": "add_user",
	"role": "cluster_user",
	"username": "cluster_account",
	"password": "letsCluster123!",
	"active": true
}
```

When using the API to create a cluster user the `harperdb-config.yaml` file must be updated with the username of the new cluster user.

This can be done through the API by calling `set_configuration` or by editing the `harperdb-config.yaml` file.

```json
{
	"operation": "set_configuration",
	"clustering_user": "cluster_account"
}
```

In the `harperdb-config.yaml` file under the top-level `clustering` element there will be a user element. Set this to the name of the cluster user.

```yaml
clustering:
  user: cluster_account
```

_Note: When making any changes to the `harperdb-config.yaml` file, Harper must be restarted for the changes to take effect._

1. Upon installation using **command line variables**. This will automatically set the user in the `harperdb-config.yaml` file.

_Note: Using command line or environment variables for setting the cluster user only works on install._

```
harperdb install --CLUSTERING_USER cluster_account --CLUSTERING_PASSWORD letsCluster123!
```

1. Upon installation using **environment variables**. This will automatically set the user in the `harperdb-config.yaml` file.

```
CLUSTERING_USER=cluster_account CLUSTERING_PASSWORD=letsCluster123
```
