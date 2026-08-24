import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { integrations } from '$lib/server/db/schema';
import type {
	ProPresenterSettings,
	CompanionSettings,
	FreeShowSettings
} from '$lib/server/db/integration-settings';
import {
	parseProPresenterSettings,
	parseCompanionSettings
} from '$lib/server/db/integration-settings';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const targets = await db.select().from(integrations).orderBy(integrations.label);
	const withParsedSettings = targets.map((t) => ({
		...t,
		parsedSettings:
			t.type === 'propresenter'
				? parseProPresenterSettings(t.settings)
				: parseCompanionSettings(t.settings)
	}));
	return { targets: withParsedSettings };
};

const INTEGRATION_TYPES = ['propresenter', 'companion', 'freeshow'] as const;
type IntegrationType = (typeof INTEGRATION_TYPES)[number];
function isValidIntegrationType(t: string | undefined): t is IntegrationType {
	return !!t && INTEGRATION_TYPES.includes(t as IntegrationType);
}

function buildSettingsFromForm(
	type: string,
	form: FormData
): ProPresenterSettings | CompanionSettings | FreeShowSettings {
	switch (type) {
		case 'propresenter':
			return {
				messageUuid: form.get('messageUuid')?.toString().trim() ?? '',
				messageName: form.get('messageName')?.toString().trim() ?? '',
				tokenUuid: form.get('tokenUuid')?.toString().trim() ?? '',
				tokenName: form.get('tokenName')?.toString().trim() ?? '',
				themeUuid: form.get('themeUuid')?.toString().trim() ?? '',
				themeName: form.get('themeName')?.toString().trim() ?? ''
			};
		case 'companion':
			return {
				page: Number(form.get('page')) || 1,
				row: Number(form.get('row')) || 0,
				col: Number(form.get('col')) || 0
			};
		case 'freeshow':
			return {};
		default:
			throw new Error(`Unknown integration type: ${type}`);
	}
}

export const actions: Actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const label = form.get('label')?.toString().trim();
		const type = form.get('type')?.toString();
		const host = form.get('host')?.toString().trim();
		const port = Number(form.get('port'));

		if (!label || !host || !port) {
			return fail(400, { error: 'Label, host, and port are all required.', label, host });
		}
		if (!isValidIntegrationType(type)) {
			return fail(400, { error: 'Invalid type.', label, host });
		}

		const settings = buildSettingsFromForm(type, form);

		await db.insert(integrations).values({ label, type, host, port, settings });
		return { success: true };
	},

	update: async ({ request }) => {
		const form = await request.formData();
		const id = form.get('id')?.toString();
		const type = form.get('type')?.toString();
		const label = form.get('label')?.toString().trim();
		const host = form.get('host')?.toString().trim();
		const port = Number(form.get('port'));

		if (!id || !type) return fail(400, { error: 'Missing target id or type.' });
		if (!label || !host || !port) {
			return fail(400, { error: 'Label, host, and port are all required.' });
		}

		const settings = buildSettingsFromForm(type, form);

		await db
			.update(integrations)
			.set({ label, host, port, settings })
			.where(eq(integrations.id, id));

		return { success: true };
	},

	toggle: async ({ request }) => {
		const form = await request.formData();
		const id = form.get('id')?.toString();
		const enabled = form.get('enabled')?.toString() === 'true';

		if (!id) return fail(400, { error: 'Missing target id.' });

		await db.update(integrations).set({ enabled }).where(eq(integrations.id, id));
		return { success: true };
	},

	remove: async ({ request }) => {
		const form = await request.formData();
		const id = form.get('id')?.toString();
		if (!id) return fail(400, { error: 'Missing target id.' });

		await db.delete(integrations).where(eq(integrations.id, id));
		return { success: true };
	}
};
