---
title: "Vanilla Playwright with Page Object Model: A Clean Setup"
slug: vanilla-playwright-pom-setup
description: "A Playwright Page Object Model layout with no BDD and no BasePage: one pageFactory owns navigation, page objects own interactions, specs read like scripts."
author: Mike Sell
date: 2026-01-16T00:00:00.000Z
updated: 2026-10-09T00:00:00.000Z
tags: Playwright, Page Object Model, TypeScript, Test Architecture
---

# Vanilla Playwright with Page Object Model: A Clean Setup

Not every team needs BDD. If only engineers write your tests, the Cucumber/Gherkin layer is overhead you can skip. You keep the same Page Object Model underneath, just without the translation step. (If you _do_ want the Gherkin layer, I wrote about that in [Playwright BDD](/blog/playwright-bdd); both setups share this same architecture.)

The whole thing in one picture: specs and page objects both meet at a single `pageFactory`. The factory owns navigation and hands the right page object back to the spec.

<figure class="diagram">
<svg viewBox="0 0 720 400" role="img" aria-label="Three spec files call only the pageFactory. The factory navigates and builds each page object. A hazard band underneath marks the assertion boundary: expect() is allowed in specs and not in page objects.">
  <text class="d-title" x="117" y="36" text-anchor="middle">Specs</text>
  <text class="d-title" x="360" y="36" text-anchor="middle">Factory</text>
  <text class="d-title" x="603" y="36" text-anchor="middle">Page objects</text>

  <rect class="d-box" x="24" y="64" width="186" height="44" rx="5"/>
  <text class="d-text" x="117" y="91" text-anchor="middle">login.spec.ts</text>
  <rect class="d-box" x="24" y="134" width="186" height="44" rx="5"/>
  <text class="d-text" x="117" y="161" text-anchor="middle">products.spec.ts</text>
  <rect class="d-box" x="24" y="204" width="186" height="44" rx="5"/>
  <text class="d-text" x="117" y="231" text-anchor="middle">smoke.spec.ts</text>

  <path class="d-line" d="M210,86 C240,86 238,140 268,140"/>
  <path class="d-arrow" d="M276,140 l-8,-4 l0,8 z"/>
  <path class="d-line" d="M210,156 L268,156"/>
  <path class="d-arrow" d="M276,156 l-8,-4 l0,8 z"/>
  <path class="d-line" d="M210,226 C240,226 238,172 268,172"/>
  <path class="d-arrow" d="M276,172 l-8,-4 l0,8 z"/>

  <rect class="d-fill" x="276" y="116" width="168" height="80" rx="6"/>
  <text class="d-on-fill" x="360" y="152" text-anchor="middle">pageFactory</text>
  <text class="d-on-fill" x="360" y="172" text-anchor="middle">goto() + construct</text>
  <text class="d-text-sm" x="360" y="222" text-anchor="middle">the only door in</text>

  <path class="d-line" d="M444,140 C474,140 472,86 502,86"/>
  <path class="d-arrow" d="M510,86 l-8,-4 l0,8 z"/>
  <path class="d-line" d="M444,156 L502,156"/>
  <path class="d-arrow" d="M510,156 l-8,-4 l0,8 z"/>
  <path class="d-line" d="M444,172 C474,172 472,226 502,226"/>
  <path class="d-arrow" d="M510,226 l-8,-4 l0,8 z"/>

  <rect class="d-box-green" x="510" y="64" width="186" height="44" rx="5"/>
  <text class="d-text" x="603" y="91" text-anchor="middle">loginPage</text>
  <rect class="d-box-green" x="510" y="134" width="186" height="44" rx="5"/>
  <text class="d-text" x="603" y="161" text-anchor="middle">productsPage</text>
  <rect class="d-box-green" x="510" y="204" width="186" height="44" rx="5"/>
  <text class="d-text" x="603" y="231" text-anchor="middle">cartPage</text>

  <rect class="d-box-amber" x="8" y="282" width="704" height="106" rx="6"/>
  <path class="d-line" d="M20,294 l10,-10 M44,294 l10,-10 M68,294 l10,-10 M92,294 l10,-10 M116,294 l10,-10 M140,294 l10,-10 M164,294 l10,-10 M188,294 l10,-10 M212,294 l10,-10 M236,294 l10,-10 M260,294 l10,-10 M284,294 l10,-10 M308,294 l10,-10 M332,294 l10,-10 M356,294 l10,-10 M380,294 l10,-10 M404,294 l10,-10 M428,294 l10,-10 M452,294 l10,-10 M476,294 l10,-10 M500,294 l10,-10 M524,294 l10,-10 M548,294 l10,-10 M572,294 l10,-10 M596,294 l10,-10 M620,294 l10,-10 M644,294 l10,-10 M668,294 l10,-10 M692,294 l10,-10"/>
  <text class="d-title" x="360" y="318" text-anchor="middle">Hazard band: the assertion boundary</text>
  <rect class="d-box-green" x="24" y="330" width="186" height="42" rx="5"/>
  <text class="d-text" x="117" y="356" text-anchor="middle">✓ expect() allowed</text>
  <text class="d-text-sm" x="360" y="356" text-anchor="middle">Law 1: page objects never call expect()</text>
  <rect class="d-box-red" x="510" y="330" width="186" height="42" rx="5"/>
  <text class="d-text" x="603" y="356" text-anchor="middle">✕ no expect() here</text>
