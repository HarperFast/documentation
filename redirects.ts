// Redirect configuration for Docusaurus client-side redirects
//
// This file contains redirects for non-versioned /docs/* paths (i.e. paths
// without a /docs/4.X/ prefix). These represent traffic from the era when there
// was a single "current" version, so they redirect to the current reference
// (/reference/v5/).
//
// For versioned /docs/4.X/* paths, see historic-redirects.ts.
//
// Sections with NO redirects needed:
//   /reference/  — new section, no old paths point here
//   /learn/       — existing redirects for /getting-started/* and /foundations/*
//   /release-notes/ — static rules below cover all paths seen in analytics
//   /fabric/      — new section, no old paths

import { historicRedirects } from './historic-redirects';

type RedirectRule = {
	to: string;
	from: string | string[];
};

// ─── Static redirect rules ────────────────────────────────────────────────────
// All paths sourced from GA pageview data (Oct 2025–Feb 2026).
// Non-versioned /docs/* paths → /reference/v5/ (current version)
// Paths with <10 views are marked LOW TRAFFIC.

const currentRedirects: RedirectRule[] = [
	// ── Docs root ──────────────────────────────────────────────────────────────
	{ from: '/docs', to: '/' },
	{ from: '/docs/category/developers', to: '/' },

	// ── Getting Started / Foundations → Learn ─────────────────────────────────
	{ from: '/docs/getting-started', to: '/learn' },
	{ from: '/docs/getting-started/quickstart', to: '/learn' },
	{ from: '/docs/getting-started/installation', to: '/learn/getting-started/install-and-connect-harper' },
	{ from: '/docs/getting-started/install-harper', to: '/learn/getting-started/install-and-connect-harper' },
	{ from: '/docs/getting-started/what-is-harper', to: '/learn' },
	{ from: '/docs/getting-started/harper-concepts', to: '/learn' },
	{ from: '/docs/getting-started/first-harper-app', to: '/learn' },
	{ from: '/docs/foundations/harper-architecture', to: '/learn' },
	{ from: '/docs/foundations/core-concepts', to: '/learn' },
	{ from: '/docs/foundations/use-cases', to: '/learn' },

	// ── Operations API ─────────────────────────────────────────────────────────
	{ from: '/docs/developers/operations-api', to: '/reference/v5/operations-api/overview' },
	{ from: '/docs/developers/operations-api/nosql-operations', to: '/reference/v5/operations-api/operations' },
	{ from: '/docs/developers/operations-api/databases-and-tables', to: '/reference/v5/database/overview' },
	{ from: '/docs/developers/operations-api/components', to: '/reference/v5/operations-api/operations' },
	{ from: '/docs/developers/operations-api/advanced-json-sql-examples', to: '/reference/v5/operations-api/operations' },
	{ from: '/docs/developers/operations-api/bulk-operations', to: '/reference/v5/operations-api/operations' },
	{ from: '/docs/developers/operations-api/system-operations', to: '/reference/v5/operations-api/operations' },
	{ from: '/docs/developers/operations-api/configuration', to: '/reference/v5/configuration/operations' },
	{ from: '/docs/developers/operations-api/users-and-roles', to: '/reference/v5/users-and-roles/operations' },
	{ from: '/docs/developers/operations-api/analytics', to: '/reference/v5/analytics/operations' },
	{ from: '/docs/developers/operations-api/quickstart-examples', to: '/reference/v5/operations-api/operations' },
	{
		from: '/docs/developers/operations-api/certificate-management',
		to: '/reference/v5/security/certificate-management',
	},
	{ from: '/docs/developers/operations-api/custom-functions', to: '/reference/v4/legacy/custom-functions' },
	{ from: '/docs/developers/operations-api/jobs', to: '/reference/v5/database/jobs' },
	{ from: '/docs/developers/operations-api/logs', to: '/reference/v5/logging/operations' },
	{ from: '/docs/developers/operations-api/sql-operations', to: '/reference/v5/database/sql' },
	{ from: '/docs/developers/operations-api/clustering-nats', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/developers/operations-api/clustering', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/developers/operations-api/token-authentication', to: '/reference/v5/security/jwt-authentication' },
	{ from: '/docs/developers/operations-api/registration', to: '/reference/v5/operations-api/operations' },
	{ from: '/docs/developers/operations-api/utilities', to: '/reference/v5/operations-api/operations' },

	// ── Applications / Components ──────────────────────────────────────────────
	{ from: '/docs/developers/applications', to: '/reference/v5/components/overview' },
	{ from: '/docs/developers/applications/defining-schemas', to: '/reference/v5/database/schema' },
	{
		// TODO: eventually redirect to a dedicated learn page for database caching
		from: '/docs/developers/applications/caching',
		to: '/reference/v5/resources/overview',
	},
	{ from: '/docs/developers/applications/data-loader', to: '/reference/v5/database/data-loader' },
	{ from: '/docs/developers/applications/web-applications', to: '/reference/v5/components/applications' },
	{ from: '/docs/developers/applications/debugging', to: '/reference/v5/components/overview' },
	{ from: '/docs/developers/applications/define-routes', to: '/reference/v5/fastify-routes/overview' },
	{ from: '/docs/developers/applications/defining-roles', to: '/reference/v5/users-and-roles/overview' },

	// ── Old /developers/components/* (separate from /reference/components/*) ──
	{ from: '/docs/developers/components', to: '/reference/v5/components/overview' },
	{ from: '/docs/developers/components/built-in', to: '/reference/v5/components/extension-api' },
	{ from: '/docs/developers/components/reference', to: '/reference/v5/components/extension-api' },
	{ from: '/docs/developers/components/writing-extensions', to: '/reference/v5/components/extension-api' },
	{ from: '/docs/developers/components/managing', to: '/reference/v5/components/overview' },
	{ from: '/docs/developers/components/sdks', to: '/reference/v5/components/overview' },
	{ from: '/docs/developers/components/drivers', to: '/reference/v5/components/overview' },
	{ from: '/docs/developers/components/operations', to: '/reference/v5/components/overview' },
	{ from: '/docs/developers/components/google-data-studio', to: '/reference/v5/components/overview' },
	{ from: '/docs/developers/miscellaneous', to: '/reference/v5/components/overview' },
	{ from: '/docs/developers/miscellaneous/sdks', to: '/reference/v5/components/overview' },
	{ from: '/docs/developers/miscellaneous/google-data-studio', to: '/reference/v5/components/overview' },
	{ from: '/docs/add-ons-and-sdks/google-data-studio', to: '/reference/v5/components/overview' },
	{ from: '/docs/add-ons-and-sdks', to: '/reference/v5/components/overview' },
	{ from: '/docs/developers/plugin-best-practices', to: '/reference/v5/components/plugin-api' },
	{ from: '/docs/developers/plugins', to: '/reference/v5/components/plugin-api' },
	{ from: '/docs/developers/pub-sub', to: '/reference/v5/rest/websockets' },
	{ from: '/docs/developers/vector-indexes', to: '/reference/v5/database/overview' },
	{ from: '/docs/developers/request-lifecycle', to: '/reference/v5/components/overview' },
	{ from: '/docs/developers/testing', to: '/reference/v5/components/overview' },
	{ from: '/docs/developers/applications/example-projects', to: '/learn' },
	{ from: '/docs/extensions/functions', to: '/reference/v4/legacy/custom-functions' },
	{ from: '/docs/custom-functions/host-static', to: '/reference/v4/legacy/custom-functions' },
	{ from: '/docs/custom-functions/restarting-server', to: '/reference/v4/legacy/custom-functions' },

	// ── Security ───────────────────────────────────────────────────────────────
	{ from: '/docs/developers/security', to: '/reference/v5/security/overview' },
	{ from: '/docs/developers/security/configuration', to: '/reference/v5/security/configuration' },
	{ from: '/docs/developers/security/users-and-roles', to: '/reference/v5/users-and-roles/overview' },
	{ from: '/docs/developers/security/jwt-auth', to: '/reference/v5/security/jwt-authentication' },
	{ from: '/docs/developers/security/basic-auth', to: '/reference/v5/security/basic-authentication' },
	{ from: '/docs/developers/security/certificate-management', to: '/reference/v5/security/certificate-management' },
	{ from: '/docs/developers/security/certificate-verification', to: '/reference/v5/security/certificate-verification' },
	{ from: '/docs/developers/security/mtls-auth', to: '/reference/v5/security/mtls-authentication' },

	// ── Replication / Clustering ───────────────────────────────────────────────
	{ from: '/docs/developers/replication', to: '/reference/v5/replication/overview' },
	{ from: '/docs/developers/replication/sharding', to: '/reference/v5/replication/sharding' },
	{ from: '/docs/developers/clustering', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/developers/clustering/certificate-management', to: '/reference/v5/security/certificate-management' },
	{ from: '/docs/developers/clustering/enabling-clustering', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/developers/clustering/creating-a-cluster-user', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/developers/clustering/things-worth-knowing', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/developers/clustering/subscription-overview', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/developers/clustering/naming-a-node', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/developers/clustering/requirements-and-definitions', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/developers/clustering/establishing-routes', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/developers/clustering/managing-subscriptions', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/developers/replication/clustering/enabling-clustering', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/developers/replication/clustering/establishing-routes', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/developers/replication/clustering/naming-a-node', to: '/reference/v5/replication/clustering' },
	{
		from: '/docs/developers/replication/clustering/requirements-and-definitions',
		to: '/reference/v5/replication/clustering',
	},
	{
		from: '/docs/developers/replication/clustering/certificate-management',
		to: '/reference/v5/security/certificate-management',
	},
	{
		from: '/docs/developers/replication/clustering/managing-subscriptions',
		to: '/reference/v5/replication/clustering',
	},
	{ from: '/docs/configuration/clustering', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/clustering', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/cluster-setup', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/clustering/creating-a-cluster-user', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/clustering/things-worth-knowing', to: '/reference/v5/replication/clustering' },

	// ── REST / Real-time ────────────────────────────────────────────────────────
	{ from: '/docs/developers/rest', to: '/reference/v5/rest/overview' },
	{ from: '/docs/developers/real-time', to: '/reference/v5/rest/websockets' },
	{ from: '/docs/rest-api', to: '/reference/v5/rest/overview' },
	{ from: '/docs/graphql/overview', to: '/reference/v5/graphql-querying/overview' },
	{ from: '/docs/developers/sql-guide', to: '/reference/v5/database/sql' },

	{ from: '/docs/developers/sql-guide/functions', to: '/reference/v5/database/sql' },
	{ from: '/docs/developers/sql-guide/date-functions', to: '/reference/v5/database/sql' },
	{ from: '/docs/developers/sql-guide/features-matrix', to: '/reference/v5/database/sql' },
	{ from: '/docs/developers/sql-guide/json-search', to: '/reference/v5/database/sql' },
	{ from: '/docs/developers/sql-guide/sql-geospatial-functions', to: '/reference/v5/database/sql' },
	{ from: '/docs/developers/sql-guide/reserved-word', to: '/reference/v5/database/sql' },
	{ from: '/docs/sql-support', to: '/reference/v5/database/sql' },
	{ from: '/docs/sql-guide/insert', to: '/reference/v5/database/sql' },
	{ from: '/docs/sql-guide/select', to: '/reference/v5/database/sql' },
	{ from: '/docs/sql-guide/datatypes', to: '/reference/v5/database/sql' },
	{ from: '/docs/sql-guide/sql-geospatial-functions/geoconvert', to: '/reference/v5/database/sql' },

	// ── Database / Resources ──────────────────────────────────────────────────
	{ from: '/docs/data-loading', to: '/reference/v5/database/data-loader' },
	{ from: '/docs/replication', to: '/reference/v5/replication/overview' },
	{ from: '/docs/resources', to: '/reference/v5/resources/overview' },
	{ from: '/docs/performance', to: '/reference/v5' },
	{ from: '/docs/performance-guide/data-modeling', to: '/reference/v5' },

	// ── Configuration ─────────────────────────────────────────────────────────
	{ from: '/docs/deployments/configuration', to: '/reference/v5/configuration/overview' },

	// ── CLI ───────────────────────────────────────────────────────────────────
	{ from: '/docs/deployments/harper-cli', to: '/reference/v5/cli/overview' },
	{ from: '/docs/deployments/harperdb-cli', to: '/reference/v5/cli/overview' },
	{ from: '/docs/administration/harperdb-cli', to: '/reference/v5/cli/overview' },
	{ from: '/docs/deployments/install-harper/harper-cli', to: '/reference/v5/cli/overview' },
	{ from: '/docs/cli', to: '/reference/v5/cli/overview' },

	// ── Install / Upgrade (no equivalent page in /reference/) ─────────────────
	{ from: '/docs/deployments/install-harper', to: '/learn/getting-started/install-and-connect-harper' },
	{ from: '/docs/deployments/install-harper/linux', to: '/learn/getting-started/install-and-connect-harper' },
	{ from: '/docs/deployments/upgrade-hdb-instance', to: '/learn' },
	{ from: '/docs/administration/upgrade-hdb-instance', to: '/learn' },

	// ── Harper Cloud → Legacy (v4 only, no v5 equivalent) ─────────────────────
	{ from: '/docs/deployments/harper-cloud', to: '/reference/v4/legacy/cloud' },
	{ from: '/docs/deployments/harperdb-cloud', to: '/reference/v4/legacy/cloud' },
	{ from: '/docs/deployments/harper-cloud/alarms', to: '/reference/v4/legacy/cloud' },
	{ from: '/docs/deployments/harper-cloud/iops-impact', to: '/reference/v4/legacy/cloud' },
	{ from: '/docs/deployments/harper-cloud/verizon-5g-wavelength-instances', to: '/reference/v4/legacy/cloud' },
	{ from: '/docs/deployments/harper-cloud/instance-size-hardware-specs', to: '/reference/v4/legacy/cloud' },

	// ── Studio ────────────────────────────────────────────────────────────────
	{ from: '/docs/administration/harper-studio', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harper-studio/create-account', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harper-studio/login-password-reset', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harper-studio/instances', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harper-studio/instance-metrics', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harper-studio/instance-configuration', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harper-studio/manage-databases-browse-data', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harper-studio/manage-instance-users', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harper-studio/manage-applications', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harper-studio/enable-mixed-content', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harper-studio/query-instance-data', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harper-studio/organizations', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harper-studio/manage-instance-roles', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harperdb-studio/', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harperdb-studio/manage-applications', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harperdb-studio/instances', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harperdb-studio/organizations', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harperdb-studio/create-account', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harperdb-studio/create-an-account', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harperdb-studio/login-password-reset', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harperdb-studio/instance-configuration', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harperdb-studio/instance-metrics', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harperdb-studio/instance-example-code', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harperdb-studio/manage-databases-browse-data', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harperdb-studio/manage-schemas-browse-data', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harperdb-studio/manage-instance-users', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harperdb-studio/manage-instance-roles', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harperdb-studio/manage-charts', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harperdb-studio/manage-replication', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harperdb-studio/manage-clustering', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harperdb-studio/manage-functions', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harperdb-studio/enable-mixed-content', to: '/reference/v5/studio/overview' },
	{ from: '/docs/administration/harperdb-studio/query-instance-data', to: '/reference/v5/studio/overview' },

	// ── Logging ───────────────────────────────────────────────────────────────
	{ from: '/docs/administration/logging', to: '/reference/v5/logging/overview' },
	{ from: '/docs/administration/logging/standard-logging', to: '/reference/v5/logging/overview' },
	{ from: '/docs/administration/logging/audit-logging', to: '/reference/v5/logging/overview' },
	{ from: '/docs/administration/logging/transaction-logging', to: '/reference/v5/logging/overview' },

	// ── Administration: other ─────────────────────────────────────────────────
	{ from: '/docs/administration/cloning', to: '/reference/v5/replication/overview' },
	{ from: '/docs/administration/compact', to: '/reference/v5/database/compaction' },
	{ from: '/docs/administration/jobs', to: '/reference/v5/database/jobs' },

	// ── Old /docs/reference/* ─────────────────────────────────────────────────
	{ from: '/docs/reference', to: '/reference/v5' },
	{ from: '/docs/reference/globals', to: '/reference/v5/components/javascript-environment' },
	{ from: '/docs/reference/resources', to: '/reference/v5/resources/overview' },
	{ from: '/docs/reference/resources/instance-binding', to: '/reference/v5/resources/resource-api' },
	{ from: '/docs/reference/resources/migration', to: '/reference/v5/database/data-loader' },
	{ from: '/docs/reference/resources/query-optimization', to: '/reference/v5/resources/query-optimization' },
	{ from: '/docs/reference/components', to: '/reference/v5/components/overview' },
	{ from: '/docs/reference/components/built-in-extensions', to: '/reference/v5/components/extension-api' },
	{ from: '/docs/reference/components/extensions', to: '/reference/v5/components/extension-api' },
	{ from: '/docs/reference/components/plugins', to: '/reference/v5/components/plugin-api' },
	{ from: '/docs/reference/components/applications', to: '/reference/v5/components/applications' },
	{ from: '/docs/reference/components/configuration', to: '/reference/v5/components/overview' },
	{ from: '/docs/reference/analytics', to: '/reference/v5/analytics/overview' },
	{ from: '/docs/reference/dynamic-schema', to: '/reference/v5/database/schema' },
	{ from: '/docs/reference/data-types', to: '/reference/v5/database/schema' },
	{ from: '/docs/reference/blob', to: '/reference/v5/database/schema' },
	{ from: '/docs/reference/transactions', to: '/reference/v5/database/transaction' },
	{ from: '/docs/reference/graphql', to: '/reference/v5/graphql-querying/overview' },
	{ from: '/docs/reference/content-types', to: '/reference/v5/rest/content-types' },
	{ from: '/docs/reference/headers', to: '/reference/v5/rest/headers' },
	{ from: '/docs/reference/roles', to: '/reference/v5/users-and-roles/overview' },
	{ from: '/docs/reference/storage-algorithm', to: '/reference/v5/database/storage-algorithm' },
	{ from: '/docs/reference/limits', to: '/reference/v5/database/schema' },
	{ from: '/docs/reference/architecture', to: '/reference/v5' },
	{ from: '/docs/reference/clustering', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/reference/clustering/enabling-clustering', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/reference/clustering/establishing-routes', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/reference/clustering/subscription-overview', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/reference/clustering/managing-subscriptions', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/reference/clustering/things-worth-knowing', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/reference/clustering/certificate-management', to: '/reference/v5/security/certificate-management' },
	{ from: '/docs/reference/clustering/creating-a-cluster-user', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/reference/clustering/naming-a-node', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/reference/clustering/requirements-and-definitions', to: '/reference/v5/replication/clustering' },
	{ from: '/docs/reference/sql-guide', to: '/reference/v5/database/sql' },
	{ from: '/docs/reference/sql-guide/json-search', to: '/reference/v5/database/sql' },
	{ from: '/docs/reference/sql-guide/date-functions', to: '/reference/v5/database/sql' },
	{ from: '/docs/reference/sql-guide/functions', to: '/reference/v5/database/sql' },
	{ from: '/docs/reference/sql-guide/sql-geospatial-functions', to: '/reference/v5/database/sql' },
	{ from: '/docs/reference/sql-guide/reserved-word', to: '/reference/v5/database/sql' },
	{ from: '/docs/reference/sql-guide/features-matrix', to: '/reference/v5/database/sql' },

	// ── Old /docs/reference/* (continued) ─────────────────────────────────────
	{ from: '/docs/reference/rest', to: '/reference/v5/rest/overview' },
	{ from: '/docs/reference/command-line-interface', to: '/reference/v5/cli/overview' },
	{ from: '/docs/reference/configuration-file', to: '/reference/v5/configuration/overview' },
	{ from: '/docs/reference/security/roles-and-permissions', to: '/reference/v5/users-and-roles/overview' },
	{ from: '/docs/reference/Applications/defining-roles', to: '/reference/v5/users-and-roles/overview' },
	{ from: '/docs/reference/api/roles/add-role', to: '/reference/v5/users-and-roles/operations' },

	// ── Old /technical-details/reference/* (pre-v4 paths, no version prefix) ──
	{ from: '/technical-details/reference/resources', to: '/reference/v5/resources/overview' },
	{ from: '/docs/technical-details/reference/resource', to: '/reference/v5/resources/overview' },

	// ── Old /docs/administration/administration ────────────────────────────────
	{ from: '/docs/administration/administration', to: '/reference/v5' },
	{ from: '/docs/administration', to: '/reference/v5' },
	{ from: '/docs/deployments', to: '/reference/v5' },

	// ── Release notes ─────────────────────────────────────────────────────────
	// Only non-versioned paths seen in pageview data.
	{ from: '/docs/technical-details/release-notes', to: '/release-notes' },
	{ from: '/docs/release-notes/4.tucker/4.0.3', to: '/release-notes' },
	{ from: '/docs/release-notes/4.tucker/4.0.5', to: '/release-notes' },
	{ from: '/docs/release-notes/1.alby', to: '/release-notes' },
	{ from: '/docs/release-notes/1.alby/1.2.0', to: '/release-notes' },
	{ from: '/docs/release-notes/1.alby/1.3.0', to: '/release-notes' },
	{ from: '/docs/release-notes/2.penny/2.2.0', to: '/release-notes' },
	{ from: '/docs/release-notes/2.penny/2.3.1', to: '/release-notes' },
	{ from: '/docs/release-notes/3.monkey', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/1.3.0', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/1.3.1', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/1.alby', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/1.alby/1.2.0', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/1.alby/1.3.0', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/1.alby/1.3.1', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/2.1.1', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/2.2.0', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/2.2.3', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/2.3.1', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/2.penny', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/2.penny/2.2.2', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/2.penny/2.2.3', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/2.penny/2.3.0', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/2.penny/2.3.1', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/3.0.0', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/3.1.0', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/3.1.1', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/3.1.2', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/3.1.3', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/3.1.4', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/3.1.5', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/3.2.0', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/3.2.1', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/3.monkey', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/3.monkey/3.1.2', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/3.monkey/3.1.3', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/4.tucker', to: '/release-notes' },
	{ from: '/docs/technical-details/release-notes/4.tucker/4.alby/1.3.0', to: '/release-notes' },

	// ── Misc old paths (pre-v4, no /docs prefix) ──────────────────────────────
	{ from: '/developers/applications', to: '/reference/v5/components/applications' },
	{ from: '/developers/components/built-in', to: '/reference/v5/components/extension-api' },
	{ from: '/technical-details/reference/globals', to: '/reference/v5/components/javascript-environment' },
	{ from: '/harperdb-4.2-pre-release/getting-started', to: '/learn' },
	{ from: '/harperdb-4.3-pre-release/developers/rest', to: '/reference/v5/rest/overview' },
	{ from: '/docs/api/ops-api', to: '/reference/v5/operations-api/overview' },

	// ── Learn ─────────────────────────────────────────────────────────────────
	{ from: '/learn/developers/coming-soon', to: '/learn' },

	// ── Fabric ────────────────────────────────────────────────────────────────
	{ from: '/fabric/rest-api', to: '/fabric' },
	{ from: '/fabric/functions', to: '/fabric' },
];

export const redirects: RedirectRule[] = [...currentRedirects, ...historicRedirects];

// ─── Wildcard / dynamic redirects ────────────────────────────────────────────
// Called by Docusaurus for every existing page path to generate inbound redirects.

export function createRedirects(_existingPath: string): string[] | undefined {
	// No dynamic redirects needed at this time.
	// The versioned /docs/4.X/ roots are real Docusaurus-built directories and
	// cannot be redirected via this plugin (postbuild.js would conflict).
	return undefined;
}
