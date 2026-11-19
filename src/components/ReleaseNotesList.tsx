import React from 'react';
import Link from '@docusaurus/Link';

// Import the release notes data statically
// This will be populated at build time
const releaseNotesData = require('@site/release-notes-data.json');

interface ReleaseData {
	pupName: string;
	hasProfilePage: boolean;
	versions: string[];
}

// The pup's own page, or the major's index page when the pup is introduced there.
function meetPath(major: number, releaseData: ReleaseData): string {
	const pup = releaseData.pupName.toLowerCase();
	return `/release-notes/v${major}-${pup}/${releaseData.hasProfilePage ? pup : ''}`;
}

export default function ReleaseNotesList(): React.JSX.Element {
	const versionsByMajor = releaseNotesData as Record<string, ReleaseData>;

	// Get sorted major versions
	const majorVersions = Object.keys(versionsByMajor)
		.map((v) => parseInt(v))
		.sort((a, b) => b - a);

	const currentMajor = majorVersions[0];
	const previousMajors = majorVersions.slice(1);

	return (
		<>
			{currentMajor && versionsByMajor[currentMajor] && (
				<>
					<h2>{`Current Release - Version ${currentMajor} (${versionsByMajor[currentMajor].pupName})`}</h2>

					<p>
						<Link to={meetPath(currentMajor, versionsByMajor[currentMajor])}>
							{`Meet ${versionsByMajor[currentMajor].pupName}`}
						</Link>
						{` Our ${currentMajor === 1 ? '1st' : currentMajor === 2 ? '2nd' : currentMajor === 3 ? '3rd' : `${currentMajor}th`} Release Pup`}
					</p>

					<ol style={{ listStyleType: 'none', paddingLeft: 0 }}>
						{versionsByMajor[currentMajor].versions.map((version: string) => (
							<li key={version}>
								<Link
									to={`/release-notes/v${currentMajor}-${versionsByMajor[currentMajor].pupName.toLowerCase()}/${version}`}
								>
									{`${version} ${versionsByMajor[currentMajor].pupName}`}
								</Link>
							</li>
						))}
					</ol>
				</>
			)}

			{previousMajors.length > 0 && (
				<>
					<h2>Previous Major Releases</h2>

					{previousMajors.map((major) => {
						const releaseData = versionsByMajor[major];
						if (!releaseData || releaseData.versions.length === 0) return null;

						return (
							<div key={major}>
								<h3>{`Version ${major} - ${releaseData.pupName}`}</h3>

								<p>
									<Link to={meetPath(major, releaseData)}>{`Meet ${releaseData.pupName}`}</Link>
									{` Our ${major === 1 ? '1st' : major === 2 ? '2nd' : major === 3 ? '3rd' : `${major}th`} Release Pup`}
								</p>

								<ol style={{ listStyleType: 'none', paddingLeft: 0 }}>
									{releaseData.versions.map((version: string) => (
										<li key={version}>
											<Link to={`/release-notes/v${major}-${releaseData.pupName.toLowerCase()}/${version}`}>
												{`${version} ${releaseData.pupName}`}
											</Link>
										</li>
									))}
								</ol>
							</div>
						);
					})}
				</>
			)}
		</>
	);
}
