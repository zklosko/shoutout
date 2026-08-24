import { db } from '$lib/server/db';
import { settings } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const row = await db.select().from(settings).where(eq(settings.id, 'default')).get();
	return { settings: row ?? { flushRetentionDays: 7 } };
};

export const actions: Actions = {
	updateSettings: async ({ request }) => {
		const form = await request.formData();
		const flushRetentionDays = Number(form.get('flushRetentionDays'));

		if (!flushRetentionDays || flushRetentionDays < 1) {
			return fail(400, { error: 'Retention must be at least 1 day.', flushRetentionDays });
		}

		await db.insert(settings).values({ id: 'default', flushRetentionDays }).onConflictDoUpdate({
			target: settings.id,
			set: { flushRetentionDays }
		});

		return { success: true };
	}
};
