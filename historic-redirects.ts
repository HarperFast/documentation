// Historic redirect rules for versioned /docs/4.X/* paths
//
// All source paths are from GA pageview data (Oct 2025 – Feb 2026).
// These paths come from Docusaurus versioned docs that have been removed.
// All versioned /docs/4.X/* paths redirect to /reference/v4/*.
//
// This file is generated once and committed. It should not need to change
// unless new analytics data reveals missed paths.

// NOTE: Future redirects should be added to redirects.ts instead.

type RedirectRule = {
	to: string;
	from: string | string[];
};

// ─── Segment mapping helpers ──────────────────────────────────────────────────
// Converts old doc segments to new /reference/v4/ equivalents.
// Applied after stripping the /docs/4.X prefix.

// Paths that are junk/artifacts we intentionally skip (no redirect):
//   /~gitbook/pdf            — GitBook PDF export URL, not a real page
//   /docs/4.X/4.X/...        — malformed double-version paths
//   /docs/4.4./getting-started/ — typo path with extra dot

export const historicRedirects: RedirectRule[] = [
	// ── Version roots ──────────────────────────────────────────────────────────
	{ from: ['/docs/4.1', '/docs/4.2', '/docs/4.3', '/docs/4.4', '/docs/4.5', '/docs/4.6'], to: '/reference/v4' },

	// ── Getting Started ────────────────────────────────────────────────────────
	{
		from: [
			'/docs/4.1/getting-started',
			'/docs/4.2/getting-started',
			'/docs/4.3/getting-started',
			'/docs/4.4/getting-started',
			'/docs/4.5/getting-started',
			'/docs/4.6/getting-started',
		],
		to: '/learn',
	},
	{
		from: [
			'/docs/4.4/getting-started/quickstart',
			'/docs/4.5/getting-started/quickstart',
			'/docs/4.6/getting-started/quickstart',
		],
		to: '/learn',
	},
	{
		from: [
			'/docs/4.4/getting-started/installation',
			'/docs/4.5/getting-started/installation',
			'/docs/4.6/getting-started/installation',
		],
		to: '/learn/getting-started/install-and-connect-harper',
	},
	{
		from: ['/docs/4.5/getting-started/install-harper', '/docs/4.5/getting-started/first-harper-app'],
		to: '/learn/getting-started/install-and-connect-harper',
	},
	{ from: ['/docs/4.5/getting-started/harper-concepts', '/docs/4.6/getting-started/harper-concepts'], to: '/learn' },

	// ── Foundations ───────────────────────────────────────────────────────────
	{
		from: [
			'/docs/4.4/foundations/core-concepts',
			'/docs/4.5/foundations/core-concepts',
			'/docs/4.6/foundations/core-concepts',
		],
		to: '/learn',
	},
	{
		from: [
			'/docs/4.4/foundations/harper-architecture',
			'/docs/4.5/foundations/harper-architecture',
			'/docs/4.6/foundations/harper-architecture',
		],
		to: '/learn',
	},
	{
		from: ['/docs/4.4/foundations/use-cases', '/docs/4.5/foundations/use-cases', '/docs/4.6/foundations/use-cases'],
		to: '/learn',
	},

	// ── Operations API ─────────────────────────────────────────────────────────
	{
		from: ['/docs/4.1/operations-api', '/docs/4.2/operations-api', '/docs/4.3/operations-api'],
		to: '/reference/v4/operations-api/overview',
	},
	{
		from: [
			'/docs/4.2/developers/operations-api',
			'/docs/4.3/developers/operations-api',
			'/docs/4.4/developers/operations-api',
			'/docs/4.5/developers/operations-api',
			'/docs/4.6/developers/operations-api',
		],
		to: '/reference/v4/operations-api/overview',
	},
	{
		from: [
			'/docs/4.2/developers/operations-api/nosql-operations',
			'/docs/4.3/developers/operations-api/nosql-operations',
			'/docs/4.4/developers/operations-api/nosql-operations',
			'/docs/4.5/developers/operations-api/nosql-operations',
			'/docs/4.6/developers/operations-api/nosql-operations',
		],
		to: '/reference/v4/operations-api/operations',
	},
	{
		from: [
			'/docs/4.2/developers/operations-api/databases-and-tables',
			'/docs/4.3/developers/operations-api/databases-and-tables',
			'/docs/4.4/developers/operations-api/databases-and-tables',
			'/docs/4.5/developers/operations-api/databases-and-tables',
			'/docs/4.6/developers/operations-api/databases-and-tables',
		],
		to: '/reference/v4/database/overview',
	},
	{
		from: [
			'/docs/4.2/developers/operations-api/components',
			'/docs/4.3/developers/operations-api/components',
			'/docs/4.4/developers/operations-api/components',
			'/docs/4.5/developers/operations-api/components',
			'/docs/4.6/developers/operations-api/components',
		],
		to: '/reference/v4/operations-api/operations',
	},
	{
		from: [
			'/docs/4.2/developers/operations-api/advanced-json-sql-examples',
			'/docs/4.3/developers/operations-api/advanced-json-sql-examples',
			'/docs/4.4/developers/operations-api/advanced-json-sql-examples',
			'/docs/4.5/developers/operations-api/advanced-json-sql-examples',
			'/docs/4.6/developers/operations-api/advanced-json-sql-examples',
		],
		to: '/reference/v4/operations-api/operations',
	},
	{
		from: [
			'/docs/4.2/developers/operations-api/bulk-operations',
			'/docs/4.3/developers/operations-api/bulk-operations',
			'/docs/4.4/developers/operations-api/bulk-operations',
			'/docs/4.5/developers/operations-api/bulk-operations',
			'/docs/4.6/developers/operations-api/bulk-operations',
		],
		to: '/reference/v4/operations-api/operations',
	},
	{
		from: [
			'/docs/4.2/developers/operations-api/sql-operations',
			'/docs/4.3/developers/operations-api/sql-operations',
			'/docs/4.4/developers/operations-api/sql-operations',
			'/docs/4.5/developers/operations-api/sql-operations',
			'/docs/4.6/developers/operations-api/sql-operations',
		],
		to: '/reference/v4/operations-api/sql',
	},
	{
		from: [
			'/docs/4.2/developers/operations-api/quickstart-examples',
			'/docs/4.3/developers/operations-api/quickstart-examples',
			'/docs/4.4/developers/operations-api/quickstart-examples',
			'/docs/4.5/developers/operations-api/quickstart-examples',
			'/docs/4.6/developers/operations-api/quickstart-examples',
		],
		to: '/reference/v4/operations-api/operations',
	},
	{
		from: [
			'/docs/4.2/developers/operations-api/registration',
			'/docs/4.3/developers/operations-api/registration',
			'/docs/4.4/developers/operations-api/registration',
			'/docs/4.5/developers/operations-api/registration',
			'/docs/4.6/developers/operations-api/registration',
		],
		to: '/reference/v4/operations-api/operations',
	},
	{
		from: [
			'/docs/4.2/developers/operations-api/token-authentication',
			'/docs/4.3/developers/operations-api/token-authentication',
			'/docs/4.4/developers/operations-api/token-authentication',
			'/docs/4.5/developers/operations-api/token-authentication',
			'/docs/4.6/developers/operations-api/token-authentication',
		],
		to: '/reference/v4/security/jwt-authentication',
	},
	{
		from: [
			'/docs/4.2/developers/operations-api/users-and-roles',
			'/docs/4.3/developers/operations-api/users-and-roles',
			'/docs/4.4/developers/operations-api/users-and-roles',
			'/docs/4.5/developers/operations-api/users-and-roles',
			'/docs/4.6/developers/operations-api/users-and-roles',
		],
		to: '/reference/v4/users-and-roles/operations',
	},
	{
		from: [
			'/docs/4.2/developers/operations-api/jobs',
			'/docs/4.3/developers/operations-api/jobs',
			'/docs/4.4/developers/operations-api/jobs',
			'/docs/4.5/developers/operations-api/jobs',
			'/docs/4.6/developers/operations-api/jobs',
		],
		to: '/reference/v4/database/jobs',
	},
	{
		from: [
			'/docs/4.2/developers/operations-api/logs',
			'/docs/4.3/developers/operations-api/logs',
			'/docs/4.4/developers/operations-api/logs',
			'/docs/4.5/developers/operations-api/logs',
			'/docs/4.6/developers/operations-api/logs',
		],
		to: '/reference/v4/logging/operations',
	},
	{
		from: [
			'/docs/4.2/developers/operations-api/utilities',
			'/docs/4.3/developers/operations-api/utilities',
			'/docs/4.4/developers/operations-api/utilities',
			'/docs/4.5/developers/operations-api/utilities',
		],
		to: '/reference/v4/operations-api/operations',
	},
	{
		from: [
			'/docs/4.3/developers/operations-api/custom-functions',
			'/docs/4.4/developers/operations-api/custom-functions',
			'/docs/4.5/developers/operations-api/custom-functions',
			'/docs/4.6/developers/operations-api/custom-functions',
		],
		to: '/reference/v4/legacy/custom-functions',
	},
	{
		from: [
			'/docs/4.4/developers/operations-api/clustering',
			'/docs/4.4/developers/operations-api/clustering-nats',
			'/docs/4.4/developers/operations-api/clustering/clustering-nats',
			'/docs/4.5/developers/operations-api/clustering',
			'/docs/4.5/developers/operations-api/clustering-nats',
			'/docs/4.6/developers/operations-api/clustering',
			'/docs/4.6/developers/operations-api/clustering-nats',
		],
		to: '/reference/v4/replication/clustering',
	},
	{
		from: ['/docs/4.4/developers/operations-api/configuration', '/docs/4.6/developers/operations-api/configuration'],
		to: '/reference/v4/configuration/operations',
	},
	{ from: '/docs/4.6/developers/operations-api/analytics', to: '/reference/v4/analytics/operations' },
	{
		from: '/docs/4.6/developers/operations-api/certificate-management',
		to: '/reference/v4/security/certificate-management',
	},
	{ from: '/docs/4.6/developers/operations-api/system-operations', to: '/reference/v4/operations-api/operations' },
	{
		from: [
			'/docs/4.1/developers/operations-api/bulk-operations',
			'/docs/4.1/developers/operations-api/clustering',
			'/docs/4.1/developers/operations-api/jobs',
			'/docs/4.1/developers/operations-api/logs',
			'/docs/4.1/developers/operations-api/registration',
			'/docs/4.1/developers/operations-api/sql-operations',
			'/docs/4.1/developers/operations-api/token-authentication',
			'/docs/4.1/developers/operations-api/users-and-roles',
			'/docs/4.1/developers/operations-api/utilities',
		],
		to: '/reference/v4/operations-api/operations',
	},

	// ── Applications ───────────────────────────────────────────────────────────
	{
		from: [
			'/docs/4.1/developers/applications',
			'/docs/4.2/developers/applications',
			'/docs/4.3/developers/applications',
			'/docs/4.4/developers/applications',
			'/docs/4.5/developers/applications',
			'/docs/4.6/developers/applications',
		],
		to: '/reference/v4/components/overview',
	},
	{
		from: [
			'/docs/4.2/developers/applications/defining-schemas',
			'/docs/4.3/developers/applications/defining-schemas',
			'/docs/4.4/developers/applications/defining-schemas',
			'/docs/4.5/developers/applications/defining-schemas',
			'/docs/4.6/developers/applications/defining-schemas',
			'/docs/4.1/developers/applications/defining-schemas',
		],
		to: '/reference/v4/database/schema',
	},
	{
		from: [
			'/docs/4.2/developers/applications/caching',
			'/docs/4.3/developers/applications/caching',
			'/docs/4.4/developers/applications/caching',
			'/docs/4.5/developers/applications/caching',
			'/docs/4.6/developers/applications/caching',
		],
		to: '/reference/v4/resources/overview',
	},
	{ from: '/docs/4.6/developers/applications/data-loader', to: '/reference/v4/database/data-loader' },
	{
		from: [
			'/docs/4.4/developers/applications/web-applications',
			'/docs/4.5/developers/applications/web-applications',
			'/docs/4.6/developers/applications/web-applications',
		],
		to: '/reference/v4/components/applications',
	},
	{
		from: [
			'/docs/4.2/developers/applications/debugging',
			'/docs/4.3/developers/applications/debugging',
			'/docs/4.4/developers/applications/debugging',
			'/docs/4.5/developers/applications/debugging',
			'/docs/4.6/developers/applications/debugging',
			'/docs/4.1/developers/applications/debugging',
		],
		to: '/reference/v4/components/overview',
	},
	{
		from: [
			'/docs/4.2/developers/applications/define-routes',
			'/docs/4.3/developers/applications/define-routes',
			'/docs/4.4/developers/applications/define-routes',
			'/docs/4.5/developers/applications/define-routes',
			'/docs/4.6/developers/applications/define-routes',
			'/docs/4.1/developers/applications/define-routes',
		],
		to: '/reference/v4/fastify-routes/overview',
	},
	{
		from: [
			'/docs/4.4/developers/applications/defining-roles',
			'/docs/4.5/developers/applications/defining-roles',
			'/docs/4.6/developers/applications/defining-roles',
		],
		to: '/reference/v4/users-and-roles/overview',
	},
	{
		from: [
			'/docs/4.2/developers/applications/example-projects',
			'/docs/4.3/developers/applications/example-projects',
			'/docs/4.4/developers/applications/example-projects',
			'/docs/4.5/developers/applications/example-projects',
			'/docs/4.6/developers/applications/example-projects',
		],
		to: '/reference/v4/components/overview',
	},

	// ── Components (old /developers/components/*) ──────────────────────────────
	{
		from: [
			'/docs/4.1/developers/components',
			'/docs/4.2/developers/components',
			'/docs/4.3/developers/components',
			'/docs/4.4/developers/components',
			'/docs/4.5/developers/components',
			'/docs/4.6/developers/components',
		],
		to: '/reference/v4/components/overview',
	},
	{
		from: [
			'/docs/4.1/developers/components/writing-extensions',
			'/docs/4.2/developers/components/writing-extensions',
			'/docs/4.3/developers/components/writing-extensions',
			'/docs/4.4/developers/components/writing-extensions',
		],
		to: '/reference/v4/components/extension-api',
	},
	{
		from: [
			'/docs/4.1/developers/components/drivers',
			'/docs/4.2/developers/components/drivers',
			'/docs/4.3/developers/components/drivers',
			'/docs/4.1/developers/components/installing',
			'/docs/4.2/developers/components/installing',
			'/docs/4.3/developers/components/installing',
			'/docs/4.4/developers/components/installing',
			'/docs/4.2/developers/components/operations',
			'/docs/4.3/developers/components/operations',
			'/docs/4.4/developers/components/operations',
		],
		to: '/reference/v4/components/overview',
	},
	{
		from: [
			'/docs/4.2/developers/components/sdks',
			'/docs/4.3/developers/components/sdks',
			'/docs/4.4/developers/components/sdks',
			'/docs/4.5/developers/miscellaneous/sdks',
			'/docs/4.6/developers/miscellaneous/sdks',
			'/docs/4.4/developers/miscellaneous/sdks',
			'/docs/4.4/developers/miscellaneous',
			'/docs/4.5/developers/miscellaneous',
			'/docs/4.6/developers/miscellaneous',
			'/docs/4.2/developers/components/google-data-studio',
			'/docs/4.3/developers/components/google-data-studio',
			'/docs/4.4/developers/miscellaneous/google-data-studio',
		],
		to: '/reference/v4/components/overview',
	},
	{
		from: [
			'/docs/4.4/developers/components/built-in',
			'/docs/4.5/developers/components/built-in',
			'/docs/4.4/developers/components/reference',
			'/docs/4.5/developers/components/reference',
		],
		to: '/reference/v4/components/extension-api',
	},
	{
		from: ['/docs/4.4/developers/components/managing', '/docs/4.5/developers/components/managing'],
		to: '/reference/v4/components/overview',
	},
	{
		from: [
			'/docs/4.4/developers/miscellaneous/query-optimization',
			'/docs/4.6/developers/miscellaneous/query-optimization',
		],
		to: '/reference/v4/resources/query-optimization',
	},

	// ── Security ───────────────────────────────────────────────────────────────
	{
		from: [
			'/docs/4.1/developers/security',
			'/docs/4.2/developers/security',
			'/docs/4.3/developers/security',
			'/docs/4.4/developers/security',
			'/docs/4.5/developers/security',
			'/docs/4.6/developers/security',
		],
		to: '/reference/v4/security/overview',
	},
	{
		from: [
			'/docs/4.1/developers/security/configuration',
			'/docs/4.2/developers/security/configuration',
			'/docs/4.3/developers/security/configuration',
			'/docs/4.4/developers/security/configuration',
			'/docs/4.5/developers/security/configuration',
			'/docs/4.6/developers/security/configuration',
		],
		to: '/reference/v4/security/configuration',
	},
	{
		from: [
			'/docs/4.1/developers/security/users-and-roles',
			'/docs/4.2/developers/security/users-and-roles',
			'/docs/4.3/developers/security/users-and-roles',
			'/docs/4.4/developers/security/users-and-roles',
			'/docs/4.5/developers/security/users-and-roles',
			'/docs/4.6/developers/security/users-and-roles',
		],
		to: '/reference/v4/users-and-roles/overview',
	},
	{
		from: [
			'/docs/4.1/developers/security/jwt-auth',
			'/docs/4.2/developers/security/jwt-auth',
			'/docs/4.3/developers/security/jwt-auth',
			'/docs/4.5/developers/security/jwt-auth',
			'/docs/4.6/developers/security/jwt-auth',
		],
		to: '/reference/v4/security/jwt-authentication',
	},
	{
		from: [
			'/docs/4.1/developers/security/basic-auth',
			'/docs/4.2/developers/security/basic-auth',
			'/docs/4.3/developers/security/basic-auth',
			'/docs/4.5/developers/security/basic-auth',
			'/docs/4.6/developers/security/basic-auth',
		],
		to: '/reference/v4/security/basic-authentication',
	},
	{
		from: [
			'/docs/4.1/developers/security/certificate-management',
			'/docs/4.2/developers/security/certificate-management',
			'/docs/4.3/developers/security/certificate-management',
			'/docs/4.4/developers/security/certificate-management',
			'/docs/4.5/developers/security/certificate-management',
			'/docs/4.6/developers/security/certificate-management',
		],
		to: '/reference/v4/security/certificate-management',
	},
	{
		from: [
			'/docs/4.3/developers/security/mtls-auth',
			'/docs/4.4/developers/security/mtls-auth',
			'/docs/4.5/developers/security/mtls-auth',
			'/docs/4.6/developers/security/mtls-auth',
		],
		to: '/reference/v4/security/mtls-authentication',
	},
	{ from: ['/docs/4.1/security', '/docs/4.2/security', '/docs/4.3/security'], to: '/reference/v4/security/overview' },
	{
		from: ['/docs/4.1/security/configuration', '/docs/4.2/security/configuration', '/docs/4.3/security/configuration'],
		to: '/reference/v4/security/configuration',
	},
	{
		from: ['/docs/4.1/security/jwt-auth', '/docs/4.2/security/jwt-auth'],
		to: '/reference/v4/security/jwt-authentication',
	},
	{
		from: ['/docs/4.1/security/basic-auth', '/docs/4.2/security/basic-auth'],
		to: '/reference/v4/security/basic-authentication',
	},
	{
		from: ['/docs/4.1/security/certificate-management', '/docs/4.2/security/certificate-management'],
		to: '/reference/v4/security/certificate-management',
	},
	{
		from: ['/docs/4.1/security/users-and-roles', '/docs/4.2/security/users-and-roles'],
		to: '/reference/v4/users-and-roles/overview',
	},

	// ── Replication / Clustering ───────────────────────────────────────────────
	{
		from: [
			'/docs/4.1/developers/replication',
			'/docs/4.2/developers/replication',
			'/docs/4.3/developers/replication',
			'/docs/4.4/developers/replication',
			'/docs/4.5/developers/replication',
			'/docs/4.6/developers/replication',
		],
		to: '/reference/v4/replication/overview',
	},
	{
		from: ['/docs/4.5/developers/replication/sharding', '/docs/4.6/developers/replication/sharding'],
		to: '/reference/v4/replication/sharding',
	},
	{
		from: [
			'/docs/4.1/developers/clustering/certificate-management',
			'/docs/4.2/developers/clustering/certificate-management',
			'/docs/4.3/developers/clustering/certificate-management',
			'/docs/4.1/developers/replication/clustering/certificate-management',
			'/docs/4.2/developers/replication/clustering/certificate-management',
			'/docs/4.3/developers/replication/clustering/certificate-management',
			'/docs/4.4/developers/replication/clustering/creating-a-cluster-user',
			'/docs/4.5/developers/replication/clustering/certificate-management',
			'/docs/4.6/developers/replication/clustering/certificate-management',
		],
		to: '/reference/v4/security/certificate-management',
	},
	{
		from: [
			'/docs/4.1/developers/clustering/enabling-clustering',
			'/docs/4.2/developers/clustering/enabling-clustering',
			'/docs/4.3/developers/clustering/enabling-clustering',
			'/docs/4.4/developers/replication/clustering/enabling-clustering',
			'/docs/4.4/developers/replication/clustering',
			'/docs/4.4/developers/replication/clustering/managing-subscriptions',
			'/docs/4.4/developers/replication/clustering/naming-a-node',
			'/docs/4.4/developers/replication/clustering/establishing-routes',
			'/docs/4.4/developers/replication/clustering/requirements-and-definitions',
			'/docs/4.4/developers/replication/clustering/subscription-overview',
			'/docs/4.4/developers/replication/clustering/things-worth-knowing',
			'/docs/4.5/developers/replication/clustering/enabling-clustering',
			'/docs/4.5/developers/replication/clustering/naming-a-node',
			'/docs/4.5/developers/replication/clustering/subscription-overview',
			'/docs/4.6/developers/replication/clustering/managing-subscriptions',
			'/docs/4.6/developers/replication/clustering/things-worth-knowing',
			'/docs/4.1/developers/clustering/managing-subscriptions',
			'/docs/4.2/developers/clustering/creating-a-cluster-user',
			'/docs/4.3/developers/clustering/creating-a-cluster-user',
			'/docs/4.3/developers/clustering/establishing-routes',
			'/docs/4.3/developers/clustering/managing-subscriptions',
			'/docs/4.3/developers/clustering/naming-a-node',
			'/docs/4.3/developers/clustering/requirements-and-definitions',
			'/docs/4.3/developers/clustering/subscription-overview',
			'/docs/4.3/developers/clustering/things-worth-knowing',
			'/docs/4.3/developers/clustering',
			'/docs/4.4/developers/clustering',
			'/docs/4.4/developers/clustering/managing-subscriptions',
			'/docs/4.4/developers/clustering/naming-a-node',
			'/docs/4.4/developers/clustering/subscription-overview',
			'/docs/4.4/developers/clustering/things-worth-knowing',
			'/docs/4.5/developers/clustering',
			'/docs/4.5/developers/clustering/certificate-management',
			'/docs/4.5/developers/clustering/creating-a-cluster-user',
			'/docs/4.5/developers/clustering/enabling-clustering',
			'/docs/4.5/developers/clustering/establishing-routes',
			'/docs/4.5/developers/clustering/managing-subscriptions',
			'/docs/4.5/developers/clustering/naming-a-node',
			'/docs/4.5/developers/clustering/requirements-and-definitions',
			'/docs/4.5/developers/clustering/subscription-overview',
			'/docs/4.5/developers/clustering/things-worth-knowing',
			'/docs/4.6/developers/clustering',
			'/docs/4.6/developers/clustering/managing-subscriptions',
			'/docs/4.6/developers/clustering/naming-a-node',
			'/docs/4.6/developers/clustering/things-worth-knowing',
		],
		to: '/reference/v4/replication/clustering',
	},
	{
		from: [
			'/docs/4.1/clustering',
			'/docs/4.2/clustering/creating-a-cluster-user',
			'/docs/4.2/clustering/things-worth-knowing',
			'/docs/4.3/clustering/creating-a-cluster-user',
			'/docs/4.1/clustering/certificate-management',
			'/docs/4.1/clustering/creating-a-cluster-user',
			'/docs/4.1/clustering/enabling-clustering',
			'/docs/4.1/clustering/establishing-routes',
			'/docs/4.1/clustering/managing-subscriptions',
			'/docs/4.1/clustering/naming-a-node',
			'/docs/4.1/clustering/requirements-and-definitions',
			'/docs/4.1/clustering/subscription-overview',
			'/docs/4.1/clustering/things-worth-knowing',
		],
		to: '/reference/v4/replication/clustering',
	},

	// ── REST / Real-time ────────────────────────────────────────────────────────
	{
		from: [
			'/docs/4.1/rest',
			'/docs/4.2/rest',
			'/docs/4.3/rest',
			'/docs/4.2/developers/rest',
			'/docs/4.3/developers/rest',
			'/docs/4.4/developers/rest',
			'/docs/4.5/developers/rest',
			'/docs/4.6/developers/rest',
		],
		to: '/reference/v4/rest/overview',
	},
	{
		from: [
			'/docs/4.1/developers/real-time',
			'/docs/4.2/developers/real-time',
			'/docs/4.3/developers/real-time',
			'/docs/4.4/developers/real-time',
			'/docs/4.5/developers/real-time',
			'/docs/4.6/developers/real-time',
		],
		to: '/reference/v4/rest/websockets',
	},

	// ── SQL Guide ─────────────────────────────────────────────────────────────
	{
		from: [
			'/docs/4.1/sql-guide',
			'/docs/4.2/sql-guide/delete',
			'/docs/4.2/sql-guide/insert',
			'/docs/4.3/sql-guide/delete',
			'/docs/4.3/sql-guide/insert',
			'/docs/4.3/sql-guide/select',
			'/docs/4.1/developers/sql-guide',
			'/docs/4.2/developers/sql-guide',
			'/docs/4.3/developers/sql-guide',
			'/docs/4.4/developers/sql-guide',
			'/docs/4.5/developers/sql-guide',
			'/docs/4.6/developers/sql-guide',
		],
		to: '/reference/v4/operations-api/sql',
	},
	{
		from: [
			'/docs/4.1/developers/sql-guide/date-functions',
			'/docs/4.2/developers/sql-guide/date-functions',
			'/docs/4.3/developers/sql-guide/date-functions',
			'/docs/4.4/developers/sql-guide/date-functions',
			'/docs/4.5/developers/sql-guide/date-functions',
		],
		to: '/reference/v4/operations-api/sql',
	},
	{
		from: [
			'/docs/4.1/developers/sql-guide/features-matrix',
			'/docs/4.2/developers/sql-guide/features-matrix',
			'/docs/4.3/developers/sql-guide/features-matrix',
			'/docs/4.4/developers/sql-guide/features-matrix',
			'/docs/4.5/developers/sql-guide/features-matrix',
		],
		to: '/reference/v4/operations-api/sql',
	},
	{
		from: [
			'/docs/4.1/developers/sql-guide/functions',
			'/docs/4.2/developers/sql-guide/functions',
			'/docs/4.3/developers/sql-guide/functions',
			'/docs/4.4/developers/sql-guide/functions',
			'/docs/4.5/developers/sql-guide/functions',
			'/docs/4.6/developers/sql-guide/functions',
		],
		to: '/reference/v4/operations-api/sql',
	},
	{
		from: [
			'/docs/4.1/developers/sql-guide/sql-geospatial-functions',
			'/docs/4.2/developers/sql-guide/sql-geospatial-functions',
			'/docs/4.3/developers/sql-guide/sql-geospatial-functions',
			'/docs/4.4/developers/sql-guide/sql-geospatial-functions',
			'/docs/4.5/developers/sql-guide/sql-geospatial-functions',
			'/docs/4.6/developers/sql-guide/sql-geospatial-functions',
			'/docs/4.3/sql-guide/sql-geospatial-functions/geoequal',
			'/docs/4.2/sql-guide/sql-geospatial-functions/geoconvert',
		],
		to: '/reference/v4/operations-api/sql',
	},
	{
		from: [
			'/docs/4.2/developers/sql-guide/json-search',
			'/docs/4.3/developers/sql-guide/json-search',
			'/docs/4.5/reference/sql-guide/json-search',
		],
		to: '/reference/v4/operations-api/sql',
	},
	{
		from: [
			'/docs/4.3/developers/sql-guide/reserved-word',
			'/docs/4.4/reference/sql-guide/reserved-word',
			'/docs/4.5/developers/sql-guide/reserved-word',
			'/docs/4.5/reference/sql-guide/reserved-word',
			'/docs/4.6/reference/sql-guide/reserved-word',
		],
		to: '/reference/v4/operations-api/sql',
	},
	{
		from: [
			'/docs/4.4/reference/sql-guide',
			'/docs/4.4/reference/sql-guide/features-matrix',
			'/docs/4.4/reference/sql-guide/sql-geospatial-functions',
			'/docs/4.5/reference/sql-guide',
			'/docs/4.5/reference/sql-guide/date-functions',
			'/docs/4.5/reference/sql-guide/features-matrix',
			'/docs/4.5/reference/sql-guide/functions',
			'/docs/4.5/reference/sql-guide/sql-geospatial-functions',
			'/docs/4.6/reference/sql-guide',
			'/docs/4.6/reference/sql-guide/date-functions',
			'/docs/4.6/reference/sql-guide/features-matrix',
			'/docs/4.6/reference/sql-guide/functions',
			'/docs/4.6/reference/sql-guide/sql-geospatial-functions',
			'/docs/4.1/sql-guide/date-functions',
			'/docs/4.1/sql-guide/delete',
			'/docs/4.1/sql-guide/features-matrix',
			'/docs/4.1/sql-guide/functions',
			'/docs/4.1/sql-guide/insert',
			'/docs/4.1/sql-guide/joins',
			'/docs/4.1/sql-guide/json-search',
			'/docs/4.1/sql-guide/reserved-word',
			'/docs/4.1/sql-guide/select',
			'/docs/4.1/sql-guide/update',
			'/docs/4.2/reference/sql-guide',
			'/docs/4.2/reference/sql-guide/date-functions',
			'/docs/4.2/reference/sql-guide/json-search',
			'/docs/4.3/reference/sql-guide',
			'/docs/4.3/reference/sql-guide/date-functions',
			'/docs/4.3/reference/sql-guide/sql-geospatial-functions',
		],
		to: '/reference/v4/operations-api/sql',
	},
	{
		from: [
			'/docs/4.1/sql-guide/sql-geospatial-functions',
			'/docs/4.1/sql-guide/sql-geospatial-functions/geoarea',
			'/docs/4.1/sql-guide/sql-geospatial-functions/geocontains',
			'/docs/4.1/sql-guide/sql-geospatial-functions/geoconvert',
			'/docs/4.1/sql-guide/sql-geospatial-functions/geocrosses',
			'/docs/4.1/sql-guide/sql-geospatial-functions/geodifference',
			'/docs/4.1/sql-guide/sql-geospatial-functions/geodistance',
			'/docs/4.1/sql-guide/sql-geospatial-functions/geoequal',
			'/docs/4.1/sql-guide/sql-geospatial-functions/geolength',
			'/docs/4.1/sql-guide/sql-geospatial-functions/geonear',
		],
		to: '/reference/v4/operations-api/sql',
	},

	// ── Configuration / Deployments ───────────────────────────────────────────
	{
		from: [
			'/docs/4.1/configuration',
			'/docs/4.2/deployments/configuration',
			'/docs/4.3/deployments/configuration',
			'/docs/4.4/deployments/configuration',
			'/docs/4.5/deployments/configuration',
			'/docs/4.6/deployments/configuration',
		],
		to: '/reference/v4/configuration/overview',
	},

	// ── CLI ───────────────────────────────────────────────────────────────────
	{
		from: [
			'/docs/4.1/harperdb-cli',
			'/docs/4.1/deployments/harperdb-cli',
			'/docs/4.2/deployments/harperdb-cli',
			'/docs/4.3/deployments/harperdb-cli',
			'/docs/4.4/deployments/harper-cli',
			'/docs/4.5/deployments/harper-cli',
			'/docs/4.6/deployments/harper-cli',
		],
		to: '/reference/v4/cli/overview',
	},

	// ── Install / Upgrade (no equivalent page, send to learn) ─────────────────
	{
		from: [
			'/docs/4.1/deployments/install-harperdb',
			'/docs/4.1/deployments/install-harperdb/linux',
			'/docs/4.1/install-harperdb',
			'/docs/4.1/install-harperdb/linux',
			'/docs/4.2/deployments/install-harperdb',
			'/docs/4.2/deployments/install-harperdb/linux',
			'/docs/4.2/install-harperdb',
			'/docs/4.3/deployments/install-harperdb',
			'/docs/4.3/deployments/install-harperdb/linux',
			'/docs/4.3/install-harperdb',
			'/docs/4.4/deployments/install-harperdb',
			'/docs/4.4/deployments/install-harperdb/linux',
			'/docs/4.4/deployments/install-harper',
			'/docs/4.4/deployments/install-harper/linux',
			'/docs/4.5/deployments/install-harper',
			'/docs/4.5/deployments/install-harper/linux',
			'/docs/4.6/deployments/install-harper',
			'/docs/4.6/deployments/install-harper/linux',
			'/docs/4.1/deployments/upgrade-hdb-instance',
			'/docs/4.2/deployments/upgrade-hdb-instance',
			'/docs/4.3/deployments/upgrade-hdb-instance',
			'/docs/4.4/deployments/upgrade-hdb-instance',
			'/docs/4.5/deployments/upgrade-hdb-instance',
			'/docs/4.6/deployments/upgrade-hdb-instance',
			'/docs/4.1/upgrade-hdb-instance',
		],
		to: '/learn/getting-started/install-and-connect-harper',
	},
	{ from: '/docs/4.2/deployments/', to: '/reference/v4' },

	// ── Cloud ─────────────────────────────────────────────────────────────────
	{
		from: [
			'/docs/4.1/harperdb-cloud',
			'/docs/4.1/harperdb-cloud/alarms',
			'/docs/4.1/harperdb-cloud/iops-impact',
			'/docs/4.1/harperdb-cloud/verizon-5g-wavelength-instances',
			'/docs/4.2/deployments/harperdb-cloud',
			'/docs/4.2/deployments/harperdb-cloud/alarms',
			'/docs/4.2/deployments/harperdb-cloud/instance-size-hardware-specs',
			'/docs/4.2/deployments/harperdb-cloud/iops-impact',
			'/docs/4.2/deployments/harperdb-cloud/verizon-5g-wavelength-instances',
			'/docs/4.3/deployments/harperdb-cloud',
			'/docs/4.3/deployments/harperdb-cloud/alarms',
			'/docs/4.3/deployments/harperdb-cloud/instance-size-hardware-specs',
			'/docs/4.3/deployments/harperdb-cloud/iops-impact',
			'/docs/4.3/deployments/harperdb-cloud/verizon-5g-wavelength-instances',
			'/docs/4.4/deployments/harperdb-cloud/alarms',
			'/docs/4.4/deployments/harperdb-cloud/instance-size-hardware-specs',
			'/docs/4.4/deployments/harperdb-cloud/iops-impact',
			'/docs/4.4/deployments/harperdb-cloud/verizon-5g-wavelength-instances',
			'/docs/4.4/deployments/harper-cloud/',
			'/docs/4.4/deployments/harper-cloud/alarms',
			'/docs/4.4/deployments/harper-cloud/instance-size-hardware-specs',
			'/docs/4.4/deployments/harper-cloud/iops-impact',
			'/docs/4.4/deployments/harper-cloud/verizon-5g-wavelength-instances',
			'/docs/4.5/deployments/harper-cloud/alarms',
			'/docs/4.5/deployments/harper-cloud/verizon-5g-wavelength-instances',
			'/docs/4.6/deployments/harper-cloud',
			'/docs/4.6/deployments/harper-cloud/alarms',
			'/docs/4.6/deployments/harper-cloud/instance-size-hardware-specs',
			'/docs/4.6/deployments/harper-cloud/verizon-5g-wavelength-instances',
		],
		to: '/reference/v4/legacy/cloud',
	},

	// ── Studio (harper-studio) ─────────────────────────────────────────────────
	{
		from: [
			'/docs/4.1/harperdb-studio',
			'/docs/4.1/harperdb-studio/create-account',
			'/docs/4.1/harperdb-studio/enable-mixed-content',
			'/docs/4.1/harperdb-studio/instance-configuration',
			'/docs/4.1/harperdb-studio/instance-example-code',
			'/docs/4.1/harperdb-studio/instance-metrics',
			'/docs/4.1/harperdb-studio/instances',
			'/docs/4.1/harperdb-studio/login-password-reset',
			'/docs/4.1/harperdb-studio/manage-charts',
			'/docs/4.1/harperdb-studio/manage-clustering',
			'/docs/4.1/harperdb-studio/manage-functions',
			'/docs/4.1/harperdb-studio/manage-instance-roles',
			'/docs/4.1/harperdb-studio/manage-instance-users',
			'/docs/4.1/harperdb-studio/manage-schemas-browse-data',
			'/docs/4.1/harperdb-studio/organizations',
			'/docs/4.1/harperdb-studio/query-instance-data',
			'/docs/4.1/harperdb-studio/resources',
			'/docs/4.2/harperdb-studio',
			'/docs/4.2/harperdb-studio/enable-mixed-content',
			'/docs/4.2/harperdb-studio/manage-functions',
			'/docs/4.2/harperdb-studio/manage-schemas-browse-data',
			'/docs/4.3/harperdb-studio',
			'/docs/4.3/harperdb-studio/enable-mixed-content',
			'/docs/4.3/harperdb-studio/instance-metrics',
			'/docs/4.3/harperdb-studio/login-password-reset',
			'/docs/4.3/harperdb-studio/manage-schemas-browse-data',
			'/docs/4.4/harperdb-studio/manage-schemas-browse-data',
			'/docs/4.4/administration/harperdb-studio',
			'/docs/4.4/administration/harperdb-studio/create-account',
			'/docs/4.4/administration/harperdb-studio/enable-mixed-content',
			'/docs/4.4/administration/harperdb-studio/instance-configuration',
			'/docs/4.4/administration/harperdb-studio/instance-metrics',
			'/docs/4.4/administration/harperdb-studio/instances',
			'/docs/4.4/administration/harperdb-studio/login-password-reset',
			'/docs/4.4/administration/harperdb-studio/manage-applications',
			'/docs/4.4/administration/harperdb-studio/manage-charts',
			'/docs/4.4/administration/harperdb-studio/manage-databases-browse-data',
			'/docs/4.4/administration/harperdb-studio/manage-instance-roles',
			'/docs/4.4/administration/harperdb-studio/manage-instance-users',
			'/docs/4.4/administration/harperdb-studio/manage-replication',
			'/docs/4.4/administration/harperdb-studio/organizations',
			'/docs/4.4/administration/harperdb-studio/query-instance-data',
			'/docs/4.5/administration/harperdb-studio',
			'/docs/4.5/administration/harperdb-studio/manage-charts',
			'/docs/4.5/administration/harperdb-studio/manage-clustering',
		],
		to: '/reference/v4/studio/overview',
	},
	{
		from: [
			'/docs/4.4/administration/harper-studio',
			'/docs/4.4/administration/harper-studio/create-account',
			'/docs/4.4/administration/harper-studio/instance-configuration',
			'/docs/4.4/administration/harper-studio/instance-metrics',
			'/docs/4.4/administration/harper-studio/instances',
			'/docs/4.4/administration/harper-studio/login-password-reset',
			'/docs/4.4/administration/harper-studio/manage-applications',
			'/docs/4.4/administration/harper-studio/manage-databases-browse-data',
			'/docs/4.4/administration/harper-studio/manage-instance-roles',
			'/docs/4.4/administration/harper-studio/manage-instance-users',
			'/docs/4.4/administration/harper-studio/manage-replication',
			'/docs/4.4/administration/harper-studio/organizations',
			'/docs/4.5/administration/harper-studio',
			'/docs/4.5/administration/harper-studio/create-account',
			'/docs/4.5/administration/harper-studio/enable-mixed-content',
			'/docs/4.5/administration/harper-studio/instance-configuration',
			'/docs/4.5/administration/harper-studio/instance-metrics',
			'/docs/4.5/administration/harper-studio/instances',
			'/docs/4.5/administration/harper-studio/login-password-reset',
			'/docs/4.5/administration/harper-studio/manage-applications',
			'/docs/4.5/administration/harper-studio/manage-databases-browse-data',
			'/docs/4.5/administration/harper-studio/manage-instance-roles',
			'/docs/4.5/administration/harper-studio/manage-instance-users',
			'/docs/4.5/administration/harper-studio/manage-replication',
			'/docs/4.5/administration/harper-studio/organizations',
			'/docs/4.5/administration/harper-studio/query-instance-data',
			'/docs/4.6/administration/harper-studio',
			'/docs/4.6/administration/harper-studio/create-account',
			'/docs/4.6/administration/harper-studio/enable-mixed-content',
			'/docs/4.6/administration/harper-studio/instance-configuration',
			'/docs/4.6/administration/harper-studio/instance-metrics',
			'/docs/4.6/administration/harper-studio/instances',
			'/docs/4.6/administration/harper-studio/manage-applications',
			'/docs/4.6/administration/harper-studio/manage-databases-browse-data',
			'/docs/4.6/administration/harper-studio/manage-instance-roles',
			'/docs/4.6/administration/harper-studio/manage-instance-users',
			'/docs/4.6/administration/harper-studio/manage-replication',
			'/docs/4.6/administration/harper-studio/organizations',
			'/docs/4.6/administration/harper-studio/query-instance-data',
		],
		to: '/reference/v4/studio/overview',
	},

	// ── Logging ───────────────────────────────────────────────────────────────
	{
		from: [
			'/docs/4.1/administration/logging',
			'/docs/4.2/administration/logging',
			'/docs/4.3/administration/logging',
			'/docs/4.4/administration/logging',
			'/docs/4.5/administration/logging',
			'/docs/4.6/administration/logging',
			'/docs/4.1/administration/logging/audit-logging',
			'/docs/4.2/administration/logging/audit-logging',
			'/docs/4.3/administration/logging/audit-logging',
			'/docs/4.4/administration/logging/audit-logging',
			'/docs/4.5/administration/logging/audit-logging',
			'/docs/4.6/administration/logging/audit-logging',
			'/docs/4.1/administration/logging/logging',
			'/docs/4.2/administration/logging/logging',
			'/docs/4.3/administration/logging/logging',
			'/docs/4.4/administration/logging/logging',
			'/docs/4.1/administration/logging/standard-logging',
			'/docs/4.2/administration/logging/standard-logging',
			'/docs/4.4/administration/logging/standard-logging',
			'/docs/4.5/administration/logging/standard-logging',
			'/docs/4.6/administration/logging/standard-logging',
			'/docs/4.1/administration/logging/transaction-logging',
			'/docs/4.2/administration/logging/transaction-logging',
			'/docs/4.3/administration/logging/transaction-logging',
			'/docs/4.4/administration/logging/transaction-logging',
			'/docs/4.5/administration/logging/transaction-logging',
			'/docs/4.6/administration/logging/transaction-logging',
			'/docs/4.1/logging',
			'/docs/4.1/audit-logging',
			'/docs/4.1/transaction-logging',
		],
		to: '/reference/v4/logging/overview',
	},

	// ── Administration (misc) ─────────────────────────────────────────────────
	{
		from: [
			'/docs/4.1/administration',
			'/docs/4.2/administration',
			'/docs/4.3/administration',
			'/docs/4.4/administration',
			'/docs/4.5/administration',
			'/docs/4.6/administration',
			'/docs/4.1/administration/administration',
			'/docs/4.2/administration/administration',
			'/docs/4.3/administration/administration',
			'/docs/4.4/administration/administration',
			'/docs/4.5/administration/administration',
		],
		to: '/reference/v4',
	},
	{
		from: [
			'/docs/4.1/administration/cloning',
			'/docs/4.2/administration/cloning',
			'/docs/4.3/administration/cloning',
			'/docs/4.4/administration/cloning',
			'/docs/4.5/administration/cloning',
			'/docs/4.6/administration/cloning',
		],
		to: '/reference/v4/replication/overview',
	},
	{
		from: [
			'/docs/4.3/administration/compact',
			'/docs/4.4/administration/compact',
			'/docs/4.5/administration/compact',
			'/docs/4.6/administration/compact',
		],
		to: '/reference/v4/database/compaction',
	},
	{
		from: [
			'/docs/4.1/administration/jobs',
			'/docs/4.2/administration/jobs',
			'/docs/4.3/administration/jobs',
			'/docs/4.4/administration/jobs',
			'/docs/4.5/administration/jobs',
			'/docs/4.1/jobs',
		],
		to: '/reference/v4/database/jobs',
	},

	// ── Custom Functions (legacy) ─────────────────────────────────────────────
	{
		from: [
			'/docs/4.1/custom-functions',
			'/docs/4.1/custom-functions/create-project',
			'/docs/4.1/custom-functions/custom-functions-operations',
			'/docs/4.1/custom-functions/debugging-custom-function',
			'/docs/4.1/custom-functions/define-helpers',
			'/docs/4.1/custom-functions/define-routes',
			'/docs/4.1/custom-functions/example-projects',
			'/docs/4.1/custom-functions/host-static',
			'/docs/4.1/custom-functions/requirements-definitions',
			'/docs/4.1/custom-functions/restarting-server',
			'/docs/4.1/custom-functions/templates',
			'/docs/4.1/custom-functions/using-npm-git',
		],
		to: '/reference/v4/legacy/custom-functions',
	},

	// ── Old /docs/4.X/reference/* ─────────────────────────────────────────────
	{
		from: [
			'/docs/4.1/reference',
			'/docs/4.2/reference',
			'/docs/4.3/reference',
			'/docs/4.4/reference',
			'/docs/4.5/reference',
			'/docs/4.6/reference',
		],
		to: '/reference/v4',
	},
	{
		from: [
			'/docs/4.1/reference/globals',
			'/docs/4.2/reference/globals',
			'/docs/4.3/reference/globals',
			'/docs/4.4/reference/globals',
			'/docs/4.5/reference/globals',
			'/docs/4.6/reference/globals',
		],
		to: '/reference/v4/components/javascript-environment',
	},
	{
		from: [
			'/docs/4.1/reference/content-types',
			'/docs/4.2/reference/content-types',
			'/docs/4.3/reference/content-types',
			'/docs/4.4/reference/content-types',
			'/docs/4.5/reference/content-types',
			'/docs/4.6/reference/content-types',
		],
		to: '/reference/v4/rest/content-types',
	},
	{
		from: [
			'/docs/4.1/reference/headers',
			'/docs/4.2/reference/headers',
			'/docs/4.5/reference/headers',
			'/docs/4.6/reference/headers',
		],
		to: '/reference/v4/rest/headers',
	},
	{
		from: [
			'/docs/4.1/reference/data-types',
			'/docs/4.2/reference/data-types',
			'/docs/4.3/reference/data-types',
			'/docs/4.4/reference/data-types', // note: reference/content-types also in 4.4
			'/docs/4.5/reference/data-types',
			'/docs/4.6/reference/data-types',
			'/docs/4.1/reference/dynamic-schema',
			'/docs/4.2/reference/dynamic-schema',
			'/docs/4.3/reference/dynamic-schema',
			'/docs/4.4/reference/dynamic-schema',
			'/docs/4.5/reference/dynamic-schema',
			'/docs/4.6/reference/dynamic-schema',
			'/docs/4.1/reference/limits',
			'/docs/4.2/reference/limits',
			'/docs/4.3/reference/limits',
			'/docs/4.4/reference/limits',
			'/docs/4.5/reference/limits',
			'/docs/4.6/reference/limits',
		],
		to: '/reference/v4/database/schema',
	},
	{
		from: ['/docs/4.5/reference/blob', '/docs/4.6/reference/blob'],
		to: '/reference/v4/database/schema',
	},
	{
		from: [
			'/docs/4.5/reference/transactions',
			'/docs/4.6/reference/transactions',
			'/docs/4.2/reference/transactions',
			'/docs/4.3/reference/transactions',
		],
		to: '/reference/v4/database/transaction',
	},
	{
		from: ['/docs/4.5/reference/graphql', '/docs/4.6/reference/graphql'],
		to: '/reference/v4/graphql-querying/overview',
	},
	{
		from: [
			'/docs/4.1/reference/storage-algorithm',
			'/docs/4.2/reference/storage-algorithm',
			'/docs/4.3/reference/storage-algorithm',
			'/docs/4.4/reference/storage-algorithm',
			'/docs/4.5/reference/storage-algorithm',
			'/docs/4.6/reference/storage-algorithm',
		],
		to: '/reference/v4/database/storage-algorithm',
	},
	{
		from: [
			'/docs/4.2/reference/analytics',
			'/docs/4.3/reference/analytics',
			'/docs/4.4/reference/analytics',
			'/docs/4.5/reference/analytics',
			'/docs/4.6/reference/analytics',
		],
		to: '/reference/v4/analytics/overview',
	},
	{
		from: [
			'/docs/4.2/reference/architecture',
			'/docs/4.3/reference/architecture',
			'/docs/4.4/reference/architecture',
			'/docs/4.5/reference/architecture',
			'/docs/4.6/reference/architecture',
		],
		to: '/reference/v4',
	},
	{
		from: [
			'/docs/4.2/reference/resource',
			'/docs/4.3/reference/resource',
			'/docs/4.4/reference/resource',
			'/docs/4.5/reference/resource',
			'/docs/4.6/reference/resource',
		],
		to: '/reference/v4/resources/overview',
	},
	{
		from: [
			'/docs/4.5/reference/resources',
			'/docs/4.6/reference/resources',
			'/docs/4.5/reference/query-optimization',
			'/docs/4.6/reference/query-optimization',
			'/docs/4.4/reference/query-optimization',
		],
		to: '/reference/v4/resources/overview',
	},
	{
		from: ['/docs/4.6/reference/resources/instance-binding', '/docs/4.6/reference/resources/migration'],
		to: '/reference/v4/resources/resource-api',
	},
	{
		from: ['/docs/4.6/reference/resources/query-optimization'],
		to: '/reference/v4/resources/query-optimization',
	},
	{
		from: ['/docs/4.4/reference/roles', '/docs/4.5/reference/roles', '/docs/4.6/reference/roles'],
		to: '/reference/v4/users-and-roles/overview',
	},
	{
		from: [
			'/docs/4.2/reference/clustering',
			'/docs/4.3/reference/clustering',
			'/docs/4.4/reference/clustering',
			'/docs/4.5/reference/clustering/certificate-management',
			'/docs/4.5/reference/clustering/enabling-clustering',
			'/docs/4.5/reference/clustering/naming-a-node',
			'/docs/4.5/reference/clustering/requirements-and-definitions',
			'/docs/4.5/reference/clustering/things-worth-knowing',
			'/docs/4.6/reference/clustering',
			'/docs/4.6/reference/clustering/certificate-management',
			'/docs/4.6/reference/clustering/subscription-overview',
			'/docs/4.6/reference/clustering/things-worth-knowing',
			'/docs/4.2/reference/clustering/creating-a-cluster-user',
			'/docs/4.2/reference/clustering/naming-a-node',
			'/docs/4.2/reference/clustering/subscription-overview',
			'/docs/4.2/reference/clustering/things-worth-knowing',
			'/docs/4.3/reference/clustering/enabling-clustering',
			'/docs/4.3/reference/clustering/managing-subscriptions',
			'/docs/4.3/reference/clustering/naming-a-node',
			'/docs/4.4/reference/clustering/creating-a-cluster-user',
			'/docs/4.4/reference/clustering/enabling-clustering',
			'/docs/4.4/reference/clustering/naming-a-node',
			'/docs/4.4/reference/clustering/requirements-and-definitions',
			'/docs/4.4/reference/clustering/things-worth-knowing',
		],
		to: '/reference/v4/replication/clustering',
	},
	{
		from: [
			'/docs/4.6/reference/components',
			'/docs/4.6/reference/components/applications',
			'/docs/4.6/reference/components/built-in-extensions',
			'/docs/4.6/reference/components/configuration',
			'/docs/4.6/reference/components/extensions',
			'/docs/4.6/reference/components/plugins',
		],
		to: '/reference/v4/components/overview',
	},

	// ── Old /docs/4.X/technical-details/reference/* ───────────────────────────
	{
		from: [
			'/docs/4.1/technical-details/reference/analytics',
			'/docs/4.2/technical-details/reference/analytics',
			'/docs/4.3/technical-details/reference/analytics',
			'/docs/4.4/technical-details/reference/analytics',
			'/docs/4.5/technical-details/reference/analytics',
			'/docs/4.6/technical-details/reference/analytics',
		],
		to: '/reference/v4/analytics/overview',
	},
	{
		from: [
			'/docs/4.1/technical-details/reference/architecture',
			'/docs/4.2/technical-details/reference/architecture',
			'/docs/4.3/technical-details/reference/architecture',
			'/docs/4.4/technical-details/reference/architecture',
			'/docs/4.5/technical-details/reference/architecture',
			'/docs/4.6/technical-details/reference/architecture',
		],
		to: '/reference/v4',
	},
	{
		from: [
			'/docs/4.1/technical-details/reference/globals',
			'/docs/4.2/technical-details/reference/globals',
			'/docs/4.3/technical-details/reference/globals',
			'/docs/4.4/technical-details/reference/globals',
		],
		to: '/reference/v4/components/javascript-environment',
	},
	{
		from: [
			'/docs/4.1/technical-details/reference/data-types',
			'/docs/4.2/technical-details/reference/content-types',
			'/docs/4.3/technical-details/reference/content-types',
			'/docs/4.4/technical-details/reference/content-types',
			'/docs/4.5/technical-details/reference/data-types',
			'/docs/4.6/technical-details/reference/content-types',
			'/docs/4.6/technical-details/reference/data-types',
			'/docs/4.6/technical-details/reference/dynamic-schema',
			'/docs/4.3/technical-details/reference/data-types',
			'/docs/4.4/technical-details/reference/data-types',
			'/docs/4.3/technical-details/reference/dynamic-schema',
			'/docs/4.4/technical-details/reference/dynamic-schema',
			'/docs/4.2/technical-details/reference/limits',
			'/docs/4.3/technical-details/reference/limits',
			'/docs/4.4/technical-details/reference/limits',
			'/docs/4.5/technical-details/reference/blob',
		],
		to: '/reference/v4/database/schema',
	},
	{
		from: [
			'/docs/4.1/technical-details/reference/storage-algorithm',
			'/docs/4.2/technical-details/reference/storage-algorithm',
			'/docs/4.3/technical-details/reference/storage-algorithm',
			'/docs/4.4/technical-details/reference/storage-algorithm',
			'/docs/4.5/technical-details/reference/storage-algorithm',
			'/docs/4.6/technical-details/reference/storage-algorithm',
		],
		to: '/reference/v4/database/storage-algorithm',
	},
	{
		from: [
			'/docs/4.1/technical-details/reference/graphql',
			'/docs/4.2/technical-details/reference/graphql',
			'/docs/4.3/technical-details/reference/graphql', // inferred from pattern
			'/docs/4.5/technical-details/reference/graphql',
			'/docs/4.6/technical-details/reference/graphql', // inferred
		],
		to: '/reference/v4/graphql-querying/overview',
	},
	{
		from: [
			'/docs/4.1/technical-details/reference/transactions',
			'/docs/4.2/technical-details/reference/transactions',
			'/docs/4.3/technical-details/reference/transactions',
			'/docs/4.4/technical-details/reference/transactions',
			'/docs/4.5/technical-details/reference/transactions',
			'/docs/4.6/technical-details/reference/transactions',
		],
		to: '/reference/v4/database/transaction',
	},
	{
		from: [
			'/docs/4.1/technical-details/reference/resource',
			'/docs/4.2/technical-details/reference/resource',
			'/docs/4.3/technical-details/reference/resource',
			'/docs/4.4/technical-details/reference/resource',
			'/docs/4.6/technical-details/reference/resource',
			'/docs/4.6/technical-details/reference/resources',
			'/docs/4.6/technical-details/reference/resources/instance-binding',
			'/docs/4.6/technical-details/reference/resources/migration',
		],
		to: '/reference/v4/resources/overview',
	},
	{
		from: [
			'/docs/4.6/technical-details/reference/components',
			'/docs/4.6/technical-details/reference/components/applications',
			'/docs/4.6/technical-details/reference/components/built-in-extensions',
			'/docs/4.6/technical-details/reference/components/configuration',
			'/docs/4.6/technical-details/reference/components/plugins',
		],
		to: '/reference/v4/components/overview',
	},
	{
		from: [
			'/docs/4.2/technical-details/reference',
			'/docs/4.3/technical-details/reference',
			'/docs/4.4/technical-details/reference',
			'/docs/4.5/technical-details/reference',
			'/docs/4.6/technical-details/reference',
			'/docs/4.6/technical-details/',
			'/docs/4.3/technical-details/',
			'/docs/4.4/technical-details/',
			'/docs/4.2/technical-details/',
		],
		to: '/reference/v4',
	},

	// ── Old /docs/4.X/add-ons-and-sdks/* ─────────────────────────────────────
	{
		from: ['/docs/4.1/add-ons-and-sdks', '/docs/4.1/add-ons-and-sdks/google-data-studio'],
		to: '/reference/v4/components/overview',
	},

	// ── Support ───────────────────────────────────────────────────────────────
	{ from: ['/docs/4.1/support'], to: '/reference/v4' },

	// ── Release notes (versioned) ─────────────────────────────────────────────
	// Paths seen in analytics under /docs/4.X/release-notes/* and
	// /docs/4.X/technical-details/release-notes/*
	// Old format: /docs/4.X/release-notes/{codename}/{semver}
	// New format: /release-notes/{codename}/{semver}
	{ from: ['/docs/4.1/release-notes', '/docs/4.2/release-notes', '/docs/4.3/release-notes'], to: '/release-notes' },

	// 1.alby series
	{
		from: [
			'/docs/4.1/release-notes/1.alby/1.1.0',
			'/docs/4.1/technical-details/release-notes/4.tucker/1.2.0',
			'/docs/4.3/technical-details/release-notes/4.tucker/1.1.0',
			'/docs/4.3/technical-details/release-notes/4.tucker/1.2.0',
			'/docs/4.3/technical-details/release-notes/4.tucker/1.3.0',
			'/docs/4.4/technical-details/release-notes/4.tucker/1.2.0',
			'/docs/4.4/technical-details/release-notes/4.tucker/1.3.0',
			'/docs/4.2/technical-details/release-notes/4.tucker/1.2.0',
			'/docs/4.2/technical-details/release-notes/4.tucker/1.3.0',
		],
		to: '/release-notes',
	},
	{
		from: ['/docs/4.1/release-notes/1.alby/1.2.0', '/docs/4.1/release-notes/1.alby/1.3.0'],
		to: '/release-notes',
	},
	{
		from: [
			'/docs/4.1/release-notes/1.alby/1.3.1',
			'/docs/4.3/technical-details/release-notes/4.tucker/1.3.1',
			'/docs/4.4/technical-details/release-notes/4.tucker/1.alby',
			'/docs/4.3/technical-details/release-notes/4.tucker/1.alby',
			'/docs/4.5/technical-details/release-notes/4.tucker/1.alby',
			'/docs/4.2/technical-details/release-notes/4.tucker/1.3.1',
		],
		to: '/release-notes/v1-alby/1.3.1',
	},

	// 2.penny series
	{
		from: [
			'/docs/4.1/release-notes/2.penny/2.1.1',
			'/docs/4.3/technical-details/release-notes/4.tucker/2.1.1',
			'/docs/4.5/technical-details/release-notes/4.tucker/2.1.1',
		],
		to: '/release-notes/v2-penny/2.1.1',
	},
	{
		from: [
			'/docs/4.1/release-notes/2.penny/2.2.0',
			'/docs/4.3/technical-details/release-notes/4.tucker/2.2.0',
			'/docs/4.4/technical-details/release-notes/4.tucker/2.2.0',
		],
		to: '/release-notes',
	},
	{
		from: [
			'/docs/4.1/release-notes/2.penny/2.2.2',
			'/docs/4.1/technical-details/release-notes/4.tucker/2.penny/2.2.2',
			'/docs/4.3/technical-details/release-notes/4.tucker/2.2.2',
			'/docs/4.3/technical-details/release-notes/4.tucker/2.penny/2.2.2',
			'/docs/4.4/technical-details/release-notes/4.tucker/2.2.2',
			'/docs/4.5/technical-details/release-notes/4.tucker/2.2.2',
		],
		to: '/release-notes',
	},
	{
		from: [
			'/docs/4.1/release-notes/2.penny/2.2.3',
			'/docs/4.2/release-notes/2.penny/2.2.3',
			'/docs/4.3/release-notes/2.penny/2.2.3',
			'/docs/4.3/technical-details/release-notes/4.tucker/2.2.3',
		],
		to: '/release-notes',
	},
	{
		from: ['/docs/4.1/release-notes/2.penny/2.3.0', '/docs/4.3/technical-details/release-notes/4.tucker/2.3.0'],
		to: '/release-notes',
	},
	{
		from: [
			'/docs/4.1/release-notes/2.penny/2.3.1',
			'/docs/4.2/release-notes/2.penny/2.3.1',
			'/docs/4.3/release-notes/2.penny/2.3.1',
			'/docs/4.3/technical-details/release-notes/4.tucker/2.3.1',
			'/docs/4.4/technical-details/release-notes/4.tucker/2.3.1',
		],
		to: '/release-notes',
	},
	{
		from: [
			'/docs/4.3/technical-details/release-notes/4.tucker/2.penny',
			'/docs/4.4/technical-details/release-notes/4.tucker/2.penny',
			'/docs/4.5/technical-details/release-notes/4.tucker/2.penny',
		],
		to: '/release-notes',
	},

	// 3.monkey series
	{
		from: [
			'/docs/4.1/release-notes/3.monkey',
			'/docs/4.2/release-notes/3.monkey',
			'/docs/4.3/release-notes/3.monkey/3.3.0',
			'/docs/4.3/technical-details/release-notes/4.tucker/3.monkey',
			'/docs/4.4/technical-details/release-notes/4.tucker/3.monkey',
			'/docs/4.5/technical-details/release-notes/4.tucker/3.monkey',
		],
		to: '/release-notes',
	},
	{
		from: [
			'/docs/4.1/release-notes/3.monkey/3.0.0',
			'/docs/4.3/technical-details/release-notes/4.tucker/3.0.0',
			'/docs/4.4/technical-details/release-notes/4.tucker/3.0.0',
		],
		to: '/release-notes/v3-monkey/3.0.0',
	},
	{
		from: [
			'/docs/4.3/technical-details/release-notes/4.tucker/3.1.0',
			'/docs/4.4/technical-details/release-notes/4.tucker/3.1.0',
			'/docs/4.3/technical-details/release-notes/4.tucker/3.1.1',
			'/docs/4.4/technical-details/release-notes/4.tucker/3.1.1',
			'/docs/4.3/technical-details/release-notes/4.tucker/3.1.2',
			'/docs/4.1/technical-details/release-notes/4.tucker/3.1.2',
		],
		to: '/release-notes',
	},
	{
		from: [
			'/docs/4.1/release-notes/3.monkey/3.1.3',
			'/docs/4.3/technical-details/release-notes/4.tucker/3.1.3',
			'/docs/4.4/technical-details/release-notes/4.tucker/3.1.3',
		],
		to: '/release-notes/v3-monkey/3.1.3',
	},
	{
		from: [
			'/docs/4.1/release-notes/3.monkey/3.1.4',
			'/docs/4.4/technical-details/release-notes/4.tucker/3.1.4',
			'/docs/4.5/technical-details/release-notes/4.tucker/3.1.5',
			'/docs/4.3/technical-details/release-notes/4.tucker/3.1.5',
			'/docs/4.4/technical-details/release-notes/4.tucker/3.1.5',
		],
		to: '/release-notes',
	},
	{
		from: ['/docs/4.1/release-notes/3.monkey/3.1.5'],
		to: '/release-notes/v3-monkey/3.1.5',
	},
	{
		from: [
			'/docs/4.3/technical-details/release-notes/4.tucker/3.2.0',
			'/docs/4.4/technical-details/release-notes/4.tucker/3.2.1',
		],
		to: '/release-notes',
	},
	{
		from: ['/docs/4.1/release-notes/3.monkey/3.2.1', '/docs/4.1/technical-details/release-notes/4.tucker/3.2.1'],
		to: '/release-notes/v3-monkey/3.2.1',
	},
	{
		from: [
			'/docs/4.1/release-notes/3.monkey/3.3.0',
			'/docs/4.2/release-notes/3.monkey/3.3.0',
			'/docs/4.3/technical-details/release-notes/4.tucker/3.3.0',
			'/docs/4.4/technical-details/release-notes/4.tucker/3.3.0',
			'/docs/4.5/technical-details/release-notes/4.tucker/3.3.0',
		],
		to: '/release-notes/v3-monkey/3.3.0',
	},

	// 4.tucker series
	{
		from: ['/docs/4.1/release-notes/4.tucker'],
		to: '/release-notes',
	},
	{
		from: [
			'/docs/4.1/release-notes/4.tucker/4.0.0',
			'/docs/4.1/release-notes/4.tucker/4.0.2',
			'/docs/4.1/release-notes/4.tucker/4.0.3',
			'/docs/4.1/release-notes/4.tucker/4.0.4',
		],
		to: '/release-notes',
	},
	{
		from: [
			'/docs/4.1/release-notes/4.tucker/4.0.5',
			'/docs/4.2/release-notes/4.tucker/4.0.5',
			'/docs/4.3/release-notes/4.tucker/4.0.5',
		],
		to: '/release-notes',
	},
	{
		from: [
			'/docs/4.1/release-notes/4.tucker/4.0.6',
			'/docs/4.2/release-notes/4.tucker/4.0.6',
			'/docs/4.3/release-notes/4.tucker/4.0.6',
		],
		to: '/release-notes',
	},
	{
		from: ['/docs/4.1/release-notes/4.tucker/4.1.0'],
		to: '/release-notes',
	},
	{
		from: [
			'/docs/4.4/technical-details/release-notes/4.tucker/4.4.25',
			'/docs/4.4/technical-details/release-notes/4.tucker/4.4.26',
		],
		to: '/release-notes',
	},

	// ── Administration / Studio (harperdb-studio under /docs/4.X/administration) ──
	{
		from: [
			'/docs/4.1/administration/harperdb-studio',
			'/docs/4.2/administration/harperdb-studio',
			'/docs/4.3/administration/harperdb-studio',
		],
		to: '/reference/v4/studio/overview',
	},
	{
		from: [
			'/docs/4.1/administration/harperdb-studio/create-account',
			'/docs/4.2/administration/harperdb-studio/create-account',
			'/docs/4.3/administration/harperdb-studio/create-account',
		],
		to: '/reference/v4/studio/overview',
	},
	{
		from: [
			'/docs/4.1/administration/harperdb-studio/instances',
			'/docs/4.2/administration/harperdb-studio/instances',
			'/docs/4.3/administration/harperdb-studio/instances',
		],
		to: '/reference/v4/studio/overview',
	},
	{
		from: [
			'/docs/4.1/administration/harperdb-studio/login-password-reset',
			'/docs/4.3/administration/harperdb-studio/login-password-reset',
		],
		to: '/reference/v4/studio/overview',
	},
	{
		from: [
			'/docs/4.2/administration/harperdb-studio/instance-configuration',
			'/docs/4.3/administration/harperdb-studio/instance-configuration',
		],
		to: '/reference/v4/studio/overview',
	},
	{
		from: [
			'/docs/4.2/administration/harperdb-studio/instance-metrics',
			'/docs/4.3/administration/harperdb-studio/instance-metrics',
		],
		to: '/reference/v4/studio/overview',
	},
	{
		from: [
			'/docs/4.2/administration/harperdb-studio/instance-example-code',
			'/docs/4.3/administration/harperdb-studio/instance-example-code',
		],
		to: '/reference/v4/studio/overview',
	},
	{
		from: [
			'/docs/4.2/administration/harperdb-studio/manage-schemas-browse-data',
			'/docs/4.1/administration/harperdb-studio/manage-schemas-browse-data',
			'/docs/4.3/administration/harperdb-studio/manage-databases-browse-data',
		],
		to: '/reference/v4/studio/overview',
	},
	{
		from: [
			'/docs/4.1/administration/harperdb-studio/manage-instance-users',
			'/docs/4.2/administration/harperdb-studio/manage-instance-users',
			'/docs/4.3/administration/harperdb-studio/manage-instance-users',
		],
		to: '/reference/v4/studio/overview',
	},
	{
		from: [
			'/docs/4.2/administration/harperdb-studio/manage-instance-roles',
			'/docs/4.3/administration/harperdb-studio/manage-instance-roles',
		],
		to: '/reference/v4/studio/overview',
	},
	{
		from: [
			'/docs/4.2/administration/harperdb-studio/manage-functions',
			'/docs/4.3/administration/harperdb-studio/manage-functions',
		],
		to: '/reference/v4/studio/overview',
	},
	{
		from: [
			'/docs/4.2/administration/harperdb-studio/manage-charts',
			'/docs/4.3/administration/harperdb-studio/manage-charts',
		],
		to: '/reference/v4/studio/overview',
	},
	{
		from: [
			'/docs/4.2/administration/harperdb-studio/manage-clustering',
			'/docs/4.3/administration/harperdb-studio/manage-clustering',
		],
		to: '/reference/v4/studio/overview',
	},
	{ from: ['/docs/4.3/administration/harperdb-studio/manage-replication'], to: '/reference/v4/studio/overview' },
	{
		from: [
			'/docs/4.2/administration/harperdb-studio/manage-applications',
			'/docs/4.3/administration/harperdb-studio/manage-applications',
		],
		to: '/reference/v4/studio/overview',
	},
	{
		from: [
			'/docs/4.1/administration/harperdb-studio/enable-mixed-content',
			'/docs/4.2/administration/harperdb-studio/enable-mixed-content',
			'/docs/4.3/administration/harperdb-studio/enable-mixed-content',
		],
		to: '/reference/v4/studio/overview',
	},
	{
		from: [
			'/docs/4.1/administration/harperdb-studio/organizations',
			'/docs/4.2/administration/harperdb-studio/organizations',
			'/docs/4.3/administration/harperdb-studio/organizations',
		],
		to: '/reference/v4/studio/overview',
	},
	{
		from: [
			'/docs/4.2/administration/harperdb-studio/query-instance-data',
			'/docs/4.3/administration/harperdb-studio/query-instance-data',
		],
		to: '/reference/v4/studio/overview',
	},

	// ── Clustering (4.1 / 4.2 paths not already covered above) ───────────────
	{
		from: [
			'/docs/4.2/developers/clustering',
			'/docs/4.2/developers/clustering/things-worth-knowing',
			'/docs/4.2/developers/clustering/establishing-routes',
			'/docs/4.2/developers/clustering/managing-subscriptions',
			'/docs/4.2/developers/clustering/subscription-overview',
			'/docs/4.2/developers/clustering/requirements-and-definitions',
			'/docs/4.2/developers/clustering/naming-a-node',
		],
		to: '/reference/v4/replication/clustering',
	},
	{
		from: [
			'/docs/4.1/developers/clustering/naming-a-node',
			'/docs/4.1/developers/clustering/requirements-and-definitions',
			'/docs/4.1/developers/clustering/subscription-overview',
			'/docs/4.1/developers/clustering/things-worth-knowing',
		],
		to: '/reference/v4/replication/clustering',
	},
	{
		from: [
			'/docs/4.1/developers/replication/clustering/creating-a-cluster-user',
			'/docs/4.1/developers/replication/clustering/managing-subscriptions',
			'/docs/4.1/developers/replication/clustering/naming-a-node',
			'/docs/4.3/developers/replication/clustering/establishing-routes',
		],
		to: '/reference/v4/replication/clustering',
	},
	{
		from: ['/docs/4.2/developers/operations-api/clustering', '/docs/4.3/developers/operations-api/clustering'],
		to: '/reference/v4/replication/clustering',
	},

	// ── Technical details / Reference (additional paths) ──────────────────────
	{
		from: [
			'/docs/4.2/technical-details/reference/headers',
			'/docs/4.3/technical-details/reference/headers',
			'/docs/4.4/technical-details/reference/headers',
			'/docs/4.5/technical-details/reference/headers',
		],
		to: '/reference/v4/rest/headers',
	},
	{ from: ['/docs/4.3/reference/headers'], to: '/reference/v4/rest/headers' },

	// ── Deployments / Cloud (4.1 paths) ───────────────────────────────────────
	{
		from: [
			'/docs/4.1/deployments/harperdb-cloud',
			'/docs/4.1/deployments/harperdb-cloud/instance-size-hardware-specs',
			'/docs/4.1/deployments/harperdb-cloud/iops-impact',
			'/docs/4.1/deployments/harperdb-cloud/verizon-5g-wavelength-instances',
		],
		to: '/reference/v4/legacy/cloud',
	},

	// ── SQL (additional 4.2 path) ──────────────────────────────────────────────
	{ from: ['/docs/4.2/developers/sql-guide/reserved-word'], to: '/reference/v4/operations-api/sql' },

	// ── Release notes (additional versioned paths) ────────────────────────────
	{
		from: ['/docs/4.1/release-notes/1.alby', '/docs/4.3/technical-details/release-notes/4.tucker/3.2.1'],
		to: '/release-notes',
	},
];
