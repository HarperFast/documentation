---
title: Instance Configuration
---

<!-- Source: versioned_docs/version-4.7/administration/harper-studio/instance-configuration.md (primary) -->

:::important
This documentation is for the deprecated Harper Cloud Studio. All users should migrate or start using [Harper Fabric](https://fabric.harper.fast) instead.
:::

# Instance Configuration

Harper instance configuration can be viewed and managed directly through the Harper Studio. Harper Cloud instances can be resized in two different ways via this page, either by modifying machine RAM or by increasing drive storage. Enterprise instances can have their licenses modified by modifying licensed RAM.

All instance configuration is handled through the **config** page of the Harper Studio, accessed with the following instructions:

1. Navigate to the [Harper Studio Organizations](https://studio.harperdb.io/organizations) page.

1. Click the appropriate organization that the instance belongs to.

1. Select your desired instance.

1. Click config in the instance control bar.

_Note, the **config** page will only be available to super users and certain items are restricted to Studio organization owners._

## Instance Overview

The **instance overview** panel displays the following instance specifications:

- Instance URL

- Applications URL

- Instance Node Name (for clustering)

- Instance API Auth Header (this user)

  _The Basic authentication header used for the logged in Harper database user_

- Created Date (Harper Cloud only)

- Region (Harper Cloud only)

  _The geographic region where the instance is hosted._

- Total Price

- RAM

- Storage (Harper Cloud only)

- Disk IOPS (Harper Cloud only)

## Update Instance RAM

Harper Cloud instance size and Enterprise instance licenses can be modified with the following instructions. This option is only available to Studio organization owners.

Note: For Harper Cloud instances, upgrading RAM may add additional CPUs to your instance as well. Click here to see how many CPUs are provisioned for each instance size.

1. In the **update ram** panel at the bottom left:
   - Select the new instance size.
   - If you do not have a credit card associated with your account, an **Add Credit Card To Account** button will appear. Click that to be taken to the billing screen where you can enter your credit card information before returning to the **config** tab to proceed with the upgrade.
   - If you do have a credit card associated, you will be presented with the updated billing information.
   - Click **Upgrade**.

1. The instance will shut down and begin reprovisioning/relicensing itself. The instance will not be available during this time. You will be returned to the instance dashboard and the instance status will show UPDATING INSTANCE.

1. Once your instance upgrade is complete, it will appear on the instance dashboard as status OK with your newly selected instance size.

_Note, if Harper Cloud instance reprovisioning takes longer than 20 minutes, please submit a support ticket here: [https://harperdbhelp.zendesk.com/hc/en-us/requests/new](https://harperdbhelp.zendesk.com/hc/en-us/requests/new)._

## Update Instance Storage

The Harper Cloud instance storage size can be increased with the following instructions. This option is only available to Studio organization owners.

Note: Instance storage can only be upgraded once every 6 hours.

1. In the **update storage** panel at the bottom left:
   - Select the new instance storage size.
   - If you do not have a credit card associated with your account, an **Add Credit Card To Account** button will appear. Click that to be taken to the billing screen where you can enter your credit card information before returning to the **config** tab to proceed with the upgrade.
   - If you do have a credit card associated, you will be presented with the updated billing information.
   - Click **Upgrade**.

1. The instance will shut down and begin reprovisioning itself. The instance will not be available during this time. You will be returned to the instance dashboard and the instance status will show UPDATING INSTANCE.
1. Once your instance upgrade is complete, it will appear on the instance dashboard as status OK with your newly selected instance size.

_Note, if this process takes longer than 20 minutes, please submit a support ticket here: [https://harperdbhelp.zendesk.com/hc/en-us/requests/new](https://harperdbhelp.zendesk.com/hc/en-us/requests/new)._

## Remove Instance

The Harper instance can be deleted/removed from the Studio with the following instructions. Once this operation is started it cannot be undone. This option is only available to Studio organization owners.

1. In the **remove instance** panel at the bottom left:
   - Enter the instance name in the text box.
   - The Studio will present you with a warning.
   - Click **Remove**.

1. The instance will begin deleting immediately.

## Restart Instance

The Harper Cloud instance can be restarted with the following instructions.

1. In the **restart instance** panel at the bottom right:
   - Enter the instance name in the text box.
   - The Studio will present you with a warning.
   - Click **Restart**.

1. The instance will begin restarting immediately.

## Instance Config (Read Only)

A JSON preview of the instance config is available for reference at the bottom of the page. This is a read only visual and is not editable via the Studio. To make changes to the instance config, review the [configuration file documentation](TODO:reference_versioned_docs/version-v4/configuration/options.md#using-the-configuration-file-and-naming-conventions).
