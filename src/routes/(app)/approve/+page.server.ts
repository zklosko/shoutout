import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { requests } from '$lib/server/db/schema';
import { and, eq, desc } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { logEvent } from '$lib/server/log';

export const load: PageServerLoad = async () => {
	const pending = await db
		.select()
		.from(requests)
		.where(eq(requests.status, 'Pending'))
		.orderBy(desc(requests.submittedAt));

	return { pending };
};

export const actions: Actions = {
	approve: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id')?.toString();
		if (!id) return fail(400, { error: 'Missing request id.' });

		// Status goes to 'approved' here, not 'sent' — the ProPresenter push
		// (once wired up) is what moves it to 'sent' or 'failed'. Keeping these
		// as separate steps means the approval decision is recorded even if the
		// ProPresenter call fails afterward, instead of the two being conflated.
		const result = await db
			.update(requests)
			.set({
				status: 'Approved',
				reviewedBy: locals.user!.id,
				reviewedAt: new Date()
			})
			.where(and(eq(requests.id, id), eq(requests.status, 'Pending')));

		if (result.changes === 0) {
			return fail(409, { error: 'Someone already handled this request.' });
		}

		// Log approval of request
		await logEvent({
			action: 'request.approved',
			actorId: locals.user!.id,
			actorName: locals.user!.name,
			targetType: 'request',
			targetId: id,
			details: 'Approved request'
		});

		return { success: true };
	},

	reject: async ({ request, locals }) => {
		const form = await request.formData();
		const id = form.get('id')?.toString();
		if (!id) return fail(400, { error: 'Missing request id.' });

		const result = await db
			.update(requests)
			.set({
				status: 'Rejected',
				reviewedBy: locals.user!.id,
				reviewedAt: new Date()
			})
			.where(and(eq(requests.id, id), eq(requests.status, 'Pending')));

		if (result.changes === 0) {
			return fail(409, { error: 'Someone already handled this request.' });
		}

		// Log rejection of request
		await logEvent({
			action: 'request.rejected',
			actorId: locals.user!.id,
			actorName: locals.user!.name,
			targetType: 'request',
			targetId: id,
			details: 'Rejected request'
		});

		return { success: true };
	}
};
