---
title: "Playwright Page Factory + Composition: Scaling a Vanilla POM"
slug: playwright-page-factory-composition
description: "Combine a page factory, composition pattern, skipGoto navigation, and a Playwright fixture — so specs stay thin as the suite grows."
author: Mike Sell
date: 2026-03-26T00:00:00.000Z
tags: playwright
---

# Playwright Page Factory + Composition: Scaling a Vanilla POM

If you already have a vanilla Playwright + Page Object Model setup — one `pageFactory` that owns navigation, page objects that own interactions, assertions only in specs — you have the foundation. The next question, once the suite grows past a handful of smoke tests, is how to keep that discipline without every spec file importing and instantiating the factory by hand.

This post picks up where [Vanilla Playwright with Page Object Model](/blog/vanilla-playwright-pom-setup) left off. The additions are deliberate and small:

1. **Composition** — shared UI regions (nav bars, modals, sidebars) as components composed inside page objects.
2. **Conditional navigation** — `skipGoto` when the browser is already on the route.
3. **Fixture-wrapped factory** — inject `pageFactory` into every test so specs never call `pageFactory(page)` themselves.

None of this requires BDD, `BasePage`, or a second navigation class. It's the same architecture, tightened for scale.

## The problem at scale

Early on, this is fine:

```typescript
import { pageFactory } from "../../page-objects/pageFactory"

test("navigates to products", async ({ page }) => {
  const onDashboard = await pageFactory(page).dashboardPage()
  await onDashboard.topNavBar.clickProducts()
  const onProducts = await pageFactory(page).productsPage({ skipGoto: true })
  await expect(onProducts.getAddToCartButton()).toBeVisible()
})
```

It works. But as you add dozens or hundreds of specs, the repetition adds up: same import, same `(page)` wiring, easy to forget `skipGoto` after an in-app navigation click. The factory is the front door to your POM — it should be as automatic as `page` itself.

Meanwhile, shared UI like a top navigation bar starts getting copy-pasted across page objects, or worse, accessed directly from specs. That's where **composition** earns its keep.

## Folder structure (target state)

```
tests/playwright/
├── fixtures/
│   └── test.ts                 # extended test + auth + pageFactory fixture
├── page-objects/
│   ├── pageFactory.ts          # navigate() + xxxPage({ skipGoto? })
│   ├── components/             # shared UI regions
│   │   └── topNavBar.ts
│   ├── auth/loginPage.ts
│   ├── products/productsPage.ts
│   └── …/<feature>/xxxPage.ts
├── e2e/
│   ├── smoke/
│   ├── login/
│   └── regression/
├── test-data/
└── utils/
```

**Page objects** map to routes or features. **Components** map to reusable regions that appear on multiple pages. The factory creates page objects only — components are constructed inside page constructors.

What's still absent on purpose: `navigationPage.ts`, `BasePage`, and a generic `pages/` dump.

## Page factory: navigation + construction

The factory owns `goto`, waits for load, and returns an initialized page object. Every method accepts optional `GotoOptions`:

```typescript
export interface GotoOptions {
  skipGoto?: boolean
}

export class PageFactory {
  constructor(private readonly page: Page) {}

  private async navigate(path: string, options?: GotoOptions): Promise<void> {
    if (options?.skipGoto) return
    await this.page.goto(path)
    await waitForPageToLoad(this.page)
  }

  async productsPage(options?: GotoOptions): Promise<ProductsPage> {
    await this.navigate("/products", options)
    return new ProductsPage(this.page)
  }
}

export const pageFactory = (page: Page): PageFactory => new PageFactory(page)
```

### When to use `skipGoto: true`

Use it when a prior step already put the browser on that URL:

- Clicked a nav link (`topNavBar.clickProducts()`)
- Submitted a form that redirected
- Logged in and landed on the home route

Without `skipGoto`, the factory calls `goto` again — slower, and sometimes resets state you were trying to test.

```typescript
const onDashboard = await pageFactory.dashboardPage()
await onDashboard.topNavBar.clickProducts()

// Browser is already on /products — don't goto again
const onProducts = await pageFactory.productsPage({ skipGoto: true })
```

## Composition: components inside page objects

A **page object** represents a route or feature (`ProductsPage`, `LoginPage`). A **component** represents a reusable region (`TopNavBar`, a modal, a sidebar panel).

Compose in the page constructor:

```typescript
export class ProductsPage {
  readonly topNavBar: TopNavBar

  constructor(private readonly page: Page) {
    this.topNavBar = new TopNavBar(page)
  }

  getAddToCartButton(): Locator {
    return this.page.getByRole("button", { name: "Add to Cart" })
  }
}
```

Specs reach shared UI through the page — never `new TopNavBar(page)` in a spec:

```typescript
await onDashboardPage.topNavBar.clickProducts()
```

### When to extract a component

- The same region appears on **two or more pages** (classic: authenticated top nav).
- A single page object file is getting unwieldy — split by visible region, not arbitrary layers.

Do **not** extract components for markup that only appears on one page. That's premature abstraction.

### Scoping locators inside components

When markup gives you a stable container, scope everything to it:

```typescript
export class HeaderComponent {
  private readonly container: Locator
  readonly profileButton: Locator

  constructor(page: Page) {
    this.container = page.getByRole("banner")
    this.profileButton = this.container.getByRole("button", { name: "Profile" })
  }

  async waitForLoad(): Promise<void> {
    await this.container.waitFor({ state: "visible" })
  }
}
```

