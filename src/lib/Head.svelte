<script lang="ts">
	let { title = '', details = true } = $props();
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="title" content={title} />
	<meta
		name="keywords"
		content="QA, SDET, Test Automation, Playwright, Digital Marketing, Blog, Blogger, Mike, Sell, Mike Sell, Crashnaut"
	/>
	<meta name="author" content="Mike Sell" />
	<meta name="copyright" content="Mike Sell" />

	{#if details}
		<meta name="description" content="Mike Sell (Crashnaut), QA SDET and Digital Marketing specialist." />

		<meta name="twitter:card" content="summary" />
		<meta name="twitter:title" content="Mike Sell - Crashnaut" />
		<meta name="twitter:description" content="Mike Sell (Crashnaut), QA SDET and Digital Marketing specialist." />

		<meta name="og:title" content="Mike Sell - Crashnaut" />
		<meta name="og:description" content="Mike Sell (Crashnaut), QA SDET and Digital Marketing specialist." />
	{/if}
</svelte:head>
