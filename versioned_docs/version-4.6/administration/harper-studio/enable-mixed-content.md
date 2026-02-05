---
title: Enable Mixed Content
---

# Enable Mixed Content

Enabling mixed content is required in cases where you would like to connect the Harper Studio to Harper Instances via HTTP. This should not be used for production systems, but may be convenient for development and testing purposes. Doing so will allow your browser to reach HTTP traffic, which is considered insecure, through an HTTPS site like the Studio.

Note: If you want to connect insecure HTTP instances from the secure HTTPS Fabric Studio, you can enable mixed content temporarily. This isn't recommended in production systems. It would be better to add HTTPS / SSL Termination in front of your instances. But if you understand the risks, you can enabling mixed content is not recommended for production systems as it can expose users to security risks.

## Steps to Connect to a Self-Hosted Harper Instance

1. Log into [Harper Studio Cloud](https://fabric.harper.fast/).
2. Select an **organization**.
3. Click "+ New Cluster" on the top right corner.
4. In the "New Cluster" page, Fill out the required fields.
   - Cluster Name - A name for your the cluster.
   - Harper Deployment - Select "Self-Hosted" (This will allow you to connect to your self-hosted HarperDB instance).
   - Support & Usage. - Keep the default option "Self Supported and Managed"
   - Optional Cluster Load Balancer Host Name - This is an optional field. You can leave it blank.
   - Instance - In the Dropdown, select whether your instance is `HTTP://` or `HTTPS://`. Unsure? Harper Instance by default is set to `HTTPS://` when installed in an instance.
   - Host Name - The hostname or IP address of your HarperDB instance. Choose `localhost` if you are running the instance on the same machine you're accessing Harper Studio Cloud with.
   - Port - The port number your HarperDB instance is listening on. Default is `9925`.

5. Click "Create New Cluster". You have now successfully created a new cluster connecting to your local Harper Instance.

A comprehensive guide is provided by Adobe [here](https://experienceleague.adobe.com/docs/target/using/experiences/vec/troubleshoot-composer/mixed-content.html).
