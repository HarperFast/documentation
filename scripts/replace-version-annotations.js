#!/usr/bin/env node
// Replaces plain-text "Added in: vX.Y.Z", "Changed in: vX.Y.Z", "Deprecated in: vX.Y.Z"
// standalone lines with <VersionBadge> JSX components in all v4 reference docs.

const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../reference');

const typeMap = { Added: 'added', Changed: 'changed', Deprecated: 'deprecated' };

function walk(d) {
	return fs.readdirSync(d).flatMap((f) => {
		const p = path.join(d, f);
		return fs.statSync(p).isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : [];
	});
}

let changed = 0;

for (const file of walk(dir)) {
	let src = fs.readFileSync(file, 'utf8');

	// Match standalone lines: "Added in: v4.3.0" or "Added in: v4.3.0 (some note)"
	let out = src.replace(/^(Added|Changed|Deprecated) in: (v[\d]+\.[\d]+(?:\.[\d]+)?)(.*)?$/gm, (_, word, ver, rest) => {
		const type = typeMap[word];
		const note = rest ? rest.trim() : '';
		const tag =
			type === 'added' ? `<VersionBadge version="${ver}" />` : `<VersionBadge type="${type}" version="${ver}" />`;
		return note ? `${tag} ${note}` : tag;
	});

	if (out !== src) {
		fs.writeFileSync(file, out);
		changed++;
		console.log('updated:', path.relative(dir, file));
	}
}

console.log(`\nDone. ${changed} file(s) updated.`);
