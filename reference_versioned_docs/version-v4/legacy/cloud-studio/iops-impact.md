---
title: IOPS Impact on Performance
---

<!-- Source: versioned_docs/version-4.7/deployments/harper-cloud/iops-impact.md (primary) -->

:::important
This documentation is for the deprecated Harper Cloud Studio. All users should migrate or start using [Harper Fabric](https://fabric.harper.fast) instead.
:::

# IOPS Impact on Performance

Harper, like any database, can place a tremendous load on its storage resources. Storage, not CPU or memory, will more often be the bottleneck of server, virtual machine, or a container running Harper. Understanding how storage works, and how much storage performance your workload requires, is key to ensuring that Harper performs as expected.

## IOPS Overview

The primary measure of storage performance is the number of input/output operations per second (IOPS) that a storage device can perform. Different storage devices can have dramatically different performance profiles. A hard drive (HDD) might only perform a hundred or so IOPS, while a solid state drive (SSD) might be able to perform tens or hundreds of thousands of IOPS.

Cloud providers like AWS, which powers Harper Cloud, don’t typically attach individual disks to a virtual machine or container. Instead, they combine large numbers of storage drives to create very high performance storage servers. Chunks (volumes) of that storage are then carved out and presented to many different virtual machines and containers. Due to the shared nature of this type of storage, the cloud provider places configurable limits on the number of IOPS that a volume can perform. The same way that cloud providers charge more for larger capacity volumes, they also charge more for volumes with more IOPS.

## Harper Cloud Storage

Harper Cloud utilizes AWS Elastic Block Storage (EBS) General Purpose SSD (gp3) volumes. This is the most common storage type used in AWS, as it provides reasonable performance for most workloads, at a reasonable price.

AWS EBS gp3 volumes have a baseline performance level of 3,000 IOPS, as a result, all Harper Cloud storage options will offer 3,000 IOPS. We plan to offer scalable IOPS as an option in the future.

You can read more about AWS EBS volume IOPS here: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-volume-types.html.

## Estimating IOPS for Harper Instance

The number of IOPS required for a particular workload is influenced by many factors. Testing your particular application is the best way to determine the number of IOPS required. A reliable method is to estimate about two IOPS for every index, including the primary key itself. So if a table has two indices besides primary key, estimate that an insert or update will require about six IOPS. Note that that can often be closer to one IOPS per index under load due to internal batching of writes, and sometimes even better when doing sequential inserts. Again it is best to test to verify this with application specific data and write patterns.

For assistance in estimating IOPS requirements feel free to contact Harper Support or join our Community Slack Channel.

## Example Use Case IOPS Requirements

- **Sensor Data Collection**

  In the case of IoT sensors where data collection will be sustained, high IOPS are required. While there are not typically large queries going on in this case, there is a high volume of data being ingested. This implies that IOPS will be sustained at a high level. For example, if you are collecting 100 records per second you would expect to need roughly 3,000 IOPS just to handle the data inserts.

- **Data Analytics/BI Server**

  Providing a server for analytics purposes typically requires a larger machine. Typically these cases involve large scale SQL joins and aggregations, which puts a large strain on reads. Harper utilizes an in-memory cache, which provides a significant performance boost on machines with large amounts of memory. However, if disparate datasets are constantly being queried and/or new data is frequently being loaded, you will find that the system still needs to have high IOPS to meet performance demand.

- **Web Services**

  Typical web service implementations with discrete reads and writes often do not need high IOPS to perform as expected. This is often the case in more transactional systems without the requirement for high performance load. A good rule to follow is that any Harper operation that requires a data scan will be IOPS intensive, but if these are not frequent then the EBS boost will suffice. Queries utilizing equals operations in either SQL or NoSQL do not require a scan due to Harper’s native indexing.

- **High Performance Database**

  Ultimately, if performance is your top priority, Harper should be run on bare metal hardware. Cloud providers offer these options at a higher cost, but they come with obvious performance improvements.
