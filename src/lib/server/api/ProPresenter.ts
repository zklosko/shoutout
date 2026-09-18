import { eq } from 'drizzle-orm';
import { db } from '../db';
import { integrations, propresenterSettings } from '../db/schema';
import { BaseDriver, type SendResult } from './base';

export class ProPresenterDriver extends BaseDriver {
	#messageUuid: string
	#messageName: string
	#tokenUuid: string
	#tokenName: string
	#themeUuid: string
	#themeName: string

	private constructor(host: string, port: number, messageUuid: string, messageName: string, tokenUuid: string, tokenName: string, themeUuid: string, themeName: string) {
		super(host, port)
		this.#messageUuid = messageUuid
		this.#messageName = messageName
		this.#tokenUuid = tokenUuid
		this.#tokenName = tokenName
		this.#themeUuid = themeUuid
		this.#themeName = themeName
	}

	static async load(): Promise<ProPresenterDriver | null> {
		const connection = await db
			.select()
			.from(integrations)
			.where(eq(integrations.type, 'propresenter'))
			.get();
		if (!connection || !connection.enabled || !connection.host || !connection.port) {
			return null;
		}

		const settings = await db
			.select()
			.from(propresenterSettings)
			.where(eq(propresenterSettings.type, 'propresenter'))
			.get();

		return new ProPresenterDriver(
			connection.host,
			connection.port,
			settings?.messageUuid ?? '',
			settings?.messageName ?? '',
			settings?.tokenUuid ?? '',
			settings?.tokenName ?? '',
			settings?.themeUuid ?? '',
			settings?.themeName ?? ''
		)
	}

	async healthCheck(): Promise<boolean> {
		const result = await this.executeCommand('/version', 'GET');
		return result.ok;
	}

	async sendChildNumber(childNumber: string, note: string | null): Promise<SendResult> {
		if (!this.#messageUuid || !this.#tokenUuid) {
			return {
				success: false,
				error: `ProPresenter is missing message/token config — set it up in Settings → Connections.`
			};
		}

		const tokens = [
			{ name: this.#tokenName, uuid: this.#tokenUuid, text: { text: childNumber } }
			// TODO: second token here if `note` should show separately.
		];

		const updateResult = await this.executeCommand(
			`/v1/messages/${this.#messageUuid}`,
			'PUT',
			{
				id: { name: this.#messageName, uuid: this.#messageUuid, index: 0 },
				message: `Text {${this.#tokenName}}`, // TODO: match your actual Message template string
				tokens,
				theme: { name: this.#themeName, uuid: this.#themeUuid, index: 0 },
				visible_on_network: true,
				is_active: false
			}
		);

		if (!updateResult.ok) {
			return { success: false, error: updateResult.error ?? `HTTP ${updateResult.status}` };
		}

		const triggerResult = await this.executeCommand(
			`/v1/messages/${this.#messageUuid}/trigger`,
			'POST',
			tokens.map((t) => ({ name: t.name, text: t.text }))
		);

		if (!triggerResult.ok) {
			return { success: false, error: triggerResult.error ?? `HTTP ${triggerResult.status}` };
		}
		return { success: true };
	}

	/** TODO: needs to be implemented again. */
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
