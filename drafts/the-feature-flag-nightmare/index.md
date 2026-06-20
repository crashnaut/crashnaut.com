---
title: "The Feature Flag Nightmare: A QA Perspective"
slug: the-feature-flag-nightmare
description: "Feature flags are dangerous to write — and pure hell to test. From the QA chair, every flag doubles the test surface, and the combinations explode faster than any team can cover. Here's why, with the maths."
author: Mike Sell
date: 2026-03-14T00:00:00.000Z
tags: testing, feature-flags, qa
---

# The Feature Flag Nightmare: A QA Perspective

My boss, Jerome Dane, wrote a piece I keep coming back to: [Feature Flags are Dangerous](https://jeromedane.medium.com/feature-flags-are-dangerous-88ef9d6c9f04). His argument is from the engineering and architecture seat — flags blur what's actually running in production, leave landmines of dead code, create multiple code paths, and quietly drift between environments and caches.

I want to add the view from the chair next to his: the QA chair. Because everything he says is true on the way *in*, and it gets worse on the way *out*. If feature flags are dangerous to write, they are pure hell to test.

Here's the part that doesn't fit in a standup update: **every independent flag doubles the test surface.** Not adds to it — doubles it.

## The maths nobody wants to hear

A single on/off flag means a feature has two states. Two flags, four. Three, eight. The number of distinct configurations is `2ⁿ`, and exponential growth gets out of hand faster than intuition expects.

:::bar-chart[Configurations to test grow as 2ⁿ]
1 flag | 2 | neutral
2 flags | 4 | neutral
3 flags | 8 | neutral
5 flags | 32 | amber
8 flags | 256 | bad
10 flags | 1024 | bad
:::

Ten flags — a number any real product blows past — is 1,024 distinct configurations of the same codebase. No QA team on earth is running 1,024 regression passes. So they don't. They test a couple of configurations and ship the rest blind.

Here's what that looks like for just three flags:

<figure class="diagram">
<svg viewBox="0 0 700 300" role="img" aria-label="A binary tree showing three on/off flags producing eight distinct test paths, of which only two are usually tested">
  <text class="d-text-sm" x="6" y="44">1 feature</text>
  <text class="d-text-sm" x="6" y="114">Flag A</text>
  <text class="d-text-sm" x="6" y="184">Flag B</text>
  <text class="d-text-sm" x="6" y="254">Flag C</text>
  <path class="d-line" d="M350,56 L205,110 M350,56 L495,110"/>
  <path class="d-line" d="M205,119 L132.5,171 M205,119 L277.5,171 M495,119 L422.5,171 M495,119 L567.5,171"/>
  <path class="d-line" d="M132.5,189 L96.25,238 M132.5,189 L168.75,238 M277.5,189 L241.25,238 M277.5,189 L313.75,238 M422.5,189 L386.25,238 M422.5,189 L458.75,238 M567.5,189 L531.25,238 M567.5,189 L603.75,238"/>
  <rect class="d-box" x="305" y="22" width="90" height="34" rx="4"/>
  <text class="d-text" x="350" y="43" text-anchor="middle">1 feature</text>
  <text class="d-edge" x="262" y="90" text-anchor="middle">off</text>
  <text class="d-edge" x="438" y="90" text-anchor="middle">on</text>
  <circle class="d-node" cx="205" cy="110" r="9"/>
  <circle class="d-node" cx="495" cy="110" r="9"/>
  <circle class="d-node" cx="132.5" cy="180" r="9"/>
  <circle class="d-node" cx="277.5" cy="180" r="9"/>
  <circle class="d-node" cx="422.5" cy="180" r="9"/>
  <circle class="d-node" cx="567.5" cy="180" r="9"/>
  <circle class="d-node-green" cx="96.25" cy="250" r="12"/>
  <circle class="d-node-red" cx="168.75" cy="250" r="12"/>
  <circle class="d-node-red" cx="241.25" cy="250" r="12"/>
  <circle class="d-node-red" cx="313.75" cy="250" r="12"/>
  <circle class="d-node-red" cx="386.25" cy="250" r="12"/>
  <circle class="d-node-red" cx="458.75" cy="250" r="12"/>
  <circle class="d-node-red" cx="531.25" cy="250" r="12"/>
  <circle class="d-node-green" cx="603.75" cy="250" r="12"/>
</svg>
<figcaption>Three on/off flags create 2³ = 8 distinct paths through one feature. Teams usually test the two green ones — all-off and all-on — and ship the other six (red) without ever running them.</figcaption>
</figure>

## It's worse than 2ⁿ in the real world

The clean `2ⁿ` number assumes flags are independent and the only thing that varies is the flag itself. Neither is true.

Flags **interact** — flag B behaves differently depending on whether flag A is on, which is exactly the kind of bug that hides in the combinations nobody ran. And flag state is only one axis. The same matrix has to be re-run across the things Jerome warned about: behaviour differs **across environments**, and again across **caches** (a flag value cached locally can disagree with the distributed source of truth). Add the user **roles or segments** most B2B products carry, and the real number is a product of all of them.

:::bar-chart[The real matrix: 3 flags, multiplied out]
Flags alone | 8 | neutral
× 3 environments | 24 | neutral
× 4 user roles | 96 | amber
× 2 cache states | 192 | bad
:::

Three flags — three! — and you're already looking at nearly 200 meaningfully different configurations. This is why "it worked in staging" is not a sentence QA can trust when flags are involved: staging was one cell in a very large grid.

## What gets tested vs. what ships

The gap between what a developer verified and what actually reaches users is where flag bugs live.

:::compare
::do[What the developer tested]
- The flag **on**, happy path
- On their machine, one environment
- As an admin / their own account
- With a fresh cache
::dont[What actually ships to users]
- Every reachable **combination** of flags
- Across every environment
- Across every role and segment
- With stale, warm, and cold caches
:::

The developer flipped one flag on and saw their feature work. Then a customer hits it with a *different* flag also on, in production, as a non-admin, behind a stale cache — a cell of the grid no one ever opened. To them it's just a bug. To Jerome's point, this is "testing in production" whether you meant to or not.

## Why automation doesn't rescue you

The instinct is "we'll just parametrize the tests across flag states." You can — but the matrix is still exponential, so you get to choose between two bad outcomes: run every combination and watch CI time explode past anything usable, or pick a subset and accept the gaps. There's no free lunch hiding in the test runner.

The pragmatic middle ground is **combinatorial (pairwise) testing**: instead of all `2ⁿ` combinations, generate the much smaller set that covers every *pair* of flag values at least once. It catches the large class of bugs that come from two flags interacting, at a fraction of the cost. It is a mitigation, not a cure — it will not catch a bug that only appears when three specific flags line up — but it's the honest tool for the job.

## What actually helps, from the QA seat

Jerome's prescription — fewer flags, branches over toggles, small reversible releases, a fast pipeline — is also the best testing strategy, because every one of those choices shrinks the grid. A few things I'd add from the testing side:

<figure class="diagram">
<svg viewBox="0 0 620 470" role="img" aria-label="A decision flowchart for whether something should become a feature flag">
  <defs>
    <marker id="ffah" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" class="d-arrow"/>
    </marker>
  </defs>
  <path class="d-line" d="M200,66 L200,88" marker-end="url(#ffah)"/>
  <path class="d-line" d="M330,140 L372,140" marker-end="url(#ffah)"/>
  <path class="d-line" d="M200,192 L200,238" marker-end="url(#ffah)"/>
  <path class="d-line" d="M330,290 L372,290" marker-end="url(#ffah)"/>
  <path class="d-line" d="M200,342 L200,386" marker-end="url(#ffah)"/>
  <text class="d-edge" x="348" y="132">yes</text>
  <text class="d-edge" x="210" y="218">no</text>
  <text class="d-edge" x="348" y="282">no</text>
  <text class="d-edge" x="210" y="368">yes</text>
  <rect class="d-box" x="120" y="22" width="160" height="44" rx="6"/>
  <text class="d-text" x="200" y="49" text-anchor="middle">New feature toggle?</text>
  <polygon class="d-box" points="200,90 330,140 200,190 70,140"/>
  <text class="d-text-sm" x="200" y="136" text-anchor="middle">Can it ship as a small,</text>
  <text class="d-text-sm" x="200" y="151" text-anchor="middle">complete release instead?</text>
  <rect class="d-box-green" x="372" y="116" width="230" height="48" rx="6"/>
  <text class="d-text-sm" x="487" y="136" text-anchor="middle">Prefer this — branch +</text>
  <text class="d-text-sm" x="487" y="151" text-anchor="middle">iterative release</text>
  <polygon class="d-box" points="200,240 330,290 200,340 70,290"/>
  <text class="d-text-sm" x="200" y="286" text-anchor="middle">Short-lived?</text>
  <text class="d-text-sm" x="200" y="301" text-anchor="middle">(days, not months)</text>
  <rect class="d-box-red" x="372" y="266" width="230" height="48" rx="6"/>
  <text class="d-text-sm" x="487" y="286" text-anchor="middle">Long-lived flag =</text>
  <text class="d-text-sm" x="487" y="301" text-anchor="middle">permanent test debt</text>
  <rect class="d-box-amber" x="96" y="388" width="208" height="56" rx="6"/>
  <text class="d-text-sm" x="200" y="412" text-anchor="middle">OK — make it a tested</text>
  <text class="d-text-sm" x="200" y="427" text-anchor="middle">parameter, with a sunset date</text>
</svg>
<figcaption>The QA-friendly decision: most toggles want to be a small release or a branch. If it genuinely must be a flag, treat it as a first-class test parameter and give it an expiry.</figcaption>
</figure>

A few principles behind that flow:

**Treat every live flag as a test parameter, not an afterthought.** If a flag exists, its states belong in the test plan — default-tested, with pairwise coverage across the rest. A flag that isn't in the test matrix is a flag you're shipping blind.

**Kill flags aggressively.** Every flag you remove *halves* the surface you just saw explode. A sunset date on each flag is the single highest-leverage testing decision a team can make, and it costs nothing.

**Make flag state observable.** When a bug report comes in, the first question is "which flags were on?" If your logs answer that, a failure is reproducible. If they don't, you're debugging one unknown cell in a 200-cell grid.

**Pin flag state in test environments.** Tests that run against whatever the flag service happens to return today aren't tests — they're weather reports. Fix the flag values per test run so a green result means something.

## The bottom line

Feature flags don't remove risk; they *move* it — off the developer's machine and into the tester's matrix, which grows exponentially with every toggle added. Jerome is right that they're dangerous to write. From where I sit, the kindest thing any team can do for the people testing their software is to have fewer flags, register the ones they keep as real test parameters, and kill them fast.

The fewer cells in the grid, the more of them you can actually open.
