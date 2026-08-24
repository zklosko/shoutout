<script>
	import { page } from '$app/state';
</script>

<section class="hero is-fullheight has-background-light">
	<div class="hero-body">
		<div class="box">
			<div class="centered-shell">
				<div class="centered-card">
					<h1 class="title">{page.status}</h1>

					<p class="is-text-7 has-color-grey">
					{#if page.status === 404}
						That page doesn't exist.
					{:else}
						{page.error?.message ?? 'Something went wrong.'}
					{/if}
					</p>

					<a href="/" class="button mt-4">
						Back home
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

