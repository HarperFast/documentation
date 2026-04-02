import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import { filterDocCardListItems } from '@docusaurus/plugin-content-docs/client';
import Heading from '@theme/Heading';
import styles from './CustomDocCardList.module.css';

interface CustomDocCardListProps {
	items: any[];
	columns?: number;
	className?: string;
}

function CustomDocCard({ item }: { item: any }) {
	return (
		<Link href={item.href} className={clsx('card padding--lg', styles.customCard)}>
			{item.badge && <span className={styles.cardBadge}>{item.badge}</span>}
			<Heading as="h2" className={styles.cardTitle}>
				{item.label}
			</Heading>
			{item.description && <p className={styles.cardDescription}>{item.description}</p>}
		</Link>
	);
}

export default function CustomDocCardList({ items, columns = 2, className }: CustomDocCardListProps) {
	const filteredItems = filterDocCardListItems(items);

	return (
		<div className={clsx(styles.cardGrid, className)} style={{ '--columns': columns } as React.CSSProperties}>
			{filteredItems.map((item, index) => (
				<div key={index}>
					<CustomDocCard item={item} />
				</div>
			))}
		</div>
	);
}
