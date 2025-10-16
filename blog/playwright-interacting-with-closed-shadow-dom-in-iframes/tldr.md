## Quick Solution

Add this helper function to your test utilities:

```typescript
async function forceOpenShadowDOM(page: Page) {
  await page.addInitScript(() => {
    const orig = Element.prototype.attachShadow
    Element.prototype.attachShadow = function (init) {
      return orig.call(this, { ...init, mode: 'open' })
    }
  })
}
```

## Usage

Apply to all tests:

```typescript
test.beforeEach(async ({ page }) => {
  await forceOpenShadowDOM(page)
})
```

Or to specific tests:

```typescript
test('test shadow DOM', async ({ page }) => {
  await forceOpenShadowDOM(page)
  await page.goto('https://your-app.com')
  
  // Access shadow DOM elements normally
  await page.locator('#shadow-host').locator('button').click()
})
```

## How It Works

1. Intercepts `attachShadow()` calls before page loads
2. Forces all shadow DOMs to `mode: 'open'`
3. Playwright can now access previously closed elements
4. Works in iFrames too

## Important

⚠️ **Test environment only** - fundamentally changes app behavior  
⚠️ **Call before navigation** - must inject script before page loads  
✅ **Works with iFrames** - perfect for embedded components

## The Problem

Closed shadow DOM (`#shadow-root (closed)`) blocks Playwright from accessing internal elements. This technique intercepts shadow DOM creation at the browser level and forces open mode, allowing your tests to interact with any shadow DOM content.
