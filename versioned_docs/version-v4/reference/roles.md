---
title: Roles
---

# Roles

Roles in Harper are part of the application’s role-based access control (RBAC) system. You can declare roles in your application and manage their permissions through a roles configuration file. When the application starts, Harper will ensure all declared roles exist with the specified permissions, updating them if necessary.

## Configuring Roles

Point to a roles configuration file from your application’s `config.yaml`:

```yaml
roles:
  files: roles.yaml
```

You can declare one or more files. Each file should define one or more roles in YAML format.

## Roles File Structure

A roles file (`roles.yaml`) contains role definitions keyed by role name. Each role may contain:

- **super_user** – a boolean that grants all permissions.
- **databases** – one or more databases the role has access to.
- **tables** – within each database, table-level and attribute-level permissions.

**Full Example**

```yaml
<role-name>:
  super_user: <boolean> # optional
  <database-name>:
    <table-name>:
      read: <boolean>
      insert: <boolean>
      update: <boolean>
      delete: <boolean>
      attributes:
        <attribute-name>:
          read: <boolean>
          insert: <boolean>
          update: <boolean>
```

## Role Flags

- `super_user: true` — grants full system access.
- `super_user: false` — the role only has the explicit permissions defined in the role.

## Database and Table Permissions

Within each role, you may specify one or more databases. Each database can declare permissions for tables.

Example:

```yaml
analyst:
  super_user: false
  data:
    Sales:
      read: true
      insert: false
      update: false
      delete: false
```

In this example, the `analyst` role has read-only access to the `Sales` table in the `data` database.

## Attribute-Level Permissions

You can also grant or deny access at the attribute level within a table.

Example:

```yaml
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

Here, the `editor` role can update the `title` of an article but cannot update the `author`.

## Multiple Roles

Roles can be defined side by side in a single file:

```yaml
reader:
  super_user: false
  data:
    Dog:
      read: true

writer:
  super_user: false
  data:
    Dog:
      insert: true
      update: true
```

## Behavior on Startup

- If a declared role does not exist, Harper creates it.
- If a declared role already exists, Harper updates its permissions to match the definition.
- Roles are enforced consistently across deployments, keeping access control in sync with your application code.
