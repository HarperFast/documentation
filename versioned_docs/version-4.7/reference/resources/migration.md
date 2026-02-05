---
title: Migration to Resource API version 2 (non-instance binding)
---

# Migration to Resource API version 2 (non-instance binding)

The Resource API was inspired by two major design ideas: the REST architectural design and the [Active Record pattern](https://en.wikipedia.org/wiki/Active_record_pattern) (made popular by Ruby on Rails and heavily used as a pattern in many ORMs). The basic design goal of the Resource API is to integrate these concepts into a single construct that can directly map RESTful methods (specifically the "uniform interface" of HTTP) to an active record data model. However, while the active record pattern has been for _consumption_ of data, implementing methods for endpoint definitions and caching sources as a data _provider_ can be confusing and cumbersome to implement. The updated non-instance binding Resource API is designed to make it easier and more consistent to implement a data provider and interact with records across a table, while maintaining more explicit control over what data is loaded and when.

The updated Resource API is enabled on a per-class basis by setting static `loadAsInstance` property to `false`. When this property is set to `false`, this means that the Resource instances will not be bound to a specific record. Instead instances represent the whole table, capturing the context and current transactional state. Any records in the table can be loaded or modified from `this` instance. There are a number of implications and different behaviors from a Resource class with `static loadAsInstance = false`:

- The `get` method (both static and instance) will directly return the record, a frozen enumerable object with direct properties, instead of a Resource instance.
- When instance methods are called, there will not be any record preloaded beforehand and the resource instance will not have properties mapped to a record.
- All instance methods accept a `target`, an instance of `RequestTarget`, as the first argument, which identifies the target record or query.
  - The `target` will have an `id` property identifying the target resource, along with target information.
  - The `getId()` method is no longer used and will return `undefined`.
  - The `target` will provide access to query parameters, search operators, and other directives.
  - A `target` property of `checkPermission` indicates that a method should check the permission before of request before proceeding. The default instance methods provide the default authorization behavior.
    - This supplants the need for `allowRead`, `allowUpdate`, `allowCreate`, and `allowDelete` methods, which shouldn't need to be used (and don't provide the id of the target record).
- Any data from a POST, PUT, and PATCH request will be available in the second argument. This reverses the order of the arguments to `put`, `post`, and `patch` compared to the legacy Resource API.
- Context is tracked using asynchronous context tracking, and will automatically be available to calls to other resources. This can be disabled by setting `static explicitContext = true`, which can improve performance.
- The `update` method will return an `Updatable` object (instead of a Resource instance), which provides properties mapped to a record, but these properties can be updated and changes will be saved when the transaction is committed.

The following are examples of how to migrate to the non-instance binding Resource API.

Previous code with a `get` method:

```javascript
export class MyData extends tables.MyData {
	async get(query) {
		let id = this.getId(); // get the id
		if (query?.size > 0) {
			// check number of query parameters
			let idWithQuery = id + query.toString(); // add query parameters
			let resource = await tables.MyData.get(idWithQuery, this); // retrieve another record
			resource.newProperty = 'value'; // assign a new value to the returned resource instance
			return resource;
		} else {
			this.newProperty = 'value'; // assign a new value to this instance
			return super.get(query);
		}
	}
}
```

Updated code:

```javascript
export class MyData extends tables.MyData {
	static loadAsInstance = false; // opt in to updated behavior
	async get(target) {
		let id = target.id; // get the id
		let record;
		if (target.size > 0) {
			// check number of query parameters
			let idWithQuery = target.toString(); // this is the full target with the path query parameters
			// we can retrieve another record from this table directly with this.get/super.get or with tables.MyData.get
			record = await super.get(idWithQuery);
		} else {
			record = await super.get(target); // we can just directly use the target as well
		}
		// the record itself is frozen, but we can copy/assign to a new object with additional properties if we want
		return { ...record, newProperty: 'value' };
	}
}
```

Here is an example of the preferred approach for authorization:
Previous code with a `get` method:

```javascript
export class MyData extends tables.MyData {
	allowRead(user) {
		// allow any authenticated user
		return user ? true : false;
	}
	async get(query) {
		// any get logic
		return super.get(query);
	}
}
```

```javascript
export class MyData extends tables.MyData {
	static loadAsInstance = false; // opt in to updated behavior
	async get(target) {
		// While you can still use allowRead, it is not called before get is called, and it is generally encouraged
		// to perform/call authorization explicitly in direct get, put, post methods rather than using allow* methods.
		if (!this.getContext().user) throw new Error('Unauthorized');
		target.checkPermissions = false; // authorization complete, no need to further check permissions below
		// target.checkPermissions is set to true or left in place, this default get method will perform the default permissions checks
		return super.get(target); // we can just directly use the query as well
	}
}
```

Here is an example of how to convert/upgrade an implementation of a `post` method:
Previous code with a `post` method:

```javascript
export class MyData extends tables.MyData {
	async post(data, query) {
		let resource = await tables.MyData.get(data.id, this);
		if (resource) {
			// update a property
			resource.someProperty = 'value';
			// or
			tables.MyData.patch(data.id, { someProperty: 'value' }, this);
		} else {
			// create a new record
			MyData.create(data, this);
		}
	}
}
```

Updated code:

```javascript
export class MyData extends tables.MyData {
	static loadAsInstance = false; // opt in to updated behavior
	// IMPORTANT: arguments are reversed:
	async post(target, data) {
		let record = await this.get(data.id);
		if (record) {
			// update a property
			const updatable = await this.update(data.id); // we can alternately pass a target to update
			updatable.someProperty = 'value';
			// or
			this.patch(data.id, { someProperty: 'value' });
		} else {
			// create a new record
			this.create(data);
		}
	}
}
```
