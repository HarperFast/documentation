// Redirect configuration for Docusaurus client-side redirects
// Based on pageview analytics (Oct 2025 – Feb 2026) from docs.harper.fast
//
// Sections with NO redirects needed:
//   /reference/  — new section, no old paths point here
//   /learn/       — already has redirects for /getting-started/* and /foundations/*
//   /release-notes/ — existing createRedirects logic handles old naming variants
//   /fabric/      — new section, no old paths

type RedirectRule = {
	to: string;
	from: string | string[];
};

// ─── Static redirect rules ───────────────────────────────────────────────────
// All paths sourced from GA pageview data (Oct 2025–Feb 2026).
// Paths with <10 views are marked LOW TRAFFIC and may be dropped in a future cleanup.

export const redirects: RedirectRule[] = [
	// ── Docs root ──────────────────────────────────────────────────────────────
	// Note: /docs and /docs/ cannot be redirected here because Docusaurus builds
	// a real page at that path (docs/index.mdx). The index.mdx itself should
	// handle sending users to the right place.
	{ from: '/docs/', to: '/' },

	// ── Getting Started / Foundations → Learn ─────────────────────────────────
	{ from: '/docs/getting-started', to: '/learn' },
	{ from: '/docs/getting-started/quickstart', to: '/learn' },
	{ from: '/docs/getting-started/installation', to: '/learn/getting-started/install-and-connect-harper' },
	{ from: '/docs/getting-started/install-harper', to: '/learn/getting-started/install-and-connect-harper' },
	// LOW TRAFFIC (<10 views):
	{ from: '/docs/getting-started/what-is-harper', to: '/learn' },
	{ from: '/docs/getting-started/harper-concepts', to: '/learn' },
	{ from: '/docs/foundations/harper-architecture', to: '/learn' },
	{ from: '/docs/foundations/core-concepts', to: '/learn' },
	{ from: '/docs/foundations/use-cases', to: '/learn' },

	// ── Operations API ─────────────────────────────────────────────────────────
	{ from: '/docs/developers/operations-api', to: '/reference/v4/operations-api/overview' },
	{ from: '/docs/developers/operations-api/nosql-operations', to: '/reference/v4/operations-api/operations' },
	{ from: '/docs/developers/operations-api/databases-and-tables', to: '/reference/v4/database/overview' },
	{ from: '/docs/developers/operations-api/components', to: '/reference/v4/operations-api/operations' },
	{ from: '/docs/developers/operations-api/advanced-json-sql-examples', to: '/reference/v4/operations-api/operations' },
	{ from: '/docs/developers/operations-api/bulk-operations', to: '/reference/v4/operations-api/operations' },
	{ from: '/docs/developers/operations-api/system-operations', to: '/reference/v4/operations-api/operations' },
	{ from: '/docs/developers/operations-api/configuration', to: '/reference/v4/configuration/operations' },
	{ from: '/docs/developers/operations-api/users-and-roles', to: '/reference/v4/users-and-roles/operations' },
	{ from: '/docs/developers/operations-api/analytics', to: '/reference/v4/analytics/operations' },
	{ from: '/docs/developers/operations-api/quickstart-examples', to: '/reference/v4/operations-api/operations' },
	{ from: '/docs/developers/operations-api/certificate-management', to: '/reference/v4/security/certificate-management' },
	{ from: '/docs/developers/operations-api/custom-functions', to: '/reference/v4/legacy/custom-functions' },
	{ from: '/docs/developers/operations-api/jobs', to: '/reference/v4/database/jobs' },
	{ from: '/docs/developers/operations-api/logs', to: '/reference/v4/logging/operations' },
	{ from: '/docs/developers/operations-api/sql-operations', to: '/reference/v4/database/sql' },
	{ from: '/docs/developers/operations-api/clustering-nats', to: '/reference/v4/replication/clustering' },
	{ from: '/docs/developers/operations-api/clustering', to: '/reference/v4/replication/clustering' },
	{ from: '/docs/developers/operations-api/token-authentication', to: '/reference/v4/security/jwt-authentication' },
	{ from: '/docs/developers/operations-api/registration', to: '/reference/v4/operations-api/operations' },
	// LOW TRAFFIC (<10 views):
	{ from: '/docs/developers/operations-api/utilities', to: '/reference/v4/operations-api/operations' },

	// ── Applications / Components ──────────────────────────────────────────────
	{ from: '/docs/developers/applications', to: '/reference/v4/components/overview' },
	{ from: '/docs/developers/applications/defining-schemas', to: '/reference/v4/database/schema' },
	{
		// TODO: eventually redirect to a dedicated learn page for database caching
		from: '/docs/developers/applications/caching',
		to: '/reference/v4/resources/overview',
	},
	{ from: '/docs/developers/applications/data-loader', to: '/reference/v4/database/data-loader' },
	{ from: '/docs/developers/applications/web-applications', to: '/reference/v4/components/applications' },
	{ from: '/docs/developers/applications/debugging', to: '/reference/v4/components/overview' },
	{ from: '/docs/developers/applications/define-routes', to: '/reference/v4/fastify-routes/overview' },
	{ from: '/docs/developers/applications/defining-roles', to: '/reference/v4/users-and-roles/overview' },
	// LOW TRAFFIC (<10 views):
	{ from: '/docs/developers/applications/', to: '/reference/v4/components/overview' },

	// ── Old /developers/components/* (separate from /reference/components/*) ──
	{ from: '/docs/developers/components', to: '/reference/v4/components/overview' },
	{ from: '/docs/developers/components/built-in', to: '/reference/v4/components/extension-api' },
	{ from: '/docs/developers/components/reference', to: '/reference/v4/components/extension-api' },
	// LOW TRAFFIC (<10 views):
	{ from: '/docs/developers/components/writing-extensions', to: '/reference/v4/components/extension-api' },
	{ from: '/docs/developers/components/managing', to: '/reference/v4/components/overview' },
	{ from: '/docs/developers/miscellaneous/sdks', to: '/reference/v4/components/overview' },

	// ── Security ───────────────────────────────────────────────────────────────
	{ from: '/docs/developers/security', to: '/reference/v4/security/overview' },
	{ from: '/docs/developers/security/configuration', to: '/reference/v4/security/configuration' },
	{ from: '/docs/developers/security/users-and-roles', to: '/reference/v4/users-and-roles/overview' },
	{ from: '/docs/developers/security/jwt-auth', to: '/reference/v4/security/jwt-authentication' },
	{ from: '/docs/developers/security/basic-auth', to: '/reference/v4/security/basic-authentication' },
	{ from: '/docs/developers/security/certificate-management', to: '/reference/v4/security/certificate-management' },
	{ from: '/docs/developers/security/certificate-verification', to: '/reference/v4/security/certificate-verification' },
	{ from: '/docs/developers/security/mtls-auth', to: '/reference/v4/security/mtls-authentication' },

	// ── Replication / Clustering ───────────────────────────────────────────────
	{ from: '/docs/developers/replication', to: '/reference/v4/replication/overview' },
	{ from: '/docs/developers/replication/sharding', to: '/reference/v4/replication/sharding' },
	{ from: '/docs/developers/clustering', to: '/reference/v4/replication/clustering' },
	// LOW TRAFFIC (<10 views):
	{ from: '/docs/developers/clustering/certificate-management', to: '/reference/v4/security/certificate-management' },
	{ from: '/docs/developers/clustering/enabling-clustering', to: '/reference/v4/replication/clustering' },
	{ from: '/docs/developers/clustering/creating-a-cluster-user', to: '/reference/v4/replication/clustering' },
	{ from: '/docs/developers/clustering/things-worth-knowing', to: '/reference/v4/replication/clustering' },
	{ from: '/docs/developers/clustering/subscription-overview', to: '/reference/v4/replication/clustering' },
	{ from: '/docs/developers/replication/clustering/enabling-clustering', to: '/reference/v4/replication/clustering' },

	// ── REST / Real-time ────────────────────────────────────────────────────────
	{ from: '/docs/developers/rest', to: '/reference/v4/rest/overview' },
	{ from: '/docs/developers/real-time', to: '/reference/v4/rest/websockets' },
	{ from: '/docs/developers/sql-guide', to: '/reference/v4/database/sql' },
	// LOW TRAFFIC (<10 views):
	{ from: '/docs/developers/sql-guide/functions', to: '/reference/v4/database/sql' },
	{ from: '/docs/developers/sql-guide/date-functions', to: '/reference/v4/database/sql' },
	{ from: '/docs/developers/sql-guide/features-matrix', to: '/reference/v4/database/sql' },
	{ from: '/docs/developers/sql-guide/json-search', to: '/reference/v4/database/sql' },
	{ from: '/docs/developers/sql-guide/sql-geospatial-functions', to: '/reference/v4/database/sql' },
	{ from: '/docs/developers/sql-guide/reserved-word', to: '/reference/v4/database/sql' },

	// ── Configuration ─────────────────────────────────────────────────────────
	{ from: '/docs/deployments/configuration', to: '/reference/v4/configuration/overview' },

	// ── CLI ───────────────────────────────────────────────────────────────────
	{ from: '/docs/deployments/harper-cli', to: '/reference/v4/cli/overview' },
	// LOW TRAFFIC (<10 views):
	{ from: '/docs/deployments/harperdb-cli', to: '/reference/v4/cli/overview' },
	{ from: '/docs/administration/harperdb-cli', to: '/reference/v4/cli/overview' },

	// ── Install / Upgrade (no equivalent page in /reference/v4/) ──────────────
	// These remain as self-referential paths that may still exist on the live site.
	// LOW TRAFFIC (<10 views for most subpaths):
	{ from: '/docs/deployments/upgrade-hdb-instance', to: '/learn' },
	{ from: '/docs/administration/upgrade-hdb-instance', to: '/learn' },

	// ── Harper Cloud → Legacy ─────────────────────────────────────────────────
	{ from: '/docs/deployments/harper-cloud', to: '/reference/v4/legacy/cloud' },
	// LOW TRAFFIC (<10 views each):
	{ from: '/docs/deployments/harperdb-cloud', to: '/reference/v4/legacy/cloud' },

	// ── Studio ────────────────────────────────────────────────────────────────
	{ from: '/docs/administration/harper-studio', to: '/reference/v4/studio/overview' },
	{ from: '/docs/administration/harper-studio/create-account', to: '/reference/v4/studio/overview' },
	{ from: '/docs/administration/harper-studio/login-password-reset', to: '/reference/v4/studio/overview' },
	{ from: '/docs/administration/harper-studio/instances', to: '/reference/v4/studio/overview' },
	{ from: '/docs/administration/harper-studio/instance-metrics', to: '/reference/v4/studio/overview' },
	{ from: '/docs/administration/harper-studio/instance-configuration', to: '/reference/v4/studio/overview' },
	{ from: '/docs/administration/harper-studio/manage-databases-browse-data', to: '/reference/v4/studio/overview' },
	{ from: '/docs/administration/harper-studio/manage-instance-users', to: '/reference/v4/studio/overview' },
	{ from: '/docs/administration/harper-studio/manage-applications', to: '/reference/v4/studio/overview' },
	{ from: '/docs/administration/harper-studio/enable-mixed-content', to: '/reference/v4/studio/overview' },
	{ from: '/docs/administration/harper-studio/query-instance-data', to: '/reference/v4/studio/overview' },
	{ from: '/docs/administration/harper-studio/organizations', to: '/reference/v4/studio/overview' },
	{ from: '/docs/administration/harper-studio/manage-instance-roles', to: '/reference/v4/studio/overview' },
	// LOW TRAFFIC (<10 views):
	{ from: '/docs/administration/harperdb-studio/', to: '/reference/v4/studio/overview' },
	{ from: '/docs/administration/harperdb-studio/manage-applications', to: '/reference/v4/studio/overview' },

	// ── Logging ───────────────────────────────────────────────────────────────
	{ from: '/docs/administration/logging', to: '/reference/v4/logging/overview' },
	{ from: '/docs/administration/logging/standard-logging', to: '/reference/v4/logging/overview' },
	{ from: '/docs/administration/logging/audit-logging', to: '/reference/v4/logging/overview' },
	{ from: '/docs/administration/logging/transaction-logging', to: '/reference/v4/logging/overview' },

	// ── Administration: other ─────────────────────────────────────────────────
	{ from: '/docs/administration/cloning', to: '/reference/v4/replication/overview' },
	{ from: '/docs/administration/compact', to: '/reference/v4/database/compaction' },
	{ from: '/docs/administration/jobs', to: '/reference/v4/database/jobs' },

	// ── Old /docs/reference/* ─────────────────────────────────────────────────
	{ from: '/docs/reference', to: '/reference/v4' },
	{ from: '/docs/reference/globals', to: '/reference/v4/components/javascript-environment' },
	{ from: '/docs/reference/resources', to: '/reference/v4/resources/overview' },
	{ from: '/docs/reference/resources/instance-binding', to: '/reference/v4/resources/resource-api' },
	{ from: '/docs/reference/resources/migration', to: '/reference/v4/database/data-loader' },
	{ from: '/docs/reference/resources/query-optimization', to: '/reference/v4/resources/query-optimization' },
	{ from: '/docs/reference/components', to: '/reference/v4/components/overview' },
	{ from: '/docs/reference/components/built-in-extensions', to: '/reference/v4/components/extension-api' },
	{ from: '/docs/reference/components/extensions', to: '/reference/v4/components/extension-api' },
	{ from: '/docs/reference/components/plugins', to: '/reference/v4/components/plugin-api' },
	{ from: '/docs/reference/components/applications', to: '/reference/v4/components/applications' },
	{ from: '/docs/reference/components/configuration', to: '/reference/v4/components/overview' },
	{ from: '/docs/reference/analytics', to: '/reference/v4/analytics/overview' },
	{ from: '/docs/reference/dynamic-schema', to: '/reference/v4/database/schema' },
	{ from: '/docs/reference/data-types', to: '/reference/v4/database/schema' },
	{ from: '/docs/reference/blob', to: '/reference/v4/database/schema' },
	{ from: '/docs/reference/transactions', to: '/reference/v4/database/transaction' },
	{ from: '/docs/reference/graphql', to: '/reference/v4/graphql-querying/overview' },
	{ from: '/docs/reference/content-types', to: '/reference/v4/rest/content-types' },
	{ from: '/docs/reference/headers', to: '/reference/v4/rest/headers' },
	{ from: '/docs/reference/roles', to: '/reference/v4/users-and-roles/overview' },
	{ from: '/docs/reference/storage-algorithm', to: '/reference/v4/database/storage-algorithm' },
	{ from: '/docs/reference/limits', to: '/reference/v4/database/schema' },
	{ from: '/docs/reference/architecture', to: '/reference/v4' },
	{ from: '/docs/reference/clustering', to: '/reference/v4/replication/clustering' },
	{ from: '/docs/reference/clustering/enabling-clustering', to: '/reference/v4/replication/clustering' },
	{ from: '/docs/reference/clustering/establishing-routes', to: '/reference/v4/replication/clustering' },
	{ from: '/docs/reference/clustering/subscription-overview', to: '/reference/v4/replication/clustering' },
	{ from: '/docs/reference/clustering/managing-subscriptions', to: '/reference/v4/replication/clustering' },
	{ from: '/docs/reference/clustering/things-worth-knowing', to: '/reference/v4/replication/clustering' },
	// LOW TRAFFIC (<10 views):
	{ from: '/docs/reference/clustering/certificate-management', to: '/reference/v4/security/certificate-management' },
	{ from: '/docs/reference/clustering/creating-a-cluster-user', to: '/reference/v4/replication/clustering' },
	{ from: '/docs/reference/clustering/naming-a-node', to: '/reference/v4/replication/clustering' },
	{ from: '/docs/reference/sql-guide', to: '/reference/v4/database/sql' },
	{ from: '/docs/reference/sql-guide/json-search', to: '/reference/v4/database/sql' },
	// LOW TRAFFIC (<10 views):
	{ from: '/docs/reference/sql-guide/date-functions', to: '/reference/v4/database/sql' },
	{ from: '/docs/reference/sql-guide/functions', to: '/reference/v4/database/sql' },
	{ from: '/docs/reference/sql-guide/sql-geospatial-functions', to: '/reference/v4/database/sql' },

	// ── Old /technical-details/reference/* (pre-v4 paths) ────────────────────
	// LOW TRAFFIC (<10 views):
	{ from: '/technical-details/reference/resources', to: '/reference/v4/resources/overview' },

	// ── Old /docs/administration/administration ────────────────────────────────
	// LOW TRAFFIC (<10 views):
	{ from: '/docs/administration/administration', to: '/reference/v4' },
	{ from: '/docs/administration', to: '/reference/v4' },
	{ from: '/docs/deployments', to: '/reference/v4' },

	// ── Release notes ─────────────────────────────────────────────────────────
	// Only paths seen in pageview data (Oct 2025–Feb 2026). The old docs embedded
	// release notes under /docs/technical-details/release-notes/ using a dot-separated
	// version name format (e.g. "4.tucker" instead of "v4-tucker").
	{ from: '/docs/technical-details/release-notes', to: '/release-notes' },
	// LOW TRAFFIC (<16 views each):
	{ from: '/docs/4.3/technical-details/release-notes/4.tucker/2.1.1', to: '/release-notes/v2-penny/2.1.1' },
	{ from: '/docs/4.3/technical-details/release-notes/4.tucker/1.3.1', to: '/release-notes/v1-alby/1.3.1' },
	{ from: '/docs/4.3/technical-details/release-notes/4.tucker/3.0.0', to: '/release-notes/v3-monkey/3.0.0' },
];

// ─── Wildcard / dynamic redirects ────────────────────────────────────────────
// Called by Docusaurus for every existing page path to generate inbound redirects.

export function createRedirects(_existingPath: string): string[] | undefined {
	// No dynamic redirects needed at this time.
	// The versioned /docs/4.X/ roots are real Docusaurus-built directories and
	// cannot be redirected via this plugin (postbuild.js would conflict).
	return undefined;
}
