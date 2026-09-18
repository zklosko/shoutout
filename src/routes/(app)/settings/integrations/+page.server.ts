import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { integrations, companionSettings } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const connection = await db.select().from(integrations).where(eq(integrations.type, 'companion')).get()
	const settings = await db
		.select()
		.from(companionSettings)
		.where(eq(companionSettings.type, 'companion'))
		.get()
	
		return {
			connection: connection ?? { type: 'companion' as const, host: '', port: null, enabled: false },
			settings: settings ?? { type: 'companion' as const, page: 1, row: 0, col: 0}
		}
};

export const actions: Actions = {
	save: async ({ request }) => {
		const form = await request.formData();
		const host = form.get('host')?.toString().trim();
		const port = Number(form.get('port'));
		const enabled = form.get('enabled') === 'on';
		const page = Number(form.get('page')) || 1;
		const row = Number(form.get('row')) || 0;
		const col = Number(form.get('col')) || 0;

		if (!host || !port) {
			return fail(400, { error: 'Host and port are required.', host, port: form.get('port') });
		}

		await db.insert(integrations).values({ type: 'companion', host, port, enabled })
			.onConflictDoUpdate({ target: integrations.type, set: {host, port, enabled}});
		
		await db
			.insert(companionSettings)
			.values({ type: 'companion', page, row, col })
			.onConflictDoUpdate({ target: companionSettings.type, set: { page, row, col } })
		
		return { success: true };
	},
};
