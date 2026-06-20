---
title: "AI Code Smells: A Review Checklist"
slug: ai-code-smells-review-checklist
description: "AI coding assistants are fast and capable, but they fill gaps with plausible-looking code. Here are nine recurring smells to watch for in review — and what to look for when you spot each one."
author: Mike Sell
date: 2026-04-23T00:00:00.000Z
tags: ai, code-review, engineering
---

# AI Code Smells: A Review Checklist

AI coding assistants are genuinely good now. They're fast, they're capable, and they'll happily produce a working diff for almost anything you ask. But "working" and "good" aren't the same thing — and the gap between them is where AI quietly creates problems.

The thing to internalise is this: **you own the loop, the AI assists within it.** The assistant doesn't know your system, your team, or your constraints. You do. It fills gaps with code that *looks* right, and the only thing standing between that and your main branch is review.

After reviewing a lot of AI-assisted pull requests, the same patterns keep showing up. None of them is automatically a bug — but each is always worth a second look. When you spot one, ask: *was this intentional, or an artifact of how the AI filled in a gap?*

Here are the nine.

## 1. The Abstraction Tax

A helper, base class, or utility introduced for logic that's used exactly once. The AI anticipates reuse that never comes, and you're left with indirection that has no payoff.

**Look for:** a function with one call site, a class with one subclass, a helper that just wraps one other function.

## 2. The Defensive Wall

`try/except` blocks and null checks wrapping code paths that cannot fail. The AI guards against `None` on a value that's always set, or catches exceptions on a dictionary key that's always present. It adds noise and buries the real errors when they finally happen.

**Look for:** error handling around your own internal calls, `if x is not None` checks on values your own code guarantees, fallback branches that can never be reached.

## 3. The Rename Alias

A variable that just holds another variable's value under a new name — `result = response`, `user_id = uid` — with nothing happening in between. The AI lost track of what it already had.

**Look for:** consecutive assignments where the right-hand side is just another local, with no transformation.

## 4. The Comment Echo

A comment that restates the code in plain English. `# Get the user by UUID` above `user = get_user(uuid)` tells the reader nothing they can't already see. Good comments explain the *why* — a constraint, a workaround, a non-obvious invariant — not the *what*.

**Look for:** comments that could be auto-generated from the function name, or that you could delete without changing anyone's understanding.

## 5. The Complexity Mismatch

The solution is far bigger than the requirement. A three-line bug fix arrives as a 60-line refactor with a new class, an enum, and two helpers. It may work, but reviewing it is hard, reverting it is harder, and maintaining it is hardest.

**Look for:** diffs much larger than the ticket scope, new types for a single use case, a simple change that suddenly requires reading three new files.

## 6. The Hallucinated API

A method, attribute, or import that doesn't actually exist. The AI filled in a plausible-sounding name. It looks correct at a glance and then throws at runtime — especially dangerous when the invented name closely resembles a real one.

**Look for:** calls on your own classes you don't recognise, imports from unusual paths. Grep it to verify before approving.

## 7. The Test Mannequin

A test that passes green but verifies nothing. It asserts there were no errors and stops — without checking what was actually created. It looks like coverage and provides none. It will not catch a regression.

**Look for:** tests with a single assertion on the error state and none on the data; mutation tests that never confirm the data changed; query tests that only check the response isn't empty.

## 8. The Catch-All Handler

`except Exception` swallowing errors with a `pass` or a stray log line. The AI silenced a failing path instead of fixing the root cause — so real errors vanish in production and turn into incidents that take hours to trace.

**Look for:** bare `except` clauses, broad exception catches, error paths that log and continue instead of raising.

## 9. The Polite Rewrite

You asked for a small change. The AI "helpfully" cleaned up the surrounding code too — renaming variables, restructuring conditionals, extracting methods. The diff is now far wider than the ticket, and every unrelated change is something the reviewer has to fully parse to trust.

**Look for:** changes to lines you didn't ask to touch. When in doubt, ask the author what each change was for.

## The habit that prevents most of them

Most of these smells come from the same place: the AI was handed a task with no context and invented its own answer. The fix is upstream of review. Before you ask for an implementation, point the assistant at the best existing example of what you're building — "follow the same structure as this resolver" — and the output starts looking like your codebase instead of a novel interpretation of it.

Review still matters. But context first, review second, beats reviewing your way out of a mess every time.
