## TL;DR

Vanilla Playwright + Page Object Model, no BDD, no `BasePage`, no separate navigation helper. The whole design is about _where code is allowed to live_.

**The one rule:** assertions live in specs; interactions live in page objects. Specs depend only on `pageFactory`; the factory owns navigation and constructs page objects.

**Layout:**

```
test/
├── e2e/{login,smoke}/          # specs
├── page-objects/
│   ├── auth/loginPage.ts
│   ├── products/productsPage.ts
│   ├── topNavBar.ts            # shared component object
│   └── pageFactory.ts          # owns goto() + construction
├── fixtures/test.ts            # extended test with auth session
├── test-data/  └── utils/
```

**pageFactory owns navigation** (`skipGoto` to reuse a page). No `navigationPage.ts`:

```typescript
class PageFactory {
  constructor(private readonly page: Page) {}

  private async navigate(path: string, options?: GotoOptions) {
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

**Page objects: composition, no `BasePage`.** `get*` returns a Locator, `click*`/`fill*`/`waitFor*` act:

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

**User-facing locators first** (`getByRole` → … → `getByTestId` → `page.locator()` last):

:::compare
::do[Reach for first]

- `getByRole({ name })`, `getByText`, `getByLabel`
- `getByTestId` only when needed
  ::dont[Avoid]
- CSS chains, XPath, `.nth()`/`.first()`
- `getByTestId` when `getByRole` works
  :::

When icon-font noise breaks a plain name match, filter a role query by text:

```typescript
// Icon-font noise in the header breaks a plain name match.
getNavLink(name: string): Locator {
  return this.page.getByRole('link').filter({
    has: this.page.getByText(name, { exact: true }),
  })
}
```

**Specs read like a manual script** (`onXxxPage` variables, assertions only here):

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

**Log in once via the API** (like `cy.login()`); UI-login specs import `@playwright/test`:

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

**Name smoke tests for what they assert** — "navigate to Products page", not "show products list".

**Config — small on purpose:**

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

Pairs with [Playwright BDD](/blog/playwright-bdd) and [Nix for SDET setup](/blog/nix-flakes-for-sdet-setup).
