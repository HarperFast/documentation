---
title: Data Loader
---

<!-- Source: versioned_docs/version-4.7/developers/applications/data-loader.md (primary) -->
<!-- Source: release-notes/v4-tucker/4.6.0.md (data loader introduced) -->

# Data Loader

Added in: v4.6.0

The Data Loader is a built-in component that loads data from JSON or YAML files into Harper tables as part of component deployment. It is designed for seeding tables with initial records — configuration data, reference data, default users, or other records that should exist when a component is first deployed or updated.

## Configuration

In your component's `config.yaml`, use the `dataLoader` key to specify the data files to load:

```yaml
dataLoader:
  files: 'data/*.json'
```

`dataLoader` is an [Extension](TODO:reference_versioned_docs/version-v4/components/extension-api.md 'Extension component API') and supports the standard `files` configuration option, including glob patterns.

## Data File Format

Each data file loads records into a single table. The file specifies the target database, table, and an array of records.

### JSON Example

```json
{
	"database": "myapp",
	"table": "users",
	"records": [
		{
			"id": 1,
			"username": "admin",
			"email": "admin@example.com",
			"role": "administrator"
		},
		{
			"id": 2,
			"username": "user1",
			"email": "user1@example.com",
			"role": "standard"
		}
	]
}
```

### YAML Example

```yaml
database: myapp
table: settings
records:
  - id: 1
    setting_name: app_name
    setting_value: My Application
  - id: 2
    setting_name: version
    setting_value: '1.0.0'
```

One table per file. To load data into multiple tables, create a separate file for each table.

## File Patterns

The `files` option accepts a single path, a list of paths, or a glob pattern:

```yaml
# Single file
dataLoader:
  files: 'data/seed-data.json'

# Multiple specific files
dataLoader:
  files:
    - 'data/users.json'
    - 'data/settings.yaml'
    - 'data/initial-products.json'

# Glob pattern
dataLoader:
  files: 'data/**/*.{json,yaml,yml}'
```

## Loading Behavior

When Harper starts a component with `dataLoader` configured:

1. All specified data files are read
2. Each file is validated to reference a single table
3. Records are inserted or updated using content hash comparison (SHA-256 hashes stored in the `hdb_dataloader_hash` system table)

### Change Detection

| Scenario                                           | Behavior                                         |
| -------------------------------------------------- | ------------------------------------------------ |
| New record                                         | Inserted; content hash stored                    |
| Unchanged record                                   | Skipped (no writes)                              |
| Changed data file                                  | Updated via `patch`, preserving any extra fields |
| Record created by user (not data loader)           | Never overwritten                                |
| Record modified by user after load                 | Preserved, not overwritten                       |
| Extra fields added by user to a data-loaded record | Preserved during updates                         |

This design makes data files safe to redeploy without losing manual modifications.

## Best Practices

**Define schemas first.** While the Data Loader can infer schemas from the records it loads, it is strongly recommended to define table schemas explicitly using the [graphqlSchema component](./schema.md) before loading data. This ensures proper types, constraints, and relationships.

**One table per file.** Each data file must target a single table. Organize files accordingly.

**Idempotent data.** Design files to be safe to load multiple times without creating conflicts.

**Version control.** Include data files in version control for consistency across deployments and environments.

**No sensitive data.** Do not include passwords, API keys, or secrets directly in data files. Use environment variables or secure configuration management instead.

## Example Component Structure

```
my-component/
├── config.yaml
├── data/
│   ├── users.json
│   ├── roles.json
│   └── settings.json
├── schemas.graphql
└── roles.yaml
```

```yaml
# config.yaml
graphqlSchema:
  files: 'schemas.graphql'

roles:
  files: 'roles.yaml'

dataLoader:
  files: 'data/*.json'

rest: true
```

## Related Documentation

- [Schema](./schema.md) — Defining table structure before loading data
- [Jobs](./jobs.md) — Bulk data operations via the Operations API (CSV/JSON import from file, URL, or S3)
- [Components](TODO:reference_versioned_docs/version-v4/components/overview.md) — Extension and plugin system that the data loader is built on
