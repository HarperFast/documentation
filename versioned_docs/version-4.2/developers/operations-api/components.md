---
title: Components
---

# Components

## Add Component

Creates a new component project in the component root directory using a predefined template.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `add_component`
- `project` _(required)_ - the name of the project you wish to create

### Body

```json
{
	"operation": "add_component",
	"project": "my-component"
}
```

### Response: 200

```json
{
	"message": "Successfully added project: my-component"
}
```

---

## Deploy Component

Will deploy a component using either a base64-encoded string representation of a `.tar` file (the output from `package_component`) or a package value, which can be any valid NPM reference, such as a GitHub repo, an NPM package, a tarball, a local directory or a website.\

If deploying with the `payload` option, HarperDB will decrypt the base64-encoded string, reconstitute the .tar file of your project folder, and extract it to the component root project directory.\

If deploying with the `package` option, the package value will be written to `harperdb-config.yaml`. Then npm install will be utilized to install the component in the `node_modules` directory located in the hdb root. The value is a package reference, which should generally be a [URL reference, as described here](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#urls-as-dependencies) (it is also possible to include NPM registerd packages and file paths). URL package references can directly reference tarballs that can be installed as a package. However, the most common and recommended usage is to install from a Git repository, which can be combined with a tag to deploy a specific version directly from versioned source control. When using tags, we highly recommend that you use the `semver` directive to ensure consistent and reliable installation by NPM. In addition to tags, you can also reference branches or commit numbers. Here is an example URL package reference to a (public) Git repository that doesn't require authentication:

```
https://github.com/HarperDB/application-template#semver:v1.0.0
```

or this can be shortened to:

```
HarperDB/application-template#semver:v1.0.0
```

You can also install from private repository if you have an installed SSH keys on the server:

```
git+ssh://git@github.com:my-org/my-app.git#semver:v1.0.0
```

Or you can use a Github token:

```
https://<my-token>@github.com/my-org/my-app#semver:v1.0.0
```

Or you can use a GitLab Project Access Token:

```
https://my-project:<my-token>@gitlab.com/my-group/my-project#semver:v1.0.0
```

Note that your component will be installed by NPM. If your component has dependencies, NPM will attempt to download and install these as well. NPM normally uses the public registry.npmjs.org registry. If you are installing without network access to this, you may wish to define [custom registry locations](https://docs.npmjs.com/cli/v8/configuring-npm/npmrc) if you have any dependencies that need to be installed. NPM will install the deployed component and any dependencies in node_modules in the hdb root directory (typically `~/hdb/node_modules`).

_Note: After deploying a component a restart may be required_

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `deploy_component`
- `project` _(required)_ - the name of the project you wish to deploy
- `package` _(optional)_ - this can be any valid GitHub or NPM reference
- `payload` _(optional)_ - a base64-encoded string representation of the .tar file. Must be a string

### Body

```json
{
	"operation": "deploy_component",
	"project": "my-component",
	"payload": "A very large base64-encoded string representation of the .tar file"
}
```

```json
{
	"operation": "deploy_component",
	"project": "my-component",
	"package": "HarperDB/application-template"
}
```

### Response: 200

```json
{
	"message": "Successfully deployed: my-component"
}
```

---

## Package Component

Creates a temporary `.tar` file of the specified project folder, then reads it into a base64-encoded string and returns an object with the string and the payload.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `package_component`
- `project` _(required)_ - the name of the project you wish to package
- `skip_node_modules` _(optional)_ - if true, creates option for tar module that will exclude the project's node_modules directory. Must be a boolean

### Body

```json
{
	"operation": "package_component",
	"project": "my-component",
	"skip_node_modules": true
}
```

### Response: 200

```json
{
	"project": "my-component",
	"payload": "LgAAAAAAAAAAAAAAAAAAA...AAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="
}
```

---

## Drop Component

Deletes a file from inside the component project or deletes the complete project.

**If just `project` is provided it will delete all that projects local files and folders**

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `drop_component`
- `project` _(required)_ - the name of the project you wish to delete or to delete from if using the `file` parameter
- `file` _(optional)_ - the path relative to your project folder of the file you wish to delete

### Body

```json
{
	"operation": "drop_component",
	"project": "my-component",
	"file": "utils/myUtils.js"
}
```

### Response: 200

```json
{
	"message": "Successfully dropped: my-component/utils/myUtils.js"
}
```

---

## Get Components

Gets all local component files and folders and any component config from `harperdb-config.yaml`

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `get_components`

### Body

```json
{
	"operation": "get_components"
}
```

### Response: 200

```json
{
	"name": "components",
	"entries": [
		{
			"package": "HarperDB/application-template",
			"name": "deploy-test-gh"
		},
		{
			"package": "@fastify/compress",
			"name": "fast-compress"
		},
		{
			"name": "my-component",
			"entries": [
				{
					"name": "LICENSE",
					"mtime": "2023-08-22T16:00:40.286Z",
					"size": 1070
				},
				{
					"name": "index.md",
					"mtime": "2023-08-22T16:00:40.287Z",
					"size": 1207
				},
				{
					"name": "config.yaml",
					"mtime": "2023-08-22T16:00:40.287Z",
					"size": 1069
				},
				{
					"name": "package.json",
					"mtime": "2023-08-22T16:00:40.288Z",
					"size": 145
				},
				{
					"name": "resources.js",
					"mtime": "2023-08-22T16:00:40.289Z",
					"size": 583
				},
				{
					"name": "schema.graphql",
					"mtime": "2023-08-22T16:00:40.289Z",
					"size": 466
				},
				{
					"name": "utils",
					"entries": [
						{
							"name": "commonUtils.js",
							"mtime": "2023-08-22T16:00:40.289Z",
							"size": 583
						}
					]
				}
			]
		}
	]
}
```

---

## Get Component File

Gets the contents of a file inside a component project.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `get_component_file`
- `project` _(required)_ - the name of the project where the file is located
- `file` _(required)_ - the path relative to your project folder of the file you wish to view
- `encoding` _(optional)_ - the encoding that will be passed to the read file call. Defaults to `utf8`

### Body

```json
{
	"operation": "get_component_file",
	"project": "my-component",
	"file": "resources.js"
}
```

### Response: 200

```json
{
	"message": "/**export class MyCustomResource extends tables.TableName {\n\t/ we can define our own custom POST handler\n\tpost(content) {\n\t\t/ do something with the incoming content;\n\t\treturn super.post(content);\n\t}\n\t/ or custom GET handler\n\tget() {\n\t\t/ we can modify this resource before returning\n\t\treturn super.get();\n\t}\n}\n */\n/ we can also define a custom resource without a specific table\nexport class Greeting extends Resource {\n\t/ a \"Hello, world!\" handler\n\tget() {\n\t\treturn { greeting: 'Hello, world!' };\n\t}\n}"
}
```

---

## Set Component File

Creates or updates a file inside a component project.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `set_component_file`
- `project` _(required)_ - the name of the project the file is located in
- `file` _(required)_ - the path relative to your project folder of the file you wish to set
- `payload` _(required)_ - what will be written to the file
- `encoding` _(optional)_ - the encoding that will be passed to the write file call. Defaults to `utf8`

### Body

```json
{
	"operation": "set_component_file",
	"project": "my-component",
	"file": "test.js",
	"payload": "console.log('hello world')"
}
```

### Response: 200

```json
{
	"message": "Successfully set component: test.js"
}
```
