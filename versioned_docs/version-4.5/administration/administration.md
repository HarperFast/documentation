---
title: Best Practices and Recommendations
---

# Best Practices and Recommendations

Harper is designed for minimal administrative effort, and with managed services these are handled for you. But there are important things to consider for managing your own Harper servers.

### Data Protection and (Backup and) Recovery

As a distributed database, data protection and recovery can benefit from different data protection strategies than a traditional single-server database. But multiple aspects of data protection and recovery should be considered:

- Availability: As a distributed database Harper is intrinsically built for high-availability and a cluster will continue to run even with complete server(s) failure. This is the first and primary defense for protecting against any downtime or data loss. Harper provides fast horizontal scaling functionality with node cloning, which facilitates ease of establishing high availability clusters.
- [Audit log](./administration/logging/): Harper defaults to tracking data changes so malicious data changes can be found, attributed, and reverted. This provides security-level defense against data loss, allowing for fine-grained isolation and reversion of individual data without the large-scale reversion/loss of data associated with point-in-time recovery approaches.
- Snapshots: When used as a source-of-truth database for crucial data, we recommend using snapshot tools to regularly snapshot databases as a final backup/defense against data loss (this should only be used as a last resort in recovery). Harper has a [`get_backup`](../developers/operations-api/databases-and-tables#get-backup) operation, which provides direct support for making and retrieving database snapshots. An HTTP request can be used to get a snapshot. Alternatively, volume snapshot tools can be used to snapshot data at the OS/VM level. Harper can also provide scripts for replaying transaction logs from snapshots to facilitate point-in-time recovery when necessary (often customization may be preferred in certain recovery situations to minimize data loss).

### Horizontal Scaling with Node Cloning

Harper provides rapid horizontal scaling capabilities through node cloning functionality.

### Monitoring

Harper provides robust capabilities for analytics and observability to facilitate effective and informative monitoring:

- Analytics provides statistics on usage, request counts, load, memory usage with historical tracking. The analytics data can be [accessed through querying](../reference/analytics).
- A large variety of real-time statistics about load, system information, database metrics, thread usage can be retrieved through the [`system_information` API](../developers/operations-api/system-operations).
- Information about the current cluster configuration and status can be found in the [cluster APIs](../developers/operations-api/clustering).
- Analytics and system information can easily be exported to Prometheus with our [Prometheus exporter component](https://github.com/HarperDB-Add-Ons/prometheus_exporter), making it easy visualize and monitor Harper with Graphana.

### Replication Transaction Logging

Harper utilizes NATS for replication, which maintains a transaction log. See the [transaction log documentation for information on how to query this log](./administration/logging/).
