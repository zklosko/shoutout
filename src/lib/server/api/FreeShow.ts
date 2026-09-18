import { BaseDriver, type SendResult } from './base';

export class FreeShowDriver extends BaseDriver {
	async healthCheck(): Promise<boolean> {
		// TODO: confirm a real health/ping action ID — using a harmless
		// read-only action if one exists, rather than assuming reachability.
		return true;
	}

	async sendChildNumber(childNumber: string, note: string | null): Promise<SendResult> {
		// TODO: FreeShow's API is action-based over a single endpoint, not
		// per-resource REST paths — confirmed shape:
		//   POST http://host:port/?action=ACTION_ID&data=<url-encoded JSON>
		// The actual ACTION_ID for "show this text" needs to come from
		// FreeShow's action reference (linked from freeshow.app/api) — filling
		// in a guessed action name here would just fail silently or do the
		// wrong thing, so this is left as a real gap, not a working call.
		const actionId = 'TODO_ACTION_ID';
		const data = { text: childNumber, note };

		const endpoint = `/?action=${encodeURIComponent(actionId)}&data=${encodeURIComponent(JSON.stringify(data))}`;
		const result = await this.executeCommand(endpoint, 'POST');

		if (!result.ok) {
			return { success: false, error: result.error ?? `HTTP ${result.status}` };
		}
		return { success: true };
	}
}
