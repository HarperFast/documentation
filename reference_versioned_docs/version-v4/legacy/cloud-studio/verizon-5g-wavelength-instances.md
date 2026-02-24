---
title: Verizon 5G Wavelength
---

<!-- Source: versioned_docs/version-4.7/deployments/harper-cloud/verizon-5g-wavelength-instances.md (primary) -->

:::important
This documentation is for the deprecated Harper Cloud Studio. All users should migrate or start using [Harper Fabric](https://fabric.harper.fast) instead.
:::

# Verizon 5G Wavelength

These instances are only accessible from the Verizon network. When accessing your Harper instance please ensure you are connected to the Verizon network, examples include Verizon 5G Internet, Verizon Hotspots, or Verizon mobile devices.

Harper on Verizon 5G Wavelength brings Harper closer to the end user exclusively on the Verizon network resulting in as little as single-digit millisecond response time from Harper to the client.

Instances are built via AWS Wavelength. You can read more about [AWS Wavelength here](https://aws.amazon.com/wavelength/).

Harper 5G Wavelength Instance Specs While Harper 5G Wavelength bills by RAM, each instance has other specifications associated with the RAM selection. The following table describes each instance size in detail\*.

| AWS EC2 Instance Size | RAM (GiB) | # vCPUs | Network (Gbps) | Processor                                   |
| --------------------- | --------- | ------- | -------------- | ------------------------------------------- |
| t3.medium             | 4         | 2       | Up to 5        | Up to 3.1 GHz Intel Xeon Platinum Processor |
| t3.xlarge             | 16        | 4       | Up to 5        | Up to 3.1 GHz Intel Xeon Platinum Processor |
| r5.2xlarge            | 64        | 8       | Up to 10       | Up to 3.1 GHz Intel Xeon Platinum Processor |

\*Specifications are subject to change. For the most up to date information, please refer to [AWS documentation](https://aws.amazon.com/ec2/instance-types/).

## Harper 5G Wavelength Storage

Harper 5G Wavelength utilizes AWS Elastic Block Storage (EBS) General Purpose SSD (gp2) volumes. This is the most common storage type used in AWS, as it provides reasonable performance for most workloads, at a reasonable price.

AWS EBS gp2 volumes have a baseline performance level, which determines the number of IOPS it can perform indefinitely. The larger the volume, the higher its baseline performance. Additionally, smaller gp2 volumes are able to burst to a higher number of IOPS for periods of time.

Smaller gp2 volumes are perfect for trying out the functionality of Harper, and might also work well for applications that don’t perform many database transactions. For applications that perform a moderate or high number of transactions, we recommend that you use a larger Harper volume. Learn more about the [impact of IOPS on performance here](iops-impact).

You can read more about [AWS EBS gp2 volume IOPS here](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-volume-types.html#ebsvolumetypes_gp2).
