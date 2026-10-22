---
title: Concurrency and Consistency
---

# Concurrency and Consistency

Harper provides request transactions, atomic increments and decrements, storage conflict resolution, and native record locks. Choose the primitive that protects your application's requirement before adding client write queues, JavaScript mutexes, version columns, compare-and-swap (CAS) retry loops, lock tables, external coordinators, or sticky routing. Application coordination is needed only for a requirement those primitives do not satisfy.

Harper 5.3.2 is the verification baseline for this page, not an upper version limit. Check the deployed version, storage engine, topology, and Harper Pro configuration before selecting a lock scope.

## Choose a Primitive

| Requirement                                                                       | Harper primitive                                             | Boundary                                                                                       |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Several writes succeed or fail together in one HTTP request                       | Automatic request transaction; await the writes              | Atomicity spans one database, not different databases or separate requests.                    |
| A timer or background task needs a transaction                                    | `transaction(async () => { ... })`                           | Background work needs an explicit transaction scope.                                           |
| Concurrent increments or decrements                                               | `Table.update(id)` followed by `addTo()` or `subtractFrom()` | Atomic deltas preserve concurrent increments. A preceding read/check is not part of the delta. |
| Read a record, check a condition, and update it while excluding competing writers | Server-side `Table.lock(id, options?)`                       | Every conflicting writer must participate. Scope, timestamp, and recovery limits apply.        |
| Resolve storage-level optimistic transaction conflicts                            | Harper's internal conflict resolution and commit retries     | These do not rerun application checks or external side effects.                                |
| Reject an edit because a form is stale                                            | A server-enforced stale-edit precondition                    | This is an application policy, separate from storage conflict handling.                        |

