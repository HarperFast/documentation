---
title: Managing
---

# Managing

Harper offers several approaches to managing components that differ between local development and Harper managed instances. This page will cover the recommended methods of developing, installing, deploying, and running Harper components.

## Local Development

Harper is designed to be simple to run locally. Generally, Harper should be installed locally on a machine using a global package manager install (i.e. `npm i -g harperdb`).

> Before continuing, ensure Harper is installed and the `harperdb` CLI is available. For more information, review the [installation guide](../../deployments/install-harper/).

When developing a component locally there are a number of ways to run it on Harper.

### `dev` and `run` commands

The quickest way to run a component is by using the `dev` command within the component directory.

The `harperdb dev .` command will automatically watch for file changes within the component directory and restart the Harper threads when changes are detected.

The `dev` command will **not** restart the main thread; if this is a requirement, switch to using `run` instead and manually start/stop the process to execute the main thread.

Stop execution for either of these processes by sending a SIGINT (generally CTRL+C) signal to the process.

### Deploying to a local Harper instance

Alternatively, to mimic interfacing with a hosted Harper instance, use operation commands instead.

1. Start up Harper with `harperdb`
1. _Deploy_ the component to the local instance by executing:

   ```sh
   harperdb deploy_component \
     project=<name> \
     package=<path-to-project> \
     restart=true
   ```

   - Make sure to omit the `target` option so that it _deploys_ to the Harper instance running locally
   - The `package=<path-to-project>` option creates a symlink to the component simplifying restarts
     - By default, the `deploy_component` operation command will _deploy_ the current directory by packaging it up and streaming the bytes. By specifying `package`, it skips this and references the file path directly
   - The `restart=true` option automatically restarts Harper threads after the component is deployed
     - If set to `'rolling'`, a rolling restart will be triggered after the component is deployed

1. In another terminal, use the `harperdb restart` command to restart the instance's threads at any time
   - With `package=<path-to-project>`, the component source is symlinked so changes will automatically be picked up between restarts
   - If `package` was omitted, run the `deploy_component` command again with any new changes
1. To remove the component use `harperdb drop_component project=<name>`

Similar to the previous section, if the main thread needs to be restarted, start and stop the Harper instance manually (with the component deployed). Upon Harper startup, the component will automatically be loaded and executed across all threads.

> Not all [component operations](../operations-api/components) are available via CLI. When in doubt, switch to using the Operations API via network requests to the local Harper instance.

For example, to properly _deploy_ a `test-component` locally, the command would look like:

```sh
harperdb deploy_component \
  project=test-component \
  package=/Users/dev/test-component \
  restart=true
```

> If the current directory is the component directory, use a shortcut such as `package=$(pwd)` to avoid typing out the complete path.

## Remote Management

Managing components on a remote Harper instance is best accomplished through [component operations](../operations-api/components), similar to using the `deploy_component` command locally. Before continuing, always backup critical Harper instances. Managing, deploying, and executing components can directly impact a live system.

Remote Harper instances work very similarly to local Harper instances. The primary component management operations still include `deploy_component`, `drop_component`, and `restart`.

The key to remote management is specifying a remote `target` along with appropriate username/password values. These can all be specified using CLI arguments: `target`, `username`, and `password`. Alternatively, the `CLI_TARGET_USERNAME` and `CLI_TARGET_PASSWORD` environment variables can replace the `username` and `password` arguments.

All together:

```sh
harperdb deploy_component \
  project=<name> \
  package=<package> \
  username=<username> \
  password=<password> \
  target=<remote> \
  restart=true \
  replicated=true
```

Or, using environment variables:

```sh
export CLI_TARGET_USERNAME=<username>
export CLI_TARGET_PASSWORD=<password>
harperdb deploy_component \
  project=<name> \
  package=<package> \
  target=<remote> \
  restart=true \
  replicated=true
```

Unlike local development where `package` should be set to a local file path for symlinking and improved development experience purposes, now it has some additional options.

