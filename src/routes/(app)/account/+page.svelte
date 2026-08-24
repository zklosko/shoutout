<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import FormField from '$lib/components/FormField.svelte';
	import { toast } from '$lib/toast.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);

	let isFirstLogin = $derived(page.url.searchParams.get('firstLogin') === 'true');

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();

		if (newPassword !== confirmPassword) {
			toast.error('Passwords do not match.');
			return;
		}
		if (newPassword.length < 8) {
			toast.error('New password must be at least 8 characters.');
			return;
		}

		loading = true;
		const { error } = await authClient.changePassword({
			currentPassword,
			newPassword
		});

		if (error) {
			loading = false;
			toast.error(error.message ?? 'Could not change password. Check your current password.');
			return;
		}

		if (isFirstLogin) {
			await fetch('?/clearForcedChangeFlag', { method: 'POST', body: new FormData() });
		}

		loading = false;
		toast.success('Password updated.');
		currentPassword = '';
		newPassword = '';
		confirmPassword = '';

		// Send them back to app after new user forced password change
		if (isFirstLogin) {
			goto('/submit');
		}
	}
</script>

<section class="section">
	<div class="container is-max-tablet">
		<div class="box">
			<h1 class="title">Change your password</h1>

			{#if isFirstLogin}
				<h2 class="subtitle">You're using a temporary password. Set your own before continuing.</h2>
			{/if}

			<form onsubmit={handleSubmit}>
				<FormField
					id="currentPassword"
					name="currentPassword"
					label="Current password"
					type="password"
					autocomplete="current-password"
					bind:value={currentPassword}
					required
				/>
				<FormField
					id="newPassword"
					name="newPassword"
					label="New Password"
					type="password"
					autocomplete="new-password"
					bind:value={newPassword}
					required
					minlength={8}
				/>
				<FormField
					id="confirmPassword"
					name="confirmPassword"
					label="Confirm Password"
					type="password"
					autocomplete="new-password"
					bind:value={confirmPassword}
					required
					minlength={8}
				/>

				<button type="submit" class="button is-primary" disabled={loading}>
					{loading ? 'Updating...' : 'Update password'}
				</button>
			</form>
		</div>
	</div>
</section>
