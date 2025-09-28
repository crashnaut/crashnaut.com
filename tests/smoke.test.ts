import { test, expect } from '@playwright/test';

test('sitemap works and can navigate to random pages', async ({ page, request }) => {
	const sitemapUrls = await test.step('get sitemap and parse urls', async () => {
		const sitemap = await request.get(`/sitemap.xml`);
		expect(sitemap.ok()).toBeTruthy();

		const sitemapXml = await sitemap.text();
		const urls = [...sitemapXml.matchAll(/<loc>(.+?)<\/loc>/g)];
		expect(urls.length).toBeGreaterThan(50);
		return urls.map(([_, url]) => new URL(url).pathname).filter((url) => url.startsWith('/blog/'));
	});

	const randomPosts = sitemapUrls.sort(() => 0.5 - Math.random()).slice(0, 10);
	expect(randomPosts).toHaveLength(10);
	for (const post of randomPosts) {
		await test.step(`${post} loads`, async () => {
			const response = await page.goto(post);
			expect(response.ok()).toBeTruthy();

			const banner = await page.goto(`${post}/images/banner.webp`);
			expect(banner.ok()).toBeTruthy();

			// await injectAxe(page);
			// await checkA11y(page);
		});
	}
});

test('rss feed works ', async ({ page }) => {
	const response = await page.goto('/blog/rss.xml');
	expect(response.ok()).toBeTruthy();
});

test('homepage works ', async ({ page }) => {
	const response = await page.goto('/');
	expect(response.ok()).toBeTruthy();
});

test('blog works ', async ({ page }) => {
	const response = await page.goto('/blog');
	expect(response.ok()).toBeTruthy();
});

test('resources works ', async ({ page }) => {
	let response = await page.goto('/resources/ngrx');
	expect(response.ok()).toBeTruthy();
	response = await page.goto('/resources/sql');
	expect(response.ok()).toBeTruthy();
});

test('contributors works ', async ({ page }) => {
	await page.goto(
		'/blog/configuring-azure-application-insights-in-an-angular-application#sending-custom-events-and-traces-to-application-insights',
	);
	await expect(
		page.getByText('A warm thank you to the contributors of this blog post'),
	).toBeDefined();
	await expect(page.getByText('Dzhavat Ushev')).toBeDefined();
});

test('translations works ', async ({ page }) => {
	await page.goto('/blog/single-component-angular-modules-and-component-tests-go-hand-in-hand');
	await expect(page.getByText('This article is also available in')).toBeDefined();
	await expect(page.getByText('Español by Dany Paredes')).toBeDefined();
});
