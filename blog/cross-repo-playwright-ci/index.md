---
title: Run Playwright Tests from a Separate Repository in CI
slug: cross-repo-playwright-ci
description: A practical guide to maintaining Playwright tests in one repository while running them against every PR in your application repository.
author: Mike Sell
date: 2025-10-26T00:00:00.000Z
tags: Playwright, GitHub Actions
---

# Run Playwright Tests from a Separate Repository in CI

## The Problem

You want to keep your Playwright tests in a separate repository from your application code, but you also want those tests to run automatically on every pull request.

Maybe your test suite has grown large enough to deserve its own repo. Maybe you're testing multiple applications with the same test suite. Or maybe you just want clean separation between test code and application code.

Whatever the reason, GitHub Actions doesn't make this obvious. Most examples assume tests live in the same repository.

## The Solution

The key insight: GitHub Actions can check out multiple repositories in a single workflow. This means your application's CI can:

1. Check out the application code (the PR)
2. Check out your test repository
3. Start the application
4. Run the tests

This is simpler than it sounds.

## Prerequisites

Before you start, you'll need:

- An application repository (where PRs happen)
- A test repository with Playwright tests
- A GitHub Personal Access Token with `repo` scope

## Step 1: Create a Personal Access Token

The workflow needs permission to access your private test repository.

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name like `Playwright Tests Access`
4. Select the `repo` scope (full control of private repositories)
5. Generate and copy the token

Now add this to your application repository:

1. Go to your app repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name it `PLAYWRIGHT_TESTS_TOKEN`
4. Paste the token value

## Step 2: Create the Workflow

In your **application repository**, create `.github/workflows/playwright-tests.yml`:

```yaml
name: Playwright Tests
on:
  pull_request:
    branches: [main, develop]

jobs:
  playwright-tests:
    name: Run Playwright Tests
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      # Check out the application (the PR code)
      - name: Checkout app
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}

      # Check out the test repository
      - name: Checkout tests
        uses: actions/checkout@v4
        with:
          repository: your-org/your-test-repo-name
          token: ${{ secrets.PLAYWRIGHT_TESTS_TOKEN }}
          path: tests

      # Set up Node.js
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      # Install app dependencies
      - name: Install app dependencies
        run: npm ci

      # Install test dependencies
      - name: Install test dependencies
        run: |
          cd tests
          npm ci
          npx playwright install --with-deps chromium

      # Start the app in the background
      - name: Start dev server
        run: |
          npm run dev &
          npx wait-on http://localhost:3000 --timeout 60000

      # Run Playwright tests
      - name: Run tests
        run: |
          cd tests
          npx playwright test
        env:
          BASE_URL: http://localhost:3000

      # Upload test report on failure
      - name: Upload test report
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: tests/playwright-report/
          retention-days: 30
```

Replace `your-org/your-test-repo-name` with your actual test repository.

## Step 3: Configure Playwright

In your **test repository**, make sure your `playwright.config.ts` uses environment variables:

```typescript
import { defineConfig } from "@playwright/test"

export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
  },
  // Your other config...
})
```

This allows the tests to run against different environments without code changes.

## Step 4: Install wait-on

The workflow uses `wait-on` to ensure the dev server is ready before running tests. Add it to your **application repository**:

```bash
npm install --save-dev wait-on
```

## Common Issues

### Tests can't find the application

**Problem:** Tests fail with connection errors.

**Solution:** Check that:

- Your dev server actually starts on port 3000 (or update the port)
- The `wait-on` timeout is long enough (default: 60 seconds)
- Your application doesn't require environment variables to start

### Token authentication fails

**Problem:** "fatal: could not read Username" or similar errors.

**Solution:** Make sure:

- The token has `repo` scope
- The secret name matches exactly (`PLAYWRIGHT_TESTS_TOKEN`)
- The token hasn't expired

### Tests pass locally but fail in CI

**Problem:** Tests work on your machine but fail in GitHub Actions.

**Solution:** Common causes:

- Different BASE_URL (check your local `.env`)
- Missing test dependencies (run `npx playwright install --with-deps`)
- Timing issues (add proper waits, not fixed sleeps)

## When to Use This Pattern

This setup makes sense when:

- Your test suite is large and deserves its own repository
- Multiple teams maintain tests vs. application
- You're testing multiple applications with shared tests
- You want independent release cycles for tests and code

Don't overcomplicate things. If your test suite is small, keeping it in the same repository is usually simpler.

## Alternative: Git Submodules

Some teams prefer Git submodules instead of checking out a separate repository in CI. The workflow is slightly different:

```yaml
- name: Checkout app with submodules
  uses: actions/checkout@v4
  with:
    submodules: recursive
    token: ${{ secrets.PLAYWRIGHT_TESTS_TOKEN }}
```

Submodules have their own complexity. The dual-checkout approach is usually cleaner.

## Testing Against Deployed Environments

This workflow tests against `localhost`. To test against deployed preview environments:

```yaml
# Instead of starting the dev server
- name: Wait for deployment
  run: npx wait-on ${{ env.DEPLOY_URL }} --timeout 300000

- name: Run tests
  run: |
    cd tests
    npx playwright test
  env:
    BASE_URL: ${{ env.DEPLOY_URL }}
```

You'll need to integrate this with your deployment system (Vercel, Netlify, etc.) to get the preview URL.

## The Bottom Line

Separating test repositories from application code is straightforward with GitHub Actions' multi-repository checkout. The key is:

1. Use a Personal Access Token for private repositories
2. Check out both repos in the same workflow
3. Install dependencies for both
4. Use environment variables for configuration

This pattern scales well and keeps your test code organized separately without sacrificing CI integration.

_More posts on Playwright patterns and CI/CD optimization coming soon._
