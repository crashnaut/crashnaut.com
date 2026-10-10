## TL;DR

Keep Playwright tests in their own repo and still run them on every app PR: GitHub Actions can check out **two repositories in one workflow**.

The flow: check out the PR → check out the test repo into `tests/` → start the app → run Playwright against `BASE_URL`.

Token: use a fine-grained PAT scoped to the test repo with Contents: Read-only (or a GitHub App via `actions/create-github-app-token`). Don't use a classic `repo`-scope token.

```yaml
- uses: actions/checkout@v7
  with:
    ref: ${{ github.event.pull_request.head.sha }}

- uses: actions/checkout@v7
  with:
    repository: your-org/your-test-repo-name
    token: ${{ secrets.PLAYWRIGHT_TESTS_TOKEN }}
    path: tests

- uses: actions/setup-node@v7
  with:
    node-version: 22
    cache: "npm"
    cache-dependency-path: |
      package-lock.json
      tests/package-lock.json

- run: npm ci && (cd tests && npm ci && npx playwright install --with-deps chromium)
- run: npm run dev & npx wait-on http://localhost:3000 --timeout 60000
- run: cd tests && npx playwright test
  env:
    BASE_URL: http://localhost:3000
```

Config: read `baseURL` from `process.env.BASE_URL` so the same suite runs against localhost or a deployed preview.

When to bother: large suites, separate test ownership, or one suite shared across apps. For a small suite, keep it in the app repo.
