import { useEffect } from 'react';
import { useHistory } from '@docusaurus/router';

export default function ReferenceRedirect() {
	const history = useHistory();

	useEffect(() => {
		// Redirect to the v4 reference docs
		history.replace('/reference/v4');
	}, [history]);

	return null;
}
