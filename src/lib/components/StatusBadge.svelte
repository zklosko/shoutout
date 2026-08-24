<script lang="ts">
	let { status }: { status: string } = $props();

	const LABELS: Record<string, string> = {
		pending: 'Pending',
		approved: 'Approved',
		rejected: 'Rejected',
		sent: 'Sent',
		failed: 'Failed'
	};

	const CLASSES: Record<string, string> = {
		pending: 'is-warning',
		approved: 'is-success',
		sent: 'is-success',
		rejected: 'is-danger',
		failed: 'is-danger'
	};
</script>

<span class="tag {CLASSES[status] ?? ''}">
	{LABELS[status] ?? status}
</span>
