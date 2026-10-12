import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

import { existsSync, readdirSync } from "fs"

// Only real posts: empty folders left behind by branch switches aren't built.
const posts = readdirSync("blog", { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(`blog/${d.name}/index.md`))
  .map((d) => `/blog/${d.name}`)
const pages = ["/", "/blog", "/contact", ...posts]

for (const scheme of ["light", "dark"] as const) {
  test.describe(`${scheme} theme`, () => {
    test.use({ colorScheme: scheme })

    for (const path of pages) {
      test(`${path} has no serious accessibility violations`, async ({
        page,
      }) => {
        await page.goto(path)
        const { violations } = await new AxeBuilder({ page })
          .exclude("iframe")
          .analyze()
        const serious = violations.filter((v) =>
          ["serious", "critical"].includes(v.impact ?? ""),
        )
        expect(
          serious.map(
            (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`,
          ),
        ).toEqual([])
      })
    }
  })
}

test("search tolerates regex characters and can be cleared", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (e) => errors.push(e.message))
  await page.goto("/blog")
  const search = page.getByRole("searchbox", { name: "Search posts" })

  await search.fill("c++ (")
  await expect(page.getByText("No posts match that.")).toBeVisible()
  await page.getByRole("button", { name: "Clear filters" }).click()
  await expect(search).toHaveValue("")

  await search.fill("playwright")
  await expect(page).toHaveURL(/\?q=playwright/)
  await expect(page.locator(".post-list > li").first()).toBeVisible()
  expect(errors).toEqual([])
})

test("tag filter narrows the list and is shareable", async ({ page }) => {
  await page.goto("/blog")
  const total = await page.locator(".post-list > li").count()
  await page.getByRole("button", { name: "Playwright", exact: true }).click()
  await expect(page).toHaveURL(/tag=Playwright/)
  const filtered = await page.locator(".post-list > li").count()
  expect(filtered).toBeLessThanOrEqual(total)
  expect(filtered).toBeGreaterThan(0)
})

test("TL;DR toggle swaps the post body", async ({ page }) => {
  await page.goto("/blog/vanilla-playwright-pom-setup")
  const tldr = page.getByRole("button", { name: /TL;DR/ })
  await tldr.click()
  await expect(tldr).toHaveAttribute("aria-pressed", "true")
  await expect(page).toHaveURL(/tldr=true/)
  await page.getByRole("button", { name: "Full post" }).click()
  await expect(page).not.toHaveURL(/tldr=true/)
})

test("every post ends with a way to hire me", async ({ page }) => {
  await page.goto("/blog/cross-repo-playwright-ci")
  const cta = page.getByRole("complementary", {
    name: "Want this kind of rigor on your team?",
  })
  await expect(
    cta.getByRole("link", { name: "Book a 30-min call" }),
  ).toHaveAttribute("href", /calendly\.com/)
})

test("unknown pages render the 404 page", async ({ page }) => {
  const res = await page.goto("/this-does-not-exist")
  expect(res?.status()).toBe(404)
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "didn't survive",
  )
})

test.describe("mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } })

  for (const path of pages) {
    test(`${path} has no horizontal scroll`, async ({ page }) => {
      await page.goto(path)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      )
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }

  test("the impact map collapses to a list", async ({ page }) => {
    await page.goto("/blog")
    await expect(page.locator(".impact figure.map")).toBeHidden()
    const list = page.locator(".impact .map-list")
    await expect(list).toBeVisible()
    expect(await list.getByRole("link").count()).toBe(posts.length)
  })
})

test("impact map labels stay on the canvas and never overlap", async ({
  page,
}) => {
  await page.goto("/blog")
  const svg = page.locator(".impact figure.map svg")
  await expect(svg).toBeVisible()
  expect(await svg.locator("a").count()).toBe(posts.length)

  // Rotated text: compare the real (oriented) boxes, not their bounding rects.
  const problems = await svg.evaluate((root: SVGSVGElement) => {
    interface P {
      x: number
      y: number
    }
    const size = root.viewBox.baseVal.width
    const quads = [...root.querySelectorAll("text")].map((t) => {
      const b = t.getBBox()
      const m =
        t.transform.baseVal.consolidate()?.matrix ?? root.createSVGMatrix()
      const corners = [
        [b.x, b.y],
        [b.x + b.width, b.y],
        [b.x + b.width, b.y + b.height],
        [b.x, b.y + b.height],
      ].map(([x, y]) => ({
        x: m.a * x + m.c * y + m.e,
        y: m.b * x + m.d * y + m.f,
      }))
      return { label: t.textContent ?? "", corners }
    })
    const axes = (q: P[]) =>
      q.map((p, i) => {
        const n = q[(i + 1) % q.length]
        return { x: -(n.y - p.y), y: n.x - p.x }
      })
    const overlap = (a: P[], b: P[]) =>
      [...axes(a), ...axes(b)].every((ax) => {
        const pa = a.map((p) => p.x * ax.x + p.y * ax.y)
        const pb = b.map((p) => p.x * ax.x + p.y * ax.y)
        return (
          Math.max(...pa) > Math.min(...pb) + 0.5 &&
          Math.max(...pb) > Math.min(...pa) + 0.5
        )
      })
    const found: string[] = []
    quads.forEach((q, i) => {
      if (q.corners.some((p) => p.x < 0 || p.y < 0 || p.x > size || p.y > size))
        found.push(`off canvas: ${q.label}`)
      for (const other of quads.slice(i + 1)) {
        if (overlap(q.corners, other.corners))
          found.push(`${q.label} overlaps ${other.label}`)
      }
    })
    return found
  })
  expect(problems).toEqual([])
})

test("post headers report what the post contains", async ({ page }) => {
  for (const path of posts) {
    await page.goto(path)
    const counts = await page.evaluate(() => {
      const prose = document.querySelector(".prose")
      if (!prose) throw new Error("no .prose")
      const h2 = prose.querySelectorAll("h2").length
      return {
        h2,
        diagrams: prose.querySelectorAll("figure.diagram, figure.bar-chart")
          .length,
        compares: prose.querySelectorAll(".compare-block").length,
        samples: prose.querySelectorAll("pre").length,
        report: document.querySelector(".crash-report")?.textContent ?? "",
        rings:
          document.querySelectorAll(".recorder .sigil circle[fill='none']")
            .length - 1,
        dots: document.querySelectorAll(".recorder .sigil circle[r='1.7']")
          .length,
        minutes: /(\d+) min read/.exec(
          document.querySelector(".byline")?.textContent ?? "",
        )?.[1],
        gauge: document
          .querySelector(".byline svg.gauge")
          ?.getAttribute("aria-label"),
      }
    })
    const n = (count: number, word: string) =>
      new RegExp(`\\b${count} ${word}${count === 1 ? "" : "s"}\\b`)
    expect(counts.report, path).toMatch(n(counts.h2, "zone"))
    expect(counts.report, path).toMatch(n(counts.samples, "sample"))
    expect(counts.report, path).toMatch(n(counts.diagrams, "diagram"))
    expect(counts.report, path).toMatch(n(counts.compares, "compare"))
    expect(counts.rings, path).toBe(Math.min(5, Math.max(1, counts.h2)))
    expect(counts.dots, path).toBe(counts.h2)
    expect(counts.gauge, path).toBe(`${counts.minutes} minute read`)
  }
})

test("every post row carries a sigil and an outline ribbon", async ({
  page,
}) => {
  for (const path of ["/", "/blog"]) {
    await page.goto(path)
    const rows = page.locator(".post-list > li")
    const total = await rows.count()
    expect(total, path).toBeGreaterThan(0)
    await expect(rows.locator(".sigil svg")).toHaveCount(total)
    const ribbons = rows.getByRole("img", { name: /^Post outline: / })
    await expect(ribbons).toHaveCount(total)
  }
})
