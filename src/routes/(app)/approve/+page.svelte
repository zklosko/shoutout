<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Tracks which request id is mid-submit, so only that card's buttons
	// disable — not the whole list — while an action is in flight.
	let pendingActionId = $state<string | null>(null);

	function timeAgo(date: Date) {
		const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
		if (seconds < 60) return 'just now';
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes} min ago`;
		const hours = Math.floor(minutes / 60);
		return `${hours} hr ago`;
	}
</script>

<section class="section">
	<div class="container is-max-tablet">
		<h1 class="title">Approve requests</h1>
		<h2 class="subtitle">
			{data.pending.length} pending
		</h2>
	</div>

	<div>
		{#if data.pending.length === 0}
			<div class="box has-text-centered">
				<p class="has-text-grey">No pending requests right now.</p>
			</div>
		{:else}
			{#each data.pending as r (r.id)}
				<div class="card block">
					<header class="card-header">
						<p class="card-header-title">#{r.childNumber}</p>
						<div class="card-header-icon">
							<StatusBadge status="pending" />
						</div>
					</header>

					<div class="card-content">
						<div class="content">
							Requested {timeAgo(r.submittedAt)}
							{#if r.note}&middot; {r.note}{/if}
						</div>
					</div>

					<footer class="card-footer">
						<form
							method="POST"
							class="card-footer-item"
							action="?/approve"
							use:enhance={() => {
								pendingActionId = r.id;
								return async ({ result, update }) => {
									pendingActionId = null;
									await update();
									if (result.type === 'success') {
										toast.success(`#${r.childNumber} approved and sent.`);
									} else if (result.type === 'failure') {
										toast.error((result.data?.error as string) ?? 'Could not approve request.');
									}
								};
							}}
						>
							<input type="hidden" name="id" value={r.id} />
							<button
								type="submit"
								class="button is-primary is-fullwidth"
								disabled={pendingActionId === r.id}
							>
								Approve &amp; send
							</button>
						</form>

						<form
							method="POST"
							action="?/reject"
							class="card-footer-item"
							use:enhance={() => {
								pendingActionId = r.id;
								return async ({ result, update }) => {
									pendingActionId = null;
									await update();
									if (result.type === 'success') {
										toast.info(`#${r.childNumber} rejected.`);
									} else if (result.type === 'failure') {
										toast.error((result.data?.error as string) ?? 'Could not reject request.');
									}
								};
							}}
						>
							<input type="hidden" name="id" value={r.id} />
							<button type="submit" class="button is-fullwidth" disabled={pendingActionId === r.id}>
								Reject
							</button>
						</form>
					</footer>
				</div>
			{/each}
		{/if}
	</div>
</section>
