---
title: "How to Be a -10x Engineering Manager When Code Is Cheap"
slug: how-to-be-a-minus-10x-engineering-manager
description: "AI made code output cheap. A -10x manager measures the output, cuts QA and adds agents to late projects. A field guide, and the five metrics to watch instead."
date: 2026-11-21
tags: AI, Code Review, Testing Strategy
---

<!-- FOLDED into part 1 (blog/how-to-be-a-minus-10x-engineer-with-an-ai-agent/). Do not publish. See drafts/minus-10x-series.md. -->

<!-- TODO(mike): Part 4 of the -10x series (drafts/minus-10x-series.md). Link parts 1–3
and the Brooks's law post in Related once they're published. -->

The classic -10x manager wasted the team's time with meetings, rituals and decisions nobody had the authority to make [1]. That still works, but there's a cheaper method now. Pick a number that AI makes go up on its own, put it on a dashboard, and run the team by it. This guide covers the moves, then the metrics a +1x manager watches instead.

## Measure what the agent makes cheap

Pull requests merged, lines changed, tickets closed and story points all used to track effort roughly, because each one took a person's time. An agent breaks that link. Telemetry from over 10,000 developers shows teams with high AI adoption merging 98% more pull requests while completing 21% more tasks [2].

A -10x manager puts the 98% on the slide. The team notices what the slide rewards and produces more of it. Goodhart's law has been describing this for decades: "When a measure becomes a target, it ceases to be a good measure" [3].

<figure class="diagram">
<svg viewBox="0 0 700 290" role="img" aria-label="Two dashboards side by side. On the slide: PRs merged up 98 percent, PR size up 154 percent, token spend up, all green. What the team lives with: tasks completed up only 21 percent, review time up 91 percent, bugs per developer up 9 percent.">
  <rect class="d-panel" x="20" y="20" width="320" height="220" rx="6"/>
  <text class="d-title" x="180" y="50" text-anchor="middle">Output dashboard</text>
  <rect class="d-box-green" x="45" y="70" width="270" height="44" rx="6"/>
  <text class="d-text" x="180" y="97" text-anchor="middle">PRs merged: +98%</text>
  <rect class="d-box-green" x="45" y="126" width="270" height="44" rx="6"/>
  <text class="d-text" x="180" y="153" text-anchor="middle">Average PR size: +154%</text>
  <rect class="d-box-green" x="45" y="182" width="270" height="44" rx="6"/>
  <text class="d-text" x="180" y="209" text-anchor="middle">Agent token spend: up</text>
  <rect class="d-panel" x="360" y="20" width="320" height="220" rx="6"/>
  <text class="d-title" x="520" y="50" text-anchor="middle">What the team lives with</text>
  <rect class="d-box-amber" x="385" y="70" width="270" height="44" rx="6"/>
  <text class="d-text" x="520" y="97" text-anchor="middle">Tasks completed: +21%</text>
  <rect class="d-box-red" x="385" y="126" width="270" height="44" rx="6"/>
  <text class="d-text" x="520" y="153" text-anchor="middle">PR review time: +91%</text>
  <rect class="d-box-red" x="385" y="182" width="270" height="44" rx="6"/>
  <text class="d-text" x="520" y="209" text-anchor="middle">Bugs per developer: +9%</text>
  <text class="d-text-sm" x="350" y="272" text-anchor="middle">Faros AI telemetry, analysis as of June 2025</text>
</svg>
<figcaption>The same telemetry looks like a success or a warning depending on which half of it reaches the slide.</figcaption>
</figure>

## Cut QA because the AI writes the tests

The coverage report looks healthy and the agent writes a test for every change, so the -10x manager cuts the QA budget. Nobody notices for a quarter. AI adoption was associated with 9% more bugs per developer [2], and those bugs don't appear in a coverage number.

The tests the agent writes for its own code confirm what it built. Nobody is left whose job is to ask whether that was the right thing. The quality debt shows up later as incidents, and by then the QA engineers who knew the product have found other jobs.

## Add agents to the late project

When a deadline slips, the -10x manager tells everyone to run more agents in parallel. Fred Brooks wrote down why adding people to a late project makes it later in 1975 [4]. Agents skip the meetings but keep the important cost: every line they write still has to be reviewed, merged and owned by the same few people.

## Ignore the review queue

PR review time grew 91% on high-adoption teams [2]. A -10x manager treats that as the reviewers being slow. They don't cap how many open PRs a reviewer carries, don't budget review time in planning, and praise whoever merges most.

The reviewers respond in the only way left to them. They skim, and the review becomes a formality.

## Mandate the tool, measure the usage

Put agent usage on the performance review. Track who uses it most, and celebrate token spend as adoption. The 2025 DORA report describes AI as "a mirror and a multiplier" that boosts cohesive organizations and highlights weaknesses in fragmented ones [5]. Usage tells you how hard the multiplier is pushed. It says nothing about what it's multiplying.

## The +1x version

A +1x manager measures delivery. DORA now tracks five software delivery metrics, and none of them reward typing speed [6].

| Metric                          | What it measures                                                        |
| ------------------------------- | ----------------------------------------------------------------------- |
| Change lead time                | Time from commit to running in production                               |
| Deployment frequency            | How often the team deploys                                              |
| Failed deployment recovery time | How long it takes to recover from a failed deployment |
| Change fail rate                | Share of deployments that need immediate intervention                   |
| Deployment rework rate          | Share of deployments that are unplanned fixes for production incidents  |

:::compare
::do[Plan for the review queue]

- Budget review time in planning and cap open PRs per reviewer.
- Keep QA as an independent check, and invite them into grooming.
- Cut scope on a late project before adding anything that writes code.

::dont[Run the team off the output slide]

- Put PR count or lines changed on the slide.
- Cut QA because the agent writes tests.
- Rank people by agent usage.

:::

Then ask the team what it stopped doing because the agent made it unnecessary, and what it started doing because the agent made it cheap.

:::tip
Measure what reaches production and stays there, because the agent has made everything before that cheap.
:::

## Why it matters for your team

In FinTech, change fail rate and rework rate are the metrics closest to incidents that touch customers' money, so they belong on the slide ahead of PR count.

Related: [What Late QA Really Costs](/blog/what-late-qa-really-costs), [Coverage Is a Health Signal, Not a Per-PR Gate](/blog/coverage-is-a-health-signal)

## Sources

1. Taylor Troesh, "How to be a -10x Engineer", taylor.town, 2023. <https://taylor.town/-10x>
2. Faros AI, "The AI Productivity Paradox Report 2025", faros.ai, July 23, 2025. <https://www.faros.ai/blog/ai-productivity-paradox-report-2025>
3. Wikipedia, "Goodhart's law", accessed November 21, 2026. <https://en.wikipedia.org/wiki/Goodhart%27s_law>
4. Frederick P. Brooks Jr., *The Mythical Man-Month: Essays on Software Engineering*, Addison-Wesley, 1975.
5. Ryan J. Salva, "How are developers using AI? Inside our 2025 DORA report", Google, September 23, 2025. <https://blog.google/technology/developers/dora-report-2025/>
6. DORA, "DORA's software delivery performance metrics", dora.dev, accessed November 21, 2026. <https://dora.dev/guides/dora-metrics-four-keys/>
