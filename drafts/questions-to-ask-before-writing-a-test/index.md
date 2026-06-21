---
title: "The Questions to Ask Before You Write a Test"
slug: questions-to-ask-before-writing-a-test
description: "The blank test file is a trap. Two quick questions, asked before you start typing, save you from writing duplicate coverage that adds runtime and noise without adding protection."
author: Mike Sell
date: 2026-01-20T00:00:00.000Z
tags:
---

# The Questions to Ask Before You Write a Test

The instinct, when you're told to add test coverage, is to open a new test file and start typing. That's the trap. A surprising amount of low-value testing comes not from bad tests but from _unnecessary_ ones — tests that re-cover paths already covered, adding runtime, maintenance, and noise without adding any protection.

Two questions, asked before you write a line, prevent most of it.

## Question 1: Does a test for this area already exist?

Before writing anything, go look. Check where tests for this domain live. Often there's already a test exercising the flow you care about, and the right move isn't a new file — it's a new assertion or a new case inside the existing one.

This matters for more than tidiness. A new near-duplicate test is a second thing to maintain, a second thing to read, and a second thing that breaks when the behaviour changes. Extending an existing test keeps related coverage in one place, where the next person can actually find it.

**If yes:** update the existing test or add a case to it. Stop here.

**If no:** move to question 2.

## Question 2: Will this test increase coverage?

Not "will it pass" — will it actually exercise a path nothing else exercises? If you can't point to the behaviour this test protects that no current test does, you're probably about to write duplicate coverage in a fresh disguise.

**If yes:** write it, and follow whatever structure your suite already uses so it looks like it belongs.

**If no:** reconsider the scope. Duplicate coverage isn't free — it's runtime on every CI run and a maintenance burden forever, in exchange for nothing. The right answer is sometimes to write no test at all.

## The flow, in short

```
I need to write a test
        │
        ▼
Does a test for this area exist? ──── yes ──▶ extend it / add a case
        │
        no
        ▼
Will a new test increase coverage? ── no ──▶ reconsider — duplicate coverage is noise
        │
        yes
        ▼
Write it, following the existing patterns
```

## Why this is worth thirty seconds

It reframes testing from "produce more tests" to "protect more behaviour." Those aren't the same thing, and conflating them is how suites end up slow, redundant, and weirdly fragile despite a healthy-looking coverage number. Start every test by looking for the one that might already exist — not with a blank file — and the suite you build stays lean, fast, and worth trusting.
