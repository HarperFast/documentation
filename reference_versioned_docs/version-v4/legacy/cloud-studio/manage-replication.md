---
title: Manage Replication
---

<!-- Source: versioned_docs/version-4.7/administration/harper-studio/manage-replication.md (primary) -->

:::important
This documentation is for the deprecated Harper Cloud Studio. All users should migrate or start using [Harper Fabric](https://fabric.harper.fast) instead.
:::

# Manage Replication

Harper instance clustering and replication can be configured directly through the Harper Studio. It is recommended to read through the [clustering documentation](../../reference/clustering) first to gain a strong understanding of Harper clustering behavior.

All clustering configuration is handled through the **replication** page of the Harper Studio, accessed with the following instructions:

1. Navigate to the [Harper Studio Organizations](https://studio.harperdb.io/organizations) page.

1. Click the appropriate organization that the instance belongs to.

1. Select your desired instance.

1. Click **replication** in the instance control bar.

Note, the **replication** page will only be available to super users.

---

## Initial Configuration

Harper instances do not have clustering configured by default. The Harper Studio will walk you through the initial configuration. Upon entering the **replication** screen for the first time you will need to complete the following configuration. Configurations are set in the **enable clustering** panel on the left while actions are described in the middle of the screen. It is worth reviewing the [Creating a Cluster User](../../reference/clustering/creating-a-cluster-user) document before proceeding.

1. Enter Cluster User username. (Defaults to `cluster_user`).
1. Enter Cluster Password.
1. Review and/or Set Cluster Node Name.
1. Click **Enable Clustering**.

At this point the Studio will restart your Harper Instance, required for the configuration changes to take effect.

---

## Manage Clustering

Once initial clustering configuration is completed you a presented with a clustering management screen with the following properties:

- **connected instances**

  Displays all instances within the Studio Organization that this instance manages a connection with.

- **unconnected instances**

  Displays all instances within the Studio Organization that this instance does not manage a connection with.

- **unregistered instances**

  Displays all instances outside the Studio Organization that this instance manages a connection with.

- **manage clustering**

  Once instances are connected, this will display clustering management options for all connected instances and all databases and tables.

---

## Connect an Instance

Harper Instances can be clustered together with the following instructions.

1. Ensure clustering has been configured on both instances and a cluster user with identical credentials exists on both.

1. Identify the instance you would like to connect from the **unconnected instances** panel.

1. Click the plus icon next the appropriate instance.

1. If configurations are correct, all databases will sync across the cluster, then appear in the **manage clustering** panel. If there is a configuration issue, a red exclamation icon will appear, click it to learn more about what could be causing the issue.

---

## Disconnect an Instance

Harper Instances can be disconnected with the following instructions.

1. Identify the instance you would like to disconnect from the **connected instances** panel.

1. Click the minus icon next the appropriate instance.

---

## Manage Replication

Subscriptions must be configured in order to move data between connected instances. Read more about subscriptions here: Creating A Subscription. The **manage clustering** panel displays a table with each row representing an channel per instance. Cells are bolded to indicate a change in the column. Publish and subscribe replication can be configured per table with the following instructions:

1. Identify the instance, database, and table for replication to be configured.

1. For publish, click the toggle switch in the **publish** column.

1. For subscribe, click the toggle switch in the **subscribe** column.
