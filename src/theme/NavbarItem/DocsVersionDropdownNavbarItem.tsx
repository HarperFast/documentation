import React from 'react';
import DocsVersionDropdownNavbarItem from '@theme-original/NavbarItem/DocsVersionDropdownNavbarItem';
import { useActivePlugin } from '@docusaurus/plugin-content-docs/client';
import type { Props } from '@theme/NavbarItem/DocsVersionDropdownNavbarItem';

export default function DocsVersionDropdownNavbarItemWrapper(props: Props) {
	const activePlugin = useActivePlugin();
	return activePlugin?.pluginId !== 'reference' ? null : <DocsVersionDropdownNavbarItem {...props} />;
}
