export interface Target {
	type: string;
	host: string;
	port: number;
	enabled: boolean;
}

export interface SendResult {
	success: boolean;
	error?: string;
}

export interface NetworkRequestError {
	ok: false;
	status?: number;
	error: string;
}

export interface NetworkResponse<T = unknown> {
	ok: true;
	status: number;
	body?: T;
}

/**
 * TSettings is the per-service typed config shape (ProPresenterSettings,
 * CompanionSettings, etc.) — parsed from the DB row's raw `settings` JSON
 * before the driver is ever constructed. See the factory function; that's
 * the one place that does the DB row -> typed driver translation.
 */
export abstract class BaseDriver {
	protected host: string;
	protected port: number;
	protected timeoutMs = 5000;

	constructor(host: string, port: number) {
		this.host = host;
		this.port = port;
	}

	/** Define your own health/version endpoint. */
	abstract healthCheck(): Promise<boolean>;

	/**
	 * The actual business action every driver must support — this is what
	 * makes drivers polymorphic and useful to the caller: it never needs to
	 * know or care which service it's talking to.
	 */
	abstract sendChildNumber(childNumber: string, note: string | null): Promise<SendResult>;

	/**
	 * Shared HTTP transport — concrete, not abstract. Fetch/timeout/parsing
	 * logic is identical across every service; subclasses call this rather
	 * than reimplementing it. Only the endpoint path and payload shape
	 * differ per service, and those live in each subclass's own methods.
	 */
	protected async executeCommand<TResponse = unknown>(
		endpoint: string,
		method: 'GET' | 'POST' | 'PUT' | 'DELETE',
		body?: unknown
	): Promise<NetworkResponse<TResponse> | NetworkRequestError> {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

		try {
			const res = await fetch(`${this.getBaseUrl()}${endpoint}`, {
				method,
				signal: controller.signal,
				headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
				body: body !== undefined ? JSON.stringify(body) : undefined
			});
			clearTimeout(timeout);

			if (!res.ok) {
				return { ok: false, status: res.status, error: `HTTP ${res.status}` };
			}

			// Some endpoints return 204 with no body — guard against parsing
			// empty responses as JSON.
			const text = await res.text();
			let parsedBody: TResponse | undefined;

			if (text) {
				try {
					parsedBody = JSON.parse(text) as TResponse
				} catch {
					parsedBody = text as unknown as TResponse
				}
			}
			return { ok: true, status: res.status, body: parsedBody };
		} catch (err) {
			clearTimeout(timeout);
			const message = err instanceof Error ? err.message : 'Unknown error';
			return { ok: false, error: controller.signal.aborted ? 'Request timed out' : message };
		}
	}

	/** Optional cleanup for external resources (e.g. closing a WebSocket). */
	async close(): Promise<void> {
		// no-op by default; override if a driver needs it
	}

	protected getBaseUrl(): string {
		return `http://${this.host}:${this.port}`;
	}
}
