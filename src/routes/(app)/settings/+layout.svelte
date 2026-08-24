<script lang="ts">
	import { page } from '$app/state';

	let { children } = $props();

	const sections = [
		{ href: '/settings', label: 'General' },
		{ href: '/settings/users', label: 'Users' },
		{ href: '/settings/integrations', label: 'Connections' },
		{ href: '/settings/logs', label: 'Logs' }
	];
</script>

<div class="columns">
	<div class="column is-one-quarter">
		<aside class="menu">
			<ul class="menu-list">
				{#each sections as s}
					<li>
						<a href={s.href} class:is-active={page.url.pathname === s.href}>
							{s.label}
						</a>
					</li>
				{/each}
			</ul>
		</aside>
	</div>
	<div class="column">
		{@render children()}
	</div>
</div>
