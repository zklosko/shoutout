import { BaseDriver, type SendResult } from './base';
import { db } from '../db';
import { companionSettings, integrations } from '../db/schema';
import { eq } from 'drizzle-orm';

export class CompanionDriver extends BaseDriver {
	#page: number;
	#row: number;
	#col: number;

	private constructor(host: string, port: number, page: number, row: number, col: number) {
		super(host, port);
		this.#page = page;
		this.#row = row;
		this.#col = col;
	}

	static async load(): Promise<CompanionDriver | null> {
		const connection = await db
			.select()
			.from(integrations)
			.where(eq(integrations.type, 'companion'))
			.get();
		if (!connection || !connection.enabled || !connection.host || !connection.port) {
			return null;
		}

		const settings = await db
			.select()
			.from(companionSettings)
			.where(eq(companionSettings.type, 'companion'))
			.get();

		return new CompanionDriver(
			connection.host,
			connection.port,
			settings?.page ?? 1,
			settings?.row ?? 0,
			settings?.col ?? 0
		);
	}

	async healthCheck(): Promise<boolean> {
		// Companion doesn't have a dedicated health endpoint documented in
		// what we've verified — using the button-press endpoint's reachability
		// as a proxy would trigger a real button press, so this is a TODO
		// pending a real Companion health check path.
		return true; // TODO
	}

	async sendChildNumber(childNumber: string, note: string | null): Promise<SendResult> {
		const result = await this.executeCommand(
			`/api/location/${this.#page}/${this.#row}/${this.#col}/press`,
			'POST'
		);

		if (!result.ok) {
			return { success: false, error: result.error ?? `HTTP ${result.status}` };
		}
		return { success: true };
	}
}

/**
 * Usage:
 * const driver = await CompanionDriver.load();
if (!driver) {
  return fail(400, { error: 'Companion is not configured.' });
}
const result = await driver.sendChildNumber(childNumber, note);
 */
