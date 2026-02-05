---
title: Real-Time
---

# Real-Time

## Real-Time

HarperDB provides real-time access to data and messaging. This allows clients to monitor and subscribe to data for changes in real-time as well as handling data-oriented messaging. HarperDB supports multiple standardized protocols to facilitate diverse standards-based client interaction.

HarperDB real-time communication is based around database tables. Declared tables are the basis for monitoring data, and defining "topics" for publishing and subscribing to messages. Declaring a table that establishes a topic can be as simple as adding a table with no attributes to your [schema.graphql in a HarperDB application folder](./applications/):

```
type MyTopic @table @export
```

You can then subscribe to records or sub-topics in this topic/namespace, as well as save data and publish messages, with the protocols discussed below.

### Content Negotiation

HarperDB is a database, not a generic broker, and therefore highly adept at handling _structured_ data. Data can be published and subscribed in all supported structured/object formats, including JSON, CBOR, and MessagePack, and the data will be stored and handled as structured data. This means that different clients can individually choose which format they prefer, both for inbound and outbound messages. One client could publish in JSON, and another client could choose to receive messages in CBOR.

## Protocols

### MQTT

HarperDB supports MQTT as an interface to this real-time data delivery. It is important to note that MQTT in HarperDB is not just a generic pub/sub hub, but is deeply integrated with the database providing subscriptions directly to database records, and publishing to these records. In this document we will explain how MQTT pub/sub concepts are aligned and integrated with database functionality.

#### Configuration

HarperDB supports MQTT with its `mqtt` server module and HarperDB supports MQTT over standard TCP sockets or over WebSockets. This is enabled by default, but can be configured in your `harperdb-config.yaml` configuration, allowing you to change which ports it listens on, if secure TLS connections are used, and MQTT is accepted over WebSockets:

```yaml
mqtt:
  network:
    port: 1883
    securePort: 8883 # for TLS
  webSocket: true # will also enable WS support through the default HTTP interface/port
  requireAuthentication: true
```

Note that if you are using WebSockets for MQTT, the sub-protocol should be set to "mqtt" (this is required by the MQTT specification, and should be included by any conformant client): `Sec-WebSocket-Protocol: mqtt`.

#### Capabilities

HarperDB's MQTT capabilities includes support for MQTT versions v3.1 and v5 with standard publish and subscription capabilities with multi-level topics, QoS 0 and 1 levels, and durable (non-clean) sessions. MQTT supports QoS 2 interaction, but doesn't guarantee exactly once delivery (although any guarantees of exactly once over unstable networks is a fictional aspiration). MQTT doesn't currently support last will, nor single-level wildcards (only multi-level wildcards).

### Topics

In MQTT, messages are published to, and subscribed from, topics. In HarperDB topics are aligned with resource endpoint paths in exactly the same way as the REST endpoints. If you define a table or resource in your schema, with a path/endpoint of "my-resource", that means that this can be addressed as a topic just like a URL path. So a topic of "my-resource/some-id" would correspond to the record in the my-resource table (or custom resource) with a record id of "some-id".

This means that you can subscribe to "my-resource/some-id" and making this subscription means you will receive notification messages for any updates to this record. If this record is modified or deleted, a message will be sent to listeners of this subscription.

The current value of this record is also treated as the "retained" message for this topic. When you subscribe to "my-resource/some-id", you will immediately receive the record for this id, through a "publish" command from the server, as the initial "retained" message that is first delivered. This provides a simple and effective way to get the current state of a record and future updates to that record without having to worry about timing issues of aligning a retrieval and subscription separately.

Similarly, publishing a message to a "topic" also interacts with the database. Publishing a message with "retain" flag enabled is interpreted as an update or put to that record. The published message will replace the current record with the contents of the published message.

If a message is published without a `retain` flag, the message will not alter the record at all, but will still be published to any subscribers to that record.

HarperDB supports QoS 0 and 1 for publishing and subscribing.

HarperDB supports multi-level topics, both for subscribing and publishing. HarperDB also supports multi-level wildcards, so you can subscribe to /`my-resource/#` to receive notifications for `my-resource/some-id` as well as `my-resource/nested/id`, or you can subscribe to `my-resource/nested/#` and receive the latter, but not the former, topic messages. HarperDB currently only supports trailing multi-level wildcards (no single-level wildcards with '\*').

### Ordering

HarperDB is designed to be a distributed database, and an intrinsic characteristic of distributed servers is that messages may take different amounts of time to traverse the network and may arrive in a different order depending on server location and network topology. HarperDB is designed for distributed data with minimal latency, and so messages are delivered to subscribers immediately when they arrive, HarperDB does not delay messages for coordinating confirmation or consensus among other nodes, which would significantly increase latency, messages are delivered as quickly as possible.

As an example, let's consider message #1 is published to node A, which then sends the message to node B and node C, but the message takes a while to get there. Slightly later, while the first message is still in transit, message #2 is published to node B, which then replicates it to A and C, and because of network conditions, message #2 arrives at node C before message #1. Because HarperDB prioritizes low latency, when node C receives message #2, it immediately publishes it to all its local subscribers (it has no knowledge that message #1 is in transit).

