---
title: "Vanilla Playwright with Page Object Model: A Clean Setup"
slug: vanilla-playwright-pom-setup
description: "A production-grade Playwright + Page Object Model layout — no BDD, no base-class inheritance, no separate navigation helper. One pageFactory owns navigation, page objects own interactions, and specs read like manual scripts."
author: Mike Sell
date: 2025-11-02T00:00:00.000Z
tags: playwright, testing, page-object-model, typescript
---

# Vanilla Playwright with Page Object Model: A Clean Setup

Not every team needs BDD. If only engineers write your tests, the Cucumber/Gherkin layer is overhead you can skip — you keep the same Page Object Model underneath, just without the translation step. (If you *do* want the Gherkin layer, I wrote about that in [Playwright BDD](/blog/playwright-bdd); both setups share this same architecture.)

Here's the whole thing in one picture: specs and page objects both meet at a single `pageFactory` — the factory owns navigation and hands the right page object back to the spec.

<figure class="diagram">
<svg viewBox="0 0 720 430" role="img" aria-label="Two panels. Page objects on the right point to a central pageFactory, which points to the test specs on the left.">
  <defs>
    <marker id="vfa" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" refX="9" refY="6" orient="auto">
      <path d="M0,0 L11,6 L0,12 Z" class="d-flow-head"/>
    </marker>
  </defs>
  <rect class="d-panel" x="8" y="8" width="246" height="414" rx="8"/>
  <rect class="d-panel" x="266" y="8" width="446" height="414" rx="8"/>
  <text class="d-title" x="131" y="44" text-anchor="middle">Tests</text>
  <text class="d-title" x="489" y="44" text-anchor="middle">Code</text>

  <path class="d-flow" d="M296,203 L223,121" marker-end="url(#vfa)"/>
  <path class="d-flow" d="M296,215 L223,215" marker-end="url(#vfa)"/>
  <path class="d-flow" d="M296,227 L223,309" marker-end="url(#vfa)"/>
  <path class="d-flow" d="M538,121 L430,203" marker-end="url(#vfa)"/>
  <path class="d-flow" d="M538,215 L430,215" marker-end="url(#vfa)"/>
  <path class="d-flow" d="M538,309 L430,227" marker-end="url(#vfa)"/>

  <rect class="d-fill" x="39" y="98" width="184" height="46" rx="5"/>
  <text class="d-on-fill" x="131" y="126" text-anchor="middle">login.spec.ts</text>
  <rect class="d-fill" x="39" y="192" width="184" height="46" rx="5"/>
  <text class="d-on-fill" x="131" y="220" text-anchor="middle">products.spec.ts</text>
  <rect class="d-fill" x="39" y="286" width="184" height="46" rx="5"/>
  <text class="d-on-fill" x="131" y="314" text-anchor="middle">smoke.spec.ts</text>

  <rect class="d-fill" x="296" y="188" width="132" height="54" rx="5"/>
  <text class="d-on-fill" x="362" y="219" text-anchor="middle">pageFactory</text>

  <rect class="d-fill" x="538" y="98" width="150" height="46" rx="5"/>
  <text class="d-on-fill" x="613" y="126" text-anchor="middle">loginPage</text>
  <rect class="d-fill" x="538" y="192" width="150" height="46" rx="5"/>
  <text class="d-on-fill" x="613" y="220" text-anchor="middle">productsPage</text>
  <rect class="d-fill" x="538" y="286" width="150" height="46" rx="5"/>
  <text class="d-on-fill" x="613" y="314" text-anchor="middle">cartPage</text>
</svg>
<figcaption>Specs depend only on the pageFactory; the factory owns navigation and constructs the right page object.</figcaption>
</figure>

This is the vanilla version, drawn from a real production suite. It's deliberately boring in the right places. The whole design comes down to a few rules about *where code is allowed to live*.

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
├── test-data/                 # users, fixtures, parametrised cases
└── utils/                     # plain helper functions
```

Two things are deliberately *absent*: there's no generic `pages/` dump (page objects live in feature folders), and there's no `navigationPage.ts` (the factory handles navigation). Organise by domain, not by file type.

## The layers, and the one rule that matters

Everything hangs off a single principle: **assertions live in specs; interactions live in page objects.** The full set of laws are all corollaries of that boundary:

1. **Assertions stay in `*.spec.ts`.** Page objects never call `expect()`.
2. **Interactions and waits stay in page objects.** Specs read like a manual script.
3. **User-facing locators first.** `getByRole` before CSS, XPath last.
4. **Don't hide multi-step journeys** behind opaque helpers — thin factory navigation is the only allowed shortcut.
5. **Avoid explicit `timeout:`** on waits and assertions; use the config defaults.

## pageFactory owns navigation

One class constructs page objects *and* handles `goto()`. No separate navigation helper, no `BasePage.navigate()`. Each method navigates, waits for load, and returns the page object — and takes a `skipGoto` flag for when you've already arrived (e.g. you clicked a nav link to get there).

```typescript
class PageFactory {
  constructor(private readonly page: Page) {}

