<script lang="ts">
	let {
		label,
		bindValue = $bindable(''),
		onChange,
		noSelectionText,
		options
	}: {
		label: string;
		bindValue: string;
		onChange?: () => void;
		noSelectionText: string;
		options: { uuid: string; name: string }[];
	} = $props();
</script>

<div class="field">
	<label class="label">{label}</label>
	<div class="control">
		<div class="select is-fullwidth">
			<select bind:value={bindValue} onchange={onChange}>
				<option value="" disabled>{noSelectionText}</option>
				{#each options as o}
					<option value={o.uuid}>{o.name}</option>
				{/each}
			</select>
		</div>
	</div>
</div>
