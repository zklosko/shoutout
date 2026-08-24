<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import FormField from '$lib/components/FormField.svelte';

	let { form }: PageProps = $props();
	let loading = $state(false);
</script>

<h1 class="title">Set up your admin account</h1>
<p class="has-text-grey mb-4">
	No accounts exist yet. This page creates the first admin and won't be reachable again once that's
	done.
</p>

<form
	method="POST"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			loading = false;
			await update();
		};
	}}
	class="stack"
>
	<FormField
		id="name"
		name="name"
		label="Name"
		type="text"
		value={form?.name ?? ''}
		required={true}
	/>
	<FormField
		id="email"
		name="email"
		label="Email"
		type="email"
		value={form?.email ?? ''}
		required={true}
	/>
	<FormField
		id="password"
		name="password"
		label="Password"
		type="password"
		minlength={8}
		required={true}
	/>
	<FormField
		id="confirmPassword"
		name="confirmPassword"
		label="Confirm Password"
		type="password"
		minlength={8}
		required={true}
	/>

	{#if form?.error}
		<p class="help is-danger">{form.error}</p>
	{/if}

	<button
		type="submit"
		class="button is-primary mt-1"
		disabled={loading}
	>
		{loading ? 'Creating…' : 'Create admin account'}
	</button>
</form>
