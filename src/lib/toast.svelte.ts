type ToastType = 'success' | 'error' | 'info';

type Toast = {
	id: string;
	type: ToastType;
	message: string;
};

const DEFAULT_DURATION_MS = 4000;

function createToastStore() {
	let toasts = $state<Toast[]>([]);

	function push(type: ToastType, message: string, durationMs: number = DEFAULT_DURATION_MS) {
		const id = crypto.randomUUID();
		toasts.push({ id, type, message });

		setTimeout(() => dismiss(id), durationMs);
	}

	function dismiss(id: string) {
		toasts = toasts.filter((t) => t.id !== id);
	}

	const all = () => toasts;
	const success = (msg: string) => push('success', msg);
	const error = (msg: string) => push('error', msg);
	const info = (msg: string) => push('info', msg);

	return {
		all,
		success,
		error,
		info,
		dismiss
	};
}

export const toast = createToastStore();
