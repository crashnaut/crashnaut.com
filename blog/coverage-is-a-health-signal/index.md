---
title: "Coverage Is a Health Signal, Not a Per-PR Gate"
slug: coverage-is-a-health-signal
description: "Making every PR raise the coverage number rewards padded tests. Gate the patch, read the project trend, and coverage starts telling you the truth."
author: Mike Sell
date: 2026-10-10T12:00:00.000Z
tags: Testing Strategy, CI, GitHub Actions, Code Coverage
---

Somewhere along the way, "we should have good test coverage" turned into "every pull request must increase the coverage percentage". It sounds rigorous, and it's one of the faster ways to rot a test suite, because people stop optimizing for covering the code they wrote and start optimizing for making a number go up. This post reads coverage as a trend instead, then wires that up in a TypeScript project with Vitest and Codecov on GitHub Actions (with the pytest-cov equivalent for Python). You'll leave with a `codecov.yml` that checks the code each PR adds and only reports on the total.

## A target for the codebase, reached together

Pick a target for the codebase as a whole, say 80%, and reach it collectively over time. You don't get there by demanding that each PR push the percentage higher. You get there by making sure everyone covers what they build, and then reading the trend as a signal rather than a gate.

## Three patterns to read

Coverage movement only tells you something when you compare it with the work that happened.

**New code shipped with its tests: the ratio holds steady.** You added code and its tests together, so the percentage stays about the same. This is the healthy default and what should happen most of the time. A flat number here is good news, not a failure to "improve".

**Tests written for previously untested code: the ratio climbs.** You went back and covered paths nobody exercised before. Also healthy. This is what backfilling looks like, and it's worth celebrating rather than treating as the only acceptable outcome.

**New code with no tests, or a pile of tests with no movement: investigate.** This is the pattern that's actually a signal. A drop means code shipped untested and pulled the number down. A batch of new tests that doesn't move the number deserves a look too. It often means they hit paths already covered, adding runtime and maintenance without adding protection (the question [before you write any integration test](/blog/anatomy-of-an-integration-test) is whether it covers a path nothing else covers).

<figure class="diagram">
<svg viewBox="0 0 700 300" role="img" aria-label="Illustrative line chart of coverage over eight sprints: flat while features ship with tests, rising during a backfill, then flat despite new tests and finally dropping, marked as the zone to investigate">
  <rect class="d-panel" x="64" y="40" width="263" height="210" rx="4"/>
  <rect class="d-box-green" x="327" y="40" width="172" height="210" rx="4"/>
  <rect class="d-box-amber" x="499" y="40" width="186" height="210" rx="4"/>
  <text class="d-text-sm" x="196" y="58" text-anchor="middle">steady: new code + its tests</text>
  <text class="d-text-sm" x="413" y="58" text-anchor="middle">climb: backfill</text>
  <text class="d-text-sm" x="592" y="58" text-anchor="middle">investigate</text>
  <path class="d-line" d="M60,40 L60,250 L688,250"/>
  <text class="d-text-sm" x="54" y="74" text-anchor="end">80%</text>
  <text class="d-text-sm" x="54" y="134" text-anchor="end">75%</text>
  <text class="d-text-sm" x="54" y="194" text-anchor="end">70%</text>
  <text class="d-text-sm" x="54" y="254" text-anchor="end">65%</text>
  <path class="d-flow" d="M70,190 L155.7,190 L241.4,178 L327.1,178 L412.9,142 L498.6,106 L584.3,106 L670,154"/>
  <circle class="d-node-green" cx="70" cy="190" r="5"/>
  <circle class="d-node-green" cx="155.7" cy="190" r="5"/>
  <circle class="d-node-green" cx="241.4" cy="178" r="5"/>
  <circle class="d-node-green" cx="327.1" cy="178" r="5"/>
  <circle class="d-node-green" cx="412.9" cy="142" r="5"/>
  <circle class="d-node-green" cx="498.6" cy="106" r="5"/>
  <circle class="d-node-red" cx="584.3" cy="106" r="5"/>
  <circle class="d-node-red" cx="670" cy="154" r="5"/>
  <text class="d-text-sm" x="584" y="92" text-anchor="middle">many new tests, flat</text>
  <text class="d-text-sm" x="664" y="178" text-anchor="end">untested code shipped</text>
  <text class="d-text-sm" x="70" y="268" text-anchor="middle">S1</text>
  <text class="d-text-sm" x="155.7" y="268" text-anchor="middle">S2</text>
  <text class="d-text-sm" x="241.4" y="268" text-anchor="middle">S3</text>
  <text class="d-text-sm" x="327.1" y="268" text-anchor="middle">S4</text>
  <text class="d-text-sm" x="412.9" y="268" text-anchor="middle">S5</text>
  <text class="d-text-sm" x="498.6" y="268" text-anchor="middle">S6</text>
  <text class="d-text-sm" x="584.3" y="268" text-anchor="middle">S7</text>
  <text class="d-text-sm" x="670" y="268" text-anchor="middle">S8</text>
  <text class="d-text-sm" x="370" y="292" text-anchor="middle">sprint (illustrative example data, not measured)</text>
</svg>
<figcaption>An illustrative project coverage trend. The first two zones are healthy even though the line is flat for half of it. Only the last zone needs a conversation.</figcaption>
</figure>

## Why the per-PR gate backfires

The moment coverage becomes a gate on every PR, you create incentives to game it. A three-line bug fix gets padded with a trivial test so the number ticks up. People avoid touching legacy code because doing so would "lower coverage" on their PR. Reviewers argue about a percentage instead of about whether the tests are any good. None of that makes the software more correct.

