---
title: Harper Docs
---

# Harper Docs

:::info

### Get the Most Out of Harper

Join our Discord to access expert support, collaborate with Harper’s core team, and stay up to date on the latest platform updates. [Join Our Discord →](https://harper.fast/discord)
:::

## What is Harper? Performance, Simplicity, and Scale.

Harper is an all-in-one backend technology that fuses database technologies, caching, application hosting, and messaging functions into a single system. Unlike traditional architectures where each piece runs independently and incurs extra costs and latency from serialization and network operations between processes, Harper systems can handle workloads seamlessly and efficiently.

Harper simplifies scaling with clustering and native data replication. At scale, architectures tend to include 4 to 16 redundant, geo-distributed nodes located near every user population center. This ensures that every user experiences minimal network latency and maximum reliability in addition to the already rapid server responses.

![](/img/v4.4/harperstack.jpg)

## Understanding the Paradigm Shift

Have you ever combined MongoDB with Redis, Next.js with Postgres, or perhaps Fastify with anything else? The options seem endless. It turns out that the cost of serialization, network hops, and intermediary processes in these systems adds up to 50% of the total system resources used (often more). Not to mention the hundreds of milliseconds of latency they can add.

What we realized is that networking systems together in this way is inefficient and only necessary because a fused technology did not exist. So, we built Harper, a database fused with a complete JavaScript application system. It’s not only orders of magnitude more performant than separated systems, but it’s also easier to deploy and manage at scale.

## Build With Harper

Start by running Harper locally with [npm](https://www.npmjs.com/package/harperdb) or [Docker](https://hub.docker.com/r/harperdb/harperdb).

Since technology tends to be built around the storage, processing, and transfer of data, start by [defining your schema](./developers/applications/#creating-our-first-table) with the `schema.graphql` file in the root of the application directory.

If you would like to [query](./developers/applications/#adding-an-endpoint) this data, add the `@export` directive to our data schema and test out the [REST](./developers/rest), [MQTT](./developers/real-time#mqtt), or [WebSocket](./developers/real-time#websockets) endpoints.

When you are ready for something a little more advanced, start [customizing your application](./developers/applications/#custom-functionality-with-javascript).

Finally, when it’s time to deploy, explore [replication](./developers/replication/) between nodes.

If you would like to jump into the most advanced capabilities, learn about [components](developers/components/index.md).

For a more comprehensive deep dive, take a look at our [Getting Started Guide](/learn/).

:::warning
Need help? Please don’t hesitate to [reach out](https://www.harpersystems.dev/contact).
:::

## Popular Use Cases

With so much functionality built in, the use cases span nearly all application systems. Some of the most popular are listed below, motivated by new levels of performance and system simplicity.

### Online Catalogs & Content Delivery

For use cases like e-commerce, real estate listing, and content-oriented sites, Harper’s breakthroughs in performance and distribution pay dividends in the form of better SEO and higher conversion rates. One common implementation leverages Harper’s [Next.js Component](https://github.com/HarperDB/nextjs) to host modern, performant frontend applications. Other implementations leverage the built-in caching layer and JavaScript application system to [server-side render pages](https://www.harpersystems.dev/development/tutorials/server-side-rendering-with-multi-tier-cache) that remain fully responsive because of built-in WebSocket connections.

### Data Delivery Networks

For use cases like real-time sports updates, flight tracking, and zero-day software update distribution, Harper is rapidly gaining popularity. Harper’s ability to receive and broadcast messages while simultaneously handling application logic and data storage streamlines operations and eliminates the need for multiple separate systems. To build an understanding of our messaging system function, refer to our [real-time documentation](./developers/real-time).

### Edge Inference Systems

Capturing, storing, and processing real-time data streams from client and IoT systems typically requires a stack of technology. Harper’s selective data replication and self-healing connections make for an ideal multi-tier system where edge and cloud systems both run Harper, making everything more performant.

[We’re happy](https://www.harpersystems.dev/contact) to walk you through how to do this.

## Getting Started

<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', margin: '2rem 0'}}>
  <div style={{border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', transition: 'box-shadow 0.2s'}}>
    <h3 style={{marginTop: '0'}}>
      <a href="/learn/" style={{textDecoration: 'none', color: 'inherit'}}>
        Quickstart
      </a>
    </h3>
    <p style={{marginBottom: '0', color: '#666'}}>
      Get up and running with Harper
    </p>
  </div>
  <div style={{border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', transition: 'box-shadow 0.2s'}}>
    <h3 style={{marginTop: '0'}}>
      <a href="./4.4/deployments/install-harper/" style={{textDecoration: 'none', color: 'inherit'}}>
        Quick Install Harper
      </a>
    </h3>
    <p style={{marginBottom: '0', color: '#666'}}>
      Run Harper on your on hardware
    </p>
  </div>
  <div style={{border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', transition: 'box-shadow 0.2s'}}>
    <h3 style={{marginTop: '0'}}>
      <a href="./4.4/deployments/harper-cloud/" style={{textDecoration: 'none', color: 'inherit'}}>
        Try Harper Cloud
      </a>
    </h3>
    <p style={{marginBottom: '0', color: '#666'}}>
      Spin up an instance in minutes to get going fast
    </p>
  </div>
</div>

## Building with Harper

<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', margin: '2rem 0'}}>
  <div style={{border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', transition: 'box-shadow 0.2s'}}>
    <h3 style={{marginTop: '0'}}>
      <a href="./4.4/developers/applications/" style={{textDecoration: 'none', color: 'inherit'}}>
        Harper Applications
      </a>
    </h3>
    <p style={{marginBottom: '0', color: '#666'}}>
      Build your a fully featured Harper Component with custom functionality
    </p>
  </div>
  <div style={{border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', transition: 'box-shadow 0.2s'}}>
    <h3 style={{marginTop: '0'}}>
      <a href="./4.4/developers/rest" style={{textDecoration: 'none', color: 'inherit'}}>
        REST Queries
      </a>
    </h3>
    <p style={{marginBottom: '0', color: '#666'}}>
      The recommended HTTP interface for data access, querying, and manipulation
    </p>
  </div>
  <div style={{border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', transition: 'box-shadow 0.2s'}}>
    <h3 style={{marginTop: '0'}}>
      <a href="./4.4/developers/operations-api/" style={{textDecoration: 'none', color: 'inherit'}}>
        Operations API
      </a>
    </h3>
    <p style={{marginBottom: '0', color: '#666'}}>
      Configure, deploy, administer, and control your Harper instance
    </p>
  </div>
</div>

<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', margin: '2rem 0'}}>
  <div style={{border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', transition: 'box-shadow 0.2s'}}>
    <h3 style={{marginTop: '0'}}>
      <a href="./4.4/developers/replication/" style={{textDecoration: 'none', color: 'inherit'}}>
        Clustering &#x26; Replication
      </a>
    </h3>
    <p style={{marginBottom: '0', color: '#666'}}>
      The process of connecting multiple Harper databases together to create a database mesh network that enables users to define data replication patterns.
    </p>
  </div>
  <div style={{border: '1px solid #e0e0e0', borderRadius: '8px', padding: '1.5rem', transition: 'box-shadow 0.2s'}}>
    <h3 style={{marginTop: '0'}}>
      <a href="./4.4/administration/harper-studio/" style={{textDecoration: 'none', color: 'inherit'}}>
        Explore the Harper Studio
      </a>
    </h3>
    <p style={{marginBottom: '0', color: '#666'}}>
      The web-based GUI for Harper. Studio enables you to administer, navigate, and monitor all of your Harper instances in a simple, user friendly interface.
    </p>
  </div>
</div>
