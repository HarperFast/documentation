---
title: Transactions
---

# Transactions

Transactions are an important part of robust handling of data in data-driven applications. HarperDB provides ACID-compliant support for transactions, allowing for guaranteed atomic, consistent, and isolated data handling within transactions, with durability guarantees on commit. Understanding how transactions are tracked and behave is important for properly leveraging transactional support in HarperDB. For most operations this is very intuitive, each HTTP request is executed in a transaction, so when multiple actions are executed in a single request, they are normally automatically included in the same transaction.

Transactions span a database. Once a read snapshot is started, it is an atomic snapshot of all the tables in a database. And writes that span multiple tables in the database will all be committed atomically together (no writes in one table will be visible before writes in another table in the same database). If a transaction is used to access or write data in multiple databases, there will actually be a separate database transaction used for each database, and there is no guarantee of atomicity between separate transactions in separate databases. This can be an important consideration when deciding if and how tables should be organized into different databases.

Because HarperDB is designed to be a low-latency distributed database, locks are avoided in data handling. Because of this, transactions do not lock data within the transaction. When a transaction starts, it will provide a read snapshot of the database for any retrievals or queries, which means all reads will be performed on a single version of the database isolated from any other writes that are concurrently taking place. And within a transaction all writes are aggregated and atomically written on commit. These writes are all isolated (from other transactions) until committed, and all become visible atomically. However, because transactions are non-locking, it is possible that writes from other transactions may occur between when reads are performed and when the writes are committed (at which point the last write will win for any records that have been written concurrently). Support for locks in transactions is planned for a future release.

Transactions can also be explicitly started using the `transaction` global function that is provided in the HarperDB environment:

## `transaction(context?, callback: (transaction) => any): Promise<any>`

This executes the callback in a transaction, providing a context that can be used for any resource methods that are called. This returns a promise for when the transaction has been committed. The callback itself may be asynchronous (return a promise), allowing for asynchronous activity within the transaction. This is useful for starting a transaction when your code is not already running within a transaction (in an HTTP request handler, a transaction will typically already be started). For example, if we wanted to run an action on a timer that periodically loads data, we could ensure that the data is loaded in single transactions like this (note that HDB is multi-threaded and if we do a timer-based job, we very likely want it to only run in one thread):

```javascript
import { tables } from 'harperdb';
const { MyTable } = tables;
if (isMainThread) // only on main thread
	setInterval(async () => {
		let someData = await (await fetch(... some URL ...)).json();
		transaction((txn) => {
			for (let item in someData) {
				MyTable.put(item, txn);
			}
		});
	}, 3600000); // every hour
```

You can provide your own context object for the transaction to attach to. If you call `transaction` with a context that already has a transaction started, it will simply use the current transaction, execute the callback and immediately return (this can be useful for ensuring that a transaction has started).

Once the transaction callback is completed (for non-nested transaction calls), the transaction will commit, and if the callback throws an error, the transaction will abort. However, the callback is called with the `transaction` object, which also provides the following methods and property:

- `commit(): Promise` - Commits the current transaction. The transaction will be committed once the returned promise resolves.
- `abort(): void` - Aborts the current transaction and resets it.
- `resetReadSnapshot(): void` - Resets the read snapshot for the transaction, resetting to the latest data in the database.
- `timestamp: number` - This is the timestamp associated with the current transaction.