When message #1 is received by node C, the behavior of what it does with this message is dependent on whether the message is a "retained" message (was published with a retain flag set to true, or was put/update/upsert/inserted into the database) or was a non-retained message. In the case of a non-retained message, this message will be delivered to all local subscribers (even though it had been published earlier), thereby prioritizing the delivery of every message. On the other hand, a retained message will not deliver the earlier out-of-order message to clients, and HarperDB will keep the message with the latest timestamp as the "winning" record state (and will be retained message for any subsequent subscriptions). Retained messages maintain (eventual) consistency across the entire cluster of servers, all nodes will converge to the same message as the being the latest and retained message (#2 in this case).

Non-retained messages are generally a good choice for applications like chat, where every message needs to be delivered even if they might arrive out-of-order (the order may not be consistent across all servers). Retained messages can be thought of a "superseding" messages, and are a good fit for applications like instrument measurements like temperature readings, where the priority to provide the _latest_ temperature and older temperature readings are not important to publish after a new reading, and consistency of the most-recent record (across the network) is important.

### WebSockets

WebSockets are supported through the REST interface and go through the `connect(incomingMessages)` method on resources. By default, making a WebSockets connection to a URL will subscribe to the referenced resource. For example, making a WebSocket connection to `new WebSocket('wss://server/my-resource/341')` will access the resource defined for 'my-resource' and the resource id of 341 and connect to it. On the web platform this could be:

```javascript
let ws = new WebSocket('wss://server/my-resource/341');
ws.onmessage = (event) => {
	// received a notification from the server
	let data = JSON.parse(event.data);
};
```

By default, the resources will make a subscription to that resource, monitoring any changes to the records or messages published to it, and will return events on the WebSockets connection. You can also override `connect(incomingMessages)` with your own handler. The `connect` method simply needs to return an iterable (asynchronous iterable) that represents the stream of messages to be sent to the client. One easy way to create an iterable stream is to define the `connect` method as a generator and `yield` messages as they become available. For example, a simple WebSockets echo server for a resource could be written:

```javascript
export class Echo extends Resource {
	async *connect(incomingMessages) {
		for await (let message of incomingMessages) { // wait for each incoming message from the client
			// and send the message back to the client
			yield message;
		}
	}
```

You can also call the default `connect` and it will provide a convenient streaming iterable with events for the outgoing messages, with a `send` method that you can call to send messages on the iterable, and a `close` event for determining when the connection is closed. The incoming messages iterable is also an event emitter, and you can listen for `data` events to get the incoming messages using event style:

```javascript
export class Example extends Resource {
	connect(incomingMessages) {
		let outgoingMessages = super.connect();
		let timer = setInterval(() => {
			  outgoingMessages.send({greeting: 'hi again!'});
		}, 1000);  // send a message once a second
		incomingMessages.on('data', (message) => {
			// another way of echo-ing the data back to the client
			outgoingMessages.send(message);
		});
		outgoingMessages.on('close', () => {
			// make sure we end the timer once the connection is closed
			clearInterval(timer);
		});
		return outgoingMessages;
	}
```

### Server Sent Events

Server Sent Events (SSE) are also supported through the REST server interface, and provide a simple and efficient mechanism for web-based applications to receive real-time updates. For consistency of push delivery, SSE connections go through the `connect()` method on resources, much like WebSockets. The primary difference is that `connect` is called without any `incomingMessages` argument, since SSE is a one-directional transport mechanism. This can be used much like WebSockets, specifying a resource URL path will connect to that resource, and by default provides a stream of messages for changes and messages for that resource. For example, you can connect to receive notification in a browser for a resource like:

```javascript
let eventSource = new EventSource('https://server/my-resource/341', { withCredentials: true });
eventSource.onmessage = (event) => {
	// received a notification from the server
	let data = JSON.parse(event.data);
};
```

### MQTT Feature Support Matrix

| Feature                                                            | Support                                                        |
| ------------------------------------------------------------------ | -------------------------------------------------------------- |
| Connections, protocol negotiation, and acknowledgement with v3.1.1 | :heavy_check_mark:                                             |
| Connections, protocol negotiation, and acknowledgement with v5     | :heavy_check_mark:                                             |
| Secure MQTTS                                                       | :heavy_check_mark:                                             |
| MQTTS over WebSockets                                              | :heavy_check_mark:                                             |
| MQTT authentication via user/pass                                  | :heavy_check_mark:                                             |
| MQTT authentication via mTLS                                       | :heavy_check_mark:                                             |
| Publish                                                            | :heavy_check_mark:                                             |
| Subscribe                                                          | :heavy_check_mark:                                             |
| Multi-level wildcard                                               | :heavy_check_mark:                                             |
| Single-level wildcard                                              | :heavy_check_mark:                                             |
| QoS 0                                                              | :heavy_check_mark:                                             |
| QoS 1                                                              | :heavy_check_mark:                                             |
| QoS 2                                                              | Not fully supported, can perform conversation but does persist |
| Clean session                                                      | :heavy_check_mark:                                             |
| Durable session                                                    | :heavy_check_mark:                                             |
| Distributed durable session                                        |                                                                |
| Will                                                               | :heavy_check_mark:                                             |
| MQTT V5 User properties                                            |                                                                |
| MQTT V5 Will properties                                            |                                                                |
| MQTT V5 Connection properties                                      |                                                                |
| MQTT V5 Connection acknowledgement properties                      |                                                                |
| MQTT V5 Publish properties                                         |                                                                |
| MQTT V5 Subscribe properties                                       |                                                                |
| MQTT V5 Ack properties                                             |                                                                |
| MQTT V5 AUTH command                                               |                                                                |
| MQTT V5 Shared Subscriptions                                       |                                                                |
