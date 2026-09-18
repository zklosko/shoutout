import { CompanionDriver } from './Companion';
import type { SendResult } from './base';

export type TargetSendResult = SendResult & {
	service: string;
};

/**
 * Sends a child number (and note) to every configured and enabled service
 */
export async function sendChildNumber(
	childNumber: string,
	note: string | null
): Promise<TargetSendResult[]> {
	const drivers = [
		{ service: 'Companion', driver: await CompanionDriver.load() }
		// ProPresenter and Freeshow drivers go here later
	];

	const active = drivers.filter((d) => d.driver !== null);

	return Promise.all(
		active.map(async ({ service, driver }) => {
			const result = await driver!.sendChildNumber(childNumber, note);
			return { service, ...result };
		})
	);
}
