---
title: Components
---

# Components

## Add Component

Creates a new component project in the component root directory using a predefined template.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `add_component`
- `project` _(required)_ - the name of the project you wish to create
- `replicated` _(optional)_ - if true, Harper will replicate the component to all nodes in the cluster. Must be a boolean.

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

Will deploy a component using either a base64-encoded string representation of a `.tar` file (the output from `package_component`) or a package value, which can be any valid NPM reference, such as a GitHub repo, an NPM package, a tarball, a local directory or a website.

If deploying with the `payload` option, Harper will decrypt the base64-encoded string, reconstitute the .tar file of your project folder, and extract it to the component root project directory.

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
- `restart` _(optional)_ - must be either a boolean or the string `rolling`. If set to `rolling`, a rolling restart will be triggered after the component is deployed, meaning that each node in the cluster will be sequentially restarted (waiting for the last restart to start the next). If set to `true`, the restart will not be rolling, all nodes will be restarted in parallel. If `replicated` is `true`, the restart operations will be replicated across the cluster.
- `replicated` _(optional)_ - if true, Harper will replicate the component to all nodes in the cluster. Must be a boolean.
- `install_command` _(optional)_ - A command to use when installing the component. Must be a string. This can be used to install dependencies with pnpm or yarn, for example, like: `"install_command": "npm install -g pnpm && pnpm install"`

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
	"package": "HarperDB/application-template",
	"replicated": true
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
- `replicated` _(optional)_ - if true, Harper will replicate the component deletion to all nodes in the cluster. Must be a boolean.
- `restart` _(optional)_ - if true, Harper will restart after dropping the component. Must be a boolean.

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
- `replicated` _(optional)_ - if true, Harper will replicate the component update to all nodes in the cluster. Must be a boolean.

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

---

## Add SSH Key

Adds an SSH key for deploying components from private repositories. This will also create an ssh config file that will be used when deploying the components.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `add_ssh_key`
- `name` _(required)_ - the name of the key
- `key` _(required)_ - the private key contents. Must be an ed25519 key. Line breaks must be delimited with `\n` and have a trailing `\n`
- `host` _(required)_ - the host for the ssh config (see below). Used as part of the `package` url when deploying a component using this key
- `hostname` _(required)_ - the hostname for the ssh config (see below). Used to map `host` to an actual domain (e.g. `github.com`)
- `known_hosts` _(optional)_ - the public SSH keys of the host your component will be retrieved from. If `hostname` is `github.com` this will be retrieved automatically. Line breaks must be delimited with `\n`
- `replicated` _(optional)_ - if true, HarperDB will replicate the key to all nodes in the cluster. Must be a boolean.
  _Operation is restricted to super_user roles only_

### Body

```json
{
	"operation": "add_ssh_key",
	"name": "harperdb-private-component",
	"key": "-----BEGIN OPENSSH PRIVATE KEY-----\nthis\nis\na\nfake\nkey\n-----END OPENSSH PRIVATE KEY-----\n",
	"host": "harperdb-private-component.github.com",
	"hostname": "github.com"
}
```

### Response: 200

```json
{
	"message": "Added ssh key: harperdb-private-component"
}
```

### Generated Config and Deploy Component "package" string examples

```
#harperdb-private-component
Host harperdb-private-component.github.com
        HostName github.com
        User git
        IdentityFile /hdbroot/ssh/harperdb-private-component.key
        IdentitiesOnly yes
```

```
"package": "git+ssh://git@<host>:<github-repo-path>.git#semver:v1.2.3"

"package": "git+ssh://git@harperdb-private-component.github.com:HarperDB/harperdb-private-component.git#semver:v1.2.3"
```

Note that `deploy_component` with a package uses `npm install` so the url must be a valid npm format url. The above is an example of a url using a tag in the repo to install.

---

## Update SSH Key

Updates the private key contents of an existing SSH key.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `update_ssh_key`
- `name` _(required)_ - the name of the key to be updated
- `key` _(required)_ - the private key contents. Must be an ed25519 key. Line breaks must be delimited with `\n` and have a trailing `\n`
- `replicated` _(optional)_ - if true, Harper will replicate the key update to all nodes in the cluster. Must be a boolean.

### Body

```json
{
	"operation": "update_ssh_key",
	"name": "harperdb-private-component",
	"key": "-----BEGIN OPENSSH PRIVATE KEY-----\nthis\nis\na\nNEWFAKE\nkey\n-----END OPENSSH PRIVATE KEY-----\n",
	"host": "harperdb-private-component.github.com",
	"hostname": "github.com"
}
```

### Response: 200

```json
{
	"message": "Updated ssh key: harperdb-private-component"
}
```

## Delete SSH Key

Deletes a SSH key. This will also remove it from the generated SSH config.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `delete_ssh_key`
- `name` _(required)_ - the name of the key to be deleted
- `replicated` _(optional)_ - if true, Harper will replicate the key deletion to all nodes in the cluster. Must be a boolean.

### Body

```json
{
	"name": "harperdb-private-component"
}
```

