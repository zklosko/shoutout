import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

const ALLOWED_ROLES = ['admin'];

export const load: LayoutServerLoad = async ({ locals }) => {
	// Checking role on guarenteed user account
	if (!ALLOWED_ROLES.includes(locals.user!.role)) {
		throw error(403, 'Your account does not have admin access.');
	}

	return {};
};
