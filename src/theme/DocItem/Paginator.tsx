import React from 'react';
import DocItemPaginator from '@theme-original/DocItem/Paginator';
import { useActivePlugin } from '@docusaurus/plugin-content-docs/client';

export default function DocItemPaginatorWrapper() {
	const activePlugin = useActivePlugin();
	return activePlugin?.pluginId === 'reference' ? null : <DocItemPaginator />;
}