Real apps fight back. When icon-font glyphs pollute accessible names in a header, page-level `getByRole` + `filter({ has: getByText(...) })` inside the component is fine — with a comment explaining why.

Components follow the same laws as page objects: **no `expect()`**, `get*` / `click*` / `fill*` prefixes, locators live inside the component.

## Wrap the factory in a Playwright fixture

Once you have more than a few specs, inject the factory the same way you inject `page`:

```typescript
import { test as base } from "@playwright/test"
import {
  pageFactory as createPageFactory,
  type PageFactory,
} from "../page-objects/pageFactory"

type TestFixtures = {
  pageFactory: PageFactory
}

export const test = base.extend<TestFixtures>({
  pageFactory: async ({ page }, use) => {
    await use(createPageFactory(page))
  },
})

export { expect } from "@playwright/test"
```

Note the import alias: `pageFactory as createPageFactory`. The fixture key and the factory function share a name — aliasing keeps the fixture file unambiguous.

Specs destructure `{ pageFactory }` and never import `pageFactory` directly:

```typescript
import { expect, test } from "../../fixtures/test"

test.describe("Products", { tag: ["@smoke", "@products"] }, () => {
  test("should navigate to Products page", async ({ pageFactory }) => {
    const onDashboardPage = await pageFactory.dashboardPage()

    await onDashboardPage.topNavBar.clickProducts()

    const onProductsPage = await pageFactory.productsPage({
      skipGoto: true,
    })

    await expect(onProductsPage.getAddToCartButton()).toBeVisible()
    await expect(onProductsPage.getViewCartButton()).toBeVisible()
  })
})
```

Keep `{ page, pageFactory }` when you assert on URL or other browser-level state:

```typescript
test("lands on analytics after nav click", async ({ page, pageFactory }) => {
  const onDashboard = await pageFactory.dashboardPage()
  await onDashboard.topNavBar.clickReports()

  const onReports = await pageFactory.reportsPage({ skipGoto: true })
  await expect(page).toHaveURL(/\/analytics\//)
  await expect(onReports.getReportsHeading()).toBeVisible()
})
```

### Pairing with API login

If your default fixture also logs in via API (the Playwright equivalent of `cy.login()`), UI-login specs opt out in the describe block — but still get `pageFactory`:

```typescript
test.describe("Login", { tag: ["@auth"] }, () => {
  test.use({ apiLogin: false })

  test("redirects after successful login", async ({ page, pageFactory }) => {
    const onLoginPage = await pageFactory.loginPage()
    await onLoginPage.loginAs(user)
    await expect(page).not.toHaveURL(/\/login/)

    const onHomePage = await pageFactory.dashboardPage({ skipGoto: true })
    await expect(onHomePage.topNavBar.getProductsNavLink()).toBeVisible()
  })
})
```

One import path for every spec. No special-case `@playwright/test` import for login folders unless you have a reason.

## Sub-pages without factory methods

Not every view needs a `pageFactory` entry. List → edit flows can return a sub-page object from an action on the list page:

```typescript
// companyAdminsPage.ts
async editFirstAdmin(): Promise<PermissionsEditPage> {
  await this.page.getByTitle("Edit Permissions").first().click()
  await waitForPageToLoad(this.page)
  return new PermissionsEditPage(this.page)
}
```

```typescript
test("shows location filter when editing admin", async ({ pageFactory }) => {
  const onAdminsPage = await pageFactory.companyAdminsPage()
  const onEditPage = await onAdminsPage.editFirstAdmin()

  await expect(onEditPage.getFilterLocationsButton()).toBeVisible()
})
```

Reserve factory methods for routes you `goto` directly. Sub-views reached only through in-app navigation can be constructed by page object actions.

## The laws (unchanged, still worth repeating)

1. **Assertions only in `*.spec.ts`.** Page objects and components never call `expect()`.
2. **Interactions and waits in page objects / components.** Specs read like manual scripts.
3. **Navigate via `pageFactory.xxxPage()`** — through the fixture, not raw `page.goto()` in specs.
4. **User-facing locators first** — `getByRole` before CSS; `page.locator()` last.
5. **Don't hide whole journeys** in opaque helpers; thin factory navigation is the allowed shortcut.

## This vs what you usually inherit

:::compare
::do[This setup]

- `pageFactory` fixture in every spec
- Composition for shared UI (`TopNavBar`, modals)
- `skipGoto` after in-app navigation
- Feature folders + `components/` for shared regions
- Factory methods only for direct `goto` routes
  ::dont[Common drift]

- `pageFactory(page)` imported in every file
- Copy-pasted nav locators across page objects
- Redundant `goto` after every nav click
- `navigationPage.ts` alongside `pageFactory.ts`
- `expect()` leaking into page objects
  :::

## Wrapping up

Page factory + composition is not a different architecture — it's the same vanilla POM with clearer boundaries as the suite grows. The factory stays the single front door. Components absorb shared UI. `skipGoto` respects navigation you've already done. The fixture removes boilerplate so every new spec starts with `{ pageFactory }` and reads like a script.

If you're setting up from scratch, start with [Vanilla Playwright with Page Object Model](/blog/vanilla-playwright-pom-setup). If you're scaling an existing suite, add the fixture first, then extract components when you see the same region on a second page.