Transactions normally provide a consistent read snapshot and atomic writes across tables in one database. Lock acquisition reloads committed data and can release an earlier read snapshot, so acquire the lock before reading the condition. A transaction alone does not make a read/check/write sequence exclusive against another request. See [`transaction()`](./api.md#transactioncontext-callback) and the [Resource instance methods](../resources/resource-api.md#resource-instance-methods).

Atomic deltas are appropriate for counters. A stock decrement is safe as a delta, but "stock must never go below zero" also needs protection for the check. The same distinction applies to balance floors, capacity limits, claim-once behavior, and ordered ticket allocation.

## Native Record Locks

<VersionBadge version="v5.3.0" />
<EngineBadge engines="RocksDB" />

`await Table.lock(id, options?, context?)` acquires a lock and returns a mutable record joined to the supplied or ambient transaction. Acquire it before other writes and before reading the value used by the condition. Mutate the returned record and call `await record.save()`. With the default `hold: false`, the transaction releases the lock on commit or abort. Do not call `record.unlock()` before the transaction commits.

`lock()` is an in-process API for server Resources and Components. It has no authorization check of its own and is not a REST `LOCK` method. Authenticate and authorize the caller before using it. Ordinary requests do not automatically acquire record locks.

### Options and Lifetime

| Option    | Type                    | Default                                                                   | Meaning                                                                                                                     |
| --------- | ----------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `scope`   | `'node'` or `'cluster'` | Cluster for replicated tables when supported; node for `replicate: false` | Node scope coordinates the node's worker threads. Cluster scope also coordinates nodes through Harper Pro.                  |
| `lease`   | `number` (milliseconds) | `30000`                                                                   | Maximum time the lock can remain held. Keep the critical section within this lease.                                         |
| `timeout` | `number` (milliseconds) | `30000`                                                                   | Maximum wait for acquisition. Choose a value within the request's latency budget. The option is `timeout`, not `timeoutMs`. |
| `hold`    | `boolean`               | `false`                                                                   | `true` keeps the lock beyond the transaction until explicit `record.unlock()` or lease expiry.                              |

`lease` must be a finite number from `100` to `300000`; `timeout` must be a finite number from `1` to `300000`. Invalid options reject with `400`. In particular, `timeout: 0` is not a non-blocking acquisition option.

Prefer transaction-scoped locks. A lock acquired outside a request or explicit `transaction()` can remain held until unlock or expiry. Keep external network calls outside the critical section: aborting a Harper transaction cannot undo a payment or another external side effect.

When correctness requires cross-node coordination, set `scope: 'cluster'` explicitly. This fails closed if the Harper Pro cluster-lock transport and home-map configuration are unavailable. With an implicit default, a core-only deployment can fall back to node scope; the existence of `lock()` alone does not establish cluster protection. Revisit an explicit `scope: 'node'` before adding nodes.

Cluster locks require RocksDB, Harper Pro with `replication.recordLocks: true`, and an agreed home map for the database. The map names every participating node; a record's **home** is the node that arbitrates its locks. A **generation** identifies one agreed version of that map. Enabling the configuration flag alone does not create a map. Follow the versioned [home-map setup and transition procedure](https://github.com/HarperFast/harper-pro/blob/v5.3.2/replication/RECORD_LOCK_HOMES_DESIGN.md#the-operation): agree the complete participant list, stage and stop the old generation, drain outstanding locks, then activate the agreed generation. Do not derive separate maps from each node's current view of reachable peers.

### Participating Writers

Locks exclude other `lock()` callers on the same key. Plain `put`, `patch`, `delete`, and `create` calls are not blocked. Unlocked `update()` calls using `addTo()` or `subtractFrom()` are not blocked either. Every writer that can violate the condition must use the same locking path, including automatic REST writes and delta updates to guarded fields. Use [table extensions](../resources/overview.md#extending-a-table) to enforce that path, or restrict endpoints that bypass it.

### Example: Reserve One Item

This example is for one RocksDB node and a non-replicated table. The table has no `@export`, so it does not expose an automatic REST write endpoint. Call `reserveOne()` from an authorized server path. All other writers of `Inventory.quantity` must use the same lock. The explicit transaction also permits calling the function from a background task.

```graphql
type Inventory @table(replicate: false) {
	id: ID @primaryKey
	quantity: Int
}
```

```javascript
import { tables, transaction } from 'harper';

export async function reserveOne(id) {
	return transaction(async () => {
		const record = await tables.Inventory.lock(id, { scope: 'node', timeout: 1000 });
		if (!(record.quantity >= 1)) {
			throw Object.assign(new Error('Insufficient stock'), { statusCode: 409 });
		}
		record.subtractFrom('quantity', 1);
		await record.save();
		return { id, reserved: 1 };
	});
}
```

The condition failure throws, so the transaction aborts and releases its lock. Returning an error-shaped object would instead commit. With stock `1`, two competing calls should produce one reservation and one insufficient-stock error, leaving stock `0`. This single-record example does not establish the multi-record or cluster recovery guarantees discussed below.

### Errors

Lock rejections expose `error.statusCode`:

| Status | Meaning                                                                            | Handling                                                                                           |
| ------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `409`  | A write through an expired/released lock, or a commit submitted after lease expiry | Abort the operation. An application stale-edit response must be distinguishable from this failure. |
| `423`  | Lock contention exceeded the wait budget                                           | Propagate it or retry within a bounded policy for an operation safe to repeat.                     |
| `503`  | Coordination is unavailable                                                        | Fail the operation; do not perform the write unlocked.                                             |
| `501`  | The storage engine is LMDB                                                         | Use a supported deployment or a design that satisfies the requirement without this primitive.      |

Application retries are separate from Harper's internal commit retries. Account for repeated requests and external side effects. Lease checks reject expired-lock writes and commits submitted after expiry; they do not guarantee cancellation of a native commit already in progress.

### Timestamp and Recovery Limits

Locks leave normal conflict resolution unchanged in both node and cluster scope. Earlier writes or another lock in the same transaction can fix its timestamp before a later locked update. That update can lose to an intervening commit even after reading its value, with all writers participating and no clock skew or crash. Acquiring several locks in one request therefore does not establish serializable multi-record read/check/write. Atomic deltas help only where the invariant permits them. Clock skew or a deliberately future transaction timestamp can also let a predecessor's write outrank its successor's under last-write-wins.

Cluster locks provide exclusion, not global serializable transactions or quorum durability. On a clean handoff, the home retains **release dependencies**, the replication positions the next holder must receive before using the record. Home restart, generation change, or eviction can lose those dependencies even after a clean release. Recovery then uses a **barrier**, a check that earlier writes have settled and replicated. An unreachable predecessor can block acquisition; a native commit that settles after that barrier can leave a successor reading stale data. Client retries, replication headers, and origin pinning do not establish a stronger guarantee. Define and verify any stronger cross-record or cross-node requirement before designing additional coordination.

The versioned [lock contract](https://github.com/HarperFast/harper/blob/v5.3.2/resources/record-locks.md) and [Table implementation](https://github.com/HarperFast/harper/blob/v5.3.2/resources/Table.ts) describe these boundaries.

## Optimistic Concurrency and Stale Edits

Harper handles storage-level optimistic transaction conflicts and retries commits internally. An application version field, browser CAS loop, or whole-request retry wrapper is not needed to duplicate that work. The [commit implementation](https://github.com/HarperFast/harper/blob/v5.3.2/resources/DatabaseTransaction.ts) does not rerun the handler's business logic.

For a conditional update, evaluate native `lock()` first within its supported scope. A separate version comparison followed by `put()` or `patch()` is not atomic CAS. In Harper 5.3.2, application-facing table writes do not expose an `ifVersion` precondition, and automatic REST writes do not enforce `If-Match`. Conditional GET and ETag support does not change that.

"Warn or reject if this form is stale" is a separate product requirement. A product-specific revision token can serve that policy, but needs an atomic server-enforced comparison and write. For a single record, acquire the lock first in the transaction, compare the client's token with the locked record's revision, reject a mismatch with `409`, otherwise advance the revision and save. All conflicting writers must participate, and the scope, timestamp, and recovery limits must satisfy the requirement. Verify the revision representation and supported precondition mechanism for the deployed version before implementing it.

Give a stale-edit response a distinguishable application error code or body. A bare `409` can also mean lease expiry and must not cause a client to discard unsaved edits. Automatic storage conflict handling does not promise to reject stale forms.

## Request, Node, and Browser Origin

One browser origin does not imply one Harper worker, node, or transaction. A browser queue serializes only that client's work. Separate HTTP requests do not share a request snapshot, and using one URL does not create a cluster-wide snapshot or remove replication lag.

For a coherent unit of work, put related reads and writes in one request transaction within one database. For counters, use atomic deltas. For participating conditional writers, evaluate native locks and their scope. Sticky routing or a single-origin architecture should not be the default answer to concurrency. State the required cross-request or cross-node freshness and check the deployment's guarantees before adding coordination.
