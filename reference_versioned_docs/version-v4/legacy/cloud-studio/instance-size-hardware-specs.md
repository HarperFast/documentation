---
title: Instance Size Hardware Specs
---

<!-- Source: versioned_docs/version-4.7/deployments/harper-cloud/instance-size-hardware-specs.md (primary) -->

:::important
This documentation is for the deprecated Harper Cloud Studio. All users should migrate or start using [Harper Fabric](https://fabric.harper.fast) instead.
:::

# Instance Size Hardware Specs

While Harper Cloud bills by RAM, each instance has other specifications associated with the RAM selection. The following table describes each instance size in detail\*.

| AWS EC2 Instance Size | RAM (GiB) | # vCPUs | Network (Gbps) | Processor                              |
| --------------------- | --------- | ------- | -------------- | -------------------------------------- |
| t3.micro              | 1         | 2       | Up to 5        | 2.5 GHz Intel Xeon Platinum 8000       |
| t3.small              | 2         | 2       | Up to 5        | 2.5 GHz Intel Xeon Platinum 8000       |
| t3.medium             | 4         | 2       | Up to 5        | 2.5 GHz Intel Xeon Platinum 8000       |
| m5.large              | 8         | 2       | Up to 10       | Up to 3.1 GHz Intel Xeon Platinum 8000 |
| m5.xlarge             | 16        | 4       | Up to 10       | Up to 3.1 GHz Intel Xeon Platinum 8000 |
| m5.2xlarge            | 32        | 8       | Up to 10       | Up to 3.1 GHz Intel Xeon Platinum 8000 |
| m5.4xlarge            | 64        | 16      | Up to 10       | Up to 3.1 GHz Intel Xeon Platinum 8000 |
| m5.8xlarge            | 128       | 32      | 10             | Up to 3.1 GHz Intel Xeon Platinum 8000 |
| m5.12xlarge           | 192       | 48      | 10             | Up to 3.1 GHz Intel Xeon Platinum 8000 |
| m5.16xlarge           | 256       | 64      | 20             | Up to 3.1 GHz Intel Xeon Platinum 8000 |
| m5.24xlarge           | 384       | 96      | 25             | Up to 3.1 GHz Intel Xeon Platinum 8000 |

\*Specifications are subject to change. For the most up to date information, please refer to AWS documentation: [https://aws.amazon.com/ec2/instance-types/](https://aws.amazon.com/ec2/instance-types/).
