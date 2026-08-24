import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Everyone lands here first, but there's nothing to show at '/' itself —
// send them straight into the app. This runs before the (app) guard
// checks for a session, so a logged-out user still gets bounced through
// to /login (with redirectTo=/submit) rather than seeing anything here.
export const load: PageServerLoad = async () => {
	throw redirect(303, '/submit');
};
