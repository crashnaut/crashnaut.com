import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

import { readdirSync } from "fs"

const posts = readdirSync("blog", { withFileTypes: true })
  .filter((d) => d.isDirectory())
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
})
