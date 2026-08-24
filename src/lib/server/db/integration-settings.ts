// This file defines the settings: JSON column in the integrations table

export type ProPresenterSettings = {
	messageUuid: string;
	messageName: string;
	tokenUuid: string;
	tokenName: string;
	themeUuid: string;
	themeName: string;
};

export type CompanionSettings = {
	page: number;
	row: number;
	col: number;
};

export type FreeShowSettings = {
	// TODO fill in later
};

export function parseProPresenterSettings(raw: unknown): ProPresenterSettings {
	const s = (raw ?? {}) as Partial<ProPresenterSettings>;
	return {
		messageUuid: s.messageUuid ?? '',
		messageName: s.messageName ?? '',
		tokenUuid: s.tokenUuid ?? '',
		tokenName: s.tokenName ?? '',
		themeUuid: s.themeUuid ?? '',
		themeName: s.themeName ?? ''
	};
}

export function parseCompanionSettings(raw: unknown): CompanionSettings {
	const s = (raw ?? {}) as Partial<CompanionSettings>;
	return {
		page: s.page ?? 1,
		row: s.row ?? 0,
		col: s.col ?? 0
	};
}

export function parseFreeShowSettings(raw: unknown): FreeShowSettings {
	// TODO later
	return {};
}
