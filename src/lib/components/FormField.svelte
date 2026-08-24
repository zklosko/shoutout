<script lang="ts">
	let {
		id,
		name,
		label,
		type = 'text',
		value = $bindable(''),
		placeholder = '',
		required = false,
		minlength,
		autocomplete
	}: {
		id: string;
		name: string;
		label: string;
		type?: string;
		value?: string;
		placeholder?: string;
		required?: boolean;
		minlength?: number;
		autocomplete?: any; // formerly string, changed to avoid typescript conflict
	} = $props();
</script>

<div class="field">
	<label for={id} class="label">
		{label}
	</label>
	<div class="control">
		<input
			class="input"
			{name}
			{type}
			bind:value
			{placeholder}
			{required}
			{minlength}
			{autocomplete}
		/>
	</div>
</div>
