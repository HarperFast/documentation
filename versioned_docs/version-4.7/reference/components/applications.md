---
title: Applications
---

# Applications

> The contents of this page predominantly relate to **application** components. Extensions are not necessarily _deployable_. The ambiguity of the term "components" is being worked on and will be improved in future releases. As we work to clarify the terminology, please keep in mind that the component operations are synonymous with application management. In general, "components" is the general term for both applications and extensions, but in context of the operations API it refers to applications only.

Harper offers several approaches to managing applications that differ between local development and Harper managed instances. This page will cover the recommended methods of developing, installing, deploying, and running Harper applications.

## Local Development

Harper is designed to be simple to run locally. Generally, Harper should be installed locally on a machine using a global package manager install (i.e. `npm i -g harperdb`).

> Before continuing, ensure Harper is installed and the `harperdb` CLI is available. For more information, review the [installation guide](../../deployments/install-harper/).

When developing an application locally there are a number of ways to run it on Harper.

### `dev` and `run` commands

The quickest way to run an application is by using the `dev` command within the application directory.

The `harperdb dev .` command will automatically watch for file changes within the application directory and restart the Harper threads when changes are detected.

The `dev` command will **not** restart the main thread; if this is a requirement, switch to using `run` instead and manually start/stop the process to execute the main thread.

Stop execution for either of these processes by sending a SIGINT (generally CTRL+C) signal to the process.

### Deploying to a local Harper instance

Alternatively, to mimic interfacing with a hosted Harper instance, use operation commands instead.

1. Start up Harper with `harperdb`
1. _Deploy_ the application to the local instance by executing:

   ```sh
   harperdb deploy \
     project=<name> \
     package=<path-to-project> \
     restart=true
   ```

   - Make sure to omit the `target` option so that it _deploys_ to the Harper instance running locally
   - The `package=<path-to-project>` option creates a symlink to the application simplifying restarts
     - By default, the `deploy` operation command will _deploy_ the current directory by packaging it up and streaming the bytes. By specifying `package`, it skips this and references the file path directly
   - The `restart=true` option automatically restarts Harper threads after the application is deployed
     - If set to `'rolling'`, a rolling restart will be triggered after the application is deployed

1. In another terminal, use the `harperdb restart` command to restart the instance's threads at any time
   - With `package=<path-to-project>`, the application source is symlinked so changes will automatically be picked up between restarts
   - If `package` was omitted, run the `deploy` command again with any new changes
1. To remove the application use `harperdb drop_component project=<name>`

Similar to the previous section, if the main thread needs to be restarted, start and stop the Harper instance manually (with the application deployed). Upon Harper startup, the application will automatically be loaded and executed across all threads.

> Not all [component operations](../../developers/operations-api/components) are available via CLI. When in doubt, switch to using the Operations API via network requests to the local Harper instance.

For example, to properly _deploy_ a `test-application` locally, the command would look like:

```sh
harperdb deploy \
  project=test-application \
  package=/Users/dev/test-application \
  restart=true
```

> If the current directory is the application directory, use a shortcut such as `package=$(pwd)` to avoid typing out the complete path.

Keep in mind that using a local file path for `package` will only work locally; deploying to a remote instance requires a different approach.

## Remote Management

Managing applications on a remote Harper instance is best accomplished through [component operations](../../developers/operations-api/components), similar to using the `deploy` command locally. Before continuing, always backup critical Harper instances. Managing, deploying, and executing applications can directly impact a live system.

Remote Harper instances work very similarly to local Harper instances. The primary application management operations still include `deploy_component`, `drop_component`, and `restart`.

The key to remote management is specifying a remote `target` along with appropriate username/password values. These can all be specified using CLI arguments: `target`, `username`, and `password`. Alternatively, the `CLI_TARGET_USERNAME` and `CLI_TARGET_PASSWORD` environment variables can replace the `username` and `password` arguments.

All together:

```sh
harperdb deploy \
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
harperdb deploy \
  project=<name> \
  package=<package> \
  target=<remote> \
  restart=true \
  replicated=true
```

