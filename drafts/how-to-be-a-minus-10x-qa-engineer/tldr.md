---
title: "How to Be a -10x QA Engineer With an AI Agent"
slug: how-to-be-a-minus-10x-qa-engineer
---

A test written from the code can't disagree with it. Keep QA independent:

```ts:playwright.config.ts
import { defineConfig } from "@playwright/test"

export default defineConfig({
  // Retry once in CI so flaky tests
  // show up in the report.
  retries: process.env.CI ? 1 : 0,
})
```

1. Write acceptance tests from the requirement and have a human approve them before the code exists.
2. Read the PR and ask edge-case questions as comments.
3. Keep retries low and treat every flaky test as a bug with an owner.
4. Let a triage agent suggest a label; decide yourself.
5. Don't count generated test cases as progress.
