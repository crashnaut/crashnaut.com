## Quick Guide

**Problem:** BDD implementations become unmaintainable with functional utilities instead of Page Objects.

**Solution:** Combine Gherkin with Page Object Model.

### Clone & Setup

```bash
git clone https://github.com/crashnaut/playwright-pom-boilerplate
cd playwright-pom-boilerplate
pnpm install
pnpm install-browsers
```

### Key Architecture

```typescript
// Domain-driven page objects
page-objects/
├── home/homePage.ts
├── login/loginPage.ts
└── pageFactory.ts

// Combined factory + navigation
const loginPage = await pageFactory(page).loginPage()
const homePage = pageFactory(page).getPage(HomePage)
```

### Usage

```bash
pnpm bddgen    # Generate tests from features
pnpm test      # Run tests
pnpm docker:test:local  # Docker testing
```

**When to use:** BDD for stakeholder collaboration, Plain POM for technical-only testing.

