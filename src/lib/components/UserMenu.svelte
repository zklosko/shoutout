<script lang="ts">
	const { user } = $props();

	let menuOpen = $state(false);
	let menuEl = $state<HTMLElement | null>(null);

	function handleWindowClick(e: MouseEvent) {
		if (menuOpen && menuEl && !menuEl.contains(e.target as Node)) {
			menuOpen = false;
		}
	}

	function handleWindowKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') menuOpen = false;
	}
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleWindowKeydown} />

{#if user}
	<div class="navbar-item has-dropdown" class:is-active={menuOpen} bind:this={menuEl}>
		<a class="navbar-link" onclick={() => (menuOpen = !menuOpen)}>
			{user.name}
		</a>
		<div class="navbar-dropdown is-right">
			{#if user.role === 'admin'}
				<a class="navbar-item" href="/settings" onclick={() => (menuOpen = false)}> Settings </a>
			{/if}
			<a class="navbar-item" href="/account" onclick={() => (menuOpen = false)}> My account </a>
			<a class="navbar-item" href="/logout" onclick={() => (menuOpen = false)}> Log out </a>
		</div>
	</div>
{/if}
