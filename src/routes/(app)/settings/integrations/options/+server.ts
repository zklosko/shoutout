import { json } from '@sveltejs/kit';
import { ProPresenterDriver } from '$lib/server/api/ProPresenter';
import type { Target } from '$lib/server/api/base';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const host = url.searchParams.get('host');
	const port = Number(url.searchParams.get('port'));

	if (!host || !port) {
		return json({ success: false, error: 'Host and port are required.' }, { status: 400 });
	}

	// This target isn't saved yet — there's no real id/label until the form
	// is submitted. listOptions() only reads host/port off `target` (via
	// getBaseUrl()), so the placeholder fields below are never actually
	// touched — they exist only to satisfy the Target type the driver
	// constructor expects.
	const stubTarget: Target = {
		id: 'unsaved',
		label: '',
		host,
		port,
		enabled: true,
		settings: {}
	};

	const driver = new ProPresenterDriver(stubTarget, {
		messageUuid: '',
		messageName: '',
		tokenUuid: '',
		tokenName: '',
		themeUuid: '',
		themeName: ''
	});

	const result = await driver.listOptions();
	return json(result, { status: result.success ? 200 : 502 });
};
