## TL;DR

Part 2 of [Vanilla Playwright POM](/blog/vanilla-playwright-pom-setup) for larger suites: **composition** for shared UI, **`skipGoto`** for in-app navigation, **`pageFactory` fixture** so specs never wire the factory by hand.

**Folder layout:**

```
tests/playwright/
├── fixtures/test.ts            # auth + pageFactory fixture
├── page-objects/
│   ├── pageFactory.ts
│   ├── components/topNavBar.ts
│   └── <feature>/xxxPage.ts
└── e2e/{smoke,login,regression}/
```

**Fixture** — alias the factory function to avoid name collision:

```typescript
import { pageFactory as createPageFactory, type PageFactory } from "../page-objects/pageFactory"

export const test = base.extend<{ pageFactory: PageFactory }>({
  pageFactory: async ({ page }, use) => {
    await use(createPageFactory(page))
  },
})
```

**Spec** — destructure `pageFactory`, not `pageFactory(page)`:

```typescript
test("navigates to products", async ({ pageFactory }) => {
  const onDashboard = await pageFactory.dashboardPage()
  await onDashboard.topNavBar.clickProducts()
  const onProducts = await pageFactory.productsPage({ skipGoto: true })
  await expect(onProducts.getAddToCartButton()).toBeVisible()
})
```

**Composition** — components in page constructors; specs use `onXxxPage.topNavBar`, never `new TopNavBar(page)` in specs.

**`skipGoto: true`** — after nav click, login redirect, or any step that already landed on the route.

**Extract a component** when UI appears on 2+ pages. Don't add `navigationPage.ts` or `BasePage`.

**Sub-pages** (list → edit) can be returned from page actions without a factory method.
