---
title: Cluster Creation & Management
---

# Cluster Creation & Management

## What is a Cluster?

A cluster is a group of instances managed together to run applications and services within a Harper organization; it is the deployable environment where your workloads live. Clusters can be created and managed directly from the Fabric Studio UI (no DevOps required!)

## Creating a Cluster

1. Navigate to your organization page.
2. Click the "+ New Cluster" button in the upper right of the sub-menu.
3. Enter the required fields:
   - **Cluster Name**: A unique name for your cluster within the organization.
   - **Harper Deployment**: Choose between Colocated, Dedicated, or Self-hosted (see below for details).
   - **Performance & Usage**: Select the cluster size that best fits your needs. Examples include Free, Medium, High, Very High.
   - **Host Name (Full Host Name)**: Enter the host name for your cluster. This will be part of the URL used to access your cluster (e.g., `<cluster name>.<your organization subdomain>.harperfabric.com`).
   - **Region**: Select the geographic region where you want your cluster to be hosted. Examples include US, Global, Europe.
   - **Estimated P90 Latency, Distribution**: Displays estimated latency based on your selected region and instance size.
4. Click the "Confirm Payment Details" or "Create New Cluster"(if you chose the free tier) button on the bottom right of the page.
5. \*Confirm or replace the preferred payment method. Add a new card if necessary
6. Cluster will begin provisioning as soon as you complete your selections.

## Editing a Cluster

To edit an existing cluster:

1. Navigate to your organization page.
2. Locate the cluster you want to edit in the list of clusters.
3. Click the three dots menu next to the cluster name and select "Edit" from the dropdown.
4. Make the necessary changes to the cluster configuration such as:
   - Performance & Usage
   - Modifying the Region location and Estimated P90 Latency
   - Adding or removing additional regions.
5. Click the "Save Changes" or "Confirm Payment Details" button to summarize and apply your modifications.

## Preview Hosts

Preview hosts let a cluster serve short-lived copies of an application, such as one per pull request, under a Fabric hostname of its own. With preview hosts on, a name one label below the cluster's preview namespace reaches the [isolated application](/reference/v5/components/applications#isolated-applications) deployed with that name as its `host`:

```
pr-42.<cluster id>.preview.<organization subdomain>.harperfabric.com
```

Fabric creates the DNS record and adds `*.<cluster id>.preview.<organization subdomain>.harperfabric.com` to each instance's certificate, so a new preview needs a deploy and nothing else: no custom domain to add, verify, or bind. The cluster ID is the part of Studio's address after the organization ID on any of the cluster's pages.

- Only isolated applications answer on preview hosts. A preview host that no running isolated application lists gets no response; it never reaches the cluster's other applications.
- A preview host is exactly one label below the namespace: `pr-42.<cluster id>.preview.…` works, and `a.pr-42.<cluster id>.preview.…` does not.
- Preview hosts are available on Colocated and Dedicated clusters.

Studio does not have a setting for preview hosts yet. The Fabric API at `https://fabric.harper.fast` turns them on with `PUT /Cluster/<cluster id>` and this body, sent by a user who can edit the cluster:

```json
{ "previews": true }
```

`{ "previews": false }` turns them off. Either request must not include other changes to the cluster. After turning preview hosts on, allow a few minutes for each instance to obtain a certificate that covers them.

## Harper Deployment Types:

### Colocated:

Multi-tenant clusters are deployed on shared hosts alongside clusters from other organizations, but data and workloads remain completely isolated. Colocated deployments are optimal for organizations seeking excellent performance across available regions.

### Dedicated:

Dedicated clusters run on hosts reserved for a single organization. These environments are available in ten more specialized regions, and offer performance isolation and higher resource limits. Dedicated deployments are ideal for organizations with stricter compliance or performance requirements

### Self-hosted:

Self-hosted clusters are provisioned entirely outside of Harper’s infrastructure, on an organization's owned and operated servers or cloud accounts.
Please follow the cluster configuration menu for more information on estimated performance and cost. Clusters will begin provisioning as soon as you complete your selections.
Clusters are provisioned in real time, as soon as selections are complete

### Additional Information:

- Cannot guarantee any provisioning time for self-hosted. (**Note**: All performance metrics are estimates unless otherwise noted.)
- Once a cluster is created, you will be prompted to set a username and password for each cluster.

## Connecting the Harper CLI to a Cluster

The cluster's **Config → Overview** page exposes its **Application URL** — the hostname the Harper CLI and SDKs target. Pass it to `harper login` to authenticate; the CLI stores the token (and writes `HARPER_CLI_TARGET` to a local `.env`) so subsequent commands don't need credentials repeated.

```bash
harper login <Application URL>
# Provide cluster username and password when prompted
```

See [CLI Authentication](/reference/v5/cli/authentication) for the full set of authentication methods — including environment variables for CI/CD pipelines.