Worse, **the gate punishes exactly the right behavior.** Shipping new code with proportionate tests keeps the ratio flat, and a "must go up" gate reads flat as failed.

## Project vs patch: two different questions

Codecov splits coverage into two checks that map neatly onto this. Per the [Codecov status docs](https://docs.codecov.com/docs/commit-status), the project status "measures overall project coverage and compares it against the base of the pull request", while the patch status "measures lines adjusted in the pull request". The patch check asks whether this PR covered what it built. The project check is the thermometer.

:::compare
::do[Check the patch, report the project]

- Patch: the lines this PR changed must be 80% covered
- Project: shown on every PR, `informational: true`, never blocks
- The trend gets read at retro, against the work done

::dont[Gate the project total on every PR]

- Project: `target: auto`, `threshold: 0%`, so any dip fails
- A refactor that deletes covered code turns the build red
- People pad tests until the number moves

:::

## Wiring it up: Vitest, GitHub Actions and Codecov

Start with coverage output Codecov can read. Vitest's `v8` provider is the default (install `@vitest/coverage-v8`), and the `lcov` reporter writes `coverage/lcov.info`.

```ts:vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src'],
    },
  },
});
```

Vitest also has `coverage.thresholds`, which fails the run when the totals drop below a number. That's a project-level gate living inside the test runner, so I leave it off and let Codecov do the comparing.

Then upload the report from CI with `codecov/codecov-action`:

```yaml:.github/workflows/test.yml
name: test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 24
      - run: npm ci
      - run: npx vitest run --coverage
      - uses: codecov/codecov-action@v7
        with:
          files: ./coverage/lcov.info
          token: ${{ secrets.CODECOV_TOKEN }}
```

On a Python service the only change is the test step: `pytest --cov=src --cov-report=xml:coverage.xml`, with `files: ./coverage.xml` on the upload.

Finally, the policy itself, in `codecov.yml` at the repo root:

```yaml:codecov.yml
coverage:
  status:
    project:
      default:
        target: auto      # compare with the PR's base commit
        threshold: 1%     # allow a 1% dip before it reads as a drop
        informational: true
    patch:
      default:
        target: 80%       # the lines this PR touched
```

`target: auto` compares against the base commit, `threshold` lets coverage drop by that much and still pass, and `informational: true` makes the status pass whatever the number. So the project check still shows up on every PR, it just can't block one. The patch check is the only one that can go red, and it only looks at code the author wrote.

<figure class="diagram">
<svg viewBox="0 0 700 300" role="img" aria-label="Two illustrative gauges: a project coverage dial at 74 percent that is informational and never blocks, and a patch coverage dial at 86 percent against an 80 percent target that passes">
  <text class="d-text-sm" x="350" y="24" text-anchor="middle">illustrative example values, not real data</text>
  <path class="d-box" d="M65,190 A110,110 0 0 1 175,80 L175,110 A80,80 0 0 0 95,190 Z"/>
  <path class="d-box" d="M175,80 A110,110 0 0 1 285,190 L255,190 A80,80 0 0 0 175,110 Z"/>
  <path class="d-flow" d="M175,190 L243.5,117.1"/>
  <circle class="d-node" cx="175" cy="190" r="7"/>
  <text class="d-text-sm" x="80" y="206" text-anchor="middle">0%</text>
  <text class="d-text-sm" x="270" y="206" text-anchor="middle">100%</text>
  <text class="d-text" x="175" y="228" text-anchor="middle">project: 74.0%</text>
  <text class="d-text-sm" x="175" y="246" text-anchor="middle">target: auto, informational: true</text>
  <text class="d-text-sm" x="175" y="264" text-anchor="middle">status: always passes</text>
  <path class="d-box-red" d="M415,190 A110,110 0 0 1 614,125.3 L589.7,143 A80,80 0 0 0 445,190 Z"/>
  <path class="d-box-green" d="M614,125.3 A110,110 0 0 1 635,190 L605,190 A80,80 0 0 0 589.7,143 Z"/>
  <path class="d-flow" d="M525,190 L615.5,147.4"/>
  <circle class="d-node" cx="525" cy="190" r="7"/>
  <text class="d-text-sm" x="430" y="206" text-anchor="middle">0%</text>
  <text class="d-text-sm" x="620" y="206" text-anchor="middle">100%</text>
  <text class="d-edge" x="624" y="114">80%</text>
  <text class="d-text" x="525" y="228" text-anchor="middle">patch: 86% of changed lines</text>
  <text class="d-text-sm" x="525" y="246" text-anchor="middle">target: 80%</text>
  <circle class="d-node-green" cx="525" cy="274" r="18"/>
  <text class="d-on-fill" x="525" y="278" text-anchor="middle">PASS</text>
</svg>
<figcaption>The project dial has no red zone because it can't fail a PR. The patch dial does, and the only thing that moves its needle is how well the new code is tested.</figcaption>
</figure>

## Read the trend, don't stand guard at it

Track project coverage over time and look at it the way you'd look at any health metric: does the trend match the work? New feature plus tests, ratio steady: fine. Backfill, ratio up: great. Number dropping, or tests landing with no effect: go look. That conversation is useful in a way that "did this PR raise the number?" never is. It also pairs well with tests that are worth counting in the first place, which for anything touching a database means [isolating the data each test writes](/blog/test-database-isolation-function-vs-class).

:::tip
Coverage is a thermometer, not a turnstile: gate the code a PR adds, and read the total as a trend.
:::

**Why it matters for your team:** on a payments codebase you want the coverage conversation to be about whether the refund path is tested, not about why a refactor of the ledger module dropped the total by 0.3%.
