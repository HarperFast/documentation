---
title: Organizations
---

<!-- Source: versioned_docs/version-4.7/administration/harper-studio/organizations.md (primary) -->

:::important
This documentation is for the deprecated Harper Cloud Studio. All users should migrate or start using [Harper Fabric](https://fabric.harper.fast) instead.
:::

# Organizations

Harper Studio organizations provide the ability to group Harper Cloud Instances. Organization behavior is as follows:

- Billing occurs at the organization level to a single credit card.
- Organizations retain their own unique Harper Cloud subdomain.
- Cloud instances reside within an organization.
- Studio users can be invited to organizations to share instances.

An organization is automatically created for you when you sign up for Harper Studio. If you only have one organization, the Studio will automatically bring you to your organization's page.

---

## List Organizations

A summary view of all organizations your user belongs to can be viewed on the [Harper Studio Organizations](https://studio.harperdb.io/?redirect=/organizations) page. You can navigate to this page at any time by clicking the **all organizations** link at the top of the Harper Studio.

## Create a New Organization

A new organization can be created as follows:

1. Navigate to the [Harper Studio Organizations](https://studio.harperdb.io/?redirect=/organizations) page.
1. Click the **Create a New Organization** card.
1. Fill out new organization details
   - Enter Organization Name
     _This is used for descriptive purposes only._
   - Enter Organization Subdomain
     _Part of the URL that will be used to identify your Harper Cloud Instances. For example, with subdomain "demo" and instance name "c1" the instance URL would be: [https://c1-demo.harperdbcloud.com](https://c1-demo.harperdbcloud.com)._
1. Click Create Organization.

## Delete an Organization

An organization cannot be deleted until all instances have been removed. An organization can be deleted as follows:

1. Navigate to the Harper Studio Organizations page.
1. Identify the proper organization card and click the trash can icon.
1. Enter the organization name into the text box.

   _This is done for confirmation purposes to ensure you do not accidentally delete an organization._

1. Click the **Do It** button.

## Manage Users

Harper Studio organization owners can manage users including inviting new users, removing users, and toggling ownership.

#### Inviting a User

A new user can be invited to an organization as follows:

1. Navigate to the [Harper Studio Organizations](https://studio.harperdb.io/?redirect=/organizations) page.
1. Click the appropriate organization card.
1. Click **users** at the top of the screen.
1. In the **add user** box, enter the new user's email address.
1. Click **Add User**.

Users may or may not already be Harper Studio users when adding them to an organization. If the Harper Studio account already exists, the user will receive an email notification alerting them to the organization invitation. If the user does not have a Harper Studio account, they will receive an email welcoming them to Harper Studio.

---

#### Toggle a User's Organization Owner Status

Organization owners have full access to the organization including the ability to manage organization users, create, modify, and delete instances, and delete the organization. Users must have accepted their invitation prior to being promoted to an owner. A user's organization owner status can be toggled owner as follows:

1. Navigate to the Harper Studio Organizations page.
1. Click the appropriate organization card.
1. Click **users** at the top of the screen.
1. Click the appropriate user from the **existing users** section.
1. Toggle the **Is Owner** switch to the desired status.

---

#### Remove a User from an Organization

Users may be removed from an organization at any time. Removing a user from an organization will not delete their Harper Studio account, it will only remove their access to the specified organization. A user can be removed from an organization as follows:

1. Navigate to the [Harper Studio Organizations](https://studio.harperdb.io/?redirect=/organizations) page.
1. Click the appropriate organization card.
1. Click **users** at the top of the screen.
1. Click the appropriate user from the **existing users** section.
1. Type **DELETE** in the text box in the **Delete User** row.

   _This is done for confirmation purposes to ensure you do not accidentally delete a user._

1. Click **Delete User**.

## Manage Billing

Billing is configured per organization and will be billed to the stored credit card at appropriate intervals (monthly or annually depending on the registered instance). Billing settings can be configured as follows:

1. Navigate to the [Harper Studio Organizations](https://studio.harperdb.io/?redirect=/organizations) page.
1. Click the appropriate organization card.
1. Click **billing** at the top of the screen.

Here organization owners can view invoices, manage coupons, and manage the associated credit card.

_Harper billing and payments are managed via Stripe._

### Add a Coupon

Coupons are applicable towards any paid tier or enterprise instance and you can change your subscription at any time. Coupons can be added to your Organization as follows:

1. In the coupons panel of the **billing** page, enter your coupon code.
1. Click **Add Coupon**.
1. The coupon will then be available and displayed in the coupons panel.
