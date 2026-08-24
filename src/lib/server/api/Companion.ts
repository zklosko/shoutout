import { BaseDriver, type SendResult } from './base';
import type { CompanionSettings } from '$lib/server/db/integration-settings';

export class CompanionDriver extends BaseDriver<CompanionSettings> {
	async healthCheck(): Promise<boolean> {
		// Companion doesn't have a dedicated health endpoint documented in
		// what we've verified — using the button-press endpoint's reachability
		// as a proxy would trigger a real button press, so this is a TODO
		// pending a real Companion health check path.
		return true; // TODO
	}

	async sendChildNumber(childNumber: string, note: string | null): Promise<SendResult> {
		const { page, row, col } = this.settings;
		const result = await this.executeCommand(`/api/location/${page}/${row}/${col}/press`, 'POST');

		if (!result.ok) {
			return { success: false, error: result.error ?? `HTTP ${result.status}` };
		}
		return { success: true };
	}
}
