---
title: "Coverage Is a Health Signal, Not a Per-PR Gate"
slug: coverage-is-a-health-signal
description: "Blocking every pull request until it raises the coverage number feels rigorous and quietly rots your test suite. Treat coverage as a trend to read, not a gate to pass, and it starts telling you the truth."
author: Mike Sell
date: 2026-02-16T00:00:00.000Z
tags: testing, coverage, qa
---

# Coverage Is a Health Signal, Not a Per-PR Gate

Somewhere along the way, "we should have good test coverage" turned into "every pull request must increase the coverage percentage." It sounds rigorous. It's actually one of the faster ways to rot a test suite, because it changes what people optimise for — from _covering the code they wrote_ to _making a number go up_.

A healthier framing: pick a target for the codebase as a whole — say 80% — and reach it collectively over time. The way you get there isn't by demanding each PR push the percentage higher. It's by making sure everyone covers what they build. Then read the trend as a signal, not a gate.

## The three patterns to read

Coverage movement tells you something only when you compare it against the work that happened.

**New code shipped with its tests → the ratio holds steady.** You added code and the tests for it together, so the percentage stays about the same. This is the healthy default, and it's exactly what should happen most of the time. A flat coverage number here is good news, not a failure to "improve."

**Tests written for previously untested code → the ratio climbs.** You went back and covered paths that weren't exercised before. Coverage rises. Also healthy — this is what backfilling looks like, and it's worth celebrating rather than treating as the only acceptable outcome.

:::bar-chart[Backfilling tests: coverage climbs as you fill genuine gaps]
Before | 60 | neutral
After | 72 | good
:::

**New code with no tests, or a pile of tests with no movement → investigate.** This is the only pattern that's actually a signal. A drop means code shipped untested and quietly pulled the number down. A batch of new tests that _doesn't_ move the number is worth a closer look too — it often means those tests are hitting paths already covered, adding runtime and maintenance without adding protection.

## Why the per-PR gate backfires

The moment coverage becomes a gate on every PR, you create incentives to game it. A three-line bug fix gets padded with a trivial test so the number ticks up. People avoid touching legacy code because doing so would "lower coverage" on their PR. Reviewers argue about a percentage instead of about whether the tests are any good. None of that makes the software more correct.

Worse, the gate punishes exactly the right behaviour. Shipping new code with proportionate tests keeps the ratio flat — and a per-PR gate reads "flat" as "failed."

## What to do instead

Track coverage over time and look at it the way you'd look at any health metric: ask whether the trend matches the work. New feature plus tests, ratio steady — fine. Backfill, ratio up — great. Number dropping, or tests landing with no effect — go look. That conversation ("does this trend make sense?") is useful in a way that "did this PR raise the number?" never is.

Coverage is a thermometer, not a turnstile. Read it, don't stand guard at it.
