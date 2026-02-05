---
title: Best Practices and Recommendations
---

# Best Practices and Recommendations

HarperDB is designed for minimal administrative effort, and with managed services these are handled for you. But there are important things to consider for managing your own HarperDB servers.

### Data Protection and (Backup and) Recovery

As a distributed database, data protection and recovery can benefit from different data protection strategies than a traditional single-server database. But multiple aspects of data protection and recovery should be considered:

- Availability: As a distributed database HarperDB is intrinsically built for high-availability and a cluster will continue to run even with complete server(s) failure. This is the first and primary defense for protecting against any downtime or data loss. HarperDB provides fast horizontal scaling functionality with node cloning, which facilitates ease of establishing high availability clusters.
- [Audit log](administration/logging): HarperDB defaults to tracking data changes so malicious data changes can be found, attributed, and reverted. This provides security-level defense against data loss, allowing for fine-grained isolation and reversion of individual data without the large-scale reversion/loss of data associated with point-in-time recovery approaches.
- Snapshots: When used as a source-of-truth database for crucial data, we recommend using snapshot tools to regularly snapshot databases as a final backup/defense against data loss (this should only be used as a last resort in recovery). HarperDB has a [`get_backup`](../developers/operations-api/databases-and-tables#get-backup) operation, which provides direct support for making and retrieving database snapshots. An HTTP request can be used to get a snapshot. Alternatively, volume snapshot tools can be used to snapshot data at the OS/VM level. HarperDB can also provide scripts for replaying transaction logs from snapshots to facilitate point-in-time recovery when necessary (often customization may be preferred in certain recovery situations to minimize data loss).

### Horizontal Scaling with Node Cloning

HarperDB provides rapid horizontal scaling capabilities through [node cloning functionality described here](administration/cloning).

### Replication Transaction Logging

HarperDB utilizes NATS for replication, which maintains a transaction log. See the [transaction log documentation for information on how to query this log](administration/logging).
