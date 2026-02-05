---
title: Manage Instance Users
---

# Manage Instance Users

HarperDB instance clustering and replication can be configured directly through the HarperDB Studio. It is recommended to read through the clustering documentation first to gain a strong understanding of HarperDB clustering behavior.

Instance user configuration is handled through the **users** page of the HarperDB Studio, accessed with the following instructions:

1. Navigate to the [HarperDB Studio Organizations](https://studio.harperdb.io/organizations) page.

2. Click the appropriate organization that the instance belongs to.

3. Select your desired instance.

4. Click **users** in the instance control bar.

_Note, the **users** page will only be available to super users._

## Add a User

HarperDB instance users can be added with the following instructions.

1. In the **add user** panel on the left enter:
   - New user username.
   - New user password.
   - Select a role.

     _Learn more about role management here: [Manage Instance Roles](./manage-instance-roles)._

2. Click **Add User**.

## Edit a User

HarperDB instance users can be modified with the following instructions.

1. In the **existing users** panel, click the row of the user you would like to edit.

2. To change a user’s password:
   1. In the **Change user password** section, enter the new password.
   2. Click **Update Password**.

3. To change a user’s role:
   1. In the **Change user role** section, select the new role.
   2. Click **Update Role**.

4. To delete a user:
   1. In the **Delete User** section, type the username into the textbox.

      _This is done for confirmation purposes._

   2. Click **Delete User**.
