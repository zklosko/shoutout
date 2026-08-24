<script lang="ts">
	import UserMenu from './UserMenu.svelte';

	let burgerOpen = $state(false);

	const { user } = $props();
</script>

<header class="site-header">
	<nav class="navbar" role="navigation" aria-label="main navigation">
		<div class="navbar-brand">
			<a class="navbar-item" href="/">
				<strong>Shoutout</strong>
			</a>

			<a
				role="button"
				class="navbar-burger"
				class:is-active={burgerOpen}
				aria-label="menu"
				aria-expanded={burgerOpen}
				onclick={() => (burgerOpen = !burgerOpen)}
			>
				<span aria-hidden="true"></span>
				<span aria-hidden="true"></span>
				<span aria-hidden="true"></span>
			</a>
		</div>

		<div class="navbar-menu" class:is-active={burgerOpen}>
			<div class="navbar-start">
				<a class="navbar-item" href="/submit">Submit</a>
				<a class="navbar-item" href="/approve">Approve</a>
			</div>
			<div class="navbar-end">
				<UserMenu {user} />
			</div>
		</div>
	</nav>
</header>

<style scoped>
	.site-header {
		border-bottom: 1px solid var(--color-border);
		background: var(--color-bg);
	}
</style>
