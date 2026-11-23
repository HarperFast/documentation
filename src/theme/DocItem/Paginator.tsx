import React from 'react';
import DocItemPaginator from '@theme-original/DocItem/Paginator';
import PaginatorNavLink from '@theme/PaginatorNavLink';
import { useActivePlugin, useDoc } from '@docusaurus/plugin-content-docs/client';

type NavLink = { permalink: string; title: string };

// Release note pages end in their version: ".../4.6.8" or ".../5.3".
function parseVersion(permalink: string): number[] | null {
	const match = permalink.match(/\/(\d+)\.(\d+)(?:\.(\d+))?$/);
	return match ? [Number(match[1]), Number(match[2]), Number(match[3] ?? 0)] : null;
}

function compareVersions(a: number[], b: number[]): number {
	return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

// The release notes sidebar lists versions newest first, so the stock "Previous" link points to a
// newer release. On a version page, link the adjacent versions as older (left) and newer (right).
// Neighbors that aren't versions, such as a major's index page, stay reachable from the sidebar.
function ReleaseNotesPaginator(): React.JSX.Element {
	const { metadata } = useDoc();
	const current = parseVersion(metadata.permalink);
	if (!current) return <DocItemPaginator />;

	let older: NavLink | undefined;
	let newer: NavLink | undefined;
	for (const link of [metadata.previous, metadata.next]) {
		const version = link && parseVersion(link.permalink);
		if (!version) continue;
		if (compareVersions(version, current) < 0) older = link;
		else newer = link;
	}

	return (
		<nav className="docusaurus-mt-lg pagination-nav" aria-label="Release notes">
			{older && <PaginatorNavLink {...older} subLabel="Older release" />}
			{newer && <PaginatorNavLink {...newer} subLabel="Newer release" isNext />}
		</nav>
	);
}

export default function DocItemPaginatorWrapper(): React.JSX.Element | null {
	const activePlugin = useActivePlugin();
	if (activePlugin?.pluginId === 'reference') return null;
	if (activePlugin?.pluginId === 'release-notes') return <ReleaseNotesPaginator />;
	return <DocItemPaginator />;
}
