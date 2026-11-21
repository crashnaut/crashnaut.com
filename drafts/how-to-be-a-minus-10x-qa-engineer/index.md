---
title: "How to Be a -10x QA Engineer With an AI Agent"
slug: how-to-be-a-minus-10x-qa-engineer
description: "QA's value is being an independent check. A -10x QA engineer hands that check to the model that wrote the code. A field guide, and the fix."
date: 2026-11-21
tags: AI, QA, Testing Strategy, Playwright
---

<!-- FOLDED into part 1 (blog/how-to-be-a-minus-10x-engineer-with-an-ai-agent/). Do not publish. See drafts/minus-10x-series.md. -->

<!-- TODO(mike): Part 3 of the -10x series (drafts/minus-10x-series.md). Add parts 1
and 2 to the Related line once they're published. A real example from your own QA work
would land well in "Retry until it's green"; never invent one. -->

QA earns its place by being a second pair of eyes that didn't write the code. A -10x QA engineer gives that away to the same model that wrote the feature, then reports the green results as quality. It takes very little effort now, and the cost turns up months later as escaped bugs and a suite nobody trusts. This guide covers the moves, then the +1x version.

The examples use Playwright with TypeScript.

## Test cases got cheap, and owning them didn't

Two years ago, a test case took someone real time to think through and write. That cost limited the suite to the cases somebody believed were worth it. Now an agent can generate 300 cases from one user story before the coffee is ready.

Each of those cases is still code. Someone has to keep it working when the UI changes, and someone has to triage it when it fails. A -10x QA engineer generates cases faster than the team can maintain them, then measures progress by the count.

## Generate the tests from the code

The fastest -10x move is to let the agent read the implementation and write the tests from it. The tests will match the code exactly, because that's where they came from. If the developer's agent misread the ticket, the test agent reads the same code and confirms the same mistake.

A developer's tests check what they meant to build. QA's job is to check what the user will actually meet, and that has to start from the requirement.

<figure class="diagram">
<svg viewBox="0 0 700 300" role="img" aria-label="Two crash runs. Top: the requirement is misread, the agent writes code, then writes tests from the code, and the run passes with the bug intact. Bottom: a human-approved acceptance test is written from the requirement first, the agent writes code, and the test fails on the misread, so it gets fixed before release.">
  <text class="d-title" x="30" y="30">Self-graded</text>
  <rect class="d-box" x="30" y="45" width="130" height="50" rx="6"/>
  <text class="d-text" x="95" y="75" text-anchor="middle">Requirement</text>
  <path class="d-line" d="M160,70 L195,70"/>
  <path class="d-arrow" d="M203,70 l -8,-4 l 0,8 z"/>
  <rect class="d-box-amber" x="205" y="45" width="140" height="50" rx="6"/>
  <text class="d-text" x="275" y="68" text-anchor="middle">Agent writes code</text>
  <text class="d-text-sm" x="275" y="85" text-anchor="middle">misreads one rule</text>
  <path class="d-line" d="M345,70 L380,70"/>
  <path class="d-arrow" d="M388,70 l -8,-4 l 0,8 z"/>
  <rect class="d-box-amber" x="390" y="45" width="140" height="50" rx="6"/>
  <text class="d-text" x="460" y="68" text-anchor="middle">Agent writes tests</text>
  <text class="d-text-sm" x="460" y="85" text-anchor="middle">from the code</text>
  <path class="d-line" d="M530,70 L565,70"/>
  <path class="d-arrow" d="M573,70 l -8,-4 l 0,8 z"/>
  <rect class="d-box-red" x="575" y="45" width="100" height="50" rx="6"/>
  <text class="d-text" x="625" y="68" text-anchor="middle">PASS</text>
  <text class="d-text-sm" x="625" y="85" text-anchor="middle">bug ships</text>
  <text class="d-title" x="30" y="170">Independent</text>
  <rect class="d-box" x="30" y="185" width="130" height="50" rx="6"/>
  <text class="d-text" x="95" y="215" text-anchor="middle">Requirement</text>
  <path class="d-line" d="M160,210 L195,210"/>
  <path class="d-arrow" d="M203,210 l -8,-4 l 0,8 z"/>
  <rect class="d-box-green" x="205" y="185" width="140" height="50" rx="6"/>
  <text class="d-text" x="275" y="208" text-anchor="middle">Acceptance test</text>
  <text class="d-text-sm" x="275" y="225" text-anchor="middle">human approved</text>
  <path class="d-line" d="M345,210 L380,210"/>
  <path class="d-arrow" d="M388,210 l -8,-4 l 0,8 z"/>
  <rect class="d-box-amber" x="390" y="185" width="140" height="50" rx="6"/>
  <text class="d-text" x="460" y="208" text-anchor="middle">Agent writes code</text>
  <text class="d-text-sm" x="460" y="225" text-anchor="middle">misreads one rule</text>
  <path class="d-line" d="M530,210 L565,210"/>
  <path class="d-arrow" d="M573,210 l -8,-4 l 0,8 z"/>
  <rect class="d-box-green" x="575" y="185" width="100" height="50" rx="6"/>
  <text class="d-text" x="625" y="208" text-anchor="middle">FAIL</text>
  <text class="d-text-sm" x="625" y="225" text-anchor="middle">fixed first</text>
  <text class="d-text-sm" x="350" y="280" text-anchor="middle">Same agent, same mistake. Only the order changed.</text>
