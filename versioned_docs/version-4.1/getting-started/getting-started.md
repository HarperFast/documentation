---
title: Getting Started
---

# Getting Started

Getting started with HarperDB is easy and fast.

The quickest way to get up and running with HarperDB is with HarperDB Cloud, our database-as-a-service offering, which this guide will utilize.

### Set Up a HarperDB Instance

Before you can start using HarperDB you need to set up an instance. Note, if you would prefer to install HarperDB locally, [check out the installation guides including Linux, Mac, and many other options](../4.1/install-harperdb).

1. [Sign up for the HarperDB Studio](https://studio.harperdb.io/sign-up)
1. [Create a new HarperDB Cloud instance](../4.1/harperdb-studio/instances#create-a-new-instance)

> HarperDB Cloud instance provisioning typically takes 5-15 minutes. You will receive an email notification when your instance is ready.

### Using the HarperDB Studio

Now that you have a HarperDB instance, you can do pretty much everything you’d like through the Studio. This section links to appropriate articles to get you started interacting with your data.

1. [Create a schema](../4.1/harperdb-studio/manage-schemas-browse-data#create-a-schema)
1. [Create a table](../4.1/harperdb-studio/manage-schemas-browse-data#create-a-table)
1. [Add a record](../4.1/harperdb-studio/manage-schemas-browse-data#add-a-record)
1. [Load CSV data](../4.1/harperdb-studio/manage-schemas-browse-data#load-csv-data) (Here’s a sample CSV of the HarperDB team’s dogs)
1. [Query data via SQL](../4.1/harperdb-studio/query-instance-data)

### Using the HarperDB API

Complete HarperDB API documentation is available at api.harperdb.io. The HarperDB Studio features an example code builder that generates API calls in the programming language of your choice. For example purposes, a basic cURL command is shown below to create a schema called dev.

```
curl --location --request POST 'https://instance-subdomain.harperdbcloud.com' \
--header 'Authorization: Basic YourBase64EncodedInstanceUser:Pass' \
--header 'Content-Type: application/json' \
--data-raw '{
"operation": "create_schema",
"schema": "dev"
}'
```

Breaking it down, there are only a few requirements for interacting with HarperDB:

- Using the HTTP POST method.
- Providing the URL of the HarperDB instance.
- Providing the Authorization header (more on using Basic authentication).
- Providing the Content-Type header.
- Providing a JSON body with the desired operation and any additional operation properties (shown in the --data-raw parameter). This is the only parameter that needs to be changed to execute alternative operations on HarperDB.

### Video Tutorials

[HarperDB video tutorials are available within the HarperDB Studio](../4.1/harperdb-studio/resources#video-tutorials). HarperDB and the HarperDB Studio are constantly changing, as such, there may be small discrepancies in UI/UX.
