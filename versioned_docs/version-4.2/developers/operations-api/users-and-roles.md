---
title: Users and Roles
---

# Users and Roles

## List Roles

Returns a list of all roles. Learn more about HarperDB roles here: [https://harperdb.io/docs/security/users-roles/](https://harperdb.io/docs/security/users-roles/).

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `list_roles`

### Body

```json
{
	"operation": "list_roles"
}
```

### Response: 200

```json
[
	{
		"__createdtime__": 1611615061106,
		"__updatedtime__": 1611615061106,
		"id": "05c2ffcd-f780-40b1-9432-cfe8ba5ad890",
		"permission": {
			"super_user": false,
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
		},
		"role": "developer"
	},
	{
		"__createdtime__": 1610749235614,
		"__updatedtime__": 1610749235614,
		"id": "136f03fa-a0e9-46c3-bd5d-7f3e7dd5b564",
		"permission": {
			"cluster_user": true
		},
		"role": "cluster_user"
	},
	{
		"__createdtime__": 1610749235609,
		"__updatedtime__": 1610749235609,
		"id": "745b3138-a7cf-455a-8256-ac03722eef12",
		"permission": {
			"super_user": true
		},
		"role": "super_user"
	}
]
```

---

## Add Role

Creates a new role with the specified permissions. Learn more about HarperDB roles here: [https://harperdb.io/docs/security/users-roles/](https://harperdb.io/docs/security/users-roles/).

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `add_role`
- `role` _(required)_ - name of role you are defining
- `permission` _(required)_ - object defining permissions for users associated with this role:
  - `super_user` _(optional)_ - boolean which, if set to true, gives users associated with this role full access to all operations and methods. If not included, value will be assumed to be false.
  - `structure_user` _(optional)_ - boolean OR array of schema names (as strings). If boolean, user can create new schemas and tables. If array of strings, users can only manage tables within the specified schemas. This overrides any individual table permissions for specified schemas, or for all schemas if the value is true.

### Body

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

### Response: 200

```json
{
	"role": "develope3r",
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
	},
	"id": "0a9368b0-bd81-482f-9f5a-8722e3582f96",
	"__updatedtime__": 1598549532897,
	"__createdtime__": 1598549532897
}
```

---

## Alter Role

Modifies an existing role with the specified permissions. updates permissions from an existing role. Learn more about HarperDB roles here: [https://harperdb.io/docs/security/users-roles/](https://harperdb.io/docs/security/users-roles/).

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `alter_role`
- `id` _(required)_ - the id value for the role you are altering
- `role` _(optional)_ - name value to update on the role you are altering
- `permission` _(required)_ - object defining permissions for users associated with this role:
  - `super_user` _(optional)_ - boolean which, if set to true, gives users associated with this role full access to all operations and methods. If not included, value will be assumed to be false.
  - `structure_user` _(optional)_ - boolean OR array of schema names (as strings). If boolean, user can create new schemas and tables. If array of strings, users can only manage tables within the specified schemas. This overrides any individual table permissions for specified schemas, or for all schemas if the value is true.

### Body

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
					"attribute_permissions": [
						{
							"attribute_name": "name",
							"read": false,
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

### Response: 200

```json
{
	"id": "a7cb91e9-32e4-4dbf-a327-fab4fa9191ea",
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
							"read": false,
							"insert": true,
							"update": true
						}
					]
				}
			}
		}
	},
	"__updatedtime__": 1598549996106
}
```

---

## Drop Role

Deletes an existing role from the database. NOTE: Role with associated users cannot be dropped. Learn more about HarperDB roles here: [https://harperdb.io/docs/security/users-roles/](https://harperdb.io/docs/security/users-roles/).

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - this must always be `drop_role`
- `id` _(required)_ - this is the id of the role you are dropping

### Body

```json
{
	"operation": "drop_role",
	"id": "2ebc3415-0aa0-4eea-9b8e-40860b436119"
}
```

### Response: 200

```json
{
	"message": "developer successfully deleted"
}
```

---

## List Users

Returns a list of all users. Learn more about HarperDB users here: [https://harperdb.io/docs/security/users-roles/](https://harperdb.io/docs/security/users-roles/).

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `list_users`

### Body

```json
{
	"operation": "list_users"
}
```

### Response: 200

```json
[
	{
		"__createdtime__": 1635520961165,
		"__updatedtime__": 1635520961165,
		"active": true,
		"role": {
			"__createdtime__": 1635520961161,
			"__updatedtime__": 1635520961161,
			"id": "7c78ef13-c1f3-4063-8ea3-725127a78279",
			"permission": {
				"super_user": true,
				"system": {
					"tables": {
						"hdb_table": {
							"read": true,
							"insert": false,
							"update": false,
							"delete": false,
							"attribute_permissions": []
						},
						"hdb_attribute": {
							"read": true,
							"insert": false,
							"update": false,
							"delete": false,
							"attribute_permissions": []
						},
						"hdb_schema": {
							"read": true,
							"insert": false,
							"update": false,
							"delete": false,
							"attribute_permissions": []
						},
						"hdb_user": {
							"read": true,
							"insert": false,
							"update": false,
							"delete": false,
							"attribute_permissions": []
						},
						"hdb_role": {
							"read": true,
							"insert": false,
							"update": false,
							"delete": false,
							"attribute_permissions": []
						},
						"hdb_job": {
							"read": true,
							"insert": false,
							"update": false,
							"delete": false,
							"attribute_permissions": []
						},
						"hdb_license": {
							"read": true,
							"insert": false,
							"update": false,
							"delete": false,
							"attribute_permissions": []
						},
						"hdb_info": {
							"read": true,
							"insert": false,
							"update": false,
							"delete": false,
							"attribute_permissions": []
						},
						"hdb_nodes": {
							"read": true,
							"insert": false,
							"update": false,
							"delete": false,
							"attribute_permissions": []
						},
						"hdb_temp": {
							"read": true,
							"insert": false,
							"update": false,
							"delete": false,
							"attribute_permissions": []
						}
					}
				}
			},
			"role": "super_user"
		},
		"username": "HDB_ADMIN"
	}
]
```

---

## User Info

Returns user data for the associated user credentials.

- `operation` _(required)_ - must always be `user_info`

### Body

```json
{
	"operation": "user_info"
}
```

### Response: 200

```json
{
	"__createdtime__": 1610749235611,
	"__updatedtime__": 1610749235611,
	"active": true,
	"role": {
		"__createdtime__": 1610749235609,
		"__updatedtime__": 1610749235609,
		"id": "745b3138-a7cf-455a-8256-ac03722eef12",
		"permission": {
			"super_user": true
		},
		"role": "super_user"
	},
	"username": "HDB_ADMIN"
}
```

---

## Add User

Creates a new user with the specified role and credentials. Learn more about HarperDB users here: [https://harperdb.io/docs/security/users-roles/](https://harperdb.io/docs/security/users-roles/).

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `add_user`
- `role` _(required)_ - 'role' name value of the role you wish to assign to the user. See `add_role` for more detail
- `username` _(required)_ - username assigned to the user. It can not be altered after adding the user. It serves as the hash
- `password` _(required)_ - clear text for password. HarperDB will encrypt the password upon receipt
- `active` _(required)_ - boolean value for status of user's access to your HarperDB instance. If set to false, user will not be able to access your instance of HarperDB.

### Body

```json
{
	"operation": "add_user",
	"role": "role_name",
	"username": "hdb_user",
	"password": "password",
	"active": true
}
```

### Response: 200

```json
{
	"message": "hdb_user successfully added"
}
```

---

## Alter User

Modifies an existing user's role and/or credentials. Learn more about HarperDB users here: [https://harperdb.io/docs/security/users-roles/](https://harperdb.io/docs/security/users-roles/).

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `alter_user`
- `username` _(required)_ - username assigned to the user. It can not be altered after adding the user. It serves as the hash.
- `password` _(optional)_ - clear text for password. HarperDB will encrypt the password upon receipt
- `role` _(optional)_ - `role` name value of the role you wish to assign to the user. See `add_role` for more detail
- `active` _(optional)_ - status of user's access to your HarperDB instance. See `add_role` for more detail

### Body

```json
{
	"operation": "alter_user",
	"role": "role_name",
	"username": "hdb_user",
	"password": "password",
	"active": true
}
```

### Response: 200

```json
{
	"message": "updated 1 of 1 records",
	"new_attributes": [],
	"txn_time": 1611615114397.988,
	"update_hashes": ["hdb_user"],
	"skipped_hashes": []
}
```

---

## Drop User

Deletes an existing user by username. Learn more about HarperDB users here: [https://harperdb.io/docs/security/users-roles/](https://harperdb.io/docs/security/users-roles/).

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `drop_user`
- `username` _(required)_ - username assigned to the user

### Body

```json
{
	"operation": "drop_user",
	"username": "sgoldberg"
}
```

### Response: 200

```json
{
	"message": "sgoldberg successfully deleted"
}
```