</svg>
<figcaption>A test written from the code can't disagree with it. A test written from the requirement first is the only one that can catch a misread.</figcaption>
</figure>

## Retry until it's green

Playwright can retry failing tests with the `retries` option, and it reports a test that failed first and then passed as "flaky" [1]. A -10x QA engineer sets retries to five, stops reading the flaky list and calls the run green.

When a test still fails, ask the agent to fix it. It may add a fixed wait or loosen the assertion until the failure goes away. The race condition is still in the product, and the suite has been taught to look away from it.

## Let the agent triage every failure

A triage agent that reads logs and stack traces and sorts failures into product bugs, automation issues, test data and environment problems is a good tool. The -10x version accepts every label without looking. "Environment issue" is the most comfortable label there is, because nobody has to do anything about it.

The agent's label is a suggestion, and the QA engineer still owns the decision, and for noticing when the same "environment issue" has appeared every night for a month.

## Wait for the build

Developers on high-AI-adoption teams merged 98% more pull requests [2]. A -10x QA engineer ignores all of them and waits for a deployed build to test.

By then the cheapest moment to find the bug is gone. A pull request shows what changed, which files it touched and which tests came with it. Ten minutes reading the PR, asking "what happens if the list is empty?", is worth more than an hour testing the build afterward.

## The +1x version

:::compare
::do[Keep the check independent]

- Write acceptance tests from the requirement, and have a human approve them before the code exists.
- Read the PR. Ask questions about edge cases and leave them as comments.
- Keep retries low in CI and treat every flaky test as a bug with an owner.
- Use one small agent for one repetitive daily task, and review what it produces.
- Let the triage agent suggest a label, then decide yourself.

::dont[Outsource the independence]

- Generate tests from the implementation.
- Count test cases as progress.
- Raise retries until the run is green.
- Accept "environment issue" without reading the log.

:::

Here is the low-retry setting. In a scratch run with `CI` set, a test that failed once and then passed showed up as "1 flaky" in the report:

```ts:playwright.config.ts
import { defineConfig } from "@playwright/test"

export default defineConfig({
  // Retry once in CI so flaky tests
  // show up in the report.
  retries: process.env.CI ? 1 : 0,
})
```

:::tip
QA's value is independence, so every test has to come from somewhere other than the code it checks.
:::

## Why it matters for your team

In a payments flow, a test written from the code will happily confirm a rounding rule the developer's agent invented, and the first independent check becomes the customer's bank statement.

Related: [Coverage Is a Health Signal, Not a Per-PR Gate](/blog/coverage-is-a-health-signal), [AI Code Smells: A Review Checklist](/blog/ai-code-smells-review-checklist), [What Late QA Really Costs](/blog/what-late-qa-really-costs)

## Sources

1. Playwright, "Retries", playwright.dev, accessed November 21, 2026. <https://playwright.dev/docs/test-retries>
2. Faros AI, "The AI Productivity Paradox Report 2025", faros.ai, July 23, 2025. <https://www.faros.ai/blog/ai-productivity-paradox-report-2025>
