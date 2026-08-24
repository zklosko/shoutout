<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import FormField from '$lib/components/FormField.svelte';

	let email = $state('');
	let password = $state('');
	let error = $state<string | null>(null);
	let loading = $state(false);

	// Set app layout guard, captures where user was going when they wound up here
	let redirectTo = $derived(page.url.searchParams.get('redirectTo') ?? '/');

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = null;
		loading = true;

		const { error: signInError } = await authClient.signIn.email({
			email,
			password
		});

		loading = false;

		if (signInError) {
			error = signInError.message ?? 'Could not sign in. Check your email and password.';
			return;
		}

		goto(redirectTo);
	}
</script>

<h1 class="title">Sign in</h1>
<p class="is-text-7 has-text-grey pb-2">Use the account your team lead set up for you.</p>

<form onsubmit={handleSubmit} class="stack">
	<FormField
		id="email"
		name="email"
		label="Email"
		type="email"
		autocomplete="email"
		bind:value={email}
		required
	/>
	<FormField
		id="password"
		name="password"
		label="Password"
		type="password"
		autocomplete="current-password"
		bind:value={password}
		required
	/>

	{#if error}
		<p class="help is-danger">{error}</p>
	{/if}

	<button type="submit" class="button is-primary" disabled={loading}>
		{loading ? 'Signing in...' : 'Sign in'}
	</button>
</form>
