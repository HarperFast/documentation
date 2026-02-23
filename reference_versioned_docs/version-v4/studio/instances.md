<!-- Source: versioned_docs/version-4.7/administration/harper-studio/instances.md (primary) -->

---
title: Instances
---

# Instances

The Harper Studio allows you to administer all of your HarperDinstances in one place. Harper currently offers the following instance types:

- **Harper Cloud Instance** Managed installations of Harper, what we call [Harper Cloud](../../deployments/harper-cloud/).
- **5G Wavelength Instance** Managed installations of Harper running on the Verizon network through AWS Wavelength, what we call 5G Wavelength Instances. _Note, these instances are only accessible via the Verizon network._
- **Enterprise Instance** Any Harper installation that is managed by you. These include instances hosted within your cloud provider accounts (for example, from the AWS or Digital Ocean Marketplaces), privately hosted instances, or instances installed locally.

All interactions between the Studio and your instances take place directly from your browser. Harper stores metadata about your instances, which enables the Studio to display these instances when you log in. Beyond that, all traffic is routed from your browser to the Harper instances using the standard [Harper API](../../developers/operations-api/).

## Organization Instance List

A summary view of all instances within an organization can be viewed by clicking on the appropriate organization from the [Harper Studio Organizations](https://studio.harperdb.io/organizations) page. Each instance gets their own card. Harper Cloud and Enterprise instances are listed together.

## Create a New Instance

1. Navigate to the [Harper Studio Organizations](https://studio.harperdb.io/organizations) page.
1. Click the appropriate organization for the instance to be created under.
1. Click the **Create New Harper Cloud Instance + Register Enterprise Instance** card.
1. Select your desired Instance Type.
1. For a Harper Cloud Instance or a Harper 5G Wavelength Instance, click **Create Harper Cloud Instance**.
   1. Fill out Instance Info.
      1. Enter Instance Name

         _This will be used to build your instance URL. For example, with subdomain "demo" and instance name "c1" the instance URL would be: [https://c1-demo.harperdbcloud.com](https://c1-demo.harperdbcloud.com). The Instance URL will be previewed below._

      1. Enter Instance Username

         _This is the username of the initial Harper instance super user._

      1. Enter Instance Password

         _This is the password of the initial Harper instance super user._

   1. Click **Instance Details** to move to the next page.
   1. Select Instance Specs
      1. Select Instance RAM

         _Harper Cloud Instances are billed based on Instance RAM, this will select the size of your provisioned instance._ _More on instance specs\_\_._

      1. Select Storage Size

         _Each instance has a mounted storage volume where your Harper data will reside. Storage is provisioned based on space and IOPS._ _More on IOPS Impact on Performance\_\_._

      1. Select Instance Region

         _The geographic area where your instance will be provisioned._

   1. Click **Confirm Instance Details** to move to the next page.
   1. Review your Instance Details, if there is an error, use the back button to correct it.
   1. Review the [Privacy Policy](https://harperdb.io/legal/privacy-policy/) and [Terms of Service](https://harperdb.io/legal/harperdb-cloud-terms-of-service/), if you agree, click the **I agree** radio button to confirm.
   1. Click **Add Instance**.
   1. Your Harper Cloud instance will be provisioned in the background. Provisioning typically takes 5-15 minutes. You will receive an email notification when your instance is ready.

## Register Enterprise Instance

1. Navigate to the [Harper Studio Organizations](https://studio.harperdb.io/organizations) page.
1. Click the appropriate organization for the instance to be created under.
1. Click the **Create New Harper Cloud Instance + Register Enterprise Instance** card.
1. Select **Register Enterprise Instance**.
   1. Fill out Instance Info.
      1. Enter Instance Name

         _This is used for descriptive purposes only._

      1. Enter Instance Username

         _The username of a Harper super user that is already configured in your Harper installation._

      1. Enter Instance Password

         _The password of a Harper super user that is already configured in your Harper installation._

      1. Enter Host

         _The host to access the Harper instance. For example, `harperdb.myhost.com` or `localhost`._

      1. Enter Port

         _The port to access the Harper instance. Harper defaults `9925` for HTTP and `31283` for HTTPS._

      1. Select SSL

         _If your instance is running over SSL, select the SSL checkbox. If not, you will need to enable mixed content in your browser to allow the HTTPS Studio to access the HTTP instance. If there are issues connecting to the instance, the Studio will display a red error message._

   1. Click **Instance Details** to move to the next page.
   1. Select Instance Specs
      1. Select Instance RAM

         _Harper instances are billed based on Instance RAM. Selecting additional RAM will enable the ability for faster and more complex queries._

   1. Click **Confirm Instance Details** to move to the next page.
   1. Review your Instance Details, if there is an error, use the back button to correct it.
   1. Review the [Privacy Policy](https://harperdb.io/legal/privacy-policy/) and [Terms of Service](https://harperdb.io/legal/harperdb-cloud-terms-of-service/), if you agree, click the **I agree** radio button to confirm.
   1. Click **Add Instance**.
   1. The Harper Studio will register your instance and restart it for the registration to take effect. Your instance will be immediately available after this is complete.

## Delete an Instance

Instance deletion has two different behaviors depending on the instance type.

- **Harper Cloud Instance** This instance will be permanently deleted, including all data. This process is irreversible and cannot be undone.
- **Enterprise Instance** The instance will be removed from the Harper Studio only. This does not uninstall Harper from your system and your data will remain intact.

An instance can be deleted as follows:

1. Navigate to the [Harper Studio Organizations](https://studio.harperdb.io/organizations) page.
1. Click the appropriate organization that the instance belongs to.
1. Identify the proper instance card and click the trash can icon.
1. Enter the instance name into the text box.

   _This is done for confirmation purposes to ensure you do not accidentally delete an instance._

1. Click the **Do It** button.

## Upgrade an Instance

Harper instances can be resized on the [Instance Configuration](./instance-configuration.md) page.

## Instance Log In/Log Out

The Studio enables users to log in and out of different database users from the instance control panel. To log out of an instance:

1. Navigate to the [Harper Studio Organizations](https://studio.harperdb.io/organizations) page.
1. Click the appropriate organization that the instance belongs to.
1. Identify the proper instance card and click the lock icon.
1. You will immediately be logged out of the instance.

To log in to an instance:

1. Navigate to the [Harper Studio Organizations](https://studio.harperdb.io/organizations) page.
1. Click the appropriate organization that the instance belongs to.
1. Identify the proper instance card, it will have an unlocked icon and a status reading PLEASE LOG IN, and click the center of the card.
1. Enter the database username.

   _The username of a Harper user that is already configured in your Harper instance._

1. Enter the database password.

   _The password of a Harper user that is already configured in your Harper instance._

1. Click **Log In**.
