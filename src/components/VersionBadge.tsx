import React from 'react';
import styles from './VersionBadge.module.css';

type VersionBadgeType = 'added' | 'changed' | 'deprecated' | 'stable';

const LABELS: Record<VersionBadgeType, string> = {
	added: 'Added in',
	changed: 'Changed in',
	deprecated: 'Deprecated in',
	stable: 'Stable in',
};

interface VersionBadgeProps {
	type?: VersionBadgeType;
	version: string;
}

export default function VersionBadge({ type = 'added', version }: VersionBadgeProps) {
	return (
		<span className={styles.badge}>
			{LABELS[type]}: {version}
		</span>
	);
}
