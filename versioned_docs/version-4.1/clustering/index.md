---
title: Clustering
---

# Clustering

HarperDB clustering is the process of connecting multiple HarperDB databases together to create a database mesh network that enables users to define data replication patterns.

HarperDB’s clustering engine replicates data between instances of HarperDB using a highly performant, bi-directional pub/sub model on a per-table basis. Data replicates asynchronously with eventual consistency across the cluster following the defined pub/sub configuration. Individual transactions are sent in the order in which they were transacted, once received by the destination instance, they are processed in an ACID-compliant manor. Conflict resolution follows a last writer wins model based on recorded transaction time on the transaction and the timestamp on the record on the node.

---

### Common Use Case

A common use case is an edge application collecting and analyzing sensor data that creates an alert if a sensor value exceeds a given threshold:

- The edge application should not be making outbound http requests for security purposes.

- There may not be a reliable network connection.

- Not all sensor data will be sent to the cloud--either because of the unreliable network connection, or maybe it’s just a pain to store it.

- The edge node should be inaccessible from outside the firewall.

- The edge node will send alerts to the cloud with a snippet of sensor data containing the offending sensor readings.

HarperDB simplifies the architecture of such an application with its bi-directional, table-level replication:

- The edge instance subscribes to a "thresholds" table on the cloud instance, so the application only makes localhost calls to get the thresholds.

- The application continually pushes sensor data into a "sensor_data" table via the localhost API, comparing it to the threshold values as it does so.

- When a threshold violation occurs, the application adds a record to the "alerts" table.

- The application appends to that record array "sensor_data" entries for the 60 seconds (or minutes, or days) leading up to the threshold violation.

- The edge instance publishes the "alerts" table up to the cloud instance.

By letting HarperDB focus on the fault-tolerant logistics of transporting your data, you get to write less code. By moving data only when and where it’s needed, you lower storage and bandwidth costs. And by restricting your app to only making local calls to HarperDB, you reduce the overall exposure of your application to outside forces.
