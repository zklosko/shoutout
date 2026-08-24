<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast.svelte';
	import type { PageProps } from './$types.js';
	let { data }: PageProps = $props();
	let confirmDelete = $state(false);
</script>

<h1 class="title">Activity Log</h1>

{#if data.logs.length === 0}
	<p class="has-text-grey">No activity yet.</p>
{:else}
	<div class="py-1">
		{#if confirmDelete}
			<form
				method="POST"
				action="?/clearLogs"
				use:enhance={() => {
					return async ({ result, update }) => {
						confirmDelete = false;
						await update();
						if (result.type === 'success') toast.success('Log cleared.');
					};
				}}
			>
				<span class="is-size-7 has-text-danger">Delete all {data.logs.length} entries?</span>
				<button type="submit" class="button is-danger">Confirm</button>
				<button type="button" class="button" onclick={() => (confirmDelete = false)}>Cancel</button>
			</form>
		{:else}
			<button type="button" class="button is-danger is-light" onclick={() => (confirmDelete = true)}
				>Clear log</button
			>
		{/if}
	</div>
	<div class="box">
		{#each data.logs as log, i (log.id)}
			<div>
				<p><strong>{log.actorName}</strong> — {log.details ?? log.action}</p>
				<p class="is-size-7 has-text-grey">
					{new Date(log.createdAt).toLocaleString()}
				</p>
			</div>
		{/each}
	</div>
{/if}
