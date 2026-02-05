---
title: Users & Roles
---

# Users & Roles

HarperDB utilizes a Role-Based Access Control (RBAC) framework to manage access to HarperDB instances. A user is assigned a role that determines the user’s permissions to access database resources and run core operations.

## Roles in HarperDB

Role permissions in HarperDB are broken into two categories – permissions around database manipulation and permissions around database definition.

**Database Manipulation**: A role defines CRUD (create, read, update, delete) permissions against database resources (i.e. data) in a HarperDB instance.

1. At the table-level access, permissions must be explicitly defined when adding or altering a role – _i.e. HarperDB will assume CRUD access to be FALSE if not explicitly provided in the permissions JSON passed to the `add_role` and/or `alter_role` API operations._
1. At the attribute-level, permissions for attributes in all tables included in the permissions set will be assigned based on either the specific attribute-level permissions defined in the table’s permission set or, if there are no attribute-level permissions defined, permissions will be based on the table’s CRUD set.

**Database Definition**: Permissions related to managing schemas, tables, roles, users, and other system settings and operations are restricted to the built-in `super_user` role.

**Built-In Roles**

There are three built-in roles within HarperDB. See full breakdown of operations restricted to only super_user roles [here](#role-based-operation-restrictions).

- `super_user` - This role provides full access to all operations and methods within a HarperDB instance, this can be considered the admin role.
  - This role provides full access to all Database Definition operations and the ability to run Database Manipulation operations across the entire database schema with no restrictions.
- `cluster_user` - This role is an internal system role type that is managed internally to allow clustered instances to communicate with one another.
  - This role is an internally managed role to facilitate communication between clustered instances.
- `structure_user` - This role provides specific access for creation and deletion of data.
  - When defining this role type you can either assign a value of true which will allow the role to create and drop schemas & tables. Alternatively the role type can be assigned a string array. The values in this array are schemas and allows the role to only create and drop tables in the designated schemas.

**User-Defined Roles**

In addition to built-in roles, admins (i.e. users assigned to the super_user role) can create customized roles for other users to interact with and manipulate the data within explicitly defined tables and attributes.

- Unless the user-defined role is given `super_user` permissions, permissions must be defined explicitly within the request body JSON.
- Describe operations will return metadata for all schemas, tables, and attributes that a user-defined role has CRUD permissions for.

**Role Permissions**

When creating a new, user-defined role in a HarperDB instance, you must provide a role name and the permissions to assign to that role. _Reminder, only super users can create and manage roles._

- `role` name used to easily identify the role assigned to individual users.

  _Roles can be altered/dropped based on the role name used in and returned from a successful `add_role` , `alter_role`, or `list_roles` operation._

- `permissions` used to explicitly define CRUD access to existing table data.

Example JSON for `add_role` request

```jsonc
{
	"operation": "add_role",
	"role": "software_developer",
	"permission": {
		"super_user": false,
		"schema_name": {
			"tables": {
				"table_name1": {
					"read": true,
					"insert": true,
					"update": true,
					"delete": false,
					"attribute_permissions": [
						{
							"attribute_name": "attribute1",
							"read": true,
							"insert": true,
							"update": true,
						},
					],
				},
				"table_name2": {
					"read": true,
					"insert": true,
					"update": true,
					"delete": false,
					"attribute_permissions": [],
				},
			},
		},
	},
}
```

**Setting Role Permissions**

There are two parts to a permissions set:

- `super_user` – boolean value indicating if role should be provided super_user access.

  _If `super_user` is set to true, there should be no additional schema-specific permissions values included since the role will have access to the entire database schema. If permissions are included in the body of the operation, they will be stored within HarperDB, but ignored, as super_users have full access to the database._

- `permissions`: Schema tables that a role should have specific CRUD access to should be included in the final, schema-specific `permissions` JSON.

  _For user-defined roles (i.e. non-super_user roles, blank permissions will result in the user being restricted from accessing any of the database schema._

**Table Permissions JSON**

Each table that a role should be given some level of CRUD permissions to must be included in the `tables` array for its schema in the roles permissions JSON passed to the API (_see example above_).

```jsonc
{
  "table_name": { // the name of the table to define CRUD perms for
    "read": boolean, // access to read from this table
    "insert": boolean, // access to insert data to table
    "update": boolean, // access to update data in table
    "delete": boolean, // access to delete row data in table
    "attribute_permissions": [ // permissions for specific table attributes
        {
          "attribute_name": "attribute_name", // attribute to assign permissions to
          "read": boolean, // access to read this attribute from table
          "insert": boolean, // access to insert this attribute into the table
          "update": boolean // access to update this attribute in the table
        }
    ]
}
```

**Important Notes About Table Permissions**

1. If a schema and/or any of its tables are not included in the permissions JSON, the role will not have any CRUD access to the schema and/or tables.
1. If a table-level CRUD permission is set to false, any attribute-level with that same CRUD permission set to true will return an error.

**Important Notes About Attribute Permissions**

1. If there are attribute-specific CRUD permissions that need to be enforced on a table, those need to be explicitly described in the `attribute_permissions` array.
1. If a non-hash attribute is given some level of CRUD access, that same access will be assigned to the table’s `hash_attribute` (also referred to as the `primary_key`), even if it is not explicitly defined in the permissions JSON.

   _See table_name1’s permission set for an example of this – even though the table’s hash attribute is not specifically defined in the attribute_permissions array, because the role has CRUD access to ‘attribute1’, the role will have the same access to the table’s hash attribute._

1. If attribute-level permissions are set – _i.e. attribute_permissions.length > 0_ – any table attribute not explicitly included will be assumed to have not CRUD access (with the exception of the `hash_attribute` described in #2).

   _See table_name1’s permission set for an example of this – in this scenario, the role will have the ability to create, insert and update ‘attribute1’ and the table’s hash attribute but no other attributes on that table._

1. If an `attribute_permissions` array is empty, the role’s access to a table’s attributes will be based on the table-level CRUD permissions.

   _See table_name2’s permission set for an example of this._

1. The `__createdtime__` and `__updatedtime__` attributes that HarperDB manages internally can have read perms set but, if set, all other attribute-level permissions will be ignored.
1. Please note that DELETE permissions are not included as a part of an individual attribute-level permission set. That is because it is not possible to delete individual attributes from a row, rows must be deleted in full.
   - If a role needs the ability to delete rows from a table, that permission should be set on the table-level.
   - The practical approach to deleting an individual attribute of a row would be to set that attribute to null via an update statement.

## Role-Based Operation Restrictions

The table below includes all API operations available in HarperDB and indicates whether or not the operation is restricted to super_user roles.

_Keep in mind that non-super_user roles will also be restricted within the operations they do have access to by the schema-level CRUD permissions set for the roles._

| Schemas and Tables | Restricted to Super_Users |
| ------------------ | :-----------------------: |
| describe_all       |                           |
| describe_schema    |                           |
| describe_table     |                           |
| create_schema      |             X             |
| drop_schema        |             X             |
| create_table       |             X             |
| drop_table         |             X             |
| create_attribute   |                           |
| drop_attribute     |             X             |

| NoSQL Operations     | Restricted to Super_Users |
| -------------------- | :-----------------------: |
| insert               |                           |
| update               |                           |
| upsert               |                           |
| delete               |                           |
| search_by_hash       |                           |
| search_by_value      |                           |
| search_by_conditions |                           |

| SQL Operations | Restricted to Super_Users |
| -------------- | :-----------------------: |
| select         |                           |
| insert         |                           |
| update         |                           |
| delete         |                           |

| Bulk Operations | Restricted to Super_Users |
| --------------- | :-----------------------: |
| csv_data_load   |                           |
| csv_file_load   |                           |
| csv_url_load    |                           |
| import_from_s3  |                           |

| Users and Roles | Restricted to Super_Users |
| --------------- | :-----------------------: |
| list_roles      |             X             |
| add_role        |             X             |
| alter_role      |             X             |
| drop_role       |             X             |
| list_users      |             X             |
| user_info       |                           |
| add_user        |             X             |
| alter_user      |             X             |
| drop_user       |             X             |

| Clustering            | Restricted to Super_Users |
| --------------------- | :-----------------------: |
| cluster_set_routes    |             X             |
| cluster_get_routes    |             X             |
| cluster_delete_routes |             X             |
| add_node              |             X             |
| update_node           |             X             |
| cluster_status        |             X             |
| remove_node           |             X             |
| configure_cluster     |             X             |

| Components         | Restricted to Super_Users |
| ------------------ | :-----------------------: |
| get_components     |             X             |
| get_component_file |             X             |
| set_component_file |             X             |
| drop_component     |             X             |
| add_component      |             X             |
| package_component  |             X             |
| deploy_component   |             X             |

| Custom Functions                | Restricted to Super_Users |
| ------------------------------- | :-----------------------: |
| custom_functions_status         |             X             |
| get_custom_functions            |             X             |
| get_custom_function             |             X             |
| set_custom_function             |             X             |
| drop_custom_function            |             X             |
| add_custom_function_project     |             X             |
| drop_custom_function_project    |             X             |
| package_custom_function_project |             X             |
| deploy_custom_function_project  |             X             |

| Registration      | Restricted to Super_Users |
| ----------------- | :-----------------------: |
| registration_info |                           |
| get_fingerprint   |             X             |
| set_license       |             X             |

| Jobs                      | Restricted to Super_Users |
| ------------------------- | :-----------------------: |
| get_job                   |                           |
| search_jobs_by_start_date |             X             |

| Logs                           | Restricted to Super_Users |
| ------------------------------ | :-----------------------: |
| read_log                       |             X             |
| read_transaction_log           |             X             |
| delete_transaction_logs_before |             X             |
| read_audit_log                 |             X             |
| delete_audit_logs_before       |             X             |

| Utilities             | Restricted to Super_Users |
| --------------------- | :-----------------------: |
| delete_records_before |             X             |
| export_local          |             X             |
| export_to_s3          |             X             |
| system_information    |             X             |
| restart               |             X             |
| restart_service       |             X             |
| get_configuration     |             X             |
| configure_cluster     |             X             |

| Token Authentication         | Restricted to Super_Users |
| ---------------------------- | :-----------------------: |
| create_authentication_tokens |                           |
| refresh_operation_token      |                           |

## Error: Must execute as User

**You may have gotten an error like,** `Error: Must execute as <<username>>`.

This means that you installed HarperDB as `<<user>>`. Because HarperDB stores files natively on the operating system, we only allow the HarperDB executable to be run by a single user. This prevents permissions issues on files.

For example if you installed as user_a, but later wanted to run as user_b. User_b may not have access to the hdb files HarperDB needs. This also keeps HarperDB more secure as it allows you to lock files down to a specific user and prevents other users from accessing your files.
