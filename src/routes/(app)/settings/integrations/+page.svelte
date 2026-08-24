<script lang="ts">
	import { enhance } from '$app/forms';
	import IntegrationSpecificSettings from '$lib/components/IntegrationSpecificSettings.svelte';
	import SettingsCard from '$lib/components/SettingsCard.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let creating = $state(false);
	let editingId = $state<string | null>(null);
	let newType = $state<'propresenter' | 'companion'>('propresenter');
</script>

<h1 class="title">Connections</h1>
<p class="subtitle">ProPresenter and Companion machines the approve queue can send numbers to.</p>

<SettingsCard title="Add a machine">
	<form
		method="POST"
		action="?/create"
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
					id="label"
					name="label"
					type="text"
					label="Label"
					placeholder="Main Auditorium"
					value={form?.label ?? ''}
					required={true}
				/>
			</div>
			<div class="column">
				<div class="field">
					<label for="type" class="label">Type</label>
					<div class="control">
						<div class="select is-fullwidth">
							<select id="type" name="type" bind:value={newType}>
								<option value="propresenter">ProPresenter</option>
								<option value="companion">Companion</option>
							</select>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="columns">
			<div class="column">
				<FormField
					id="host"
					name="host"
					type="text"
					label="Host"
					placeholder="192.168.1.50"
					value={form?.host ?? ''}
					required={true}
				/>
			</div>
			<div class="column">
				<FormField
					id="port"
					name="port"
					type="number"
					label="Port"
					placeholder="1025"
					required={true}
				/>
			</div>
		</div>

		{#if form?.error}
			<p class="help is-danger">{form.error}</p>
		{/if}

		<button type="submit" class="button is-primary" disabled={creating}>
			{creating ? 'Adding…' : 'Add machine'}
		</button>
	</form>
</SettingsCard>

<nav class="panel">
	{#if data.targets.length === 0}
		<div class="panel-block has-text-grey">No machines added yet.</div>
	{:else}
		{#each data.targets as t, i (t.id)}
			<div class="panel-block is-justify-content-space-between">
				{#if editingId === t.id}
					<form
						method="POST"
						action="?/update"
						class="is-flex-grow-1"
						use:enhance={() => {
							return async ({ update }) => {
								editingId = null;
								await update();
							};
						}}
					>
						<input type="hidden" name="id" value={t.id} />

						<FormField
							id="label-{t.id}"
							name="label"
							type="text"
							label="Label"
							value={t.label}
							required={true}
						/>

						<div class="columns">
							<div class="column">
								<FormField
									id="host-{t.id}"
									name="host"
									type="text"
									label="Host"
									value={t.host}
									required={true}
								/>
							</div>
							<div class="column">
								<FormField
									id="port-{t.id}"
									name="port"
									type="number"
									label="Port"
									value={String(t.port)}
									required={true}
								/>
							</div>
						</div>

						<IntegrationSpecificSettings {t} />

						<div class="my-4">
							<button type="submit" class="button is-primary"> Save </button>
							<button type="button" class="button" onclick={() => (editingId = null)}>
								Cancel
							</button>
						</div>
					</form>
				{:else}
					<div>
						<p class="has-text-weight-semibold">
							{t.label}
							<span class="tag is-uppercase">
								{t.type}
							</span>
						</p>
						<p class="is-size-7 has-text-grey">{t.host}:{t.port}</p>
					</div>

					<div class="is-flex is-align-items-center">
						<button type="button" class="button mr-2" onclick={() => (editingId = t.id)}>
							Edit
						</button>

						<form method="POST" action="?/toggle" use:enhance>
							<input type="hidden" name="id" value={t.id} />
							<input type="hidden" name="enabled" value={(!t.enabled).toString()} />
							<button type="submit" class="button is-warning mr-2">
								{t.enabled ? 'Disable' : 'Enable'}
							</button>
						</form>

						<form method="POST" action="?/remove" use:enhance>
							<input type="hidden" name="id" value={t.id} />
							<button type="submit" class="button is-danger"> Remove </button>
						</form>
					</div>
				{/if}
			</div>
		{/each}
	{/if}
</nav>
