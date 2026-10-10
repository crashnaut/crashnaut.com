---
title: "Playwright: Interacting with Closed Shadow DOM in iFrames"
slug: playwright-interacting-with-closed-shadow-dom-in-iframes
description: "Force closed shadow roots open with Playwright addInitScript to test web components inside iframes, like embedded payment or ID-verification widgets."
author: Mike Sell
date: 2025-10-16T00:00:00.000Z
tags: Playwright, iframes, Shadow DOM, Web Components
---

## The Problem: Closed Shadow DOM

When testing iFrames with Playwright (which, unlike Cypress, has excellent iframe support), you may encounter a particularly tricky scenario: the **closed Shadow DOM**. In your browser's DevTools, it looks like this:

![Example of closed shadow root in browser devtools](./images/shadow-root-closed.png)

Notice the `#shadow-root (closed)` label.

A common place to hit this combination is embedded third-party widgets (payment fields, identity-verification flows) that render inside an iframe and keep their internals in a closed shadow root.

## Why Shadow DOM is Closed

The Shadow DOM provides encapsulation for web components, isolating their internal structure from the rest of the page. When a Shadow DOM is set to `closed` mode, it's mostly about encapsulation:

- Isolation: makes it harder for page scripts to reach into or tamper with the component's internals. It's a deterrent rather than a security boundary: any script that runs first can patch `attachShadow`, which is exactly what the trick below does.
- Encapsulation: ensures component internals remain private and protected from outside interference
- API contract: forces interaction through the component's public API only

While these are valid architectural decisions, they create a challenge for automated testing where you need to verify the component's internal state.

## The Testing Challenge

When you try to use Playwright to interact with elements inside a closed Shadow DOM, you'll encounter errors because Playwright cannot pierce through the closed boundary. The DOM query simply fails to find the elements you're looking for.

For most test engineers, this seems like game over. However, there's a clever workaround.

## The Solution: Force Open Shadow DOM

You can intercept the Shadow DOM creation at the browser level and force all Shadow DOMs to be created in `open` mode instead:

![Example of open shadow root in browser devtools](./images/shadow-root-open.png)

Notice the difference: `#shadow-root (open)` allows Playwright to access the internal elements.

## Implementation

This is the function that does it:

```typescript
async function forceOpenShadowDOM(page: Page) {
  await page.addInitScript(() => {
    const orig = Element.prototype.attachShadow
    Element.prototype.attachShadow = function (init) {
      // Force mode: 'open' even if the component requests 'closed'
      return orig.call(this, { ...init, mode: "open" })
    }
  })
}
```

This function uses Playwright's `addInitScript()` to inject JavaScript that runs before any page scripts load. It:

1. Saves the original `attachShadow` method
2. Overrides `Element.prototype.attachShadow`
3. Intercepts all Shadow DOM creation calls
4. Forces the mode to `'open'` regardless of what the component requests
5. Keeps all other initialization options

## Usage in Tests

Add this to your test setup to apply it to all tests:

```typescript
test.beforeEach(async ({ page }) => {
  await forceOpenShadowDOM(page)
  // Your test setup continues...
})
```

Alternatively, for specific tests:

```typescript
test("should interact with shadow DOM elements", async ({ page }) => {
  await forceOpenShadowDOM(page)
  await page.goto("https://your-app.com")

  // Now you can access shadow DOM elements normally
  await page.locator("#shadow-host").locator("button").click()
})
```

## Inside an iframe

`addInitScript()` runs in child frames as well as the top-level page. Playwright evaluates it whenever a child frame is attached or navigated, in the context of that frame, so one call covers the iframe too. Combine it with `frameLocator()`:

```typescript
test("should fill a field inside a closed shadow root in an iframe", async ({ page }) => {
  await forceOpenShadowDOM(page) // also runs in every child frame
  await page.goto("https://your-app.com/checkout")

  const widget = page.frameLocator('iframe[title="Payment"]')

  // Playwright locators pierce open shadow roots, so no special selectors needed
  await widget.getByLabel("Cardholder name").fill("Test User")
  await expect(widget.getByRole("button", { name: "Pay" })).toBeEnabled()
})
```

## Important Considerations

- Test environment only: this technique should only be used in testing environments. It fundamentally changes how the application behaves.
- Timing matters: call `forceOpenShadowDOM()` before navigating to your page, as it needs to inject the script before the page loads.
- iFrame support: this works within iFrames as well, which is what you need for embedded components.
- Declarative Shadow DOM isn't covered: a shadow root declared in HTML with `<template shadowrootmode="closed">` is created by the HTML parser, not by calling `attachShadow()`, so this override never sees it and the root stays closed.

This approach gives you the testing capability you need while respecting that closed Shadow DOM serves legitimate purposes in production code.
