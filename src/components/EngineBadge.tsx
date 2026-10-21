import React from 'react';
import styles from './EngineBadge.module.css';

const CANONICAL_NAMES: Record<string, string> = {
	rocksdb: 'RocksDB',
	lmdb: 'LMDB',
};

interface EngineBadgeProps {
	/** Comma-separated storage engines, e.g. "RocksDB" or "RocksDB, LMDB" */
	engines: string;
}

export default function EngineBadge({ engines }: EngineBadgeProps) {
	const names = engines.split(',').map((engine) => {
		const trimmed = engine.trim();
		return CANONICAL_NAMES[trimmed.toLowerCase()] ?? trimmed;
	});
	return (
		<span className={styles.badge}>
			{names.length > 1 ? 'Engines' : 'Engine'}: {names.join(', ')}
		</span>
	);
}
