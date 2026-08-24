<script lang="ts">
	import FormField from './FormField.svelte';

	const { t } = $props();
</script>

<hr class="my-4" />
{#if t.type === 'propresenter'}
	<div class="is-justify-content is-space-between">
		<FormField
			id="messageUuid-{t.id}"
			name="messageUuid"
			type="text"
			label="Message UUID"
			value={t.parsedSettings.messageUuid}
		/>
		<FormField
			id="messageName-{t.id}"
			name="messageName"
			type="text"
			label="Message name"
			value={t.parsedSettings.messageName}
		/>
		<FormField
			id="tokenUuid-{t.id}"
			name="tokenUuid"
			type="text"
			label="Token UUID"
			value={t.parsedSettings.tokenUuid}
		/>
		<FormField
			id="tokenName-{t.id}"
			name="tokenName"
			type="text"
			label="Token name"
			value={t.parsedSettings.tokenName}
		/>
		<FormField
			id="themeUuid-{t.id}"
			name="themeUuid"
			type="text"
			label="Theme UUID"
			value={t.parsedSettings.themeUuid}
		/>
		<FormField
			id="themeName-{t.id}"
			name="themeName"
			type="text"
			label="Theme name"
			value={t.parsedSettings.themeName}
		/>
	</div>
{:else if t.type === 'companion'}
	<div class="is-justify-content is-space-between">
		<FormField
			id="page-{t.id}"
			name="page"
			type="number"
			label="Page"
			value={t.parsedSettings.page}
		/>
		<FormField id="row-{t.id}" name="row" type="number" label="Row" value={t.parsedSettings.row} />
		<FormField
			id="col-{t.id}"
			name="col"
			type="number"
			label="Column"
			value={t.parsedSettings.col}
		/>
	</div>
{/if}
