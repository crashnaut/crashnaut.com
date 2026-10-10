---
title: "AI Code Smells: A Review Checklist"
slug: ai-code-smells-review-checklist
description: "AI coding assistants fill gaps with plausible-looking code. Nine recurring AI code smells to catch in review, and what to look for when you spot each one."
author: Mike Sell
date: 2026-03-12T00:00:00.000Z
tags: AI, Code Review, Testing
---

# AI Code Smells: A Review Checklist

AI coding assistants are genuinely good now, and they'll happily produce a working diff for almost anything you ask. A working diff can still be a bad one, and the gap between the two is where AI quietly creates problems.

Keep one thing in mind: **you own the loop, and the AI assists within it.** The assistant doesn't know your system or your constraints. You do. It fills gaps with code that _looks_ right, and the only thing standing between that and your main branch is review.

After reviewing a lot of AI-assisted pull requests, the same patterns keep showing up. None of them is automatically a bug, but each is worth a second look. When you spot one, ask: _was this intentional, or an artifact of how the AI filled in a gap?_

Here are the nine.

<figure class="diagram">
<svg viewBox="0 0 720 400" role="img" aria-label="Triage map of the nine AI code smells. Across: what catches each one, from tsc or lint, to grep, to a test, to only a human reviewer. Up: the damage if it ships, from noise to a silent production failure. tsc or lint catches the Hallucinated API and the Defensive Wall; grep finds the Abstraction Tax and the Rename Alias; nothing here is caught by a test; only a human catches the Comment Echo, Complexity Mismatch, Polite Rewrite, Test Mannequin and Catch-All Handler. The last two sit in the red hazard zone: high damage and only a human can catch them.">
  <rect class="d-box-red" x="500" y="40" width="212" height="86" rx="4"/>
  <text class="d-edge" x="606" y="30" text-anchor="middle">HAZARD ZONE</text>
  <rect class="d-panel" x="110" y="40" width="602" height="290" rx="4"/>
  <path class="d-line" stroke-dasharray="3 5" d="M272,40 L272,330 M404,40 L404,330 M500,40 L500,330"/>
  <text class="d-text" x="191" y="350" text-anchor="middle">tsc / lint</text>
  <text class="d-text" x="338" y="350" text-anchor="middle">grep</text>
  <text class="d-text" x="452" y="350" text-anchor="middle">a test</text>
  <text class="d-text" x="606" y="350" text-anchor="middle">only a human</text>
  <path class="d-line" d="M110,368 L704,368"/>
  <path class="d-arrow" d="M712,368 l-8,-4 l0,8 z"/>
  <text class="d-text-sm" x="411" y="388" text-anchor="middle">What catches it, cheapest first</text>
  <path class="d-line" d="M24,330 L24,48"/>
  <path class="d-arrow" d="M24,40 l-4,8 l8,0 z"/>
  <text class="d-text-sm" x="36" y="185" text-anchor="middle" transform="rotate(-90 36 185)">Damage if it ships</text>
  <text class="d-text-sm" x="102" y="58" text-anchor="end">silent prod</text>
  <text class="d-text-sm" x="102" y="72" text-anchor="end">failure</text>
  <text class="d-text-sm" x="102" y="326" text-anchor="end">noise</text>
  <text class="d-text-sm" x="452" y="192" text-anchor="middle">none land</text>
  <text class="d-text-sm" x="452" y="206" text-anchor="middle">here: 7 is</text>
  <text class="d-text-sm" x="452" y="220" text-anchor="middle">the test</text>
  <circle class="d-node" cx="130" cy="156" r="11"/>
  <text class="d-text" x="130" y="160" text-anchor="middle">6</text>
  <text class="d-text" x="148" y="160">Hallucinated API</text>
  <circle class="d-node" cx="130" cy="208" r="11"/>
  <text class="d-text" x="130" y="212" text-anchor="middle">2</text>
  <text class="d-text" x="148" y="212">Defensive Wall</text>
  <circle class="d-node" cx="292" cy="266" r="11"/>
  <text class="d-text" x="292" y="270" text-anchor="middle">1</text>
  <text class="d-text" x="310" y="270">Abstraction Tax</text>
  <circle class="d-node" cx="292" cy="301" r="11"/>
  <text class="d-text" x="292" y="305" text-anchor="middle">3</text>
  <text class="d-text" x="310" y="305">Rename Alias</text>
  <circle class="d-node-red" cx="520" cy="54" r="11"/>
  <text class="d-on-fill" x="520" y="58" text-anchor="middle">8</text>
  <text class="d-text" x="538" y="58">Catch-All Handler</text>
  <text class="d-text-sm" x="538" y="72">lint: only empty catch {}</text>
  <circle class="d-node-red" cx="520" cy="98" r="11"/>
  <text class="d-on-fill" x="520" y="102" text-anchor="middle">7</text>
  <text class="d-text" x="538" y="102">Test Mannequin</text>
  <circle class="d-node" cx="520" cy="185" r="11"/>
  <text class="d-text" x="520" y="189" text-anchor="middle">9</text>
  <text class="d-text" x="538" y="189">Polite Rewrite</text>
  <circle class="d-node" cx="520" cy="220" r="11"/>
  <text class="d-text" x="520" y="224" text-anchor="middle">5</text>
  <text class="d-text" x="538" y="224">Complexity Mismatch</text>
  <circle class="d-node" cx="520" cy="313" r="11"/>
  <text class="d-text" x="520" y="317" text-anchor="middle">4</text>
  <text class="d-text" x="538" y="317">Comment Echo</text>
