<!-- Source: versioned_docs/version-4.7/developers/security/users-and-roles.md (primary) -->
<!-- Source: versioned_docs/version-4.7/developers/operations-api/users-and-roles.md (operations API reference) -->
<!-- Source: versioned_docs/version-4.7/reference/roles.md (roles config file format) -->
<!-- Source: release-notes/v4-tucker/4.5.0.md (password hashing upgrade: sha256, argon2id) -->
<!-- Source: release-notes/v4-tucker/4.2.0.md (cookie-based sessions) -->

---
id: users-and-roles
title: Users and Roles
---

# Users and Roles

Harper uses a Role-Based Access Control (RBAC) framework to manage access to Harper instances. Each user is assigned a role that determines their permissions to access database resources and run operations.

## Roles

Role permissions in Harper are divided into two categories:

**Database Manipulation** — CRUD (create, read, update, delete) permissions against database data (tables and attributes).

**Database Definition** — Permissions to manage databases, tables, roles, users, and other system settings. These are restricted to the built-in `super_user` role.

### Built-In Roles

| Role | Description |
|---|---|
| `super_user` | Full access to all operations and methods. The admin role. |
| `cluster_user` | Internal system role that allows clustered instances to communicate. Managed internally. |
| `structure_user` | Access to create and delete databases and tables. Can be set to `true` (all databases) or an array of database names (specific databases only). |

### User-Defined Roles

Admins (`super_user` users) can create custom roles with explicit permissions on specific tables and attributes.

- Unless a user-defined role has `super_user: true`, all permissions must be defined explicitly.
- Any table or database not included in the role's permission set will be inaccessible.
- `describe` operations return metadata only for databases, tables, and attributes that the role has CRUD permissions for.

## Permission Structure

When creating or altering a role, you define a `permission` object:

```json
{
	"operation": "add_role",
	"role": "software_developer",
	"permission": {
		"super_user": false,
		"database_name": {
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
							"update": true
						}
					]
				},
				"table_name2": {
					"read": true,
					"insert": true,
					"update": true,
					"delete": false,
					"attribute_permissions": []
				}
			}
		}
	}
}
```

### Table Permissions

Each table entry defines CRUD access:

```jsonc
{
  "table_name": {
    "read": boolean,    // Access to read from this table
    "insert": boolean,  // Access to insert data
    "update": boolean,  // Access to update data
    "delete": boolean,  // Access to delete rows
    "attribute_permissions": [
      {
        "attribute_name": "attribute_name",
        "read": boolean,
        "insert": boolean,
        "update": boolean
        // Note: "delete" is not an attribute-level permission
      }
    ]
  }
}
```

### Important Rules

**Table-level:**
- If a database or table is not included in the permissions, the role has no access to it.
- If a table-level CRUD permission is `false`, setting the same CRUD permission to `true` on an attribute returns an error.

