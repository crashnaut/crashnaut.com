---
title: "Playwright BDD: Combining Cucumber with Page Objects"
slug: playwright-bdd
description: "Combine Cucumber/Gherkin with the Page Object Model in Playwright so BDD suites stay maintainable instead of decaying into scattered utility functions."
author: Mike Sell
date: 2025-11-28T00:00:00.000Z
updated: 2026-10-09T00:00:00.000Z
tags: BDD, Playwright, Page Object Model, Cucumber
---

## The Problem with Functional BDD Implementations

I've seen many BDD implementations that start well but become unmaintainable over time. The most common issue is using functional programming patterns with utility functions instead of proper Page Objects.

What typically happens:

- Test utilities become a scattered mess of functions
- Duplicated logic across different step definitions
- No clear ownership of UI interactions
- Difficult to refactor when the UI changes
- Hard for new team members to understand

## The Solution: BDD + POM

If your team needs Gherkin, combine it with the Page Object Model so the code behind the scenarios stays maintainable.

### Feature Files (Gherkin)

Write scenarios in business language:

```gherkin
Feature: User Login

  @login @smoke
  Scenario: Successful login
    Given the user is on the login page
    When the user logs in with valid credentials
    Then the user should see the dashboard
```

### Page Objects (Maintainable UI Logic)

Encapsulate UI interactions in page classes:

```typescript
export class LoginPage extends BasePage {
  private get emailInput(): Locator {
    return this.page.getByLabel(/email/i)
  }

  async login(email: string, password: string) {
    await this.fillInput(this.emailInput, email)
    await this.fillInput(this.passwordInput, password)
    await this.submitButton.click()
  }
}
```

:::note
This example extends a `BasePage` for shared helpers like `fillInput`. My newer setup drops the base class entirely in favor of composition (small component objects and plain util functions), because inheritance trees get tangled as a suite grows. The BDD layer works the same either way; see [Vanilla Playwright with Page Object Model](/blog/vanilla-playwright-pom-setup) for the no-`BasePage` version.
:::

### Step Definitions (The Glue)

Connect Gherkin to Page Objects:

```typescript
When("the user logs in with valid credentials", async ({ page }) => {
  const loginPage = pageFactory(page).getPage(LoginPage)
  await loginPage.login(validUser.email, validUser.password)
})
```

## Key Architecture Decisions

### Domain-Driven Page Objects

Don't use a generic `pages/` folder. Organize by feature domains:

```
page-objects/
├── home/
│   └── homePage.ts
├── login/
│   └── loginPage.ts
└── checkout/
    └── checkoutPage.ts
```

This matches your application structure and makes it easy to find what you need.

### Combined Factory + Navigation

Instead of separate navigation and factory classes, use a combined approach:

```typescript
// Navigate to page
const homePage = await pageFactory(page).homePage()

// Get existing page instance
const loginPage = pageFactory(page).getPage(LoginPage)
```

It's a cleaner API with less boilerplate.

### No Assertions in Page Objects

Keep page objects pure:

```typescript
// ❌ Bad
export class LoginPage {
  async login(email, password) {
    // ...
    expect(this.page.url()).toContain("/dashboard") // Don't do this
  }
}

// ✅ Good
export class LoginPage {
  async login(email, password) {
    // ... just actions, no assertions
  }
}

// Assertions in step definitions
Then("the user should be logged in", async ({ page }) => {
  expect(page.url()).toContain("/dashboard") // Assertions here
})
```

## Docker for Consistency

Two modes of testing:

### Local Mode (PR Testing)

- Starts your app inside the container
- Tests against `localhost:3000`
- Useful for validating changes before merge

### Remote Mode (Environment Testing)

- Tests against deployed environments
- No local app needed
- For dev/staging/production validation

```bash
# Build once
pnpm docker:build

# Test locally
pnpm docker:test:local

# Test deployed environment
pnpm docker:test:dev
```

## CI/CD Integration

Three GitHub Actions workflows:

1. PR workflow: every pull request
2. Dev workflow: after deployments
3. Smoke workflow: every 6 hours against all environments

All three run in Docker for consistency.

## Benefits of This Approach

If your team needs Gherkin, this is what each group gets from it.

### For Product/BA

- Write scenarios in plain English
- No technical knowledge required
- Features become living documentation

### For QA/SDET

- Maintainable page objects
- Clear separation of concerns
- Easy to refactor when UI changes
- Reusable step definitions

### For Developers

- Scenarios serve as specifications
- Can run tests locally
- Quick feedback loop
- Clear acceptance criteria

## The Boilerplate

I've created a complete boilerplate with:

- Playwright BDD (playwright-bdd package)
- Domain-driven page objects
- Combined factory pattern
- Docker support
- GitHub Actions workflows
- Comprehensive documentation

**Get it here:** [GitHub: crashnaut/playwright-pom-boilerplate](https://github.com/crashnaut/playwright-pom-boilerplate)

<!-- TODO(mike): as of 2026-10 the public repo has no playwright-bdd dependency, no features/ folder and no `bddgen` script (package.json only has playwright test scripts + docker). Either push the BDD version to the repo or reword "I've created a complete boilerplate with: Playwright BDD..." and the `pnpm bddgen` step below (same in tldr.md). -->

```bash
git clone https://github.com/crashnaut/playwright-pom-boilerplate
cd playwright-pom-boilerplate
```

## Getting Started

```bash
# Install
pnpm install
pnpm install-browsers

# Generate tests from features
pnpm bddgen

# Run tests
pnpm test
```

That's the whole setup, about five minutes from clone to running tests.

## When to Use BDD vs Plain POM

Use BDD if your team needs Gherkin, for example when you're:

- Collaborating with non-technical stakeholders
- Needing living documentation
- Wanting tests readable by Product/BA
- Having multiple people write scenarios

Use plain POM when:

- Pure technical testing
- Don't need Gherkin scenarios
- Want one less layer (no `bddgen` step, no step-definition indirection)
- Only QA/developers write tests

## Lessons Learned

### 1. Don't Use Functional Utilities

I've refactored too many codebases with messy utility functions. Page Objects are worth the upfront structure.

### 2. Keep Step Definitions Thin

All logic belongs in page objects. Step definitions should just call page object methods and assert.

### 3. Tag Everything

Use tags (`@smoke`, `@regression`) to run different test suites. Not every test needs to run on every commit.

### 4. Docker is Non-Negotiable

The "works on my machine" problem is real. Docker ensures consistency.

## Resources

- [Full boilerplate with examples](https://github.com/crashnaut/playwright-pom-boilerplate)
- [Playwright BDD docs](https://vitalets.github.io/playwright-bdd/)
- [Cucumber best practices](https://cucumber.io/docs/bdd/)

## Wrapping Up

BDD doesn't have to mean unmaintainable test code. If your team needs Gherkin, putting proper Page Objects behind it keeps the scenarios readable for stakeholders and the code underneath maintainable as the application grows.

If only engineers write your tests, the same architecture works without the Gherkin layer. I covered that in [Vanilla Playwright with Page Object Model](/blog/vanilla-playwright-pom-setup).
