---
title: Cluster Creation & Management
---

# Cluster Creation & Management

## What is a Cluster?

A cluster is a group of instances managed together to run applications and services within a Harper organization; it is the deployable environment where your workloads live. Clusters can be created and managed directly from the Fabric Studio UI (no DevOps required!)

## Creating a Cluster

To create a [sharded cluster](#sharded-clusters), use the Fabric API instead: Studio cannot create one yet.

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

On a sharded cluster, a change that removes instances must leave every shard enough running instances. See [Scaling a Sharded Cluster](#scaling-a-sharded-cluster).

## Sharded Clusters

A sharded cluster splits the records of its `@sharded` tables among groups of instances called shards. Each instance belongs to one shard and keeps every record of that shard. Fabric gives every instance its shard and refuses changes that would leave a shard with too few instances. Which tables are sharded is up to your application's schema: see [Schema-defined sharding](/reference/v5/replication/residency) for the `@sharded` directive and what it requires.

Sharded clusters run Harper 5.4.0-beta.3 or later, on Colocated or Dedicated deployments. A Self-hosted cluster cannot be sharded.

### Creating a Sharded Cluster

Studio does not offer sharding yet ([studio#2084](https://github.com/HarperFast/studio/issues/2084)), so create the cluster with the Fabric API at `https://fabric.harper.fast`:

1. Sign in with `POST /Login/` and the body `{ "email": "<email>", "password": "<password>" }`, using the email and password you use for Studio, not a cluster's username and password. The account must be able to create clusters in the organization. The response sets a session cookie: send it with the requests that follow.
2. Create the cluster with `POST /Cluster/` and a body like this:

```json
{
	"name": "orders",
	"abbreviatedName": "orders",
	"organizationId": "<organization id>",
	"version": "<Harper version>",
	"regionPlans": [{ "regionId": "<region id>", "planId": "<plan id>" }],
	"sharding": { "shards": 2, "minOwners": 2 }
}
```

`sharding` is the only field specific to a sharded cluster:

- `shards` is the number of shards: a whole number from 2 to 256, sent as a JSON number.
- `minOwners` is the fewest running instances each shard must keep: a whole number, at least 1. It defaults to 2.

The other fields create any hosted cluster. `abbreviatedName` gives the cluster its host name, `<abbreviatedName>.<organization subdomain>.harperfabric.com`. The organization ID is the first part of Studio's address after `#/` on any of the organization's pages. `GET /Region/?organizationId=<organization id>` lists the regions the organization can use, each with its `instanceCount`, and `GET /Plan/?organizationId=<organization id>` lists its plans.

Fabric refuses the request with 400, before creating anything, unless:

- the cluster is Colocated or Dedicated, and the request has `regionPlans`.
- `regionPlans` gives the cluster at least `shards` multiplied by `minOwners` instances. Each region plan adds its region's `instanceCount`. The example needs four: two shards of two instances each.
- `version` is 5.4.0-beta.3 or later. Without `version`, Fabric uses its default Harper version, and refuses the request if that is earlier.

`sharding` cannot change once the cluster exists: `PUT /Cluster/<cluster id>/` refuses it with 400. A later version change cannot go below 5.4.0-beta.3.

With `minOwners: 1`, a shard can be left with a single instance. While that instance is down, the shard has no running instance to read its records from, and if the instance's data is lost, those records can come back only from a backup. See [Recovery sources](/reference/v5/replication/residency#recovery-sources).

### How Fabric Assigns Shards

- **A shard is permanent.** Fabric picks an instance's shard when it creates the instance and never changes it. When Fabric replaces an instance, for example to move it to a new host after a plan change, the new instance takes the old one's shard.
- **New instances keep shards balanced.** Each new instance joins the shard with the fewest instances. Among equally small shards, Fabric picks the one whose nearest instance is farthest from the new instance, so each shard's instances tend to be spread across locations. That spread is a tendency, not a guarantee.
- **Fabric configures the shard.** It writes [`replication.shard` and `replication.shards`](/reference/v5/replication/residency#configuration) into each instance's configuration, and a new instance [joins](/reference/v5/replication/residency#cloning-a-node-into-a-sharded-cluster) with its shard already chosen. Do not set or change these yourself: a shard is part of an instance's identity, and Fabric relies on the one it assigned.

The instances of a record's shard are its owners. Another instance that reads the record fetches it from an owner, which may be in another region, and can keep a temporary copy of it; see [Ownership, reads, and writes](/reference/v5/replication/residency#ownership-reads-and-writes). A region has an owner of every shard only if it has at least as many instances as there are shards.

To see an instance's shard, send Harper's [`get_configuration`](/reference/v5/configuration/operations#get-configuration) operation to it: `replication.shard` in its answer is the instance's shard. Once a `@sharded` table is active, [`cluster_status`](/reference/v5/replication/clustering#sharding-status) lists every shard's instances in `sharding.<database>.shards`.

### Scaling a Sharded Cluster

Adding instances works as on any cluster, and each new instance joins the shard with the fewest instances.

Removing instances, from Studio's Edit page or with `PUT /Cluster/<cluster id>/`, must leave every shard at least `minOwners` running instances:

- Only running instances count. An instance still copying its data, or in an error state, does not.
- When a change removes some of a region's instances rather than the whole region, Fabric chooses which ones go, keeping enough in every shard.
- A change that would leave a shard short fails with 400 and changes nothing. The error names the shard and how many running instances it has now.
- `regionPlans` in a `PUT` lists every region the cluster keeps, and a region left out is removed, so build each `PUT` from a fresh `GET /Cluster/<cluster id>/`: a body built from an older read can undo someone else's change. Fabric detects one such conflict. If a region your change removes instances from was changed after Fabric read the cluster for your request, the request fails with 409 and changes nothing. Read the cluster again and apply your change to what it returns.

Fabric checks this only when you remove instances. An instance that fails still leaves its shard short until it recovers.

### Not Yet Supported

- Sharding an existing cluster: choose sharding when you create the cluster.
- Changing the number of shards. That needs Harper to move records between shards ([harper-pro#1053](https://github.com/HarperFast/harper-pro/issues/1053)).
- Creating a sharded cluster in Studio ([studio#2084](https://github.com/HarperFast/studio/issues/2084)).

## Preview Hosts

Colocated and Dedicated clusters can serve short-lived copies of an application, such as one per pull request, under their own host name. A name one label below `app.` and the cluster's full host name reaches the [isolated application](/reference/v5/components/applications#isolated-applications) deployed with that name as its `host`:

```
pr-42.app.<cluster name>.<organization subdomain>.harperfabric.com
```

Fabric points every name under `app.<cluster name>.<organization subdomain>.harperfabric.com` at the cluster and adds `*.app.<cluster name>.<organization subdomain>.harperfabric.com` to each instance's certificate, so a new preview needs a deploy and nothing else: no custom domain to add, verify, or bind, and no setting to turn on.

- Only isolated applications answer on preview hosts. A preview host that no running isolated application lists gets no response; it never reaches the cluster's other applications.
- A preview host is exactly one label below `app.` and the cluster's host name: `pr-42.app.<cluster name>.…` works, and neither `a.pr-42.app.<cluster name>.…` nor `pr-42.<cluster name>.…` does.
- Self-hosted clusters have no preview hosts: Fabric does not serve their host names.
- New clusters serve preview hosts from the start. A cluster created earlier gains them one instance at a time, as each instance's certificate renews, which happens automatically within about seven weeks. Until every instance has renewed, a request for a preview host that reaches an instance without the new certificate gets no response, so on a cluster with several instances previews work only intermittently.

### Previews share a site with production

A preview runs under the cluster's own host name, so browsers treat it as the same site as anything your production application serves from that host name. Deploy as a preview only code you would trust in production. What production serves only from a custom domain is a different site from the cluster's previews, and the cautions below don't apply to it.

- A preview can set a cookie with `Domain=<cluster name>.<organization subdomain>.harperfabric.com`, which browsers then send to every application on the cluster, alongside any cookie of the same name the cluster set itself. For a cookie your production application relies on, such as a session cookie, use a name that starts with `__Host-` and set it with `Secure`, `Path=/` and no `Domain`, as browsers require of that prefix: a preview can then neither set nor replace it, and browsers never send it to a preview, as they do any cookie production sets with a `Domain`. Harper's own session cookie keeps its name, so it cannot take this protection.
- `SameSite` does not separate a preview from production: a page served from a preview can send requests to your production application with production's cookies attached. Protect requests that change state with a CSRF token or an `Origin` check, not `SameSite` alone.

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

The cluster's **Config → Overview** page exposes its **Application URL** — the hostname the Harper CLI and SDKs target. Pass it to `harper login` to authenticate; the CLI stores the token so subsequent commands don't need credentials repeated. It also saves the URL as the CLI's default target. If the current directory already has a `.env` file, and neither that file nor your environment sets `HARPER_CLI_TARGET` or `CLI_TARGET`, login appends `HARPER_CLI_TARGET` to it.

```bash
harper login <Application URL>
# Provide cluster username and password when prompted
```

See [CLI Authentication](/reference/v5/cli/authentication) for the full set of authentication methods, and [Deploying from a CI/CD Pipeline](/learn/developers/deploying-from-ci) for deploying from GitHub Actions with no stored credential.
