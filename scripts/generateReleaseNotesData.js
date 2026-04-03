const fs = require('node:fs');
const path = require('node:path');

const pupNames = {
	5: 'Lincoln',
	4: 'Tucker',
	3: 'Monkey',
	2: 'Penny',
	1: 'Alby',
};

function parseVersion(version) {
	const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
	if (!match) return null;

	const major = parseInt(match[1], 10);
	const minor = parseInt(match[2], 10);
	const patch = parseInt(match[3], 10);

	return {
		version,
		major,
		minor,
		patch,
	};
}

function compareVersions(a, b) {
	// Sort by major, minor, patch (newest first)
	if (a.major !== b.major) return b.major - a.major;
	if (a.minor !== b.minor) return b.minor - a.minor;
	return b.patch - a.patch;
}

function getReleaseNotes() {
	const releaseNotesDir = path.join(__dirname, '..', 'release-notes');
	const versionsByMajor = {};

	// Read all subdirectories in release-notes
	const subdirs = fs
		.readdirSync(releaseNotesDir, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

	subdirs.forEach((subdir) => {
		const subdirPath = path.join(releaseNotesDir, subdir);
		const files = fs.readdirSync(subdirPath);

		files.forEach((file) => {
			// Match version pattern in filename (e.g., "4.6.8.md")
			const match = file.match(/^(\d+\.\d+\.\d+)\.md$/);
			if (match) {
				const version = parseVersion(match[1]);
				if (version) {
					const major = version.major;
					if (!versionsByMajor[major]) {
						versionsByMajor[major] = {
							pupName: pupNames[major] || 'Unknown',
							versions: [],
						};
					}
					versionsByMajor[major].versions.push(version);
				}
			}
		});
	});

	// Sort versions within each major version and simplify to just version strings
	Object.keys(versionsByMajor).forEach((major) => {
		versionsByMajor[major].versions = versionsByMajor[major].versions.sort(compareVersions).map((v) => v.version);
	});

	return versionsByMajor;
}

function generateReleaseNotesData() {
	const data = getReleaseNotes();
	const outputPath = path.join(__dirname, '..', 'release-notes-data.json');

	fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
	console.log(`Generated release notes data at ${outputPath}`);
	console.log(`Found ${Object.keys(data).length} major versions`);

	return data;
}

// Export the function for use in other scripts
module.exports = generateReleaseNotesData;

// If this script is run directly (not imported), execute the function
if (require.main === module) {
	generateReleaseNotesData();
}
