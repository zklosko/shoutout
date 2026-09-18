import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { requests } from '$lib/server/db/schema';
import { and, eq, desc } from 'drizzle-orm';
import { sendChildNumber } from '$lib/server/api';
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

		const row = await db.select().from(requests).where(eq(requests.id, id)).get();
		if (!row) return fail(404, { error: 'Request not found.' });

		const results = await sendChildNumber(row.childNumber, row.note);
		if (results.length === 0) {
			await db.update(requests).set({ status: 'Failed' }).where(eq(requests.id, id));
			return fail(400, { error: 'No display services are configured. Set one up in Settings.' });
		}

		const failures = results.filter((r) => !r.success);
		if (failures.length === results.length) {
			await db.update(requests).set({ status: 'Failed' }).where(eq(requests.id, id));
			return fail(502, { error: `Send failed: ${failures.map((f) => `${f.service} (${f.error})`).join(', ')}` });		}

		await db.update(requests).set({ status: 'Sent' }).where(eq(requests.id, id));

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
