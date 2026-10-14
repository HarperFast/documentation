---
title: Load Balancing and Node Availability
---

# Load Balancing and Node Availability

A Harper Fabric cluster serves your applications from one hostname, the cluster's Fabric hostname (for example `my-cluster.my-org.harperfabric.com`) or a [custom domain](/fabric/custom-domains) pointed at it. Fabric's load balancer picks a node of the cluster for each new connection to that hostname. This page covers how it decides which nodes may receive traffic, and how to read or change that decision for one node.

## How Fabric decides where traffic goes

The load balancer checks each node with a `GET /status` request to that node. A node that answers `200` may receive new connections. A node that answers anything else, or does not answer, receives none until it answers `200` again.

`/status` is served by a component that Fabric deploys to every node of the cluster, named `status-check`. Its source is public: [HarperFast/status-check-fabric](https://github.com/HarperFast/status-check-fabric). It answers from a single record on the node, the `availability` status, which Harper's [`set_status` and `get_status`](/reference/v5/operations-api/operations#set_status--get_status--clear_status) operations write and read:

| `availability` record | `GET /status` answers |
| --------------------- | --------------------- |
| `Available`           | `200`                 |
| `Unavailable`         | `404`                 |
| No record             | `404`                 |

Fabric writes this record itself. For example, it takes a node out while it upgrades that node, and puts it back afterwards.

### Each node has its own record

Harper keeps status records in the `system.hdb_status` table, which it creates with replication turned off. Every node therefore has its own `availability` record: writing it on one node changes only that node. The record is stored on disk, so it keeps its value when Harper restarts.

Because each node answers for itself, a request meant for one node has to reach that node. Through the cluster hostname, the load balancer decides which node receives it. Use the node's own hostname, which only that node answers.

## The `status-check` component

### `GET /status`

Unauthenticated.

- `200` with the body `"Status endpoint is reporting for duty."` when the node's `availability` record is `Available`.
- `404` with an error titled `Status endpoint is reporting downtime.` otherwise, including when the node has no `availability` record.

```bash
curl -i https://<node hostname>/status
```

### `POST /status`

Sets the node's `availability` record to `Available`. Requires a `super_user`: the component answers `204` on success, `401` to a request without credentials, and `403` to any other user.

### `DELETE /status`

Sets the node's `availability` record to `Unavailable`. Authorized the same way as `POST`.

To change the record yourself, use the Harper CLI rather than these routes, as [Taking a node out of rotation](#taking-a-node-out-of-rotation) shows. It needs no password on the command line, and from v5.3.0 the user it runs as does not have to be a `super_user`.

:::warning
Fabric routes traffic by this component. Do not remove it, and do not deploy another resource that serves `/status`.
:::

:::note
This is not the [`@harperdb/status-check`](https://github.com/HarperFast/status-check) npm package, which keeps its own `hdb_status` table in the `data` database. Fabric does not read that table, and the package also serves `/status`, so do not deploy it on a Fabric cluster. On a self-managed cluster, [Health Checks and Traffic Admission](/learn/administration/health-checks-and-traffic-admission) covers it.
:::

## Taking a node out of rotation

To stop new traffic reaching a node, set its `availability` record to `Unavailable` with the [`set_status`](/reference/v5/operations-api/operations#set_status--get_status--clear_status) operation. To let traffic back, set it to `Available`. Send each command to the node's own hostname. From your own machine, [log in](/reference/v5/cli/authentication#method-1-persistent-login-recommended-for-local-development) once and the CLI keeps the token:

```bash
harper login https://<node hostname>
harper set_status id=availability status=Unavailable target=https://<node hostname>
harper get_status id=availability target=https://<node hostname>
harper set_status id=availability status=Available target=https://<node hostname>
```

`get_status` returns the record, including `__updatedtime__`, the time of its last write.

From a GitHub Actions workflow, run the same commands with [workload identity (OIDC)](/reference/v5/cli/authentication#workload-identity-oidc), so the workflow holds no Harper credential at all. [Deploying from a CI/CD Pipeline](/learn/developers/deploying-from-ci) shows how to set up the trust policy and the user it maps to.

That user does not need to be a `super_user`. From v5.3.0, a role whose [`operations`](/reference/v5/users-and-roles/overview#operation-permissions) list names only `set_status` and `get_status` can run those two operations and nothing else.

Connections already open to the node stay open: the load balancer only decides where new connections go. Fabric writes the same record, so a value you set can be replaced by Fabric's own operations on the node.

An application can also feed its own health into this record, so that a node taking errors leaves rotation while its peers keep serving. See [Taking an Unhealthy Node Out of Rotation](/learn/developers/taking-a-node-out-of-rotation).
