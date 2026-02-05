---
title: Host A Static Web UI
---

# Host A Static Web UI

The [@fastify/static](https://github.com/fastify/fastify-static) module can be utilized to serve static files.

Install the module in your project by running `npm i @fastify/static` from inside your project directory.

Register `@fastify/static` with the server and set `root` to the absolute path of the directory that contains the static files to serve.

For further information on how to send specific files see the [@fastify/static](https://github.com/fastify/fastify-static) docs.

```javascript
module.exports = async (server, { hdbCore, logger }) => {
	server.register(require('@fastify/static'), {
		root: path.join(__dirname, 'public'),
	});
};
```
