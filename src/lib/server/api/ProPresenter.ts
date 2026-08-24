import { BaseDriver, type SendResult } from './base';
import type { ProPresenterSettings } from '$lib/server/db/integration-settings';

export class ProPresenterDriver extends BaseDriver<ProPresenterSettings> {
	async healthCheck(): Promise<boolean> {
		const result = await this.executeCommand('/v1/version', 'GET');
		return result.ok;
	}

	async sendChildNumber(childNumber: string, note: string | null): Promise<SendResult> {
		if (!this.settings.messageUuid || !this.settings.tokenUuid) {
			return {
				success: false,
				error: `${this.target.label} is missing message/token config — set it up in Settings → Connections.`
			};
		}

		const tokens = [
			{ name: this.settings.tokenName, uuid: this.settings.tokenUuid, text: { text: childNumber } }
			// TODO: second token here if `note` should show separately.
		];

		const updateResult = await this.executeCommand(
			`/v1/messages/${this.settings.messageUuid}`,
			'PUT',
			{
				id: { name: this.settings.messageName, uuid: this.settings.messageUuid, index: 0 },
				message: `Text {${this.settings.tokenName}}`, // TODO: match your actual Message template string
				tokens,
				theme: { name: this.settings.themeName, uuid: this.settings.themeUuid, index: 0 },
				visible_on_network: true,
				is_active: false
			}
		);

		if (!updateResult.ok) {
			return { success: false, error: updateResult.error ?? `HTTP ${updateResult.status}` };
		}

		const triggerResult = await this.executeCommand(
			`/v1/messages/${this.settings.messageUuid}/trigger`,
			'POST',
			tokens.map((t) => ({ name: t.name, text: t.text }))
		);

		if (!triggerResult.ok) {
			return { success: false, error: triggerResult.error ?? `HTTP ${triggerResult.status}` };
		}
		return { success: true };
	}

	/** Used by the settings UI's "Load from ProPresenter" dropdown feature. */
	async listOptions() {
		const messagesListResult = await this.executeCommand<{ name: string; uuid: string }[]>(
			'/v1/messages',
			'GET'
		);
		if (!messagesListResult.ok) {
			return {
				success: false as const,
				error: messagesListResult.error ?? `HTTP ${messagesListResult.status}`
			};
		}

		const themesResult = await this.executeCommand<{ name: string; uuid: string }[]>(
			'/v1/themes',
			'GET'
		);
		if (!themesResult.ok) {
			return {
				success: false as const,
				error: themesResult.error ?? `HTTP ${themesResult.status}`
			};
		}

		const messages = await Promise.all(
			(messagesListResult.body ?? []).map(async (m) => {
				const detail = await this.executeCommand<{ tokens?: { uuid: string; name: string }[] }>(
					`/v1/messages/${m.uuid}`,
					'GET'
				);
				const tokens = detail.ok
					? (detail.body?.tokens ?? []).map((t) => ({ uuid: t.uuid, name: t.name }))
					: [];
				return { uuid: m.uuid, name: m.name, tokens };
			})
		);

		return {
			success: true as const,
			messages,
			themes: (themesResult.body ?? []).map((t) => ({ uuid: t.uuid, name: t.name }))
		};
	}
}
