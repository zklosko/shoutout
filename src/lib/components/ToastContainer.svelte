<script lang="ts">
	import { toast } from '$lib/toast.svelte';

	const iconFor = { success: '✓', error: '✕', info: 'ℹ' };
	const classFor = { success: 'is-success', error: 'is-danger', info: 'is-info' };
</script>

<div class="toast-stack">
	{#each toast.all() as t (t.id)}
		<div class="notification {classFor[t.type]}" role="status">
			<button class="delete" onclick={() => toast.dismiss(t.id)} aria-label="Dismiss"></button>
			{iconFor[t.type]}
			{t.message}
		</div>
	{/each}
</div>

<style>
	/* Fixed floating position */
	.toast-stack {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-width: 22rem;
	}

	@media (max-width: 26rem) {
		.toast-stack {
			left: 1rem;
			right: 1rem;
			max-width: none;
		}
	}
</style>