</svg>
<figcaption>Specs depend only on the pageFactory; the factory owns navigation and constructs the right page object.</figcaption>
</figure>

This is the vanilla version, drawn from a real production suite. It's deliberately boring in the right places. The whole design comes down to a few rules about _where code is allowed to live_.

## The shape of it

```
test/
├── e2e/
│   ├── login/                 # UI-login specs (real form + 2FA)
│   └── smoke/                 # read-only page-load checks
├── page-objects/
│   ├── auth/loginPage.ts
│   ├── products/productsPage.ts
│   ├── …/                     # one folder per feature domain
│   ├── topNavBar.ts           # shared component object
│   └── pageFactory.ts         # owns goto() + page construction
├── fixtures/
│   └── test.ts                # extended `test` with an auth session
├── test-data/                 # users, fixtures, parameterized cases
└── utils/                     # plain helper functions
```

Two things are deliberately _absent_: there's no generic `pages/` dump (page objects live in feature folders), and there's no `navigationPage.ts` (the factory handles navigation). Organize by domain, not by file type.

## The layers, and the one rule that matters

Everything hangs off a single principle: **assertions live in specs; interactions live in page objects.** The full set of laws are all corollaries of that boundary:

1. Assertions stay in `*.spec.ts`. Page objects never call `expect()`.
2. Interactions and waits stay in page objects. Specs read like a manual script.
3. User-facing locators first. `getByRole` before CSS, XPath last.
4. Don't hide multi-step flows behind opaque helpers. Thin factory navigation is the only allowed shortcut.
5. Avoid explicit `timeout:` on waits and assertions; use the config defaults.

## pageFactory owns navigation

One class constructs page objects _and_ handles `goto()`. No separate navigation helper, no `BasePage.navigate()`. Each method navigates, waits for load, and returns the page object. It also takes a `skipGoto` flag for when you've already arrived (e.g. you clicked a nav link to get there).

```typescript
import type { Page } from "@playwright/test"
import { LoginPage } from "./auth/loginPage"
import { ProductsPage } from "./products/productsPage"
import { waitForPageToLoad } from "../utils/waitForPageToLoad"

export interface GotoOptions {
  skipGoto?: boolean
}

class PageFactory {
  constructor(private readonly page: Page) {}

  private async navigate(path: string, options?: GotoOptions) {
    if (options?.skipGoto) return
    await this.page.goto(path)
    await waitForPageToLoad(this.page)
  }

  async loginPage(options?: GotoOptions): Promise<LoginPage> {
    await this.navigate("/login", options)
    return new LoginPage(this.page)
  }

  async productsPage(options?: GotoOptions): Promise<ProductsPage> {
    await this.navigate("/products", options)
    return new ProductsPage(this.page)
  }
}

export const pageFactory = (page: Page): PageFactory => new PageFactory(page)
```

`waitForPageToLoad` is a plain util, not magic. `goto()` already waits for the `load` event, so the helper's job is to wait for whatever your app shows when it's actually _usable_:

```typescript
// utils/waitForPageToLoad.ts
import type { Page } from "@playwright/test"

export async function waitForPageToLoad(page: Page): Promise<void> {
  await page.waitForLoadState("domcontentloaded")
  // Swap in your app's own "ready" signal: a main landmark, a heading, a spinner going away.
  await page.getByRole("main").waitFor({ state: "visible" })
}
```

In a spec, navigation is always `await pageFactory(page).somePage()`, never a raw `page.goto()`.

## Page objects: composition, not inheritance

There is no `BasePage`. Page objects hold a `page` reference, expose locators and actions, and pull shared behavior from plain util functions and small component objects (like a top nav bar) rather than from a class hierarchy. (Inheritance trees get tangled fast.)

```typescript
export class ProductsPage {
  readonly topNavBar: TopNavBar

  constructor(private readonly page: Page) {
    this.topNavBar = new TopNavBar(page)
  }

  getAddToCartButton(): Locator {
    return this.page.getByRole("button", { name: "Add to Cart" })
  }

  getViewCartButton(): Locator {
    return this.page.getByRole("button", { name: "View Cart" })
  }
}
```

Method names follow fixed prefixes so a page object is scannable at a glance: `get*` returns a `Locator`, `click*` clicks, `fill*` fills inputs, `waitFor*` waits for state.

## Locators: reach for the accessible ones first

This is where most flaky suites are won or lost. Playwright's locator priority is the policy: target what the _user_ perceives, not how the markup happens to be built today.

:::compare
::do[Reach for these first]

- `getByRole('button', { name: 'Login' })`
- `getByText`, `getByLabel`, `getByPlaceholder`
- `getByTestId` when role/label/text genuinely can't target it
  ::dont[Avoid these]
- CSS chains and XPath (`page.locator()` is the last resort)
- `.nth()` / `.first()` to paper over ambiguity
- `getByTestId` when `getByRole` already works
  :::