**Attribute-level:**
- If `attribute_permissions` is a non-empty array, only the listed attributes are accessible (plus the table's hash attribute — see below).
- If `attribute_permissions` is empty (`[]`), attribute access follows the table-level CRUD permissions.
- If any non-hash attribute is given CRUD access, the table's `hash_attribute` (primary key) automatically receives the same access, even if not explicitly listed.
- Any attribute not explicitly listed in a non-empty `attribute_permissions` array has no access.
- `DELETE` is not an attribute-level permission. Deleting rows is controlled at the table level.
- The `__createdtime__` and `__updatedtime__` attributes managed by Harper can have `read` permissions set; other attribute-level permissions for these fields are ignored.

## Managing Roles with Config Files

In addition to managing roles via the Operations API, Harper supports declaring roles in a configuration file. When the application starts, Harper ensures all declared roles exist with the specified permissions.

Configure in your application's `config.yaml`:

```yaml
roles:
  files: roles.yaml
```

Example `roles.yaml`:

```yaml
analyst:
  super_user: false
  data:
    Sales:
      read: true
      insert: false
      update: false
      delete: false

editor:
  data:
    Articles:
      read: true
      insert: true
      update: true
      attributes:
        title:
          read: true
          update: true
        author:
          read: true
          update: false
```

**Startup behavior:**
- If a declared role does not exist, Harper creates it.
- If a declared role already exists, Harper updates its permissions to match the definition.

## Operations API: Roles

### List Roles

_Restricted to `super_user` roles._

```json
{
	"operation": "list_roles"
}
```

### Add Role

_Restricted to `super_user` roles._

- `role` _(required)_ — Name for the new role.
- `permission` _(required)_ — Permissions object. See [Permission Structure](#permission-structure).
  - `super_user` _(optional)_ — If `true`, grants full access. Defaults to `false`.
  - `structure_user` _(optional)_ — Boolean or array of database names. If `true`, can create/drop databases and tables. If array, limited to specified databases.

```json
{
	"operation": "add_role",
	"role": "developer",
	"permission": {
		"super_user": false,
		"structure_user": false,
		"dev": {
			"tables": {
				"dog": {
					"read": true,
					"insert": true,
					"update": true,
					"delete": false,
					"attribute_permissions": [
						{
							"attribute_name": "name",
							"read": true,
							"insert": true,
							"update": true
						}
					]
				}
			}
		}
	}
}
```

### Alter Role

_Restricted to `super_user` roles._

- `id` _(required)_ — The `id` of the role to alter (from `list_roles`).
- `role` _(optional)_ — New name for the role.
- `permission` _(required)_ — Updated permissions object.

```json
{
	"operation": "alter_role",
	"id": "f92162e2-cd17-450c-aae0-372a76859038",
	"role": "another_developer",
	"permission": {
		"super_user": false,
		"structure_user": false,
		"dev": {
			"tables": {
				"dog": {
					"read": true,
					"insert": true,
					"update": true,
					"delete": false,
					"attribute_permissions": []
				}
			}
		}
	}
}
```

### Drop Role

_Restricted to `super_user` roles. Roles with associated users cannot be dropped._

- `id` _(required)_ — The `id` of the role to drop.

```json
{
	"operation": "drop_role",
	"id": "developer"
}
```

## Operations API: Users

### List Users

_Restricted to `super_user` roles._

```json
{
	"operation": "list_users"
}
```

### User Info

Returns user data for the currently authenticated user. Available to all roles.

```json
{
	"operation": "user_info"
}
```

### Add User

_Restricted to `super_user` roles._

- `role` _(required)_ — Role name to assign.
- `username` _(required)_ — Username. Cannot be changed after creation.
- `password` _(required)_ — Plain-text password. Harper encrypts it on receipt.
- `active` _(required)_ — Boolean. If `false`, user cannot access Harper.

```json
{
	"operation": "add_user",
	"role": "role_name",
	"username": "hdb_user",
	"password": "password",
	"active": true
}
```

### Alter User

_Restricted to `super_user` roles._

- `username` _(required)_ — Username to modify.
- `password` _(optional)_ — New password.
- `role` _(optional)_ — New role name.
- `active` _(optional)_ — Enable/disable user access.

```json
{
	"operation": "alter_user",
	"role": "role_name",
	"username": "hdb_user",
	"password": "new_password",
	"active": true
}
```

### Drop User

_Restricted to `super_user` roles._

```json
{
	"operation": "drop_user",
	"username": "sgoldberg"
}
```

## Password Hashing

Added in: v4.5.0 (confirmed via release notes)

Harper supports two password hashing algorithms, replacing the previous MD5 hashing:

- **`sha256`** — Default algorithm. Good security and excellent performance.
- **`argon2id`** — Highest security. More CPU-intensive; recommended for high-security environments.

Password hashing is configurable in `harperdb-config.yaml`:

```yaml
operationsApi:
  authentication:
    passwordHashAlgorithm: sha256 # or argon2id
```

## Role-Based Operation Restrictions

The following table shows which operations are restricted to `super_user` roles. Non-`super_user` roles are also restricted within their accessible operations by their CRUD permission set.

| Databases and Tables | Restricted to Super User |
|---|:---:|
| `describe_all` | |
| `describe_database` | |
| `describe_table` | |
| `create_database` | X |
| `drop_database` | X |
| `create_table` | X |
| `drop_table` | X |
| `create_attribute` | |
| `drop_attribute` | X |

| NoSQL Operations | Restricted to Super User |
|---|:---:|
| `insert` | |
| `update` | |
| `upsert` | |
| `delete` | |
| `search_by_hash` | |
| `search_by_value` | |
| `search_by_conditions` | |

| SQL Operations | Restricted to Super User |
|---|:---:|
| `select` | |
| `insert` | |
| `update` | |
| `delete` | |

| Bulk Operations | Restricted to Super User |
|---|:---:|
| `csv_data_load` | |
| `csv_file_load` | |
| `csv_url_load` | |
| `import_from_s3` | |

| Users and Roles | Restricted to Super User |
|---|:---:|
| `list_roles` | X |
| `add_role` | X |
| `alter_role` | X |
| `drop_role` | X |
| `list_users` | X |
| `user_info` | |
| `add_user` | X |
| `alter_user` | X |
| `drop_user` | X |

| Clustering | Restricted to Super User |
|---|:---:|
| `cluster_set_routes` | X |
| `cluster_get_routes` | X |
| `cluster_delete_routes` | X |
| `add_node` | X |
| `update_node` | X |
| `cluster_status` | X |
| `remove_node` | X |
| `configure_cluster` | X |

| Components | Restricted to Super User |
|---|:---:|
| `get_components` | X |
| `get_component_file` | X |
| `set_component_file` | X |
| `drop_component` | X |
| `add_component` | X |
| `package_component` | X |
| `deploy_component` | X |

| Registration | Restricted to Super User |
|---|:---:|
| `registration_info` | |
| `get_fingerprint` | X |
| `set_license` | X |

| Jobs | Restricted to Super User |
|---|:---:|
| `get_job` | |
| `search_jobs_by_start_date` | X |

| Logs | Restricted to Super User |
|---|:---:|
| `read_log` | X |
| `read_transaction_log` | X |
| `delete_transaction_logs_before` | X |
| `read_audit_log` | X |
| `delete_audit_logs_before` | X |

| Utilities | Restricted to Super User |
|---|:---:|
| `delete_records_before` | X |
| `export_local` | X |
| `export_to_s3` | X |
| `system_information` | X |
| `restart` | X |
| `restart_service` | X |
| `get_configuration` | X |

| Token Authentication | Restricted to Super User |
|---|:---:|
| `create_authentication_tokens` | |
| `refresh_operation_token` | |

## Troubleshooting: "Must execute as User"

If you see the error `Error: Must execute as <<username>>`, it means Harper was installed as a specific OS user and must be run by that same user. Harper stores files natively on the operating system and only allows the Harper executable to be run by a single user — this prevents file permission issues and keeps the installation secure.

To resolve: run Harper with the same OS user account used during installation.
