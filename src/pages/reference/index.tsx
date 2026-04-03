import { useEffect } from 'react';
import { useHistory } from '@docusaurus/router';

export default function ReferenceRedirect() {
	const history = useHistory();

	useEffect(() => {
		// Redirect to the latest reference docs
		history.replace('/reference/v4');
	}, [history]);

	return null;
}
