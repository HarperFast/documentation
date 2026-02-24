---
title: Manage Applications
---

<!-- Source: versioned_docs/version-4.7/administration/harper-studio/manage-applications.md (primary) -->

:::important
This documentation is for the deprecated Harper Cloud Studio. All users should migrate or start using [Harper Fabric](https://fabric.harper.fast) instead.
:::

# Manage Applications

[Harper Applications](../../developers/applications/) are enabled by default and can be configured further through the Harper Studio. It is recommended to read through the [Applications](../../developers/applications/) documentation first to gain a strong understanding of Harper Applications behavior.

All Applications configuration and development is handled through the **applications** page of the Harper Studio, accessed with the following instructions:

1. Navigate to the Harper Studio Organizations page.
1. Click the appropriate organization that the instance belongs to.
1. Select your desired instance.
1. Click **applications** in the instance control bar.

_Note, the **applications** page will only be available to super users._

## Manage Applications

The Applications editor is not required for development and deployment, though it is a useful tool to maintain and manage your Harper Applications. The editor provides the ability to create new applications or import/deploy remote application packages.

The left bar is the applications file navigator, allowing you to select files to edit and add/remove files and folders. By default, this view is empty because there are no existing applications. To get started, either create a new application or import/deploy a remote application.

The right side of the screen is the file editor. Here you can make edit individual files of your application directly in the Harper Studio.

## Things to Keep in Mind

To learn more about developing Harper Applications, make sure to read through the [Applications](../../developers/applications/) documentation.

When working with Applications in the Harper Studio, by default the editor will restart the Harper Applications server every time a file is saved. Note, this behavior can be turned off by toggling the `auto` toggle at the top right of the applications page. If you are constantly editing your application, it may result in errors causing the application not to run. These errors will not be visible on the application page, however they will be available in the Harper logs, which can be found on the [status page](./instance-metrics.md).

The Applications editor stores unsaved changes in cache. This means that occasionally your editor will show a discrepancy from the code that is stored and running on your Harper instance. You can identify if the code in your Studio differs if the "save" and "revert" buttons are active. To revert the cached version in your editor to the version of the file stored on your Harper instance click the "revert" button.

## Accessing Your Application Endpoints

Accessing your application endpoints varies with which type of endpoint you're creating. All endpoints, regardless of type, will be accessed via the [Harper HTTP port found in the Harper configuration file](TODO:reference_versioned_docs/version-v4/configuration/options.md#http). The default port is `9926`, but you can verify what your instances is set to by navigating to the [instance config page](./instance-configuration.md) and examining the read only JSON version of your instance's config file looking specifically for either the `http: port: 9926` or `http: securePort: 9926` configs. If `port` is set, you will access your endpoints via `http` and if `securePort` is set, you will access your endpoints via `https`.

Below is a breakdown of how to access each type of endpoint. In these examples, we will use a locally hosted instance with `securePort` set to `9926`: `https://localhost:9926`.

- **Standard REST Endpoints**\
  Standard REST endpoints are defined via the `@export` directive to tables in your schema definition. You can read more about these in the [Adding an Endpoint section of the Applications documentation](../../developers/applications/#adding-an-endpoint). Here, if we are looking to access a record with ID `1` from table `Dog` on our instance, [per the REST documentation](../../developers/rest), we could send a `GET` (or since this is a GET, we could post the URL in our browser) to `https://localhost:9926/Dog/1`.
- **Augmented REST Endpoints**\
  Harper Applications enable you to write [Custom Functionality with JavaScript](../../developers/applications/#custom-functionality-with-javascript) for your resources. Accessing these endpoints is identical to accessing the standard REST endpoints above, though you may have defined custom behavior in each function. Taking the example from the [Applications documentation](../../developers/applications/#custom-functionality-with-javascript), if we are looking to access the `DogWithHumanAge` example, we could send the GET to `https://localhost:9926/DogWithHumanAge/1`.
- **Fastify Routes**\
  If you need more functionality than the REST applications can provide, you can define your own custom endpoints using [Fastify Routes](../../developers/applications/#define-fastify-routes). The paths to these routes are defined via the application `config.yaml` file. You can read more about how you can customize the configuration options in the [Define Fastify Routes documentation](../../developers/applications/define-routes). By default, routes are accessed via the following pattern: `[Instance URL]:[HTTP Port]/[Project Name]/[Route URL]`. Using the example from the [Harper Application Template](https://github.com/HarperDB/application-template/), where we've named our project `application-template`, we would access the `getAll` route at `https://localhost/application-template/getAll`.

## Creating a New Application

1. From the application page, click the "+ app" button at the top right.
1. Click "+ Create A New Application Using The Default Template".
1. Enter a name for your project, note project names must contain only alphanumeric characters, dashes and underscores.
1. Click OK.
1. Your project will be available in the applications file navigator on the left. Click a file to select a file to edit.

## Editing an Application

1. From the applications page, click the file you would like to edit from the file navigator on the left.
1. Edit the file with any changes you'd like.
1. Click "save" at the top right. Note, as mentioned above, when you save a file, the Harper Applications server will be restarted immediately.
