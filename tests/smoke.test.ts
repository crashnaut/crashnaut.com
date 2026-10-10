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

test("diagrams follow the house rules (docs/STYLE.md §3)", async ({
  request,
}) => {
  const posts = (await sitemapPaths(request)).filter((p) =>
    p.startsWith("/blog/"),
  )
  const problems: string[] = []
  let diagrams = 0
  for (const path of posts) {
    const html = await (await request.get(path)).text()
    for (const [figure] of html.matchAll(
      /<figure class="diagram">[\s\S]*?<\/figure>/g,
    )) {
      diagrams++
      const svg = figure.match(/<svg[^>]*>/)?.[0] ?? ""
      const where = `${path} diagram ${diagrams}`
      if (!svg) problems.push(`${where}: no <svg>`)
      if (!svg.includes('role="img"')) problems.push(`${where}: no role="img"`)
      if (!/aria-label="[^"]{10,}"/.test(svg))
        problems.push(`${where}: no aria-label`)
      if (!/<figcaption>[^<]+/.test(figure))
        problems.push(`${where}: no figcaption`)
      if (/<(marker|style|script|foreignObject)\b/.test(figure))
        problems.push(
          `${where}: uses <marker>, <style>, <script> or <foreignObject>`,
        )
      if (/(fill|stroke)="(#|hsl|rgb)|style="|hsla?\(|rgba?\(/.test(figure))
        problems.push(`${where}: hard-coded colour`)
    }
  }
  expect(diagrams).toBeGreaterThan(10)
  expect(problems).toEqual([])
})

test("unpublished posts redirect instead of 404ing", async ({ request }) => {
  // firebase.json redirects; the preview server just needs to not serve them
  const res = await request.get("/blog/llms-unkept-promise-to-sdets", {
    maxRedirects: 0,
  })
  expect(res.status()).not.toBe(200)
})

test("pairwise grid matches the post's own pairwise table", async ({
  request,
}) => {
  const html = await (
    await request.get("/blog/the-feature-flag-nightmare")
  ).text()
  const table = html.match(/<table>[\s\S]*?Flag A[\s\S]*?<\/table>/)?.[0]
  if (!table) throw new Error("pairwise table not found")
  const runs = [
    ...table.matchAll(/<tr>\s*<td>(\d+)<\/td>([\s\S]*?)<\/tr>/g),
  ].map(([, run, cells]) => ({
    run,
    values: [...cells.matchAll(/<td>(on|off)<\/td>/g)].map(([, v]) => v),
  }))
  expect(runs).toHaveLength(5)

  const cells = [
    ...html.matchAll(
      /data-pair="([A-D])([A-D])" data-values="(on|off)\/(on|off)" data-runs="([\d,]+)"/g,
    ),
  ]
  expect(cells).toHaveLength(24)
  for (const [, a, b, va, vb, marked] of cells) {
    const i = "ABCD".indexOf(a)
    const j = "ABCD".indexOf(b)
    const covering = runs
      .filter((r) => r.values[i] === va && r.values[j] === vb)
      .map((r) => r.run)
    expect(covering.length, `${a}${b} ${va}/${vb} is covered`).toBeGreaterThan(
      0,
    )
    expect(marked, `${a}${b} ${va}/${vb}`).toBe(covering.join(","))
  }
})

test("each new diagram sits under its section heading", async ({ request }) => {
  const expected: [string, string][] = [
    ["/blog/the-feature-flag-nightmare", "Why automation doesn"],
    ["/blog/cross-repo-playwright-ci", "The Solution"],
    [
      "/blog/playwright-interacting-with-closed-shadow-dom-in-iframes",
      "Important Considerations",
    ],
    ["/blog/playwright-page-factory-composition", "When to use"],
    [
      "/blog/test-database-isolation-function-vs-class",
      "Two isolation levels, chosen per test",
    ],
  ]
  for (const [path, heading] of expected) {
    const html = await (await request.get(path)).text()
    const match = new RegExp(
      `<h([23])[^>]*>(?:(?!</h[23]>)[\\s\\S])*${heading}[\\s\\S]*?</h\\1>`,
    ).exec(html)
    if (!match) throw new Error(`${path} has no "${heading}" heading`)
    const section =
      html.slice(match.index + match[0].length).split(/<h[23][\s>]/)[0] ?? ""
    expect(section, `${path}: diagram under "${heading}"`).toContain(
      '<figure class="diagram">',
    )
  }
})
