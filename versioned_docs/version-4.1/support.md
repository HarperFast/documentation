---
title: Support
---

# Support

HarperDB support is available with all paid instances. Support tickets are managed via our [Zendesk portal](https://harperdbhelp.zendesk.com/hc/en-us/requests/new). Once a ticket is submitted the HarperDB team will triage your request and get back to you as soon as possible. Additionally, you can join our [Slack community](https://harperdbcommunity.slack.com/join/shared_invite/zt-e8w6u1pu-2UFAXl_f4ZHo7F7DVkHIDA#/) where HarperDB team members and others in the community are frequently active to help answer questions.

- [Submit a Support Ticket](https://harperdbhelp.zendesk.com/hc/en-us/requests/new)
- [Join Our Slack Community](https://harperdbcommunity.slack.com/join/shared_invite/zt-e8w6u1pu-2UFAXl_f4ZHo7F7DVkHIDA#/)

---

### Common Issues

**1 Gigabyte Limit to Request Bodies**

HarperDB supports the body of a request to be up to 1 GB in size. This limit does not impact the CSV file import function the reads from the local file system or from an external URL. We recommend if you do need to bulk import large record sets that you utilize the CSV import function, especially if you run up on the 1 GB body size limit. Documentation for these functions can be found here.

**Do not install as sudo**

HarperDB should be installed using a specific user for HarperDB. This allows you to restrict the permissions that user has and who has access to the HarperDB file system. The reason behind this is that HarperDB files are written directly to the file system, and by using a specific HarperDB user this gives you granular control over who has access to these files.

**Error: Must execute as User**

You may have gotten an error like, `Error: Must execute as <<username>>.` This means that you installed HarperDB as `<<user>>`. Because HarperDB stores files directly to the file system, we only allow the HarperDB executable to be run by a single user. This prevents permissions issues on files. For example if you installed as user_a, but later wanted to run as user_b. User_b may not have access to the database files HarperDB needs. This also keeps HarperDB more secure as it allows you to lock files down to a specific user and prevents other users from accessing your files.

---

### Frequently Asked Questions (FAQs)

**What operating system should I use to run HarperDB?**

All major operating systems: Linux, Windows, and macOS. However, running HarperDB on Windows and macOS is intended only for development and evaluation purposes. Linux is strongly recommended for production use.

**How are HarperDB’s SQL and NoSQL capabilities different from other solutions?**

Many solutions offer NoSQL capability and separate processing for SQL such as in-memory transformation or multi-model support. HarperDB’s unique mechanism for storing each data attribute individually allows for performing NoSQL and SQL operations in real-time on the stored data set.

**How does HarperDB ensure high availability and consistency?**

HarperDB's clustering and replication capabilities allow high availability and fault-tolerance; if a server goes down, traffic can be quickly routed to other HarperDB servers that can service requests. HarperDB's replication uses a consistent resolution strategy (last-write-wins by logical timestamp), to ensure eventual consistency. HarperDB offers auditing capabilities that can be enabled to preserve a record of all changes so that mistakes or even malicious data changes are recorded and can be reverted.

**Is HarperDB ACID-compliant?**

HarperDB operations are atomic, consist, and isolated per instance. This means that any query will provide an isolated consistent snapshot view of the database (based on when the query started. Updating and insertion operations are also performed atomically; any reads and writes are performed within an atomic, isolated transaction with serialization isolation level, and will rollback if it can not be fully completed successfully. Data is immediately flushed to disk after a write to ensure eventual durability. ACID compliance is not guaranteed across instances in a cluster, rather the eventual consistency will propagate changes with last-write-wins (by last logical timestamp) resolution.

**How Does HarperDB Secure My Data?**

HarperDB has role and user based security allowing you to simply and easily control that the right people have access to your data. We also implement a number of authentication mechanisms to ensure the transactions submitted are trusted and secure.

**Is HarperDB row or column oriented?**

HarperDB can be considered column oriented, however, the exploded data model creates an interface that is free from either of these orientations. A user can search and update with columnar benefits and be as ACID as row oriented restrictions.

**What do you mean when you say HarperDB is single model?**

HarperDB takes every attribute of a database table object and creates a key:value for both the key and its corresponding value. For example, the attribute eye color will be represented by a key "eye-color" and the corresponding value "green" will be represented by a key with the value "green". We use LMDB’s lightning-fast key:value store to underpin all these interrelated keys and values, meaning that every "column" is automatically indexed, and you get huge performance in a tiny package.

**Are Primary Keys Case-Sensitive?**

When using HarperDB, primary keys are case-sensitive. This can cause confusion for developers. For example, if you have a user table, it might make sense to use `user.email` as the primary key. This can cause problems as Harper@harperdb.io and harper@harperdb.io would be seen as two different records. We recommend enforcing case on keys within your app to avoid this issue.

**How Do I Move My HarperDB Data Directory?**

HarperDB’s data directory can be moved from one location to another by simply updating the `rootPath` in the config file (where the data lives, which you specified during installation) to a new location.

Next, edit HarperDB’s hdb_boot_properties.file to point HarperDB to the new location by updating the settings_path variable. Substitute the NEW_HDB_ROOT variable in the snippets below with the new path to your new data directory, making sure you escape any slashes.

On MacOS/OSX

```bash
sed -i '' -E 's/^(settings_path[[:blank:]]*=[[:blank:]]*).*/\1NEW_HDB_ROOT\/harperdb-config.yaml/' ~/.harperdb/hdb_boot_properties.file
```

On Linux

```bash
sed -i -E 's/^(settings_path[[:blank:]]*=[[:blank:]]*).*/\1NEW_HDB_ROOT\/harperdb-config.yaml/' ~/hdb_boot_properties.file
```

Finally, edit the config file in the root folder you just moved:

- Edit the `rootPath` parameter to reflect the new location of your data directory.
