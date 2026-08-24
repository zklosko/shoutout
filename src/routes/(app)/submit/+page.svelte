<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast.svelte';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import type { PageProps } from './$types';
	import FormField from '$lib/components/FormField.svelte';

	let { data, form }: PageProps = $props();
	let submitting = $state(false);
</script>

<div class="section">
	<div class="container is-max-desktop">
		<div class="box">
			<h1 class="title">Request a number on screen</h1>
			<p class="subtitle has-text-grey">Someone will approve this before it shows.</p>

			<form
				method="POST"
				use:enhance={() => {
					submitting = true;
					return async ({ result, update }) => {
						submitting = false;
						await update();
						if (result.type === 'success') {
							toast.success(`Request sent for approval.`);
						} else if (result.type === 'failure') {
							toast.error((result.data?.error as string) ?? 'Could not approve request.');
						}
					};
				}}
				class="stack"
			>
				<div class="field">
					<FormField
						id="childNumber"
						name="childNumber"
						type="text"
						label="Child number"
						placeholder="e.g. 420"
						value={form?.childNumber ?? ''}
						required={true}
					/>
				</div>

				<div class="field">
					<FormField
						id="note"
						name="note"
						type="text"
						label="Note (optional)"
						placeholder="e.g. Parent needed at check-in"
						value={form?.note ?? ''}
					/>
				</div>

				{#if form?.error}
					<p class="help is-danger">{form.error}</p>
				{/if}

				{#if form?.success}
					<p class="help is-success">Request sent for approval.</p>
				{/if}

				<button type="submit" class="button is-primary" disabled={submitting}>
					{submitting ? 'Sending...' : 'Submit request'}
				</button>
			</form>

			{#if data.pendingRequests.length > 0}
				<hr class="my-4" />
				<p class="is-size-7 has-text-grey mb-2">Your pending requests</p>
				{#each data.pendingRequests as r (r.id)}
					<div class="is-flex is-justify-content-space-between is-align-items-center py-2">
						<span>#{r.childNumber}</span>
						<StatusBadge status={r.status} />
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>