</svg>
<figcaption>Where each smell gets caught, and what it costs if nothing catches it. Review time belongs in the red corner: only a human spots these, and they fail silently in production. Placement assumes a TypeScript codebase with ESLint.</figcaption>
</figure>

## 1. The Abstraction Tax

A helper, base class, or utility introduced for logic that's used exactly once. The AI anticipates reuse that never comes, and you're left with indirection that has no payoff.

**Look for:** a function with one call site, a class with one subclass, a helper that just wraps one other function.

## 2. The Defensive Wall

`try/catch` blocks and null checks wrapping code paths that cannot fail. The AI guards against `null` or `undefined` on a value that's always set, or wraps a lookup on a key that's always present in a `try`. It adds noise and buries the real errors when they finally happen.

**Look for:** error handling around your own internal calls, `if (x != null)` checks on values your own code guarantees, fallback branches that can never be reached.

## 3. The Rename Alias

A variable that just holds another variable's value under a new name (`const result = response`, `const userId = uid`) with nothing happening in between. The AI lost track of what it already had.

**Look for:** consecutive assignments where the right-hand side is just another local, with no transformation.

## 4. The Comment Echo

A comment that restates the code in plain English. `// Get the user by UUID` above `const user = getUser(uuid)` tells the reader nothing they can't already see. Good comments explain the _why_ (a constraint, a workaround, a non-obvious invariant) rather than the _what_.

**Look for:** comments that could be auto-generated from the function name, or that you could delete without changing anyone's understanding.

## 5. The Complexity Mismatch

The solution is far bigger than the requirement. A three-line bug fix arrives as a 60-line refactor with a new class, an enum, and two helpers. It may work, but it's harder to review, revert and maintain than the fix you asked for.

**Look for:** diffs much larger than the ticket scope, new types for a single use case, a simple change that suddenly requires reading three new files.

## 6. The Hallucinated API

A method, attribute, or import that doesn't actually exist. The AI filled in a plausible-sounding name. It looks correct at a glance and then throws at runtime. It's especially dangerous when the invented name closely resembles a real one.

**Look for:** calls on your own classes you don't recognize, imports from unusual paths. Grep it to verify before approving.

## 7. The Test Mannequin

A test that passes green but verifies nothing. It asserts there were no errors and stops, without checking what was actually created. It looks like coverage but won't catch a regression.

**Look for:** tests with a single assertion on the error state and none on the data; mutation tests that never confirm the data changed; query tests that only check the response isn't empty.

## 8. The Catch-All Handler

`catch (e) {}` swallowing errors with an empty block or a stray `console.log`. The AI silenced a failing path instead of fixing the root cause, so real errors vanish in production and turn into incidents that take hours to trace.

**Look for:** empty `catch` blocks, catches that never inspect or rethrow the error, `.catch(() => {})` on promises, error paths that log and continue instead of raising.

## 9. The Polite Rewrite

You asked for a small change. The AI "helpfully" cleaned up the surrounding code too: renaming variables, restructuring conditionals, extracting methods. The diff is now far wider than the ticket, and every unrelated change is something the reviewer has to fully parse to trust.

**Look for:** changes to lines you didn't ask to touch. When in doubt, ask the author what each change was for.

## The habit that prevents most of them

Most of these smells come from the same place: the AI was handed a task with no context and invented its own answer. The fix is upstream of review. Before you ask for an implementation, point the assistant at the best existing example of what you're building ("follow the same structure as this resolver") and the output starts looking like your codebase instead of a novel interpretation of it.

Review still matters, but giving context first saves you from reviewing your way out of a mess.
