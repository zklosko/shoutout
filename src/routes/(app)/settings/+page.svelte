<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let saving = $state(false);
</script>

<h1 class="title">General</h1>
<p class="subtitle">General settings</p>

<div>
	<form
		method="POST"
		action="?/updateSettings"
		use:enhance={() => {
			saving = true;
			return async ({ result, update }) => {
				saving = false;
				await update({ reset: false });
				if (result.type === 'success') {
					toast.success('Setting saved.');
				} else if (result.type === 'failure') {
					toast.error((result.data?.error as string) ?? 'Could not save settings.');
				}
			};
		}}
	>
		<FormField
			id="flushRetentionDays"
			name="flushRetentionDays"
			label="Delete old requests after (days)"
			type="number"
			value={String(form?.flushRetentionDays ?? data.settings.flushRetentionDays)}
			required={true}
		/>
		<button type="submit" class="button is-primary" disabled={saving}>
			{saving ? 'Saving...' : 'Save'}
		</button>
	</form>
</div>
