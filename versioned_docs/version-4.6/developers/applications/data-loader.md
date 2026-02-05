---
title: Data Loader
---

# Data Loader

The Data Loader is a built-in component that provides a reliable mechanism for loading data from JSON or YAML files into Harper tables as part of component deployment. This feature is particularly useful for ensuring specific records exist in your database when deploying components, such as seed data, configuration records, or initial application data.

## Configuration

To use the Data Loader, first specify your data files in the `config.yaml` in your component directory:

```yaml
dataLoader:
  files: 'data/*.json'
```

The Data Loader is an [Extension](../../reference/components#extensions) and supports the standard `files` configuration option.

## Data File Format

Data files can be structured as either JSON or YAML files containing the records you want to load. Each data file must specify records for a single table - if you need to load data into multiple tables, create separate data files for each table.

### Basic Example

Create a data file in your component's data directory (one table per file):

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

### Multiple Tables

To load data into multiple tables, create separate data files for each table:

**users.json:**

```json
{
	"database": "myapp",
	"table": "users",
	"records": [
		{
			"id": 1,
			"username": "admin",
			"email": "admin@example.com"
		}
	]
}
```

**settings.yaml:**

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

## File Organization

You can organize your data files in various ways:

### Single File Pattern

```yaml
dataLoader:
  files: 'data/seed-data.json'
```

### Multiple Files Pattern

```yaml
dataLoader:
  files:
    - 'data/users.json'
    - 'data/settings.yaml'
    - 'data/initial-products.json'
```

### Glob Pattern

```yaml
dataLoader:
  files: 'data/**/*.{json,yaml,yml}'
```

## Loading Behavior

When Harper starts up with a component that includes the Data Loader:

1. The Data Loader reads all specified data files (JSON or YAML)
1. For each file, it validates that a single table is specified
1. Records are inserted or updated based on content hash comparison:
   - New records are inserted if they don't exist
   - Existing records are updated only if the data file content has changed
   - User modifications made via Operations API or other methods are preserved - those records won't be overwritten
   - Users can add extra fields to data-loader records without blocking future updates to the original fields
1. The Data Loader uses SHA-256 content hashing stored in a system table (`hdb_dataloader_hash`) to track which records it has loaded and detect changes

### Change Detection

The Data Loader intelligently handles various scenarios:

- **New records**: Inserted with their content hash stored
- **Unchanged records**: Skipped (no database writes)
- **Changed data file**: Records are updated using `patch` to preserve any extra fields users may have added
- **User-created records**: Records created outside the Data Loader (via Operations API, REST, etc.) are never overwritten
- **User-modified records**: Records modified after being loaded are preserved and not overwritten
- **User-added fields**: Extra fields added to data-loader records are preserved during updates

This approach ensures data files can be safely reloaded across deployments and node scaling without losing user modifications.

Note: While the Data Loader can create tables automatically by inferring the schema from the provided records, it's recommended to define your table schemas explicitly using the [graphqlSchema](../applications/defining-schemas) component for better control and type safety.

## Best Practices

1. **Define Schemas First**: While the Data Loader can infer schemas, it's strongly recommended to define your table schemas and relations explicitly using the [graphqlSchema](../applications/defining-schemas) component before loading data. This ensures proper data types, constraints, and relationships between tables.

1. **One Table Per File**: Remember that each data file can only load records into a single table. Organize your files accordingly.

1. **Idempotency**: Design your data files to be idempotent - they should be safe to load multiple times without creating duplicate or conflicting data.

1. **Version Control**: Include your data files in version control to ensure consistency across deployments.

1. **Environment-Specific Data**: Consider using different data files for different environments (development, staging, production).

1. **Data Validation**: Ensure your data files are valid JSON or YAML and match your table schemas before deployment.

1. **Sensitive Data**: Avoid including sensitive data like passwords or API keys directly in data files. Use environment variables or secure configuration management instead.

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

With this structure, your `config.yaml` might look like:

```yaml
# Load environment variables first
loadEnv:
  files: '.env'

# Define schemas
graphqlSchema:
  files: 'schemas.graphql'

# Define roles
roles:
  files: 'roles.yaml'

# Load initial data
dataLoader:
  files: 'data/*.json'

# Enable REST endpoints
rest: true
```

## Related Documentation

- [Built-In Components](../../reference/components/built-in-extensions)
- [Extensions](../../reference/components/extensions)
- [Bulk Operations](../operations-api/bulk-operations) - For loading data via the Operations API
