---
title: Defining Application Roles
---

# Defining Application Roles

Applications are more than just tables and endpoints — they need access rules. Harper lets you define roles directly in your application so you can control who can do what, without leaving your codebase.

Let’s walk through creating a role, assigning it, and seeing it in action.

## Step 1: Declare a Role

First, point Harper to a roles configuration file. Add this to your `config.yaml`:

```yaml
roles:
  files: roles.yaml
```

Then create a simple `roles.yaml` in your application directory. For example, here’s a role that can only read and insert data into the `Dog` table:

```yaml
dog-reader:
  super_user: false
  data:
    Dog:
      read: true
      insert: true
```

When Harper starts up, it will create this role (or update it if it already exists).

## Step 2: Create a User for the Role

Next, create a non-super_user user and assign them this role. You can do this with the [Users and Roles API](../security/users-and-roles) (requires a super_user to run):

```bash
curl -u admin:password -X POST http://localhost:9926 \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "add_user",
    "username": "alice",
    "password": "password",
    "role": "dog_reader"
  }'
```

Now you have a user named `alice` with the `dog_reader` role.

## Step 3: Make Requests as Different Users

Authenticate requests as `alice` to see how her role works:

```bash
# allowed (insert, role permits insert)
curl -u alice:password -X POST http://localhost:9926/Dog/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Buddy", "breed": "Husky"}'

# not allowed (delete, role does not permit delete)
curl -u alice:password -X DELETE http://localhost:9926/Dog/1
```

The first request succeeds with a `200 OK`. The second fails with a `403 Forbidden`.

Now compare with a super_user:

```bash
# super_user can delete
curl -u admin:password -X DELETE http://localhost:9926/Dog/1
```

This succeeds because the super_user role has full permissions.

## Where to Go Next

This page gave you the basics - declare a role, assign it, and see it work.

For more advanced scenarios, including:

- defining multiple databases per role,
- granting fine-grained attribute-level permissions,
- and the complete structure of `roles.yaml`,

see the [Roles Reference](../../reference/roles).
