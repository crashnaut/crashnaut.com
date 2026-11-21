---
title: "How to Be a -10x Product Owner When Code Is Cheap"
slug: how-to-be-a-minus-10x-product-owner
description: "An agent builds exactly what the ticket says, fast. A -10x product owner writes one-line tickets and changes them hourly. A field guide, and the fix."
date: 2026-11-21
tags: AI, QA, Testing Strategy, FinTech
---

<!-- FOLDED into part 1 (blog/how-to-be-a-minus-10x-engineer-with-an-ai-agent/). Do not publish. See drafts/minus-10x-series.md. -->

<!-- TODO(mike): Part 5 of the -10x series (drafts/minus-10x-series.md). Link the other
parts in Related once they're published. -->

When building software was slow, a vague ticket got challenged in grooming, because someone would have to spend two weeks building it. An agent doesn't push back. It builds exactly what the ticket says, quickly and confidently, including the parts the ticket forgot. This guide is for the product owner who wants to turn that into waste, followed by the +1x version.

## The middle got thin

Picture the effort on a feature as a curve. For years, writing the code felt like the middle of the work, and it was what teams estimated and measured.

With agents, the middle gets thin. The effort moves to both ends. On the left is understanding what the customer needs and writing it down precisely. On the right is checking that the result is what the business meant. Both ends belong to people with domain knowledge, and the product owner owns most of the left.

<figure class="diagram">
<svg viewBox="0 0 700 300" role="img" aria-label="Two effort curves across requirements, build and validation. Before agents, effort peaks in the build phase. With agents, the build phase is thin and effort rises at requirements and validation.">
  <text class="d-text-sm" x="30" y="24">Illustrative shape, not measured data</text>
  <path class="d-line" d="M40,240 L660,240"/>
  <text class="d-text" x="140" y="265" text-anchor="middle">Requirements</text>
  <text class="d-text" x="350" y="265" text-anchor="middle">Build</text>
  <text class="d-text" x="560" y="265" text-anchor="middle">Validation</text>
  <path class="d-line" d="M40,235 C140,225 230,70 350,70 C470,70 560,225 660,235"/>
  <text class="d-edge" x="350" y="58" text-anchor="middle">before agents</text>
  <path class="d-flow" d="M40,235 C80,110 170,100 230,150 C290,205 410,205 470,150 C530,100 620,110 660,235"/>
  <text class="d-edge" x="140" y="108" text-anchor="middle">with agents</text>
  <text class="d-edge" x="560" y="108" text-anchor="middle">with agents</text>
  <text class="d-text-sm" x="24" y="160" text-anchor="middle" transform="rotate(-90 24 160)">effort</text>
  <rect class="d-box-amber" x="295" y="200" width="110" height="28" rx="4"/>
  <text class="d-text-sm" x="350" y="218" text-anchor="middle">agent does this</text>
</svg>
<figcaption>When the build gets cheap, the requirement and the check become the expensive parts, and both need someone who understands the business.</figcaption>
</figure>

## Write the ticket in one line

"Add refunds." That's the whole ticket. A developer would have asked about partial refunds, refunds after a currency conversion and refunds on a disputed payment. The agent asks nothing. It ships a refund feature that handles the case it assumed, with tests that confirm the assumption.

The demo looks finished, because generated software always looks finished. The missing cases turn up when a customer asks for half their money back.

:::compare
::do[A ticket the agent can't misread]

- Refund any amount up to the captured amount, in the original currency.
- Example: captured 100.00 EUR, refunded 30.00, then 70.00. A third refund of 0.01 is rejected.
- A disputed payment can't be refunded until the dispute closes.
- Out of scope: refunds to a different card.

::dont[A ticket the agent will complete for you]

- "Add refunds."
- "Same as the old system."
- "Handle the edge cases."

:::

The good version is longer to write. It's also the only version a reviewer, a tester and an agent can all check the result against.

## Change your mind hourly

The classic -10x move was changing requirements as late as possible [1]. It used to be self-limiting, because every change cost a rebuild that someone complained about. Now the agent rebuilds in minutes, so the product owner can change direction every afternoon.

The code regenerates. The review, the migration, the test data, the support article and the customers who learned the old flow don't. Every pivot leaves something behind that a person has to clean up.

## Ship every idea

Building got so cheap that nothing gets cut. Every experiment becomes a feature, and every feature stays.

Each one is a permanent cost: tests to maintain, a support path, a dependency to patch, a screen to keep accessible. Two years ago the cost of building forced a conversation about which ideas were worth it. A -10x product owner enjoys the fact that the conversation no longer has to happen.

## Let the agent write the acceptance criteria

Paste the one-line ticket into an agent and ask for acceptance criteria. It returns a tidy, plausible list built from its own reading of the ticket. The developer's agent then builds from that list, and the test agent tests against it. Three steps, and the only human input was two words.

## The +1x version

- Write acceptance criteria with concrete examples: amounts, currencies, dates, roles.
- List what's out of scope, so the agent doesn't fill the gap.
- Approve the acceptance criteria and the acceptance test before the build starts.
- Say no more often. Code is cheap to write, and every feature is still expensive to own.
- Check the result against the criteria yourself, because nobody else knows what the business meant.

:::tip
When an agent builds exactly what you wrote, the ticket is the product, so write it like one.
:::

## Why it matters for your team

In payments, an ambiguous refund or fee rule becomes a ledger that doesn't reconcile, and the product owner's ticket is the only place that rule was ever going to be pinned down.

Related: [What Late QA Really Costs](/blog/what-late-qa-really-costs), [How to Test Feature Flags Without Testing 2ⁿ Combinations](/blog/the-feature-flag-nightmare)

## Sources

1. Taylor Troesh, "How to be a -10x Engineer", taylor.town, 2023. <https://taylor.town/-10x>
