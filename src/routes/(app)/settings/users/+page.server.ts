import { fail } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { requests } from '$lib/server/db/schema';
import { user, session, account } from '$lib/server/db/auth.schema';
import { and, count, eq, inArray } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

const ROLES = ['submitter', 'approver', 'admin'] as const;

function isValidRole(r: string | undefined): r is (typeof ROLES)[number] {
	return !!r && ROLES.includes(r as (typeof ROLES)[number]);
}

export const load: PageServerLoad = async ({ locals }) => {
	const users = await db.select().from(user).orderBy(user.name);
	return { users, currentUserId: locals.user!.id };
};

export const actions: Actions = {
	updateRole: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id')?.toString();
		const role = form.get('role')?.toString();

		if (!id || !isValidRole(role)) {
			return fail(400, { error: 'Invalid role update.' });
		}

		if (id === locals.user!.id && role !== 'admin') {
			return fail(400, { error: "You can't remove your own admin access." });
		}

		await db.update(user).set({ role }).where(eq(user.id, id));
		return { success: true };
	},

	createUser: async ({ request }) => {
		const form = await request.formData();
		const name = form.get('name')?.toString().trim();
		const email = form.get('email')?.toString().trim();
		const password = form.get('password')?.toString();
		const role = form.get('role')?.toString();

		if (!name || !email || !password) {
			return fail(400, { error: 'Name, email, and password are all required.', name, email });
		}
		if (password.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters.', name, email });
		}
		if (!role || !isValidRole(role)) {
			return fail(400, { error: 'Invalid role.', name, email });
		}

		// signUpEmail runs the normal sign-up flow (hashing, the user record,
		// etc.) but does NOT log the admin out or change the current session —
		// it's a server-side API call, not a browser sign-up.
		const result = await auth.api.signUpEmail({ body: { name, email, password } });

		if (!result?.user) {
			return fail(400, {
				error: 'Could not create that account.',
				name,
				email
			});
		}

		// role is input:false in auth.ts on purpose (so users can't self-assign
		// it) — this direct DB write is the deliberate admin-only bypass.
		await db.update(user).set({ role }).where(eq(user.id, result.user.id));

		return { success: true, created: email };
	},

	deleteUser: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id')?.toString();
		if (!id) return fail(400, { error: 'Missing user id.' });

		if (id === locals.user!.id) {
			return fail(400, { error: "You can't delete your own account." });
		}

		const [{ value: requestCount }] = await db
			.select({ value: count() })
			.from(requests)
			.where(and(eq(requests.submittedBy, id), inArray(requests.status, ['Pending', 'Failed'])));

		if (requestCount > 0) {
			return fail(400, {
				error: `This user has ${requestCount} request(s) on record and can't be deleted.`
			});
		}

		// Flush requests that have been resolved by a approver
		await db
			.delete(requests)
			.where(
				and(
					eq(requests.submittedBy, id),
					inArray(requests.status, ['Approved', 'Rejected', 'Sent'])
				)
			);

		// Clear non-dangling reviewers
		await db.update(requests).set({ reviewedBy: null }).where(eq(requests.reviewedBy, id));

		await db.delete(session).where(eq(session.userId, id));
		await db.delete(account).where(eq(account.userId, id));
		await db.delete(user).where(eq(user.id, id));

		return { success: true };
	}
};
