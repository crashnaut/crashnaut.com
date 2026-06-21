import { test, expect } from "@playwright/test"

test("sitemap includes core routes and listed blog posts are reachable", async ({
  request,
}) => {
  const sitemap = await request.get("/sitemap.xml")
  expect(sitemap.ok()).toBeTruthy()
  expect(sitemap.headers()["content-type"]).toMatch(/xml/)

  const sitemapXml = await sitemap.text()
  const paths = [...sitemapXml.matchAll(/<loc>(.+?)<\/loc>/g)].map(
    ([, url]) => new URL(url).pathname,
  )
  expect(paths).toEqual(expect.arrayContaining(["/", "/blog", "/contact"]))
  expect(paths).not.toContain("/bits")

  const blogPaths = paths.filter((url) => url.startsWith("/blog/")).sort()
  expect(blogPaths.length).toBeGreaterThan(0)

  for (const postPath of blogPaths.slice(0, 3)) {
    await test.step(`${postPath} loads`, async () => {
      const response = await request.get(postPath)
      expect(response.ok()).toBeTruthy()
      const html = await response.text()
      expect(html).toContain("<h1")
    })
  }
})

test("rss feed works", async ({ request }) => {
  const response = await request.get("/blog/rss.xml")
  expect(response.ok()).toBeTruthy()
  expect(response.headers()["content-type"]).toMatch(/xml/)
  const xml = await response.text()
  expect(xml).toContain("<rss")
})

test("homepage works", async ({ request }) => {
  const response = await request.get("/")
  expect(response.ok()).toBeTruthy()
  const html = await response.text()
  expect(html).toContain("Hi, I'm Mike")
  expect(html).toContain(">BLOG<")
})

test("homepage has a single title and meta description", async ({
  request,
}) => {
  const response = await request.get("/")
  expect(response.ok()).toBeTruthy()
  const html = await response.text()
  expect(html.match(/<title>/g)?.length).toBe(1)
  expect(html.match(/<meta[^>]*name="description"[^>]*>/g)?.length).toBe(1)
})

test("blog works", async ({ request }) => {
  const response = await request.get("/blog")
  expect(response.ok()).toBeTruthy()
  const html = await response.text()
  expect(html).toContain('aria-label="Search"')
  const articleCount = (html.match(/<article/g) ?? []).length
  expect(articleCount).toBeGreaterThanOrEqual(6)
})

test("/contact has exactly one meta description tag", async ({ request }) => {
  const response = await request.get("/contact")
  expect(response.ok()).toBeTruthy()
  const html = await response.text()
  const matches = html.match(/<meta[^>]*name="description"[^>]*>/g) ?? []
  expect(matches).toHaveLength(1)
})

test("blog article page renders heading and section content", async ({
  request,
}) => {
  const response = await request.get("/blog/playwright-bdd")
  expect(response.ok()).toBeTruthy()
  const html = await response.text()
  expect(html).toContain("Playwright BDD: Combining Cucumber with Page Objects")
  expect(html).toContain("The Problem with Functional BDD Implementations")
})

test("blog article includes structured data", async ({ request }) => {
  const response = await request.get("/blog/playwright-bdd")
  expect(response.ok()).toBeTruthy()
  const html = await response.text()
  expect(html).toContain("application/ld+json")
  expect(html).toContain("BlogPosting")
})

test("compare block markdown renders as HTML, not raw delimiters", async ({
  request,
}) => {
  const response = await request.get("/blog/the-feature-flag-nightmare")
  expect(response.ok()).toBeTruthy()
  const html = await response.text()
  expect(html).toContain('class="compare-block"')
  expect(html).toContain('class="compare-col do"')
  expect(html).toContain('class="compare-col dont"')
  expect(html).not.toContain(":::compare")
  expect(html).not.toContain("::dont[What actually ships to users]")
})
