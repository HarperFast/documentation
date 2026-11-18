import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

// Ordered as a path: set up, build, go live, monitor, then automate.
// Docusaurus's previous/next links follow this order, so each page leads to the next step.
const sidebarsFabric: SidebarsConfig = {
	fabricSidebar: [
		{
			type: 'doc',
			id: 'index',
			label: 'Overview',
		},
		{
			type: 'category',
			label: 'Get Started',
			collapsible: false,
			className: 'learn-category-header',
			items: [
				{
					type: 'doc',
					id: 'create-account',
					label: 'Create an Account',
				},
				{
					type: 'doc',
					id: 'create-organization',
					label: 'Create an Organization',
				},
				{
					type: 'doc',
					id: 'cluster-creation-management',
					label: 'Create & Manage Clusters',
				},
				{
					type: 'doc',
					id: 'organization-management',
					label: 'Invite Your Team',
				},
				{
					type: 'doc',
					id: 'search',
					label: 'Find Your Way with Search',
				},
			],
		},
		{
			type: 'category',
			label: 'Build',
			collapsible: false,
			className: 'learn-category-header',
			items: [
				{
					type: 'doc',
					id: 'managing-applications',
					label: 'Deploy Applications',
				},
				{
					type: 'doc',
					id: 'database-management',
					label: 'Manage Data',
				},
				{
					type: 'doc',
					id: 'cluster-api-explorer',
					label: 'Explore Your APIs',
				},
			],
		},
		{
			type: 'category',
			label: 'Go Live',
			collapsible: false,
			className: 'learn-category-header',
			items: [
				{
					type: 'doc',
					id: 'custom-domains',
					label: 'Custom Domains',
				},
				{
					type: 'doc',
					id: 'load-balancing',
					label: 'Load Balancing & Node Availability',
				},
			],
		},
		{
			type: 'category',
			label: 'Monitor',
			collapsible: false,
			className: 'learn-category-header',
			items: [
				{
					type: 'doc',
					id: 'logging',
					label: 'Logs',
				},
				{
					type: 'doc',
					id: 'grafana-integration',
					label: 'Grafana Integration',
				},
			],
		},
		{
			type: 'category',
			label: 'Administer',
			collapsible: false,
			className: 'learn-category-header',
			items: [
				// The same page as Get Started's "Invite Your Team", listed again for people
				// managing an existing organization. A link item, so previous/next and the
				// active highlight stay with the Get Started entry.
				{
					type: 'link',
					href: '/fabric/organization-management',
					label: 'Users & Roles',
				},
			],
		},
		{
			type: 'category',
			label: 'Automate',
			collapsible: false,
			className: 'learn-category-header',
			items: [
				{
					type: 'doc',
					id: 'api-reference',
					label: 'Fabric API Reference',
				},
			],
		},
	],
};

export default sidebarsFabric;
