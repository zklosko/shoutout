import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/auth.schema';
import { count } from 'drizzle-orm';
import { flushOldRequests } from '$lib/server/maintenance';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		// Only hits the DB when there's no session anyway, so this adds
		// no cost to the normal logged-in path.
		const [{ value: userCount }] = await db.select({ value: count() }).from(user);

		if (userCount === 0) {
			throw redirect(303, '/setup');
		}

		const redirectTo = url.pathname + url.search;
		throw redirect(303, `/login?redirectTo=${encodeURIComponent(redirectTo)}`);
	}

	// Forced password change check
	if (locals.user.mustChangePassword && url.pathname !== '/account') {
		throw redirect(303, '/account?firstLogin=true');
	}

	flushOldRequests();

	return {
		user: locals.user
	};
};
