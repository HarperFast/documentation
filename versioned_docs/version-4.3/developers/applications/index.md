---
title: Applications
---

# Applications

## Overview of HarperDB Applications

HarperDB is more than a database, it's a distributed clustering platform allowing you to package your schema, endpoints and application logic and deploy them to an entire fleet of HarperDB instances optimized for on-the-edge scalable data delivery.

In this guide, we are going to explore the evermore extensible architecture that HarperDB provides by building a HarperDB component, a fundamental building-block of the HarperDB ecosystem.

When working through this guide, we recommend you use the [HarperDB Application Template](https://github.com/HarperDB/application-template) repo as a reference.

## Understanding the Component Application Architecture

HarperDB provides several types of components. Any package that is added to HarperDB is called a "component", and components are generally categorized as either "applications", which deliver a set of endpoints for users, or "extensions", which are building blocks for features like authentication, additional protocols, and connectors that can be used by other components. Components can be added to the `hdb/components` directory and will be loaded by HarperDB when it starts. Components that are remotely deployed to HarperDB (through the studio or the operation API) are installed into the hdb/node_modules directory. Using `harperdb run .` or `harperdb dev .` allows us to specifically load a certain application in addition to any that have been manually added to `hdb/components` or installed (in `node\_modules`).

```mermaid
flowchart LR
	Client(Client)-->Endpoints
	Client(Client)-->HTTP
	Client(Client)-->Extensions
	subgraph HarperDB
	direction TB
	Applications(Applications)-- "Schemas" --> Tables[(Tables)]
	Applications-->Endpoints[/Custom Endpoints/]
	Applications-->Extensions
	Endpoints-->Tables
	HTTP[/REST/HTTP/]-->Tables
	Extensions[/Extensions/]-->Tables
	end
```

## Getting up and Running

### Pre-Requisites

We assume you are running HarperDB version 4.2 or greater, which supports HarperDB Application architecture (in previous versions, this is 'custom functions').

### Scaffolding our Application Directory

Let's create and initialize a new directory for our application. It is recommended that you start by using the [HarperDB application template](https://github.com/HarperDB/application-template). Assuming you have `git` installed, you can create your project directory by cloning:

```shell
> git clone https://github.com/HarperDB/application-template my-app
> cd my-app
```

<details>

<summary>You can also start with an empty application directory if you'd prefer.</summary>

To create your own application from scratch, you'll may want to initialize it as an npm package with the \`type\` field set to \`module\` in the \`package.json\` so that you can use the EcmaScript module syntax used in this tutorial:

```shell
> mkdir my-app
> cd my-app
> npm init -y esnext
```

</details>

<details>

<summary>If you want to version control your application code, you can adjust the remote URL to your repository.</summary>

Here's an example for a github repo:

```shell
> git remote set-url origin git@github.com:/<github-user>/<github-repo>
```

Locally developing your application and then committing your app to a source control is a great way to manage your code and configuration, and then you can [directly deploy from your repository](#deploying-your-application).

</details>

## Creating our first Table

The core of a HarperDB application is the database, so let's create a database table!

A quick and expressive way to define a table is through a [GraphQL Schema](https://graphql.org/learn/schema). Using your editor of choice, edit the file named `schema.graphql` in the root of the application directory, `my-app`, that we created above. To create a table, we will need to add a `type` of `@table` named `Dog` (and you can remove the example table in the template):

```graphql
type Dog @table {
	# properties will go here soon
}
```

And then we'll add a primary key named `id` of type `ID`:

_(Note: A GraphQL schema is a fast method to define tables in HarperDB, but you are by no means required to use GraphQL to query your application, nor should you necessarily do so)_

```graphql
type Dog @table {
	id: ID @primaryKey
}
```

Now we tell HarperDB to run this as an application:

```shell
> harperdb dev . # tell HarperDB cli to run current directory as an application in dev mode
```

HarperDB will now create the `Dog` table and its `id` attribute we just defined. Not only is this an easy way to get create a table, but this schema is included in our application, which will ensure that this table exists wherever we deploy this application (to any HarperDB instance).

## Adding Attributes to our Table

Next, let's expand our `Dog` table by adding additional typed attributes for dog `name`, `breed` and `age`.

```graphql
type Dog @table {
	id: ID @primaryKey
	name: String
	breed: String
	age: Int
}
```

This will ensure that new records must have these properties with these types.

Because we ran `harperdb dev .` earlier (dev mode), HarperDB is now monitoring the contents of our application directory for changes and reloading when they occur. This means that once we save our schema file with these new attributes, HarperDB will automatically reload our application, read `my-app/schema.graphql` and update the `Dog` table and attributes we just defined. The dev mode will also ensure that any logging or errors are immediately displayed in the console (rather only in the log file).

As a NoSQL database, HarperDB supports heterogeneous records (also referred to as documents), so you can freely specify additional properties on any record. If you do want to restrict the records to only defined properties, you can always do that by adding the `sealed` directive:

```graphql
type Dog @table @sealed {
	id: ID @primaryKey
	name: String
	breed: String
	age: Int
	tricks: [String]
}
```

If you are using HarperDB Studio, we can now [add JSON-formatted records](../administration/harperdb-studio/manage-databases-browse-data#add-a-record) to this new table in the studio or upload data as [CSV from a local file or URL](../administration/harperdb-studio/manage-databases-browse-data#load-csv-data). A third, more advanced, way to add data to your database is to use the [operations API](./operations-api), which provides full administrative control over your new HarperDB instance and tables.

## Adding an Endpoint

Now that we have a running application with a database (with data if you imported any data), let's make this data accessible from a RESTful URL by adding an endpoint. To do this, we simply add the `@export` directive to our `Dog` table:

```graphql
type Dog @table @export {
	id: ID @primaryKey
	name: String
	breed: String
	age: Int
	tricks: [String]
}
```

By default the application HTTP server port is `9926` (this can be [configured here](../deployments/configuration#http)), so the local URL would be [http://localhost:9926/Dog/](http://localhost:9926/Dog/) with a full REST API. We can PUT or POST data into this table using this new path, and then GET or DELETE from it as well (you can even view data directly from the browser). If you have not added any records yet, we could use a PUT or POST to add a record. PUT is appropriate if you know the id, and POST can be used to assign an id:

```http
POST /Dog/
Content-Type: application/json

{
	"name": "Harper",
	"breed": "Labrador",
	"age": 3,
	"tricks": ["sits"]
}
```

With this a record will be created and the auto-assigned id will be available through the `Location` header. If you added a record, you can visit the path `/Dog/<id>` to view that record. Alternately, the curl command `curl http://localhost:9926/Dog/<id>` will achieve the same thing.

## Authenticating Endpoints

These endpoints automatically support `Basic`, `Cookie`, and `JWT` authentication methods. See the documentation on [security](./security) for more information on different levels of access.

By default, HarperDB also automatically authorizes all requests from loopback IP addresses (from the same computer) as the superuser, to make it simple to interact for local development. If you want to test authentication/authorization, or enforce stricter security, you may want to disable the [`authentication.authorizeLocal` setting](../deployments/configuration#authentication).

### Content Negotiation

These endpoints support various content types, including `JSON`, `CBOR`, `MessagePack` and `CSV`. Simply include an `Accept` header in your requests with the preferred content type. We recommend `CBOR` as a compact, efficient encoding with rich data types, but `JSON` is familiar and great for web application development, and `CSV` can be useful for exporting data to spreadsheets or other processing.

HarperDB works with other important standard HTTP headers as well, and these endpoints are even capable of caching interaction:

```
Authorization: Basic <base64 encoded user:pass>
Accept: application/cbor
If-None-Match: "etag-id" # browsers can automatically provide this
```

## Querying

Querying your application database is straightforward and easy, as tables exported with the `@export` directive are automatically exposed via [REST endpoints](./rest). Simple queries can be crafted through [URL query parameters](https://en.wikipedia.org/wiki/Query_string).

In order to maintain reasonable query speed on a database as it grows in size, it is critical to select and establish the proper indexes. So, before we add the `@export` declaration to our `Dog` table and begin querying it, let's take a moment to target some table properties for indexing. We'll use `name` and `breed` as indexed table properties on our `Dog` table. All we need to do to accomplish this is tag these properties with the `@indexed` directive:

```graphql
type Dog @table {
	id: ID @primaryKey
	name: String @indexed
	breed: String @indexed
	owner: String
	age: Int
	tricks: [String]
}
```

And finally, we'll add the `@export` directive to expose the table as a RESTful endpoint

```graphql
type Dog @table @export {
	id: ID @primaryKey
	name: String @indexed
	breed: String @indexed
	owner: String
	age: Int
	tricks: [String]
}
```

Now we can start querying. Again, we just simply access the endpoint with query parameters (basic GET requests), like:

```
http://localhost:9926/Dog/?name=Harper
http://localhost:9926/Dog/?breed=Labrador
http://localhost:9926/Dog/?breed=Husky&name=Balto&select=id,name,breed
```

Congratulations, you now have created a secure database application backend with a table, a well-defined structure, access controls, and a functional REST endpoint with query capabilities! See the [REST documentation for more information on HTTP access](./rest) and see the [Schema reference](./applications/defining-schemas) for more options for defining schemas.

## Deploying your Application

This guide assumes that you're building a HarperDB application locally. If you have a cloud instance available, you can deploy it by doing the following:

- Commit and push your application component directory code (i.e., the `my-app` directory) to a Github repo. In this tutorial we started with a clone of the application-template. To commit and push to your own repository, change the origin to your repo: `git remote set-url origin git@github.com:your-account/your-repo.git`
- Go to the applications section of your target cloud instance in the [HarperDB Studio](../administration/harperdb-studio/manage-applications).
- In the left-hand menu of the applications IDE, click 'deploy' and specify a package location reference that follows the [npm package specification](https://docs.npmjs.com/cli/v8/using-npm/package-spec) (i.e., a string like `HarperDB/Application-Template` or a URL like `https://github.com/HarperDB/application-template`, for example, that npm knows how to install).

You can also deploy your application from your repository by directly using the [`deploy_component` operation](./operations-api/components#deploy-component).

Once you have deployed your application to a HarperDB cloud instance, you can start scaling your application by adding additional instances in other regions.

With the help of a global traffic manager/load balancer configured, you can distribute incoming requests to the appropriate server. You can deploy and re-deploy your application to all the nodes in your mesh.

Now, with an application that you can deploy, update, and re-deploy, you have an application that is horizontally and globally scalable!

## Custom Functionality with JavaScript

So far we have built an application entirely through schema configuration. However, if your application requires more custom functionality, you will probably want to employ your own JavaScript modules to implement more specific features and interactions. This gives you tremendous flexibility and control over how data is accessed and modified in HarperDB. Let's take a look at how we can use JavaScript to extend and define "resources" for custom functionality. Let's add a property to the dog records when they are returned, that includes their age in human years. In HarperDB, data is accessed through our [Resource API](../reference/resource), a standard interface to access data sources, tables, and make them available to endpoints. Database tables are `Resource` classes, and so extending the function of a table is as simple as extending their class.

To define custom (JavaScript) resources as endpoints, we need to create a `resources.js` module (this goes in the root of your application folder). And then endpoints can be defined with Resource classes that `export`ed. This can be done in addition to, or in lieu of the `@export`ed types in the schema.graphql. If you are exporting and extending a table you defined in the schema make sure you remove the `@export` from the schema so that don't export the original table or resource to the same endpoint/path you are exporting with a class. Resource classes have methods that correspond to standard HTTP/REST methods, like `get`, `post`, `patch`, and `put` to implement specific handling for any of these methods (for tables they all have default implementations). To do this, we get the `Dog` class from the defined tables, extend it, and export it:

```javascript
// resources.js:
const { Dog } = tables; // get the Dog table from the HarperDB provided set of tables (in the default database)

export class DogWithHumanAge extends Dog {
	get(query) {
		this.humanAge = 15 + this.age * 5; // silly calculation of human age equivalent
		return super.get(query);
	}
}
```

Here we exported the `DogWithHumanAge` class (exported with the same name), which directly maps to the endpoint path. Therefore, now we have a `/DogWithHumanAge/<dog-id>` endpoint based on this class, just like the direct table interface that was exported as `/Dog/<dog-id>`, but the new endpoint will return objects with the computed `humanAge` property. Resource classes provide getters/setters for every defined attribute so that accessing instance properties like `age`, will get the value from the underlying record. The instance holds information about the primary key of the record so updates and actions can be applied to the correct record. And changing or assigning new properties can be saved or included in the resource as it returned and serialized. The `return super.get(query)` call at the end allows for any query parameters to be applied to the resource, such as selecting individual properties (with a [`select` query parameter](./rest#selectproperties)).

Often we may want to incorporate data from other tables or data sources in your data models. Next, let's say that we want a `Breed` table that holds detailed information about each breed, and we want to add that information to the returned dog object. We might define the Breed table as (back in schema.graphql):

```graphql
type Breed @table {
	name: String @primaryKey
	description: String @indexed
	lifespan: Int
	averageWeight: Float
}
```

And next we will use this table in our `get()` method. We will call the new table's (static) `get()` method to retrieve a breed by id. To do this correctly, we access the table using our current context by passing in `this` as the second argument. This is important because it ensures that we are accessing the data atomically, in a consistent snapshot across tables. This provides automatically tracking of most recently updated timestamps across resources for caching purposes. This allows for sharing of contextual metadata (like user who requested the data), and ensure transactional atomicity for any writes (not needed in this get operation, but important for other operations). The resource methods are automatically wrapped with a transaction (will commit/finish when the method completes), and this allows us to fully utilize multiple resources in our current transaction. With our own snapshot of the database for the Dog and Breed table we can then access data like this:

```javascript
//resource.js:
const { Dog, Breed } = tables; // get the Breed table too
export class DogWithBreed extends Dog {
	async get(query) {
		let breedDescription = await Breed.get(this.breed, this);
		this.breedDescription = breedDescription;
		return super.get(query);
	}
}
```

The call to `Breed.get` will return an instance of the `Breed` resource class, which holds the record specified the provided id/primary key. Like the `Dog` instance, we can access or change properties on the Breed instance.

Here we have focused on customizing how we retrieve data, but we may also want to define custom actions for writing data. While HTTP PUT method has a specific semantic definition (replace current record), a common method for custom actions is through the HTTP POST method. the POST method has much more open-ended semantics and is a good choice for custom actions. POST requests are handled by our Resource's post() method. Let's say that we want to define a POST handler that adds a new trick to the `tricks` array to a specific instance. We might do it like this, and specify an action to be able to differentiate actions:

```javascript
export class CustomDog extends Dog {
	async post(data) {
		if (data.action === 'add-trick') this.tricks.push(data.trick);
	}
}
```

And a POST request to /CustomDog/ would call this `post` method. The Resource class then automatically tracks changes you make to your resource instances and saves those changes when this transaction is committed (again these methods are automatically wrapped in a transaction and committed once the request handler is finished). So when you push data on to the `tricks` array, this will be recorded and persisted when this method finishes and before sending a response to the client.

The `post` method automatically marks the current instance as being update. However, you can also explicitly specify that you are changing a resource by calling the `update()` method. If you want to modify a resource instance that you retrieved through a `get()` call (like `Breed.get()` call above), you can call its `update()` method to ensure changes are saved (and will be committed in the current transaction).

We can also define custom authorization capabilities. For example, we might want to specify that only the owner of a dog can make updates to a dog. We could add logic to our `post` method or `put` method to do this, but we may want to separate the logic so these methods can be called separately without authorization checks. The [Resource API](../reference/resource) defines `allowRead`, `allowUpdate`, `allowCreate`, and `allowDelete`, or to easily configure individual capabilities. For example, we might do this:

```javascript
export class CustomDog extends Dog {
	allowUpdate(user) {
		return this.owner === user.username;
	}
}
```

Any methods that are not defined will fall back to HarperDB's default authorization procedure based on users' roles. If you are using/extending a table, this is based on HarperDB's [role based access](./security/users-and-roles). If you are extending the base `Resource` class, the default access requires super user permission.

You can also use the `default` export to define the root path resource handler. For example:

```javascript
// resources.json
export default class CustomDog extends Dog {
	...
```

This will allow requests to url like // to be directly resolved to this resource.

## Define Custom Data Sources

We can also directly implement the Resource class and use it to create new data sources from scratch that can be used as endpoints. Custom resources can also be used as caching sources. Let's say that we defined a `Breed` table that was a cache of information about breeds from another source. We could implement a caching table like:

```javascript
const { Breed } = tables; // our Breed table
class BreedSource extends Resource {
	// define a data source
	async get() {
		return (await fetch(`https://best-dog-site.com/${this.getId()}`)).json();
	}
}
// define that our breed table is a cache of data from the data source above, with a specified expiration
Breed.sourcedFrom(BreedSource, { expiration: 3600 });
```

The [caching documentation](applications/caching) provides much more information on how to use HarperDB's powerful caching capabilities and set up data sources.

HarperDB provides a powerful JavaScript API with significant capabilities that go well beyond a "getting started" guide. See our documentation for more information on using the [`globals`](../reference/globals) and the [Resource interface](../reference/resource).

## Configuring Applications/Components

Every application or component can define their own configuration in a `config.yaml`. If you are using the application template, you will have a [default configuration in this config file](https://github.com/HarperDB/application-template/blob/main/config.yaml) (which is default configuration if no config file is provided). Within the config file, you can configure how different files and resources are loaded and handled. The default configuration file itself is documented with directions. Each entry can specify any `files` that the loader will handle, and can also optionally specify what, if any, URL `path`s it will handle. A path of `/` means that the root URLs are handled by the loader, and a path of `.` indicates that the URLs that start with this application's name are handled.

This config file allows you define a location for static files, as well (that are directly delivered as-is for incoming HTTP requests).

Each configuration entry can have the following properties, in addition to properties that may be specific to the individual component:

- `files`: This specifies the set of files that should be handled the component. This is a glob pattern, so a set of files can be specified like "directory/\*\*".
- `path`: This is the URL path that is handled by this component.
- `root`: This specifies the root directory for mapping file paths to the URLs. For example, if you want all the files in `web/**` to be available in the root URL path via the static handler, you could specify a root of `web`, to indicate that the web directory maps to the root URL path.
- `package`: This is used to specify that this component is a third party package, and can be loaded from the specified package reference (which can be an NPM package, Github reference, URL, etc.).

## Define Fastify Routes

Exporting resource will generate full RESTful endpoints. But, you may prefer to define endpoints through a framework. HarperDB includes a resource plugin for defining routes with the Fastify web framework. Fastify is a full-featured framework with many plugins, that provides sophisticated route definition capabilities.

By default, applications are configured to load any modules in the `routes` directory (matching `routes/*.js`) with Fastify's autoloader, which will allow these modules to export a function to define fastify routes. See the [defining routes documentation](applications/define-routes) for more information on how to create Fastify routes.

However, Fastify is not as fast as HarperDB's RESTful endpoints (about 10%-20% slower/more-overhead), nor does it automate the generation of a full uniform interface with correct RESTful header interactions (for caching control), so generally the HarperDB's REST interface is recommended for optimum performance and ease of use.

## Restarting Your Instance

Generally, HarperDB will auto-detect when files change and auto-restart the appropriate threads. However, if there are changes that aren't detected, you may manually restart, with the `restart_service` operation:

```json
{
	"operation": "restart_service",
	"service": "http_workers"
}
```
