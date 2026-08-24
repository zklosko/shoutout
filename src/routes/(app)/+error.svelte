<script>
	import { page } from '$app/state';
</script>

<div class="container section-sm">
	<div class="container-narrow text-center">
		<div class="centered-card">
			<h1>{page.status}</h1>

			<p class="text-muted">{page.error?.message ?? 'Something went wrong.'}</p>

			<a href="/submit" class="btn btn-secondary btn-submit"> Back to submit </a>
		</div>
	</div>
</div>

<style scoped>
	.container-narrow {
		padding-inline: 0;
	}
	.btn-submit {
		margin-top: var(--space-sm);
		display: inline-flex;
	}
</style>
