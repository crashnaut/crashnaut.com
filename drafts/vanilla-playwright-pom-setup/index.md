---
title: "Vanilla Playwright with Page Object Model: A Clean Setup"
date: 2024-10-18
draft: true
tags: ["playwright", "testing", "automation", "page-object-model", "typescript"]
summary: "A production-ready Playwright boilerplate with Page Object Model, domain-driven architecture, and Docker support—without the overhead of BDD frameworks."
---

# Vanilla Playwright with Page Object Model: A Clean Setup

## Why Vanilla Playwright?

Not every project needs BDD. Sometimes you want the power and speed of Playwright without the overhead of Cucumber/Gherkin.

This is that setup: pure Playwright with a clean Page Object Model architecture.

## The Core Architecture

### Domain-Driven Page Objects

Organize by feature, not by page type:

```
page-objects/
├── base/
│   └── basePage.ts          # Shared functionality
├── home/
│   └── homePage.ts           # Home page logic
├── login/
│   └── loginPage.ts          # Login page logic
└── pageFactory.ts            # Factory + navigation
```

No generic `pages/` folder. Each feature domain gets its own directory.

### Combined Factory Pattern

One class handles both navigation and page instantiation:

```typescript
// Navigate and get page
const homePage = await pageFactory(page).homePage()

// Get page without navigation (already on page)
const loginPage = pageFactory(page).getPage(LoginPage)
```

Simpler than separate navigation helpers and factory classes.

## Base Page Pattern

All page objects extend `BasePage`:

```typescript
export class BasePage {
  protected readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async waitForPageToLoad() {
    await this.page.waitForFunction(
      () => document.readyState === 'complete'
    )
  }

  getButton(name: string): Locator {
    return this.page.getByRole('button', { name: new RegExp(name, 'i') })
  }

  getInput(name: string): Locator {
    return this.page
      .getByLabel(new RegExp(name, 'i'))
      .or(this.page.getByPlaceholder(new RegExp(name, 'i')))
  }
}
```

Common methods available to all page objects.

## Example Page Object

```typescript
export class LoginPage extends BasePage {
  private get emailInput(): Locator {
    return this.page.getByLabel(/email/i)
  }

  private get passwordInput(): Locator {
    return this.page.getByLabel(/password/i)
  }

  private get submitButton(): Locator {
    return this.getButton('login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
    await this.waitForPageToLoad()
  }

  async hasErrorMessage(): Promise<boolean> {
    const error = this.page.locator('[role="alert"]')
    return await error.isVisible({ timeout: 5000 })
  }
}
```

**Key principles:**
- Private getters for locators
- Public methods for actions
- No assertions (those belong in tests)
- Return Locators, not elements

## Test Structure

Clean, readable tests:

```typescript
test.describe('Login Flow', () => {
  test('successful login with valid credentials', async ({ page }) => {
    const loginPage = await pageFactory(page).loginPage()
    await loginPage.login(validUser.email, validUser.password)
    
    // Assertions in tests, not page objects
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('shows error with invalid credentials', async ({ page }) => {
    const loginPage = await pageFactory(page).loginPage()
    await loginPage.login('invalid@test.com', 'wrong')
    
    expect(await loginPage.hasErrorMessage()).toBe(true)
  })
})
```

## Environment Configuration

Test against different environments:

```typescript
const getBaseUrl = (env: string) => {
  switch (env) {
    case 'local': return 'http://localhost:3000'
    case 'dev': return 'https://your-app.dev'
    case 'staging': return 'https://your-app.staging'
    case 'production': return 'https://your-app.com'
  }
}
```

Run with environment variables:

```bash
ENVIRONMENT=local pnpm test
ENVIRONMENT=dev pnpm test
ENVIRONMENT=staging pnpm test
```

## Docker Testing

Two modes for different scenarios:

### Local Mode
Start your app, test against it:

```bash
pnpm docker:build
pnpm docker:test:local
```

The container:
1. Starts your dev server
2. Waits for it to be ready
3. Runs tests against localhost
4. Shuts down

Perfect for PR testing.

### Remote Mode
Test deployed environments:

```bash
pnpm docker:test:dev
pnpm docker:test:staging
```

No local server needed. Tests hit your deployed app.

Perfect for post-deployment validation.

## Project Structure

