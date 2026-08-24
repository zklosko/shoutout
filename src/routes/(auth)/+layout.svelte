<script>
	let { children } = $props();
</script>

<section class="hero is-fullheight has-background-light">
	<div class="hero-body">
		<div class="box">
			{@render children()}
		</div>
	</div>
</section>