A local component can be deployed to a remote instance by **omitting** the `package` field. Harper will automatically package the local directory and include that along with the rest of the deployment operation.

Furthermore, the `package` field can be set to any valid [npm dependency value](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#dependencies).

- For components deployed to npm, specify the package name: `package="@harperdb/status-check"`
- For components on GitHub, specify the URL: `package="https://github.com/HarperDB/status-check"`, or the shorthand `package=HarperDB/status-check`
- Private repositories also work if the correct SSH keys are on the server: `package="git+ssh://git@github.com:HarperDB/secret-component.git"`
  - Reference the [SSH Key](../operations-api/components#add-ssh-key) operations for more information on managing SSH keys on a remote instance
- Even tarball URLs are supported: `package="https://example.com/component.tar.gz"`

> When using git tags, we highly recommend that you use the semver directive to ensure consistent and reliable installation by npm. In addition to tags, you can also reference branches or commit numbers.

These `package` values are all supported because behind-the-scenes, Harper is generating a `package.json` file for the components. Then, it uses a form of `npm install` to resolve them as dependencies. This is why symlinks are generated when specifying a file path locally. The following [Advanced](./managing#advanced) section explores this pattern in more detail.

Finally, don't forget to include `restart=true`, or run `harperdb restart target=<remote>`.

## Advanced

The following methods are advanced and should be executed with caution as they can have unintended side-effects. Always backup any critical Harper instances before continuing.

First, locate the Harper installation `rootPath` directory. Generally, this is `~/hdb`. It can be retrieved by running `harperdb get_configuration` and looking for the `rootPath` field.

> For a useful shortcut on POSIX compliant machines run: `harperdb get_configuration json=true | jq ".rootPath" | sed 's/"/g'`

This path is the Harper instance. Within this directory, locate the root config titled `harperdb-config.yaml`, and the components root path. The components root path will be `<rootPath>/components` by default (thus, `~/hdb/components`), but it can also be configured. If necessary, use `harperdb get_configuration` again and look for the `componentsRoot` field for the exact path.

### Adding components to root

Similar to how components can specify other components within their `config.yaml`, components can be added to Harper by adding them to the `harperdb-config.yaml`.

The configuration is very similar to that of `config.yaml`. Entries are comprised of a top-level `<name>:`, and an indented `package: <specifier>` field. Any additional component options can also be included as indented fields.

```yaml
status-check:
  package: '@harperdb/status-check'
```

The key difference between this and a component's `config.yaml` is that the name does **not** need to be associated with a `package.json` dependency. When Harper starts up, it transforms these configurations into a `package.json` file, and then executes a form of `npm install`. Thus, the `package: <specifier>` can be any valid dependency syntax such as npm packages, GitHub repos, tarballs, and local directories are all supported.

Given a root config like:

```yaml
myGithubComponent:
  package: HarperDB-Add-Ons/package#v2.2.0 # install from GitHub
myNPMComponent:
  package: harperdb # install from npm
myTarBall:
  package: /Users/harper/cool-component.tar # install from tarball
myLocal:
  package: /Users/harper/local # install from local path
myWebsite:
  package: https://harperdb-component # install from URL
```

Harper will generate a `package.json` like:

```json
{
	"dependencies": {
		"myGithubComponent": "github:HarperDB-Add-Ons/package#v2.2.0",
		"myNPMComponent": "npm:harperdb",
		"myTarBall": "file://Users/harper/cool-component.tar",
		"myLocal": "file://Users/harper/local",
		"myWebsite": "https://harperdb-component"
	}
}
```

npm will install all the components and store them in `<componentsRoot>`. A symlink back to `<rootPath>/node_modules` is also created for dependency resolution purposes.

The package prefix is automatically added, however you can manually set it in your package reference.

```yaml
myCoolComponent:
  package: file://Users/harper/cool-component.tar
```

By specifying a file path, npm will generate a symlink and then changes will be automatically picked up between restarts.
