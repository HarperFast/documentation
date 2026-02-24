---
title: Enable Mixed Content
---

<!-- Source: versioned_docs/version-4.7/administration/harper-studio/enable-mixed-content.md (primary) -->

:::important
This documentation is for the deprecated Harper Cloud Studio. All users should migrate or start using [Harper Fabric](https://fabric.harper.fast) instead.
:::

# Enable Mixed Content

If you want to connect insecure HTTP instances from the secure HTTPS Fabric Studio, you can enable mixed content temporarily. This isn't recommended in production systems. It would be better to add HTTPS / SSL Termination in front of your instances. But if you understand the risks, you can enable mixed content. Enabling mixed content is required in cases where you would like to connect the Harper Studio to Harper Instances via HTTP. This should not be used for production systems, but may be convenient for development and testing purposes. Doing so will allow your browser to reach HTTP traffic, which is considered insecure, through an HTTPS site like the Studio.

A comprehensive guide is provided by Adobe [here](https://experienceleague.adobe.com/docs/target/using/experiences/vec/troubleshoot-composer/mixed-content.html).
