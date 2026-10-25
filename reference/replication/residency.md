---
title: Declarative residency
---

# Declarative residency

<VersionBadge version="v5.4.0" />

`@residency` fixes a table's placement policy in its schema. Every application, operations, and replication thread applies the same policy. A key or record selects a slot, the database's installed slot map selects a shard, and `replication.shard` identifies that shard's current nodes.

Upgrade every schema and data writer before activation. Wire compatibility with earlier peers allows delivery and reads; it does not make an earlier writer enforce the policy. Fallback to peers that cannot advertise a shard-list digest requires an installed custom map and no configured list on either side; otherwise setup disagrees and placement is blocked.

## Configuration

For a new declarative table with no installed map, configure the complete shard-id set on every node. A custom-map conversion does not require this list; leave it unset on both sides when using legacy-peer fallback. See [`replication.shards`](./sharding.md#complete-shard-id-set) for initialization and mismatch handling.

```yaml
replication:
  shard: 0
  shards: [0, 1]
  databases: '*'
```

Give shard `1`'s nodes `shard: 1` and the same `shards` list. The list belongs to deployment configuration; application schemas contain slot policies, not cluster shard IDs.

## Schema directive

```graphql
type Item @table @residency(slots: 1024) {
	id: ID @primaryKey
	category: String @indexed
	body: String
}
```

| Argument      | Meaning                                                                                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `slots`       | Required integer from `1` through `65536`.                                                                                                                      |
| `slotFrom`    | Optional JavaScript expression returning an integer from `0` through `slots - 1`. Key policies expose `id`.                                                     |
| `byAttribute` | Default `false`. When `true`, the expression also exposes `record` and its attribute names, and the slot is stored with the record. Requires a secondary index. |

Declarative tables require [per-table audit logging](../database/transaction.md#enabling-the-transaction-log-per-table) and table replication. Harper refuses activation with `@table(audit: false)`, effective `logging.auditLog: false`, or `@table(replicate: false)`, and refuses disabling these table settings later. The replication route must also reach an owner.

Without `slotFrom`, the slot is the unsigned FNV-1a 32-bit hash of the key's ordered-binary encoding, modulo `slots`. Its offset basis is `2166136261` and its multiplier is `16777619`.

An explicit key policy can preserve an existing partition function:

```graphql
type Item @table @residency(slots: 10, slotFrom: "Number(id.slice(-1))") {
	id: ID @primaryKey
	category: String @indexed
	body: String
}
```

Expressions must be self-contained, deterministic, and synchronous. They compile on every thread without application helpers. An expression that throws, returns a Promise, or produces a non-integer or out-of-range result refuses the write. The last-digit example assumes string keys, matching the existing function being converted. Schema expressions are trusted code, as with computed expressions; they are not a sandbox.

The policy is immutable once activated, including removal of the directive. Redeploying the same policy is idempotent. Calling `setResidency` or `setResidencyById` on a declarative table fails; remove those calls when converting. Existing tables can adopt a key-derived policy with an equivalent custom map. Attribute policies must be declared on a new table because existing rows have no stored slots.

## Ownership, reads, and writes

Owners store full records. With secondary indexes, other nodes keep index projections and receive invalidations. Reads fetch the full body from an owner. RocksDB can cache a temporary replica; LMDB proxies the read without caching it. Replicas retain the canonical record identity and do not become owners or count toward owner confirmation.

A key-policy table without secondary indexes stores nothing on non-owners; reads resolve the owner from the key. Such tables do not cache replicas. Attribute policies require a secondary index so a non-owner can retain the stored slot. If an attribute record's slot is unknown locally, DELETE returns 503 with a message beginning `Attribute residency slot is unknown`. This response does not distinguish a delayed projection from a never-created key or a purged tombstone; local absence cannot prove that the record is absent on its owners. If another node still has the slot metadata, send the deletion there. If no node has it, DELETE cannot succeed anywhere; retrying alone cannot fix that condition. Stop automatic retries and use application-level knowledge to establish whether the key ever existed. Local absence is not proof that it was deleted.

`replicateTo` is ignored for placement on a declarative table; the installed slot map determines where full records are retained. A non-owner accepts a local write and sends the complete body through replication to the owners. On an indexed RocksDB table with positive `replicaExpiration`, it also retains the complete written body as a temporary local replica, allowing an immediate local read while delivery is pending. A newer invalidation replaces it, and the replica sweep expires it. With expiration zero or LMDB, it retains only the index projection; an index-free key policy retains nothing. A replica is a cache, so crash recovery may restore a projection instead. Ingest-heavy non-owners should budget space for approximately their serialized bytes written per second multiplied by `replicaExpiration`, or set expiration to zero. File-backed audit bodies remain until audit retention permits reclamation, even after a replica expires; include that delivery history in the disk budget. Refetched cache files have their own replica lifetime. This requires a configured replication route to an owner. Cross-shard query fan-out and write forwarding are not provided by this directive. Application database branches do not support declarative residency because branches do not replicate.

### Attribute-slot changes

```graphql
type RegionalItem @table @residency(slots: 10, slotFrom: "region", byAttribute: true) {
	id: ID @primaryKey
	region: Int @indexed
	body: String
}
```

Changing `region` sends the complete canonical body to the new owners and invalidates old owners at the same version. This handoff uses full-record replacement ordering: an older concurrent patch does not merge into the replacement. Use application concurrency controls when writers can update a record while its slot changes. When the writer is outside the new owner set, success requires at least one new owner to confirm durable receipt. If no new owner has an active subscription and recent received activity within [`replication.pingTimeout`](../configuration/options.md#replication), the change is refused before commit. This can also refuse an owner whose base copy is not progressing.

Automatic slot-move confirmation waits up to `replication.residencyConfirmationTimeout` (default `30000` ms). Explicit `replicatedConfirmation` uses `replication.confirmationTimeout` instead (default `900000` ms, raised to `blobTimeout` when the confirmation setting is omitted). Both settings are read when a confirmation starts. An explicit setting can lower that timeout independently of blob transfers. Slow transfers can therefore exceed the automatic timeout even on a healthy link.

A connection can fail after admission. An error with `replicationUnconfirmed: true` after local commit means the outcome is uncertain; it does not mean the transaction rolled back. Inspect the record and retry with the application's concurrency controls. Audit retention bounds replay for disconnected peers; it is not an indefinite handoff queue.

### Subscription filters

Non-owner invalidation events contain only indexed fields. A subscription `rowFilter` evaluates that event payload even if a complete replica exists locally. Predicates on unindexed fields can miss updates; a negated predicate can also pass because the field is missing. Use indexed fields for these predicates. Do not use an unindexed event predicate to decide whether a subscriber may learn a record's id or indexed fields.

### Configuration failures and peer identity

Invalid residency configuration at startup quarantines the affected database before replay. Its reads and writes return `DATABASE_RESIDENCY_BLOCKED` with the configuration reason and `retryable: false`; replication does not subscribe or advance its cursor. New tables declared in that database are deferred until a repaired restart; healthy tables in the same application schema still load. Other databases and the operations API remain available. `cluster_status.residency` reports the blocked database. Repair the configuration and restart the node to replay its retained tail. Repairing a system map or restarting an individual worker does not clear the quarantine.

A peer's announced node name must match its authenticated identity or an alias explicitly bound by its configured route or node record. For a canonical hostname reached through an IP address, configure both identities:

```yaml
replication:
  routes:
    - hostname: node-b
      url: wss://192.0.2.20:9933
```

The canonical name is used for topology and confirmations. An announcement cannot create an alias or claim another known node's identity.

## Installed maps

Each database has one versioned snapshot in `system.hdb_residency_slots`. The snapshot contains `database`, `version`, `digest`, `slots`, and complete, nonoverlapping `ranges` with exclusive `end` values. Tables may use different covered prefixes of the map.

First activation requires a writable node; it may need to persist both the map and activation metadata. Activate the policy before switching a node to read-only mode.

For a new declarative table with no map, first activation installs version `1` from only the declared slot count and sorted `replication.shards`: slot `k` maps to `shards[k % shards.length]`. Equal inputs produce the same snapshot and digest on simultaneous installers. The installed snapshot is then authoritative. Changes to the configured shard list never regenerate it.

The first table activated supplies the default slot count; Harper does not choose the maximum across a schema. For tables with different slot counts, install one custom map covering the largest count and wait for the same snapshot on every node before deploying the tables. A later table needing more slots requires an explicit `initialize_residency_slots` extension that preserves every active assignment. It never extends the default automatically. Do not run different initial schema deployments concurrently.

An existing table requires a custom map before activation, even if this node currently holds no rows. A custom map can be installed without `replication.shards`:

```json
{
	"operation": "initialize_residency_slots",
	"database": "data",
	"slots": 10,
	"ranges": [
		{ "start": 0, "end": 5, "shard": 0 },
		{ "start": 5, "end": 10, "shard": 1 }
	]
}
```

This POST operation requires `super_user` and returns the installed snapshot. It changes metadata only. An exact retry is a no-op. Once a declarative table is active, existing assignments cannot change; coverage can only extend without changing active slots. Same-version divergent snapshots are refused rather than resolved by last-write-wins. Deleting an installed map is refused. If its stored snapshot is lost or corrupted, Harper does not reconstruct it from configuration.

Setup exchanges carry the map version/digest and a separate shard-list digest. A missing or conflicting map blocks dependent placement and replication progress and appears in `cluster_status.residency`. A conflict on the system stream can also hold later system updates. Repair the conflicting configuration/map and reconnect; do not assume that skipping the offending record is safe. Resolving independently initialized, differently placed databases may require restoring or exporting the losing data. Reassignments that move data are a separate feature.

There is no operation to delete or reset an active map. If an accidentally initialized joining node has no unique data, stop its traffic and reprovision it with a fresh data directory; receive or install the cluster's exact snapshot before deploying the declarative application. Do not delete individual system-table files. If it has unique data, preserve a backup and restore/export that data before reprovisioning. In custom-map deployments, leaving `replication.shards` unset on every participant prevents premature default installation; lists must still agree across peers.

## Convert an existing by-id table without moving records

### 1. Prepare the existing table

Back up the database and upgrade all writers. Keep the current `setResidencyById` function running during the comparison.

### 2. Install the equivalent map

Install a custom map that reproduces the function's numeric shard result exactly, from one designated node. Wait for the same snapshot on every participant before enabling the directive. On a newly joining node in a custom-map deployment, install or receive that snapshot before deploying its declarative application; otherwise first activation would initialize a default map from the local list.

### 3. Compare placement on every node

Run `verify_residency_slots` on each node while its application worker still runs the old function:

```json
{
	"operation": "verify_residency_slots",
	"database": "data",
	"table": "Item",
	"policy": { "slots": 10, "slotFrom": "Number(id.slice(-1))" }
}
```

This POST operation requires `super_user`. It scans local records and compares the actual old function's numeric shard with the proposed policy and installed map. It reports `checked`, `mismatches`, bounded mismatch samples, observed slots, departed node names, and map identity. It does not rewrite records or activate the policy. Hostname-array functions are not converted: the first nonnumeric return rejects the operation with HTTP 400, rather than counting as a mismatch or inferring a shard. `departedNodeNames` lists names found in stored legacy residency lists that are absent from the node's current known-node list (including itself). A sample of present keys cannot prove equivalence for every future key; the operator must confirm the functions are equivalent.

### 4. Activate the directive

Require zero mismatches and matching maps on every participant. Deploy the directive and remove the setter. The existing deployment can keep writing during the comparison; this is not a quiescing migration operation.

Existing residency IDs remain readable but no longer decide placement. Key-derived records receive no new slot metadata. A stale component that calls a forbidden setter after activation fails visibly and must be updated.

### Rollback

For a key-derived policy, drain cached RocksDB replicas before changing binaries: an earlier binary can interpret one as a full owned record. LMDB does not cache these replicas. Key policies themselves need no slot-format conversion.

1. Back up the database. Pause application requests and background jobs on **every node**, including reads that could admit another replica. Keep them paused through the downgrade.
2. Set `@table(replicaExpiration: 0)` in each affected table's schema and restart every node on the **current** binary, preserving its residency directive. This table argument is in seconds; zero disables new replica admissions. It does not rewrite existing replica deadlines, so waiting for a new, shorter lifetime does not establish a drain.
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
5. Remove the maintenance code, restore the previous binary with the equivalent legacy schema and `setResidencyById` function, then resume traffic. Keep the installed slot map for a later upgrade.

There is no built-in replica-drain operation. If you cannot run and verify this maintenance procedure, restore a preactivation backup instead of attempting an in-place downgrade.

An attribute policy writes a new local primary/audit format. In-place downgrade to an earlier binary is unsupported. Restore a backup from before activation; writes since that backup may be lost. Protocol fallback does not make an earlier binary understand the new local storage format.