```
playwright-pom-boilerplate/
├── tests/
│   ├── e2e/                    # E2E test specs
│   │   ├── home.spec.ts
│   │   └── login.spec.ts
│   ├── smoke/                  # Quick smoke tests
│   │   └── smoke.spec.ts
│   ├── page-objects/           # POM
│   │   ├── base/
│   │   ├── home/
│   │   ├── login/
│   │   └── pageFactory.ts
│   ├── test-data/             # Test data
│   │   └── testData.ts
│   └── utils/                 # Helpers
│       └── helpers.ts
├── Dockerfile.playwright       # Docker image
├── playwright.config.ts        # Configuration
└── package.json               # Scripts & deps
```

## GitHub Actions Integration

Three workflows included:

1. **PR Workflow** - Tests every pull request (local mode)
2. **Dev Workflow** - Tests after dev deployments (remote mode)
3. **Smoke Workflow** - Periodic health checks (every 6 hours)

All use Docker for consistency.

## Best Practices Built In

### ✅ Do

- Use `data-testid` or semantic selectors
- Extend all page objects from `BasePage`
- Keep assertions in test files
- Return Locators from page objects
- Organize by domain/feature
- Use Docker for CI/CD

### ❌ Don't

- Put assertions in page objects
- Use CSS/XPath selectors when avoidable
- Create a generic `pages/` folder
- Hardcode wait times
- Skip Docker in CI

## Quick Start

```bash
# Clone and install
git clone <repo>
cd playwright-pom-boilerplate
pnpm install
pnpm install-browsers

# Run tests
pnpm test                 # All tests
pnpm test:local          # Local environment
pnpm test:headed         # With browser visible
pnpm test:ui             # UI mode (great for debugging)

# View report
pnpm report
```

## When to Use This vs BDD

**Use vanilla Playwright when:**
- Only technical team writes tests
- Don't need Gherkin scenarios
- Want faster test execution
- Prefer TypeScript over natural language
- Simpler setup (no BDD generation step)

**Use BDD when:**
- Product/BA write scenarios
- Need living documentation
- Want stakeholder collaboration
- Tests should be readable by non-developers

Both approaches use the same POM architecture underneath.

## The Boilerplate

Complete boilerplate with:
- Domain-driven page objects
- Combined factory pattern
- Docker support (local & remote)
- GitHub Actions workflows
- Environment configuration
- TypeScript with path aliases
- Example tests

**Get it here:** [GitHub - playwright-pom-boilerplate](#)

## Running in CI

GitHub Actions workflow example:

```yaml
- name: Build Docker image
  run: docker build -f Dockerfile.playwright -t playwright-pom .

- name: Run tests
  run: |
    docker run --rm \
      -v ${{ github.workspace }}/playwright-report:/app/playwright-report \
      -e ENVIRONMENT=local \
      playwright-pom pnpm test

- name: Upload report
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
```

Consistent environment, every time.

## Rapid Setup with Nix Flakes

Get all dependencies (Node.js 20+, pnpm, OrbStack) installed automatically:

```bash
curl --proto '=https' --tlsv1.2 -sSf -L \
  https://install.determinate.systems/nix | sh -s -- install

git clone https://github.com/crashnaut/nix
cd nix/mac
nix run nix-darwin -- switch --flake .#your-hostname
```

Five minutes to a fully configured SDET environment.

[Learn more about the Nix setup →](https://crashnaut.com/blog/nix-flakes-for-sdet-setup)

## Key Differences from Other Setups

### This Boilerplate
- ✅ Domain-driven structure
- ✅ Combined factory + navigation
- ✅ Docker with local & remote modes
- ✅ TypeScript path aliases
- ✅ Production-ready CI/CD

### Typical Playwright Setup
- ❌ Generic `pages/` folder
- ❌ Separate navigation helper
- ❌ No Docker examples
- ❌ Basic or no CI/CD
- ❌ Minimal organization

## Resources

- [Complete boilerplate repository](#)
- [Playwright documentation](https://playwright.dev/)
- [Nix Flakes SDET setup guide](https://crashnaut.com/blog/nix-flakes-for-sdet-setup)

## Wrapping Up

Vanilla Playwright with a solid Page Object Model gives you fast, maintainable E2E tests without BDD overhead. 

The key is good architecture: domain-driven organization, clean page objects, and Docker for consistency.

Start with the boilerplate, customize for your app, and you'll have production-ready tests in under an hour.

---

*Coming soon: Advanced Playwright patterns, Docker optimization, and scaling test suites. [Follow for updates](#).*
