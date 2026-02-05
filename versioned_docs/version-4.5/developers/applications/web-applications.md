---
title: Web Applications on Harper
---

# Web Applications on Harper

Harper is an efficient, capable, and robust platform for developing web applications, with numerous capabilities designed
specifically for optimized web application delivery. In addition, there are a number of tools and frameworks that can be used
with Harper to create web applications with standard best-practice design and development patterns. Running these frameworks
on Harper can unlock tremendous scalability and performance benefits by leveraging Harper's built-in multi-threading,
caching, and distributed design.

Harper's unique ability to run JavaScript code directly on the server side, combined with its built-in database for data storage, querying, and caching
allows you to create full-featured web applications with a single platform. This eliminates the overhead of legacy solutions that
require separate application servers, databases, and caching layers, and their requisite communication overhead and latency, while
allowing the full stack to deployed to distributed locations with full local response handling, providing an incredibly low latency web experience.

## Web Application Frameworks

With built-in caching mechanisms, and an easy-to-use JavaScript API for interacting with data, creating full-featured applications
using popular frameworks is a simple and straightforward process.

Get started today with one of our examples:

- [Next.js](https://github.com/HarperDB/nextjs-example)
- [React SSR](https://github.com/HarperDB/react-ssr-example)
- [Vue SSR](https://github.com/HarperDB/vue-ssr-example)
- [Svelte SSR](https://github.com/HarperDB/svelte-ssr-example)
- [Solid SSR](https://github.com/HarperDB/solid-ssr-example)

## Cookie Support

Harper includes support for authenticated sessions using cookies. This allows you to create secure, authenticated web applications
using best-practice security patterns, allowing users to login and maintain a session without any credential storage on the client side
that can be compromised. A login endpoint can be defined by exporting a resource and calling the `login` method on the request object. For example, this could be a login endpoint in your resources.js file:

```javascript
export class Login extends Resource {
	async post(data) {
		const { username, password } = data;
		await request.login(username, password);
		return { message: 'Logged in!' };
	}
}
```

This endpoint can be called from the client side using a standard fetch request, a cookie will be returned, and the session will be maintained by Harper.
This allows web applications to directly interact with Harper and database resources, without needing to go through extra layers of authentication handling.

## Browser Caching Negotiation

Browsers support caching negotiation with revalidation, which allows requests for locally cached data to be sent to servers with a tag or timestamp. Harper REST functionality can fully interact with these headers, and return `304 Not Modified` response based on prior `Etag` sent in headers. It is highly recommended that you utilize the [REST interface](../rest) for accessing tables, as it facilitates this downstream browser caching. Timestamps are recorded with all records and are then returned [as the `ETag` in the response](../rest#cachingconditional-requests). Utilizing this browser caching can greatly reduce the load on your server and improve the performance of your web application by being able to instantly use locally cached data after revalidation from the server.

## Built-in Cross-Origin Resource Sharing (CORS)

Harper includes built-in support for Cross-Origin Resource Sharing (CORS), which allows you to define which domains are allowed to access your Harper instance. This is a critical security feature for web applications, as it prevents unauthorized access to your data from other domains, while allowing cross-domain access from known hosts. You can define the allowed domains in your [Harper configuration file](../../deployments/configuration#http), and Harper will automatically handle the CORS headers for you.

## More Resources

Make sure to check out our developer videos too:

- [Next.js on Harper | Step-by-Step Guide for Next Level Next.js Performance](https://youtu.be/GqLEwteFJYY)
- [Server-side Rendering (SSR) with Multi-Tier Cache Demo](https://youtu.be/L-tnBNhO9Fc)