### Response: 200

```json
{
	"message": "Deleted ssh key: harperdb-private-component"
}
```

---

## List SSH Keys

List off the names of added SSH keys

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `list_ssh_keys`

### Body

```json
{
	"operation": "list_ssh_keys"
}
```

### Response: 200

```json
[
	{
		"name": "harperdb-private-component"
	}
]
```

_Note: Additional SSH keys would appear as more objects in this array_

---

## Set SSH Known Hosts

Sets the SSH known_hosts file. This will overwrite the file.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `set_ssh_known_hosts`
- `known_hosts` _(required)_ - The contents to set the known_hosts to. Line breaks must be delimite d with&#x20;
- `replicated` _(optional)_ - if true, Harper will replicate the known hosts to all nodes in the cluster. Must be a boolean.

### Body

```json
{
	"operation": "set_ssh_known_hosts",
	"known_hosts": "github.com ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBEmKSENjQEezOmxkZMy7opKgwFB9nkt5YRrYMjNuG5N87uRgg6CLrbo5wAdT/y6v0mKV0U2w0WZ2YB/++Tpockg=\ngithub.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl\ngithub.com ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCj7ndNxQowgcQnjshcLrqPEiiphnt+VTTvDP6mHBL9j1aNUkY4Ue1gvwnGLVlOhGeYrnZaMgRK6+PKCUXaDbC7qtbW8gIkhL7aGCsOr/C56SJMy/BCZfxd1nWzAOxSDPgVsmerOBYfNqltV9/hWCqBywINIR+5dIg6JTJ72pcEpEjcYgXkE2YEFXV1JHnsKgbLWNlhScqb2UmyRkQyytRLtL+38TGxkxCflmO+5Z8CSSNY7GidjMIZ7Q4zMjA2n1nGrlTDkzwDCsw+wqFPGQA179cnfGWOWRVruj16z6XyvxvjJwbz0wQZ75XK5tKSb7FNyeIEs4TT4jk+S4dhPeAUC5y+bDYirYgM4GC7uEnztnZyaVWQ7B381AK4Qdrwt51ZqExKbQpTUNn+EjqoTwvqNj4kqx5QUCI0ThS/YkOxJCXmPUWZbhjpCg56i+2aB6CmK2JGhn57K5mj0MNdBXA4/WnwH6XoPWJzK5Nyu2zB3nAZp+S5hpQs+p1vN1/wsjk=\n"
}
```

### Response: 200

```json
{
	"message": "Known hosts successfully set"
}
```

## Get SSH Known Hosts

Gets the contents of the known_hosts file

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `get_ssh_known_hosts`

### Body

```json
{
	"operation": "get_ssh_known_hosts"
}
```

### Response: 200

```json
{
	"known_hosts": "github.com ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBEmKSENjQEezOmxkZMy7opKgwFB9nkt5YRrYMjNuG5N87uRgg6CLrbo5wAdT/y6v0mKV0U2w0WZ2YB/++Tpockg=\ngithub.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl\ngithub.com ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCj7ndNxQowgcQnjshcLrqPEiiphnt+VTTvDP6mHBL9j1aNUkY4Ue1gvwnGLVlOhGeYrnZaMgRK6+PKCUXaDbC7qtbW8gIkhL7aGCsOr/C56SJMy/BCZfxd1nWzAOxSDPgVsmerOBYfNqltV9/hWCqBywINIR+5dIg6JTJ72pcEpEjcYgXkE2YEFXV1JHnsKgbLWNlhScqb2UmyRkQyytRLtL+38TGxkxCflmO+5Z8CSSNY7GidjMIZ7Q4zMjA2n1nGrlTDkzwDCsw+wqFPGQA179cnfGWOWRVruj16z6XyvxvjJwbz0wQZ75XK5tKSb7FNyeIEs4TT4jk+S4dhPeAUC5y+bDYirYgM4GC7uEnztnZyaVWQ7B381AK4Qdrwt51ZqExKbQpTUNn+EjqoTwvqNj4kqx5QUCI0ThS/YkOxJCXmPUWZbhjpCg56i+2aB6CmK2JGhn57K5mj0MNdBXA4/WnwH6XoPWJzK5Nyu2zB3nAZp+S5hpQs+p1vN1/wsjk=\n"
}
```

---

## Install Node Modules

:::warning Deprecated
This operation is deprecated, as it is handled automatically by [deploy_component](#deploy-component) and [restart](./system-operations#restart).
:::

Executes npm install against specified custom function projects.

_Operation is restricted to super_user roles only_

- `operation` _(required)_ - must always be `install_node_modules`
- `projects` _(required)_ - must ba an array of custom functions projects.
- `dry_run` _(optional)_ - refers to the npm --dry-run flag: [https://docs.npmjs.com/cli/v8/commands/npm-install#dry-run](https://docs.npmjs.com/cli/v8/commands/npm-install#dry-run). Defaults to false.

### Body

```json
{
	"operation": "install_node_modules",
	"projects": ["dogs", "cats"],
	"dry_run": true
}
```
