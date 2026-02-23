<!-- Source: versioned_docs/version-4.7/administration/harper-studio/manage-instance-users.md (primary) -->

---
title: Manage Instance Users
---

# Manage Instance Users

:::important
This documentation is for Harper Studio in versions 4.6 and earlier. For Harper v4.7+, see the current [Studio documentation](../../studio/overview.md).
:::

Harper users and roles can be managed directly through the Harper Studio. It is recommended to read through the [users & roles documentation](../../developers/security/users-and-roles) to gain a strong understanding of how they operate.

Instance user configuration is handled through the **users** page of the Harper Studio, accessed with the following instructions:

1. Navigate to the [Harper Studio Organizations](https://studio.harperdb.io/organizations) page.

1. Click the appropriate organization that the instance belongs to.

1. Select your desired instance.

1. Click **users** in the instance control bar.

_Note, the **users** page will only be available to super users._

## Add a User

Harper instance users can be added with the following instructions.

1. In the **add user** panel on the left enter:
   - New user username.
   - New user password.
   - Select a role.

     _Learn more about role management here: [Manage Instance Roles](./manage-instance-roles.md)._

1. Click **Add User**.

## Edit a User

Harper instance users can be modified with the following instructions.

1. In the **existing users** panel, click the row of the user you would like to edit.

1. To change a user's password:
   1. In the **Change user password** section, enter the new password.
   1. Click **Update Password**.

1. To change a user's role:
   1. In the **Change user role** section, select the new role.
   1. Click **Update Role**.

1. To delete a user:
   1. In the **Delete User** section, type the username into the textbox.

      _This is done for confirmation purposes._

   1. Click **Delete User**.
