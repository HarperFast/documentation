---
title: Schema-defined sharding
---

# Schema-defined sharding

Schema-defined sharding requires RocksDB. `@sharded` and `initialize_shard_map` refuse LMDB databases; schema refusal fences only the affected database and keeps loading healthy databases in the component. The older per-record residency functions remain available on LMDB. An LMDB database created with an earlier prerelease sharding policy must be exported using that prerelease and recreated on RocksDB before reapplying the schema; removing the directive does not erase the persisted policy.

<VersionBadge version="v5.4.0" />

`@sharded` fixes a table's placement policy in its schema. Every application, operations, and replication thread applies the same policy. The primary key selects a slot, the database's installed slot map selects a shard, and `replication.shard` identifies that shard's current nodes.

Upgrade every schema and data writer before activation. Wire compatibility with earlier peers allows delivery and reads; it does not make an earlier writer enforce the policy. With an installed custom map, recovery-capable peers may omit `replication.shards` only when neither side configures a list. This configuration fallback does not waive the sharding-recovery capability requirement: an older peer can receive compatible records and serve reads, but its announcement holds sharded writes until it is upgraded or removed.

## Configuration

For a new declarative table with no installed map, configure the complete shard-id set on every node. A custom-map conversion does not require this list. Leave it unset consistently if it was not configured; differing shard-list digests still hold placement. All members must run the sharding initialization protocol before converted tables can resume writes. See [`replication.shards`](./sharding.md#complete-shard-id-set) for initialization and mismatch handling.

```yaml
replication:
  shard: 0
  shards: [0, 1]
  databases: '*'
```

Give shard `1`'s nodes `shard: 1` and the same `shards` list. The list belongs to deployment configuration; application schemas contain slot policies, not cluster shard IDs.

## Schema directive

```graphql
type Item @table @sharded {
	id: ID @primaryKey
	category: String @indexed
	body: String
}
```

`slots` is the optional database-wide count, an integer from `1` through `65536`. It adopts the installed map's count, or defaults to `1024`. An explicit count must equal the installed map's count.

The slot is the unsigned FNV-1a 32-bit hash of the primary key's ordered-binary encoding, modulo that count. The offset basis is `2166136261` and multiplier `16777619`. Numeric `-0` and `0` use the same encoding; numeric `5` and string `"5"` are distinct inputs. Updating other fields cannot change the slot.

Only primary-key hashing is supported. Schema declarations using `by` or `slotFrom` are refused. Attribute-derived placement and custom expressions await [concurrent-move design (#1178)](https://github.com/HarperFast/harper-pro/issues/1178).

Declarative tables require [per-table audit logging](../database/transaction.md#enabling-the-transaction-log-per-table) and table replication. Harper refuses activation with `@table(audit: false)`, effective `logging.auditLog: false`, or `@table(replicate: false)`, and refuses disabling these table settings later. The replication route must reach an owner.

The policy is immutable once activated; changing its count or removing the directive is refused. Redeploying the same policy is idempotent. `setResidency` and `setResidencyById` are refused on declarative tables. Existing tables can adopt primary-key hashing only with a map that preserves their placement.

## Ownership, reads, and writes

Owners store full records. With secondary indexes, other nodes keep index projections and receive invalidations. Reads fetch the full body from an owner. A non-owner can cache a temporary replica. Replicas retain the canonical record identity and do not become owners or count toward owner confirmation.

A table without secondary indexes stores nothing on non-owners; reads resolve the owner from the key. Such tables do not cache replicas.

`replicateTo` is ignored for placement on a declarative table; the installed slot map determines where full records are retained. A non-owner accepts a local write and sends the complete body through replication to the owners. On an indexed RocksDB table with positive `replicaExpiration`, it also retains the complete written body as a temporary local replica, allowing an immediate local read while delivery is pending. A newer invalidation replaces it, and the replica sweep expires it. With expiration zero, it retains only the index projection; an index-free key policy retains nothing. A replica is a cache, so crash recovery may restore a projection instead. Ingest-heavy non-owners should budget space for approximately their serialized bytes written per second multiplied by `replicaExpiration`, or set expiration to zero. File-backed audit bodies remain until audit retention permits reclamation, even after a replica expires; include that delivery history in the disk budget. Refetched cache files have their own replica lifetime. This requires a configured replication route to an owner. Cross-shard query fan-out and write forwarding are not provided by this directive. Application database branches do not support sharding because branches do not replicate.

Local-only writes succeed without replication confirmation. They do not deliver a local audit body to owners. The node retains a writer replica, index projection, or no row according to its replica and index settings.

Explicit `replicatedConfirmation` uses `replication.confirmationTimeout` (when the configuration key is unset, the greater of `900000` ms and `replication.blobTimeout`). An error with `replicationUnconfirmed: true` after local commit means the requested confirmation was not obtained; it does not mean rollback. Inspect the record and apply the application's concurrency controls before retrying.

### Subscription filters

Non-owner invalidation events contain only indexed fields. A subscription `rowFilter` evaluates that event payload even if a complete replica exists locally. Predicates on unindexed fields can miss updates; a negated predicate can also pass because the field is missing. Use indexed fields for these predicates. Do not use an unindexed event predicate to decide whether a subscriber may learn a record's id or indexed fields.

### Configuration failures and peer identity

Invalid sharding configuration at startup quarantines the affected database before replay. Its reads and writes return `DATABASE_SHARDING_BLOCKED` with the configuration reason and `retryable: false`; replication does not subscribe or advance its cursor. New tables declared in that database are deferred until a repaired restart; healthy tables in the same application schema still load. Other databases and the operations API remain available. `cluster_status.sharding` reports the blocked database. Repair the configuration and restart the node to replay its retained tail. Repairing a system map or restarting an individual worker does not clear the quarantine.

A disagreement detected after startup places the affected database in a live hold. Reads and writes, including those on its unsharded tables, return `DATABASE_SHARDING_HELD` with `retryable: true`. Other databases in the same schema continue serving. Repairing the configuration clears this hold on every worker without a worker restart. Each process observes the root file; after the 150 ms settling interval, affected replication connections reconnect automatically to refresh peer agreement. Wait for the held state to clear before retrying writes. In `cluster_status.sharding`, `state: held` identifies this recoverable condition; `state: quarantined` and `restartRequired: true` identify the startup quarantine described above. A rolling shard-list configuration change can hold every sharded database until all peers agree. If an environment variable such as `HARPER_SET_CONFIG` supplies the shard list, update that provisioning value too: a full process restart re-applies it and can undo a file-only repair.

A peer's announced node name must match its authenticated identity or an alias explicitly bound by its configured route or node record. For a canonical hostname reached through an IP address, configure both identities:

```yaml
replication:
  routes:
    - hostname: node-b
      url: wss://192.0.2.20:9933
```

The canonical name is used for topology and confirmations. An announcement cannot create an alias or claim another known node's identity.

## Recovery sources

An owning node receives a live stream for origin X directly from X or through a co-owner in its own shard. Failover selects a peer in the receiver's shard. If neither source is reachable, that origin waits without advancing its cursor; `cluster_status.sharding` identifies the waiting origin and the missing source. Non-owners may relay projections to other non-owners.

Bootstrapping or making a full copy of an owning node requires a same-shard peer or a complete backup for its owned slots. A copy from any peer remains allowed for slots the receiver does not own. A fast clone owning zero slots can bootstrap from any peer.

On first initialization, sharded writes return a retryable 503 until the configured members have connected and acknowledged the initial history state. Requests do not keep transactions open while initialization waits. A missing member is reported as waiting rather than treated as proof of an empty shard. Once initialized, ordinary operation does not require every member to remain connected. Replacement nodes learn the existing history state and recover a complete owned baseline before they can act as a complete recovery source.

A fresh node may start its owned slots empty only when the installed map is the initial version and those slots have no write history. An empty current table is not sufficient: deleted records and lost storage do not erase history. Otherwise, if the entire shard is lost, restore a complete backup. Status reports the backup requirement instead of treating an incomplete copy as recovery. Maps are installed before declarative writes begin; conversion of existing data uses the paused operator-assertion procedure below. Later ownership changes require the [slot-move workflow](https://github.com/HarperFast/harper-pro/issues/1053), which copies from the old owners.

### Recovering a lost node

Choose one recovery route before restarting a node whose local data or audit history was lost:

- **Keep the original node name:** restore a complete backup taken while the node was stopped after its last accepted write, preserving the database roots and their audit history. An earlier backup that omits accepted writes does not qualify for same-name recovery. Restore the matching catalog metadata with the audit; copying table rows alone is insufficient. Restart the node with its original configuration and confirm that `cluster_status.sharding.<database>.recovery.phase` becomes `ready` before admitting writes.
- **Recover from co-owner snapshots:** stop the failed node, provision a fresh data root with a **new `node.hostname`**, and configure the same `replication.shard` and shard list. Join it through the normal [`add_node` procedure](./clustering.md#add-node). Keep a complete same-shard peer available for the copy. Remove the failed name through [`remove_node`](./clustering.md#remove-node), including on any peers that were offline during removal, and check the new node's recovery status before admitting writes.

A node reusing a name whose earlier origin history is known to peers, without the corresponding local history, refuses sharded writes and cannot serve as an owned-slot recovery source. Its recovery status reports `origin-history-lost` and names both remedies: restore a complete backup, or rejoin under a new node name. Waiting for its clock to advance does not repair the missing history.

While this node lacks its frozen origin start, outgoing replication for the affected database is held, including ordinary tables sharing its stream. Ordinary local writes can still succeed; that response does not confirm delivery to another node. Stop all application writes to that database before recovery, preserve any unique ordinary-table writes accepted after the failure, and export or restore them before replacing the root. Other databases remain independent.

Co-owners continue relaying the old name's retained audit entries after membership removal. Keep those co-owners and their audit history available until lagging peers have received the old writes; membership removal does not replace normal audit retention requirements. The new name's writes use a separate origin, so receiving them does not certify receipt of the old origin's pending writes.

If an entire shard was lost, a new name alone cannot recover its bodies: restore a complete backup. Each name restored without its original audit needs the snapshot-only route above. A new storage root in an initialized database cannot borrow another root's origin history; recover missing history before enabling writes.

Snapshot recovery also marks the database's record-lock lineage as recloned: it cannot prove continuity of its earlier local history, including for ordinary tables in the same database. A complete backup preserving the original history avoids that limitation. Future [origin incarnations](https://github.com/HarperFast/harper-pro/issues/1123#issuecomment-6414845915) will allow a wiped node to keep its hostname while originating under a new root generation; that is not supported in this release.

Every member must support sharding recovery admission. An authenticated announcement from an older binary holds sharded writes, even after initialization; ordinary tables and system metadata remain available. This observation survives restart and matching map/schema messages cannot clear it. Upgrade the peer or remove it from the configured membership. An offline peer's unannounced downgrade cannot be detected until it reconnects.

Arbitrary cross-shard relay and clone layouts for owners are unsupported in this release. [Complete-body recovery from origin audit logs](https://github.com/HarperFast/harper-pro/issues/1123) tracks broader topology support, including handling origins whose full audit history is no longer retained.

## Installed maps

Each database has one versioned snapshot in `system.hdb_residency_slots`. The snapshot contains `database`, `version`, `digest`, `slots`, and complete, nonoverlapping `ranges` with exclusive `end` values. Every sharded table in that database uses the same slot count.

First activation requires a writable node; it may need to persist both the map and activation metadata. Activate the policy before switching a node to read-only mode.

For a new declarative table with no map, first activation installs version `1` from the explicit count (or `1024` when omitted) and sorted `replication.shards`: slot `k` maps to `shards[k % shards.length]`. Equal inputs produce the same snapshot and digest on simultaneous installers. The installed snapshot is then authoritative. Changes to the configured shard list never regenerate it.

`slots` is a database-wide value. An omitted count adopts the installed map's count. An explicit different count is refused with an error naming both counts. Once a sharded table is active, changing the count is refused because it would change hash placement. Separate maps per slot count are deferred: custom-map administration and future [slot moves (#1053)](https://github.com/HarperFast/harper-pro/issues/1053) would need to apply to every map. Do not run incompatible first schema deployments concurrently.

An existing table requires a custom map before activation, even if this node currently holds no rows. A custom map can be installed without `replication.shards`:

```json
{
	"operation": "initialize_shard_map",
	"database": "data",
	"slots": 10,
	"ranges": [
		{ "start": 0, "end": 5, "shard": 0 },
		{ "start": 5, "end": 10, "shard": 1 }
	]
}
```

This POST operation requires `super_user` and returns the installed snapshot. It changes metadata only. An exact retry is a no-op. Once a declarative table is active, neither existing assignments nor the database slot count can change. Same-version divergent snapshots are refused rather than resolved by last-write-wins. Deleting an installed map is refused. If its stored snapshot is lost or corrupted, Harper does not reconstruct it from configuration.

Setup exchanges carry the map version/digest and a separate shard-list digest. A missing or conflicting map blocks dependent placement and replication progress and appears in `cluster_status.sharding`. A conflict on the system stream can also hold later system updates. Repair the conflicting configuration/map and reconnect; do not assume that skipping the offending record is safe. Resolving independently initialized, differently placed databases may require restoring or exporting the losing data. Reassignments that move data are a separate feature.

There is no operation to delete or reset an active map. If an accidentally initialized joining node has no unique data, stop its traffic and reprovision it with a fresh data directory; receive or install the cluster's exact snapshot before deploying the declarative application. Do not delete individual system-table files. If it has unique data, preserve a backup and restore/export that data before reprovisioning. In custom-map deployments, leaving `replication.shards` unset on every participant prevents premature default installation; lists must still agree across peers.

## Limitations

Attribute-derived sharding and custom slot expressions are unavailable pending [concurrent-move design (#1178)](https://github.com/HarperFast/harper-pro/issues/1178). Slot migration is separate work in [#1053](https://github.com/HarperFast/harper-pro/issues/1053).

Owner recovery requires the [sources described above](#recovery-sources). Arbitrary cross-shard owner recovery is deferred to [#1123](https://github.com/HarperFast/harper-pro/issues/1123).

## Older per-record residency APIs

`setResidency`, `setResidencyById`, `getResidency`, and residency lists retain their names and remain the older per-record mechanism. Use the conversion procedure below when adopting schema-defined sharding for an existing by-id table.

## Convert an existing by-id table without moving records

Check eligibility before installing a map: the legacy function must agree with the primary-key hash and proposed ranges for every record. Last-digit or modulo recipes are not generally equivalent to this hash. Compare the functions offline first; custom `slotFrom` policies remain unsupported pending [#1178](https://github.com/HarperFast/harper-pro/issues/1178). An installed map cannot be deleted.

### 1. Prepare the existing table

Back up the database and upgrade all writers. Keep the current `setResidencyById` function running during the comparison.

### 2. Install the equivalent map

The existing function must agree with the supported primary-key hash and the proposed map for every stored record. Arbitrary legacy expressions cannot be adopted yet. Install the equivalent map from one designated node. Wait for the same snapshot on every participant before enabling the directive. On a newly joining node in a custom-map deployment, install or receive that snapshot before deploying its declarative application; otherwise first activation would initialize a default map from the local list.

### 3. Compare placement on every node

Run `verify_shard_map` on each node while its application worker still runs the old function:

```json
{
	"operation": "verify_shard_map",
	"database": "data",
	"table": "Item",
	"policy": { "slots": 10 }
}
```

This POST operation requires `super_user`. It scans local records and compares the actual old function's numeric shard with the proposed policy and installed map. It reports `checked`, `mismatches`, bounded mismatch samples, observed slots, departed node names, and map identity. It does not rewrite records or activate the policy. Hostname-array functions are not converted: the first nonnumeric return rejects the operation with HTTP 400, rather than counting as a mismatch or inferring a shard. `departedNodeNames` lists names found in stored legacy residency lists that are absent from the node's current known-node list (including itself). A sample of present keys cannot prove equivalence for every future key; the operator must confirm the functions are equivalent.

### 4. Assert each existing owner's completeness

Require zero mismatches and matching maps on every participant. Placement comparison examines the records present on a node; it does not prove that the node holds every record it should own. The operator must establish that completeness independently.

Pause legacy writes across the cluster before asserting completeness, and keep them paused through activation. On each existing owner, submit the digest returned by map installation:

```json
{
	"operation": "initialize_shard_map",
	"database": "data",
	"existing_owner": true,
	"expected_digest": "<installed map digest>"
}
```

This is an **operator assertion of completeness**, not something Harper verifies. It is bound to every captured local database root generation, its existing tables and the expected map digest. A partial set of receipts is uncertified, and a later legacy table conversion needs a new assertion. A digest mismatch is refused without storing an assertion. The operation does not declare a sharded table, and `verify_shard_map` remains read-only.

Without the assertion, a converted legacy root stays uncertified. It may serve and copy nonowned data, but it cannot supply recovery for owned slots; `cluster_status.sharding` names the missing assertion. A replaced root does not inherit an assertion from replicated schema metadata. An uncertified node may still return a locally present body; completeness gating cannot detect that such a body is stale. It must not report an owned miss as authoritative absence or act as an owned recovery source.

### 5. Activate the directive

Deploy the directive and remove the setter. Wait for sharding initialization to complete on the owners before resuming writes. A member still running the previous binary cannot acknowledge initialization: writes remain refused and status names the missing member until it is upgraded. Writes can continue during the earlier placement comparison; the completeness assertion and activation form the paused cutover.

Existing residency IDs remain readable but no longer decide placement. Key-derived records receive no new slot metadata. A stale component that calls a forbidden setter after activation fails visibly and must be updated.

### Convert an existing unsharded table

An existing table without a residency function can also gain `@sharded`. Pause writes, install the desired custom map, and establish that every future owner already has all the records assigned to it. For a previously fully replicated table, check that every future owner has caught up before proceeding. Use the same `initialize_shard_map` request with `existing_owner: true` and the exact `expected_digest` on each owner, then deploy the key-derived directive and wait for initialization before resuming writes.

This is the same operator assertion of completeness as the by-id procedure; Harper does not verify that every required record is present. `verify_shard_map` compares a legacy by-id function and does not replace this assertion for an unsharded table. A mismatched digest stores no assertion. Without the assertion, status names the missing completeness assertion and the node cannot supply owned-slot recovery.

Key-derived conversion retains existing non-owner full copies locally; it does not relocate, purge, rewrite, or change the versions of existing rows. Those copies do not confer ownership or qualify the node as an owned-slot recovery source. Index-free reads load from the owner rather than trusting a retained non-owner body; indexed tables receive ordinary invalidations. Bootstrap may add missing non-owner index projections. Subsequent writes follow the new replica/projection placement rules. Conversion alone therefore does not remove previously replicated bodies from a region; account for those copies when planning a data-residency cutover.

### Rollback

The in-place procedure below applies to key-derived tables converted from an equivalent `setResidencyById` policy. It does not restore full replication for a table that had no residency function: removing `@sharded` cannot backfill full bodies on former non-owners. For that conversion, restore a complete preactivation backup instead. Preserve and reconcile writes accepted after the backup before restoring it, or those writes can be lost.

For a key-derived policy, drain cached RocksDB replicas before changing binaries: an earlier binary can interpret one as a full owned record. Key policies themselves need no slot-format conversion.

1. Back up the database. Pause application requests and background jobs on **every node**, including reads that could admit another replica. Keep them paused through the downgrade.
2. Set `@table(replicaExpiration: 0)` in each affected table's schema and restart every node on the **current** binary, preserving its sharding directive. This table argument is in seconds; zero disables new replica admissions. It does not rewrite existing replica deadlines, so waiting for a new, shorter lifetime does not establish a drain.
3. Run the following trusted maintenance code for each affected table on every node. Run it inside the application worker with access to `tables`; do not expose it as a public endpoint. This procedure is for the 5.4 implementation and uses internal primary metadata (`REPLICA = 4`); verify the matching implementation before using it with another release. It evicts only cached replicas, preserving owned rows and legacy-compatible invalidated index projections. The runtime TTL call below repeats step 2 defensively on this table handle and preserves its other TTL settings. These APIs are trusted worker internals, not Operations API commands.

```js
async function drainResidencyReplicas(Table) {
	const REPLICA = 4;
	Table.setTTLExpiration({ replicaExpiration: 0 });
	for (const entry of Table.primaryStore.getRange({ start: true })) {
		if (entry.metadataFlags & REPLICA) await Table.evict(entry.key, entry.value, entry.version);
	}
	let remaining = 0;
	for (const entry of Table.primaryStore.getRange({ start: true })) if (entry.metadataFlags & REPLICA) remaining++;
	if (remaining) throw new Error(`${remaining} replicas remain; do not downgrade`);
	return { remaining };
}
await drainResidencyReplicas(tables.Item);
```

4. Require `{ remaining: 0 }` for every affected table on every node. Eviction is version-checked; a busy replica can survive a pass, so a nonzero result refuses the downgrade. Do not use ordinary record counts as proof: projections and replicas share keys.
5. Remove the maintenance code, restore the previous binary with the equivalent legacy schema and `setResidencyById` function, then resume traffic. Keep the installed slot map for a later upgrade. Local assertion receipts also survive restart and downgrade: their trust remains the operator's responsibility while the equivalent legacy placement is in use, not a new verification by Harper on re-upgrade.

There is no built-in replica-drain operation. If you cannot run and verify this maintenance procedure, restore a preactivation backup instead of attempting an in-place downgrade.
