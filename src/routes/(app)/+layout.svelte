<script>
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';

	let { children, data } = $props();

	// data.user comes from (app)/+layout.server.js once auth is wired up —
	// that load function is also where you'd redirect to /login if there's
	// no session, so by the time this component renders, user should always
	// be set. Keeping the fallback here anyway is just cheap insurance.
	let user = $derived(data?.user);
</script>

<div class="app-shell">
	<Header {user} />

	<main class="site-main">
		{@render children()}
	</main>

	<ToastContainer />

	<Footer />
</div>

<style>
	.app-shell {
		min-height: 100vh;
		background:
			radial-gradient(circle at top, rgba(30, 58, 95, 0.06), transparent 55%),
			var(--bulma-body-background-color);
	}

	.site-main {
		flex: 1;
	}
</style>
