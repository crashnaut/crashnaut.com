---
title: "Playwright BDD: Combining Cucumber with Page Objects"
slug: playwright-bdd
description: "A production-ready Playwright BDD boilerplate that solves the maintainability issues of functional test utilities by combining Cucumber/Gherkin with the Page Object Model."
author: Mike Sell
date: 2024-10-18T00:00:00.000Z
tags: ["playwright", "bdd"]
---

# Playwright BDD: Combining Cucumber with Page Objects

## The Problem with Functional BDD Implementations

I've seen many BDD implementations that start well but become unmaintainable over time. The most common issue? Using functional programming patterns with utility functions instead of proper Page Objects.

Here's what typically happens:
- Test utilities become a scattered mess of functions
- Duplicated logic across different step definitions
- No clear ownership of UI interactions
- Difficult to refactor when the UI changes
- Hard for new team members to understand

## The Solution: BDD + POM

The answer is simple: combine the readability of BDD/Gherkin with the maintainability of the Page Object Model.

### Feature Files (Gherkin)

Write scenarios in business language:

```yaml
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

### Step Definitions (The Glue)

Connect Gherkin to Page Objects:

```typescript
When('the user logs in with valid credentials', async ({ page }) => {
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

Cleaner API, less boilerplate.

### No Assertions in Page Objects

Keep page objects pure:

```typescript
// ❌ Bad
export class LoginPage {
  async login(email, password) {
    // ...
    expect(this.page.url()).toContain('/dashboard')  // Don't do this
  }
}

// ✅ Good
export class LoginPage {
  async login(email, password) {
    // ... just actions, no assertions
  }
}

// Assertions in step definitions
Then('the user should be logged in', async ({ page }) => {
  expect(page.url()).toContain('/dashboard')  // Assertions here
})
```

## Docker for Consistency

Two modes of testing:

### Local Mode (PR Testing)
- Starts your app inside the container
- Tests against `localhost:3000`
- Perfect for validating changes before merge

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

1. **PR Workflow** - Every pull request
2. **Dev Workflow** - After deployments
3. **Smoke Workflow** - Every 6 hours against all environments

All running in Docker for consistency.

## Benefits of This Approach

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

**Get it here:** [GitHub - playwright-bdd-boilerplate](https://github.com/crashnaut/playwright-pom-boilerplate)

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

That's it. Five minutes from clone to running tests.

## When to Use BDD vs Plain POM

**Use BDD when:**
- Collaborating with non-technical stakeholders
- Need living documentation
- Want tests readable by Product/BA
- Multiple people write scenarios

**Use plain POM when:**
- Pure technical testing
- Don't need Gherkin scenarios
- Faster test execution
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

- [Full boilerplate with examples](#)
- [Playwright BDD docs](https://vitalets.github.io/playwright-bdd/)
- [Cucumber best practices](https://cucumber.io/docs/bdd/)

## Wrapping Up

BDD doesn't have to mean unmaintainable test code. By combining Gherkin with proper Page Objects, you get the best of both worlds: readable tests that stakeholders understand, and maintainable code that scales with your application.

*More posts coming on Playwright patterns, Docker testing strategies, and CI/CD optimization. [Follow me](#) for updates.*