Unlike local development where `package` should be set to a local file path for symlinking and improved development experience purposes, now it has some additional options.

A local application can be deployed to a remote instance by **omitting** the `package` field. Harper will automatically package the local directory and include that along with the rest of the deployment operation.

Furthermore, the `package` field can be set to any valid [npm dependency value](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#dependencies).

- For applications deployed to npm, specify the package name: `package="@harperdb/status-check"`
- For applications on GitHub, specify the URL: `package="https://github.com/HarperDB/status-check"`, or the shorthand `package=HarperDB/status-check`
- Private repositories also work if the correct SSH keys are on the server: `package="git+ssh://git@github.com:HarperDB/secret-applications.git"`
  - Reference the [SSH Key](../../developers/operations-api/components#add-ssh-key) operations for more information on managing SSH keys on a remote instance
- Even tarball URLs are supported: `package="https://example.com/application.tar.gz"`

> When using git tags, we highly recommend that you use the semver directive to ensure consistent and reliable installation by npm. In addition to tags, you can also reference branches or commit numbers.

These `package` values are all supported because behind-the-scenes, Harper is generating a `package.json` file for the components. Then, it uses a form of `npm install` to resolve them as dependencies. This is why symlinks are generated when specifying a file path locally. The following [Advanced](#advanced) section explores this pattern in more detail.

Finally, don't forget to include `restart=true`, or run `harperdb restart target=<remote>`.

## Dependency Management

Naturally, applications may have dependencies. Since we operate on top of Node.js, we default to leveraging `npm` and `package.json` for dependency management.

As already covered, there are a number of ways to run an application on Harper. From symlinking to a local directory, to deploying it via the `deploy_component` operation. Harper does its best to seamlessly run your application.

During application loading, if an application directory contains a `node_modules` directory or it excludes a `package.json`, Harper will skip dependency installation. Otherwise, Harper will check the application's config (values specified in the `harperdb-config.yaml` file) for `install: { command, timeout }` fields (see the example below for more information). If it exists, Harper will use the specified command to install dependencies. If not, then Harper will attempt to derive the package manager from the [`package.json#devEngines#packageManager`](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#devengines) field (which can specify an npm alternate like yarn or pnpm). Finally, if no package manager or install command could be derived, Harper will default to using `npm install`.

The Application operations [`add_component`](../../developers/operations-api/components.md#add-component) and [`deploy_component`](../../developers/operations-api/components.md#deploy-component) support customizing the install command (and timeout) through the `install_command` and `install_timeout` fields.

If you plan to use an alternative package manager than `npm`, ensure it is installed and configured on the host machine. Harper does not currently support the `"onFail": "download"` option in `package.json#devEngines#packageManager` and will fallback to `"onFail": "error"` behavior.

### Example `harperdb-config.yaml`

```yaml
myApp:
  package: ./my-app
  install:
    command: yarn install
    timeout: 600000 # 10 minutes
```

### Example `package.json`

```json
{
	"name": "my-app",
	"version": "1.0.0",
	"devEngines": {
		"packageManager": {
			"name": "pnpm",
			"onFail": "error"
		}
	}
}
```

## Advanced

The following methods are advanced and should be executed with caution as they can have unintended side-effects. Always backup any critical Harper instances before continuing.

First, locate the Harper installation `rootPath` directory. Generally, this is `~/hdb`. It can be retrieved by running `harperdb get_configuration` and looking for the `rootPath` field.

> For a useful shortcut on POSIX compliant machines run: `harperdb get_configuration json=true | jq ".rootPath" | sed 's/"/g'`

This path is the Harper instance. Within this directory, locate the root config titled `harperdb-config.yaml`, and the components root path. The components root path will be `<rootPath>/components` by default (thus, `~/hdb/components`), but it can also be configured. If necessary, use `harperdb get_configuration` again and look for the `componentsRoot` field for the exact path.

### Adding components to root

Similar to how components can specify other components within their `config.yaml`, applications can be added to Harper by adding them to the `harperdb-config.yaml`.

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
