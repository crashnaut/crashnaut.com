<script lang="ts">
	let { title = '', details = true } = $props();
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="title" content={title} />
	<meta
		name="keywords"
		content="QA, SDET, Test Automation, Playwright, DevOps, CI/CD, Nix, Testing, Blog, Mike, Sell, Mike Sell, Crashnaut"
	/>
	<meta name="author" content="Mike Sell" />
	<meta name="copyright" content="Mike Sell" />

	{#if details}
		<meta name="description" content="Mike Sell (Crashnaut), Senior SDET specializing in test automation, CI/CD, and quality engineering." />

		<meta name="twitter:card" content="summary" />
		<meta name="twitter:title" content="Mike Sell - Crashnaut" />
		<meta name="twitter:description" content="Mike Sell (Crashnaut), Senior SDET specializing in test automation, CI/CD, and quality engineering." />

		<meta name="og:title" content="Mike Sell - Crashnaut" />
		<meta name="og:description" content="Mike Sell (Crashnaut), Senior SDET specializing in test automation, CI/CD, and quality engineering." />
	{/if}
</svelte:head>