  private async navigate(path: string, options?: GotoOptions) {
    if (options?.skipGoto) return
    await this.page.goto(path)
    await waitForPageToLoad(this.page)
  }

  async loginPage(options?: GotoOptions): Promise<LoginPage> {
    await this.navigate('/login', options)
    return new LoginPage(this.page)
  }

  async productsPage(options?: GotoOptions): Promise<ProductsPage> {
    await this.navigate('/products', options)
    return new ProductsPage(this.page)
  }
}

export const pageFactory = (page: Page): PageFactory => new PageFactory(page)
```

In a spec, navigation is always `await pageFactory(page).somePage()` — never a raw `page.goto()`.

## Page objects: composition, not inheritance

There is no `BasePage`. Page objects hold a `page` reference, expose locators and actions, and pull shared behaviour from plain util functions and small component objects (like a top nav bar) rather than from a class hierarchy. Inheritance trees get tangled fast; composition stays flat.

```typescript
export class ProductsPage {
  readonly topNavBar: TopNavBar

  constructor(private readonly page: Page) {
    this.topNavBar = new TopNavBar(page)
  }

  getAddToCartButton(): Locator {
    return this.page.getByRole('button', { name: 'Add to Cart' })
  }

  getViewCartButton(): Locator {
    return this.page.getByRole('button', { name: 'View Cart' })
  }
}
```

Method names follow fixed prefixes so a page object is scannable at a glance: `get*` returns a `Locator`, `click*` clicks, `fill*` fills inputs, `waitFor*` waits for state.

## Locators: reach for the accessible ones first

This is where most flaky suites are won or lost. Playwright's locator priority is the policy: target what the *user* perceives, not how the markup happens to be built today.

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

Real UIs fight back, and the page object is exactly where you absorb that. When icon-font glyphs pollute an accessible name and break a plain `getByRole('link', { name })`, combine a role query with a text filter — and leave a comment so the next person knows why:

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
import { expect, test } from '../../fixtures/test'
import { pageFactory } from '../../page-objects/pageFactory'

test.describe('Products', { tag: ['@smoke', '@products'] }, () => {
  test('should navigate to Products page', async ({ page }) => {
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

Logging in through the UI before every test is slow and turns an auth hiccup into a hundred red specs. So the default path logs in through the API — the Playwright equivalent of Cypress's `cy.login()` — by extending the base `test` with an auth fixture:

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

`loginViaApi` does the unglamorous real-world work: GET the login page, scrape the CSRF token, POST the credentials, and you've got a session — no UI, no waiting. Specs that genuinely test the login form import `@playwright/test` directly instead, and the handful that test API login itself opt out with `test.use({ apiLogin: false })`.

## Smoke tests: name them for what they actually assert

Smoke specs are read-only "did the page load?" checks. The trap is letting the title promise more than the assertions deliver — a green "should show products list" that only checks a heading is a lie waiting to mislead someone during an incident.

:::compare
::do[Name fits the assertion]
- "should navigate to Products page" — checks the landmark buttons
- "should show Cart heading from Cart tab"
::dont[Name oversells]
- "should show products list" — implies table rows it never checks
- "should complete checkout" — implies an action and an output
:::

When the same flow must hold for several user variants (regions, roles), don't copy-paste specs — loop over a parametrised list of cases and tag each with its variant, so one spec body covers them all.

## Configuration, honestly

The config is small on purpose: base URL from an env var, Chromium on a desktop-Chrome profile, fully parallel, retries and artifacts only on CI.

```typescript
export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [['html', { open: 'never' }], ['list']] : [['list']],
  use: {
    baseURL: process.env.BASE_URL,
    trace: isCI ? 'on-first-retry' : 'on',
    screenshot: isCI ? 'only-on-failure' : 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
```

Trace-on for local runs is the quiet hero here — when something fails on your machine, the trace viewer already has the whole story.

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

Vanilla Playwright with a disciplined POM gives you fast, readable, maintainable E2E tests without a BDD layer. The architecture is almost entirely about boundaries: navigation in the factory, interactions in page objects, assertions in specs, accessible locators throughout. Hold those lines and the suite stays pleasant to work in as it grows.

If you want the whole environment — Node, pnpm, browsers — set up in one go, I covered that in [Nix Flakes for SDET Setup](/blog/nix-flakes-for-sdet-setup).
