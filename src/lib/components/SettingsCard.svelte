<script lang="ts">
	let { children, title } = $props();
</script>

<div class="box">
	<h2 class="subtitle">{title}</h2>
	{@render children()}
</div>
