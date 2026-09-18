<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from '$lib/toast.svelte';
	import SettingsCard from '$lib/components/SettingsCard.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let saving = $state(false);
</script>

<h1 class="title">Connections</h1>
<p class="subtitle">Where the approve queue sends numbers once approved.</p>

<SettingsCard title="Companion">
	<form
		method="POST"
		action="?/saveCompanion"
		use:enhance={() => {
			saving = true;
			return async ({ result, update }) => {
				saving = false;
				await update({ reset: false });
				if (result.type === 'success') {
					toast.success('Companion settings saved.');
				} else if (result.type === 'failure') {
					toast.error((result.data?.error as string) ?? 'Could not save settings.');
				}
			};
		}}
	>
		<div class="field">
			<label class="checkbox">
				<input type="checkbox" name="enabled" checked={data.companion.connection.enabled} />
				Enabled
			</label>
		</div>

		<div class="columns">
			<div class="column">
				<FormField
					id="host"
					name="host"
					type="text"
					label="Host"
					placeholder="192.168.1.51"
					value={form?.host ?? data.companion.connection.host ?? ''}
					required={true}
				/>
			</div>
			<div class="column">
				<FormField
					id="port"
					name="port"
					type="number"
					label="Port"
					placeholder="8000"
					value={String(form?.port ?? data.companion. connection.port ?? '')}
					required={true}
				/>
			</div>
		</div>

		<p class="has-text-grey is-size-7 mb-2">Button location</p>
		<div class="columns">
			<div class="column">
				<FormField
					id="page"
					name="page"
					type="number"
					label="Page"
					value={String(data.companion.settings.page)}
					required={true}
				/>
			</div>
			<div class="column">
				<FormField
					id="row"
					name="row"
					type="number"
					label="Row"
					value={String(data.companion.settings.row)}
					required={true}
				/>
			</div>
			<div class="column">
				<FormField
					id="col"
					name="col"
					type="number"
					label="Column"
					value={String(data.companion.settings.col)}
					required={true}
				/>
			</div>
		</div>

		{#if form?.error}
			<p class="help is-danger">{form.error}</p>
		{/if}

		<button type="submit" class="button is-primary" disabled={saving}>
			{saving ? 'Saving…' : 'Save'}
		</button>
	</form>
</SettingsCard>

<SettingsCard title="ProPresenter">
	<form
		method="POST"
		action="?/saveProPresenter"
		use:enhance={() => {
			saving = true;
			return async ({ result, update }) => {
				saving = false;
				await update({ reset: false });
				if (result.type === 'success') {
					toast.success('ProPresenter settings saved.');
				} else if (result.type === 'failure') {
					toast.error((result.data?.error as string) ?? 'Could not save settings.');
				}
			};
		}}
	>
			<div class="field">
			<label class="checkbox">
				<input type="checkbox" name="enabled" checked={data.propresenter.connection.enabled} />
				Enabled
			</label>
		</div>

		<div class="columns">
			<div class="column">
				<FormField
					id="host"
					name="host"
					type="text"
					label="Host"
					placeholder="192.168.1.51"
					value={form?.host ?? data.propresenter.connection.host ?? ''}
					required={true}
				/>
			</div>
			<div class="column">
				<FormField
					id="port"
					name="port"
					type="number"
					label="Port"
					placeholder="8000"
					value={String(form?.port ?? data.propresenter.connection.port ?? '')}
					required={true}
				/>
			</div>
		</div>
		<p class="has-text-grey is-size-7 mb-2">Message Settings</p>
		<div class="columns">
			<div class="column">
				<FormField
					id="message"
					name="message"
					type="string"
					label="Message"
					value={data.propresenter.settings.messageName}
					required={true}
				/>
			</div>
			<div class="column">
				<FormField
					id="token"
					name="token"
					type="string"
					label="Token"
					value={data.propresenter.settings.tokenName}
					required={true}
				/>
			</div>
			<div class="column">
				<FormField
					id="theme"
					name="theme"
					type="string"
					label="Theme"
					value={data.propresenter.settings.theme}
					required={true}
				/>
			</div>
		</div>

		{#if form?.error}
			<p class="help is-danger">{form.error}</p>
		{/if}

		<button type="submit" class="button is-primary" disabled={saving}>
			{saving ? 'Saving…' : 'Save'}
		</button>
	</form>
</SettingsCard>