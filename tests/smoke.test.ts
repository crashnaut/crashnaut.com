import { test, expect } from "@playwright/test"
import { sitemapPaths, toLocal } from "./helpers"

test("sitemap lists core routes and every post loads", async ({ request }) => {
  const paths = await sitemapPaths(request)
  expect(paths).toEqual(expect.arrayContaining(["/", "/blog", "/contact"]))

  const posts = paths.filter((p) => p.startsWith("/blog/"))
  expect(posts.length).toBeGreaterThanOrEqual(6)
  for (const path of posts) {
    const res = await request.get(path)
    expect(res.status(), path).toBe(200)
    expect(
      (await res.text()).match(/<h1[\s>]/g),
      `${path} has one h1`,
    ).toHaveLength(1)
  }
})

test("every page has exactly one title, description and canonical", async ({
  request,
}) => {
  for (const path of await sitemapPaths(request)) {
    const html = await (await request.get(path)).text()
    expect(html.match(/<title>/g), path).toHaveLength(1)
    expect(html.match(/<meta name="description"/g), path).toHaveLength(1)
    expect(html.match(/<link rel="canonical"/g), path).toHaveLength(1)
  }
})

test("every page's share image exists", async ({ request }) => {
  for (const path of await sitemapPaths(request)) {
    const html = await (await request.get(path)).text()
    const og = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1]
    if (!og) throw new Error(`${path} has no og:image`)
    const image = await request.get(toLocal(og))
    expect(image.status(), `${path} -> ${og}`).toBe(200)
    expect(image.headers()["content-type"]).toContain("image/png")
  }
})

test("internal links resolve", async ({ request }) => {
  const seen = new Set<string>()
  for (const path of await sitemapPaths(request)) {
    const html = await (await request.get(path)).text()
    for (const [, href] of html.matchAll(/href="(\/[^"#?]*)/g)) {
      if (seen.has(href) || href.startsWith("/_app/")) continue
      seen.add(href)
      const res = await request.get(href)
      expect(res.status(), `${path} links to ${href}`).toBeLessThan(400)
    }
  }
})

test("no leftovers from the forked template", async ({ request }) => {
  // The site started from timdeschryver.dev; none of its IDs or copy should ship.
  const banned =
    /timdeschryver|carbonads|ko-fi|beehiiv|MDEwOlJlcG9zaXRvcnkxNzg3MjYyMDg|Hi, I'm Tim|indieweb-avatar/i
  for (const path of [...(await sitemapPaths(request)), "/blog/rss.xml"]) {
    const body = await (await request.get(path)).text()
    expect(body.match(banned)?.[0], path).toBeUndefined()
  }
})

test("rss feed carries full content with absolute links", async ({
  request,
}) => {
  const res = await request.get("/blog/rss.xml")
  expect(res.ok()).toBeTruthy()
  expect(res.headers()["content-type"]).toMatch(/xml/)
  const xml = await res.text()
  expect(xml).not.toMatch(/="undefined"/)
  expect(xml).toContain("<content:encoded>")
  // RFC 822 dates, e.g. "Fri, 09 Oct 2026 00:00:00 GMT"
  expect(xml).toMatch(
    /<pubDate>\w{3}, \d{2} \w{3} \d{4} [\d:]{8} GMT<\/pubDate>/,
  )
  expect(xml).not.toMatch(/(href|src)="\/(?!\/)/)
})

test("posts show their real publish date, not the formatting commit", async ({
  request,
}) => {
  const html = await (
    await request.get("/blog/vanilla-playwright-pom-setup")
  ).text()
  expect(html).toContain("Nov 2, 2025")
  expect(html).not.toMatch(/>\s*Modified/)
})

test("compare blocks render as HTML, not raw delimiters", async ({
  request,
}) => {
  const html = await (
    await request.get("/blog/the-feature-flag-nightmare")
  ).text()
  expect(html).toContain('class="compare-block"')
  expect(html).toContain('class="compare-col do"')
  expect(html).not.toContain(":::compare")
})

test("unpublished posts redirect instead of 404ing", async ({ request }) => {
  // firebase.json redirects; the preview server just needs to not serve them
  const res = await request.get("/blog/llms-unkept-promise-to-sdets", {
    maxRedirects: 0,
  })
  expect(res.status()).not.toBe(200)
})
