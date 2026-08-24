<script lang="ts">
	import { enhance } from '$app/forms';
	import FormField from '$lib/components/FormField.svelte';
	import SettingsCard from '$lib/components/SettingsCard.svelte';
	import type { PageProps } from './$types';
	import { toast } from '$lib/toast.svelte';

	let { data, form }: PageProps = $props();
	const ROLES = ['submitter', 'approver', 'admin'];

	let creating = $state(false);
	let confirmingDeleteId = $state<string | null>(null);
</script>

<h1 class="title">Users & roles</h1>
<p class="subtitle">Create accounts and change user roles.</p>

<SettingsCard title="Add a user">
	<form
		method="POST"
		action="?/createUser"
		use:enhance={() => {
			creating = true;
			return async ({ update }) => {
				creating = false;
				await update({ reset: true });
			};
		}}
	>
		<div class="columns">
			<div class="column">
				<FormField
					id="name"
					name="name"
					label="Name"
					type="text"
					value={form?.name ?? ''}
					required={true}
				/>
			</div>
			<div class="column">
				<FormField
					id="email"
					name="email"
					label="Email"
					type="email"
					autocomplete="email"
					value={form?.email ?? ''}
					required={true}
				/>
			</div>
		</div>

		<div class="columns">
			<div class="column">
				<FormField
					id="password"
					name="password"
					type="text"
					label="Temporary Password"
					required={true}
					minlength={8}
				/>
			</div>
			<div class="column">
				<div class="field">
					<label for="role" class="label">Role</label>
					<div class="control">
						<div class="select is-fullwidth">
							<select id="role" name="role">
								{#each ROLES as r}
									<option value={r}>{r}</option>
								{/each}
							</select>
						</div>
					</div>
				</div>
			</div>
		</div>

		{#if form?.error}
			<p class="help is-danger">{form.error}</p>
		{/if}
		{#if form?.success && form?.created}
			<p class="help is-success">
				Created {form.created}. Share the temporary password with them directly — it won't be shown
				again here.
			</p>
		{/if}

		<div class="field">
			<button type="submit" class="button is-primary" disabled={creating}>
				{creating ? 'Creating…' : 'Create user'}
			</button>
		</div>
	</form>
</SettingsCard>

<nav class="panel">
	{#each data.users as u, i (u.id)}
		<div class="panel-block is-justify-content-space-between">
			<div>
				<p class="has-text-weight-semibold">
					{u.name}
					{#if u.id === data.currentUserId}
						<span class="is-size-7 has-text-grey">(you)</span>
					{/if}
				</p>
				<p class="is-size-7 has-text-grey">{u.email}</p>
			</div>

			<div class="is-flex is-align-items-center">
				<form method="POST" action="?/updateRole" class="px-2">
					<input type="hidden" name="id" value={u.id} />
					<div class="select is-small">
						<select
							name="role"
							disabled={u.id === data.currentUserId}
							title={u.id === data.currentUserId ? "You can't change your own role." : undefined}
							onchange={(e) => e.currentTarget.form?.requestSubmit()}
						>
							{#each ROLES as r}
								<option value={r} selected={u.role === r}>{r}</option>
							{/each}
						</select>
					</div>
				</form>

				{#if confirmingDeleteId === u.id}
					<form
						method="POST"
						action="?/deleteUser"
						use:enhance={() => {
							return async ({ result, update }) => {
								confirmingDeleteId = null;
								await update();
								if (result.type === 'success') {
									toast.success(`${u.name} deleted.`);
								} else if (result.type === 'failure') {
									toast.error((result.data?.error as string) ?? 'Could not delete user.');
								}
							};
						}}
						class="is-flex is-align-items-center"
					>
						<input type="hidden" name="id" value={u.id} />
						<span class="is-size-7 has-text-danger mr-2">Delete {u.name}?</span>
						<button type="submit" class="button is-danger is-small mr-2"> Confirm </button>
						<button
							type="button"
							class="button is-small"
							onclick={() => (confirmingDeleteId = null)}
						>
							Cancel
						</button>
					</form>
				{:else}
					<button
						type="button"
						class="button is-small is-danger is-light"
						disabled={u.id === data.currentUserId}
						title={u.id === data.currentUserId ? "You can't delete your own account." : undefined}
						onclick={() => (confirmingDeleteId = u.id)}
					>
						Delete
					</button>
				{/if}
			</div>
		</div>
	{/each}
</nav>
