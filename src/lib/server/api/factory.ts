import type { integrations } from '$lib/server/db/schema';
import { ProPresenterDriver } from './ProPresenter';
import { CompanionDriver } from './Companion';
import { FreeShowDriver } from './FreeShow';
import {
	parseProPresenterSettings,
	parseCompanionSettings,
	parseFreeShowSettings
} from '$lib/server/db/integration-settings';
import type { BaseDriver } from './base';

type TargetRow = typeof integrations.$inferSelect;

/**
 * The one place a raw DB row (with settings: unknown JSON) becomes a
 * typed, working driver instance. Nothing outside this file should ever
 * need to know the settings shape differs per type, or construct a
 * driver directly — call this, get back something with .sendChildNumber()
 * and .healthCheck(), regardless of which service it actually is.
 */
export function createDriver(row: TargetRow): BaseDriver<unknown> {
	switch (row.type) {
		case 'propresenter':
			return new ProPresenterDriver(row, parseProPresenterSettings(row.settings));
		case 'companion':
			return new CompanionDriver(row, parseCompanionSettings(row.settings));
		case 'freeshow':
			return new FreeShowDriver(row, parseFreeShowSettings(row.settings));
		default:
			// Exhaustiveness check — if you add a 4th type to the schema enum
			// and forget to add a case here, TypeScript flags it at this line.
			throw new Error(`Unknown target type: ${row.type satisfies never}`);
	}
}
