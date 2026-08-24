import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { requests } from '$lib/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const pendingRequests = await db
		.select()
		.from(requests)
		.where(and(eq(requests.submittedBy, locals.user!.id), eq(requests.status, 'Pending')))
		.orderBy(desc(requests.submittedAt))
		.limit(10);

	return { pendingRequests };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const childNumber = form.get('childNumber')?.toString().trim();
		const note = form.get('note')?.toString().trim() || null;

		if (!childNumber) {
			return fail(400, { error: 'Child number is required', childNumber, note });
		}

		// Very loose validation. Tighen up or make a setting.
		if (childNumber.length > 20) {
			return fail(400, {
				error: 'That number looks too long -- double check it.',
				childNumber,
				note
			});
		}

		await db.insert(requests).values({
			childNumber,
			note,
			submittedBy: locals.user!.id
		});

		return { success: true };
	}
};