Real UIs fight back, and the page object is exactly where you absorb that. When icon-font glyphs pollute an accessible name and break a plain `getByRole('link', { name })`, combine a role query with a text filter, and leave a comment so the next person knows why:

```typescript
// Icon-font noise in the header breaks a plain name match.
getNavLink(name: string): Locator {
  return this.page.getByRole('link').filter({
    has: this.page.getByText(name, { exact: true }),
  })
}
```

## Specs read like a manual script

Because all the machinery lives below them, specs end up short and narrative. Page-object variables are named `onXxxPage`, so a test reads as "on the dashboard page, click products; on the products page, the buttons are visible":

```typescript
import { expect, test } from "../../fixtures/test"
import { pageFactory } from "../../page-objects/pageFactory"

test.describe("Products", { tag: ["@smoke", "@products"] }, () => {
  test("should navigate to Products page", async ({ page }) => {
    const onDashboardPage = await pageFactory(page).dashboardPage()

    await onDashboardPage.topNavBar.clickProducts()

    const onProductsPage = await pageFactory(page).productsPage({
      skipGoto: true,
    })

    await expect(onProductsPage.getAddToCartButton()).toBeVisible()
    await expect(onProductsPage.getViewCartButton()).toBeVisible()
  })
})
```

Note the `skipGoto: true`: the click already landed us on the page, so the factory constructs the page object without re-navigating.

## Log in once, via the API

Logging in through the UI before every test is slow and turns an auth hiccup into a hundred red specs. So the default path logs in through the API (the Playwright equivalent of Cypress's `cy.login()`) by extending the base `test` with an auth fixture:

```typescript
export const test = base.extend<AuthFixtures>({
  apiLogin: [true, { option: true }],
  loginUser: [getAdminUser(), { option: true }],

  page: async ({ page, apiLogin, loginUser }, use) => {
    if (apiLogin) await loginViaApi(page.request, loginUser)
    await use(page)
  },
})
```

`loginViaApi` does the unglamorous real-world work: GET the login page, scrape the CSRF token, POST the credentials, and you've got a session without touching the UI. Specs that genuinely test the login form import `@playwright/test` directly instead, and the handful that test API login itself opt out with `test.use({ apiLogin: false })`.

## Smoke tests: name them for what they actually assert

Smoke specs are read-only "did the page load?" checks. The trap is letting the title promise more than the assertions deliver. A green "should show products list" that only checks a heading is a lie waiting to mislead someone during an incident.

:::compare
::do[Name fits the assertion]

- "should navigate to Products page" (checks the landmark buttons)
- "should show Cart heading from Cart tab"
  ::dont[Name oversells]
- "should show products list" (implies table rows it never checks)
- "should complete checkout" (implies an action and an output)
  :::

When the same flow must hold for several user variants (regions, roles), don't copy-paste specs. Loop over a parameterized list of cases and tag each with its variant, so one spec body covers them all.

## Configuration, honestly

The config is small on purpose: base URL from an env var, Chromium on a desktop-Chrome profile, fully parallel, retries and artifacts only on CI.

```typescript
export default defineConfig({
  testDir: "./test/e2e",
  fullyParallel: true,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [["html", { open: "never" }], ["list"]] : [["list"]],
  use: {
    baseURL: process.env.BASE_URL,
    trace: isCI ? "on-first-retry" : "on",
    screenshot: isCI ? "only-on-failure" : "off",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
})
```

Trace-on for local runs is the quiet hero here: when something fails on your machine, the trace viewer already has the whole story.

## This setup vs the one you usually inherit

:::compare
::do[This setup]

- Domain folders, one per feature
- One `pageFactory` owns `goto()` + construction
- Composition: util functions + component objects
- Assertions only in specs; user-facing locators
  ::dont[The setup to avoid]
- A generic `pages/` dump
- A separate navigation helper class
- A deep `BasePage` inheritance tree
- `expect()` leaking into page objects; CSS/XPath everywhere
  :::

## Wrapping up

Vanilla Playwright with a disciplined POM gives you E2E tests that are quick to read and change, without a BDD layer. The architecture is almost entirely about boundaries: navigation in the factory, interactions in page objects, assertions in specs, accessible locators throughout. Hold those lines and the suite stays pleasant to work in as it grows.

**Part 2:** once the suite grows past a handful of specs, [Playwright Page Factory + Composition](/blog/playwright-page-factory-composition) builds on this setup with shared UI as composed components, and a `pageFactory` fixture so specs never wire the factory by hand.

For a runnable starting point, see [crashnaut/playwright-pom-boilerplate](https://github.com/crashnaut/playwright-pom-boilerplate) on GitHub. It's a simpler, earlier version of this layout.

<!-- TODO(mike): the boilerplate repo still ships tests/page-objects/base/basePage.ts and has no skipGoto/GotoOptions — update it to match this post (or reword the line above). -->

If you want the whole environment (Node, pnpm, browsers) set up in one go, I covered that in [Nix Flakes for SDET Setup](/blog/nix-flakes-for-sdet-setup).
