// Local shim over the `harper` package.
//
// Harper 5.x types `Table.search()` to accept only a `RequestTarget` (a
// URLSearchParams subclass), whereas this codebase queries with plain option
// objects (`{ conditions, select, sort, ... }`) that Harper accepts at
// runtime. Rather than fight the upstream types at every call site, we re-export
// everything from `harper` but replace `tables`/`server` with permissively
// typed views. (Generated schema types are not used — @harperfast/schema-codegen
// cannot yet emit valid types for a Harper 5.x schema; see the engineering-metrics
// project's note and harperfast/schema-codegen#29.)
//
// This file is pure type-plumbing: the casts erase to nothing, so at runtime it
// is just `export const tables = <the real harper tables>`.

export * from 'harper';

import { tables as _tables, server as _server, Resource as _Resource } from 'harper';

// Harper's `Resource` base types its handler methods (post/get/...) with a
// strict shape (e.g. a required `reliesOnPrototype` static). Custom resources
// override those with plain methods, so expose a permissively-typed base that
// custom subclasses can extend without fighting the upstream signatures.
export const Resource = _Resource as unknown as { new (...args: any[]): any };

/** Plain query-options object accepted by Harper's collection methods. */
export interface SearchQuery {
	operator?: string;
	conditions?: any[];
	sort?: { attribute: string; descending?: boolean } | Record<string, any>;
	select?: any[];
	limit?: number;
	offset?: number;
	id?: string | number;
	// Bare-condition form (`{ attribute, comparator, value }`) + any other option.
	attribute?: string | string[];
	comparator?: string;
	value?: any;
	[key: string]: any;
}

/** The subset of table methods this codebase uses, permissively typed. */
export interface HarperTable {
	new (...args: any[]): any;
	search(query?: SearchQuery): AsyncIterable<any>;
	get(id?: any): Promise<any>;
	put(record: any, options?: any): Promise<any> | any;
	patch(...args: any[]): any;
	create(...args: any[]): any;
	delete(id?: any): Promise<boolean>;
	[key: string]: any;
}

/** `tables[TableName]` → permissive table accessor. */
export const tables = _tables as unknown as Record<string, HarperTable>;

/** Options for `server.http` — includes the middleware-ordering constraints. */
export interface HttpOptions {
	after?: string;
	before?: string;
	name?: string;
	runFirst?: boolean;
	port?: number | 'all';
	[key: string]: any;
}

/** The request object Harper passes to `server.http` middleware. */
export interface HarperRequest {
	method: string;
	url: string;
	pathname: string;
	headers: { get(name: string): string | null; [key: string]: any };
	/** Present only for handlers registered `{ after: 'authentication' }`. */
	session?: {
		update(data: Record<string, any>): Promise<any>;
		[key: string]: any;
	} | null;
	user?: { role?: { permission?: { super_user?: boolean } }; [key: string]: any } | null;
	[key: string]: any;
}

export type HttpHandler = (
	request: HarperRequest,
	next: (request: HarperRequest) => Response | Promise<Response>
) => Response | Promise<Response>;

export interface HarperServer {
	http(handler: HttpHandler, options?: HttpOptions): void;
	operation(op: any, context?: any, authorize?: boolean): Promise<any>;
	recordAnalytics?(value: number, metric: string, path?: string, method?: string, type?: string): void;
	[key: string]: any;
}

export const server = _server as unknown as HarperServer;
