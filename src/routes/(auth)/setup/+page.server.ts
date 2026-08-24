import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/auth.schema';
import { count, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// This is what makes the page a one-time thing: once a single user
	// exists, this route refuses to render at all, permanently. There's no
	// "delete this route later" step to remember.
	const [{ value: userCount }] = await db.select({ value: count() }).from(user);
	if (userCount > 0) {
		throw redirect(303, '/login');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		// Re-check inside the action too, not just in load — closes the gap
		// where two people could both load this page before either submits.
		const [{ value: userCount }] = await db.select({ value: count() }).from(user);
		if (userCount > 0) {
			return fail(400, { error: 'Setup has already been completed.' });
		}

		const form = await request.formData();
		const name = form.get('name')?.toString().trim();
		const email = form.get('email')?.toString().trim();
		const password = form.get('password')?.toString();
		const confirmPassword = form.get('confirmPassword')?.toString();

		if (!name || !email || !password) {
			return fail(400, { error: 'All fields are required.', name, email });
		}
		if (password.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters.', name, email });
		}
		if (password !== confirmPassword) {
			return fail(400, { error: 'Passwords do not match.', name, email });
		}

		const result = await auth.api.signUpEmail({ body: { name, email, password } });
		if (!result?.user) {
			return fail(400, { error: 'Could not create that account.', name, email });
		}

		// CHANGED: also clear mustChangePassword — the first admin picked
		// their own password just now, so they shouldn't be forced to
		// change it again on next login like admin-created accounts are.
		await db
			.update(user)
			.set({ role: 'admin', mustChangePassword: false })
			.where(eq(user.id, result.user.id));

		throw redirect(303, '/login');
	}
};
