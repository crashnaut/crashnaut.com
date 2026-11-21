---
title: "How to Be a -10x Engineer With an AI Agent"
slug: how-to-be-a-minus-10x-engineer-with-an-ai-agent
description: "Wasting 400 engineering hours a week used to take effort. With a coding agent, one engineer can do it before lunch. A field guide, and the antidote."
author: Mike Sell
date: 2026-11-21T00:00:00.000Z
tags: AI, Code Review, Testing Strategy
---

In 2023 a short satirical essay made the rounds with a simple recipe: to become a -10x engineer, waste 400 engineering hours per week [1]. That's ten colleagues at 40 hours each, and the essay lists the classic ways to do it: late requirement changes, pointless rituals, slow builds, tests that mock everything. That was before coding agents went mainstream. The recipe still works, but the effort has collapsed. One engineer with an agent can now waste a team's week before lunch, and every step looks like productivity.

This is a field guide for the ambitious. A later post covers the -100x upgrade: letting the agent read your tickets and Slack so you don't have to. Follow this one in reverse if you'd rather keep your team.

## The arithmetic got easier

The old -10x engineer had to produce the waste by hand. The new one only has to produce output, because output is what now costs other people time.

Telemetry from over 10,000 developers on 1,255 teams shows where the time goes [2]. On teams with high AI adoption, developers merged 98% more pull requests and PR review time grew 91%. With more AI adoption, average PR size grew 154% and bugs per developer rose 9%.

:::bar-chart[Change with AI adoption, % (Faros AI telemetry, to June 2025)]
PRs merged | 98 | info
Tasks completed | 21 | good
Average PR size | 154 | amber
PR review time | 91 | bad
Bugs per developer | 9 | bad
:::

Compare the first two lines. Pull requests merged rose 98% and tasks completed rose 21%, while review time nearly doubled. That gap is the opportunity.

Two years ago, writing the code was the expensive step. Now a model writes it in seconds. Reading it, reviewing it and keeping it running for the next five years cost what they always did. A -10x engineer only needs to produce lines faster than the team can own them.

<figure class="diagram">
<svg viewBox="0 0 700 300" role="img" aria-label="One engineer and an agent produce a 3,000-line pull request in an hour; it sits in a review queue, get rubber-stamped, and reach production, where an incident pulls several engineers back in for days">
  <text class="d-text-sm" x="30" y="24">Illustrative crash run, not measured data</text>
  <rect class="d-box" x="30" y="60" width="150" height="70" rx="6"/>
  <text class="d-text" x="105" y="90" text-anchor="middle">1 engineer + agent</text>
  <text class="d-text-sm" x="105" y="110" text-anchor="middle">1 hour of prompting</text>
  <path class="d-flow" d="M180,95 L250,95"/>
  <path class="d-flow-head" d="M262,95 l -12,-6 l 0,12 z"/>
  <text class="d-edge" x="221" y="82" text-anchor="middle">1 PR</text>
  <rect class="d-box-amber" x="265" y="50" width="170" height="90" rx="6"/>
  <text class="d-text" x="350" y="82" text-anchor="middle">Review queue</text>
  <text class="d-text-sm" x="350" y="102" text-anchor="middle">3,000 lines to read</text>
  <text class="d-text-sm" x="350" y="120" text-anchor="middle">titled “small refactor”</text>
  <text class="d-edge" x="350" y="42" text-anchor="middle">IMPACT ZONE</text>
  <path class="d-flow" d="M435,95 L505,95"/>
  <path class="d-flow-head" d="M517,95 l -12,-6 l 0,12 z"/>
  <text class="d-edge" x="476" y="82" text-anchor="middle">LGTM</text>
  <rect class="d-box-red" x="520" y="60" width="150" height="70" rx="6"/>
  <text class="d-text" x="595" y="90" text-anchor="middle">Production</text>
  <text class="d-text-sm" x="595" y="110" text-anchor="middle">tests were green</text>
  <path class="d-line" d="M595,130 L595,220 L105,220 L105,142"/>
  <path class="d-arrow" d="M105,132 l -4,8 l 8,0 z"/>
  <text class="d-edge" x="350" y="240" text-anchor="middle">incident: 3 engineers, 2 days, plus a postmortem meeting</text>
  <text class="d-text-sm" x="350" y="270" text-anchor="middle">1 hour in, about 50 hours out</text>
</svg>
<figcaption>The -10x crash run. The agent makes the first hour cheap and moves the cost to review and to the incident afterward, where it lands on other people.</figcaption>
</figure>

## Ship the diff nobody can read

Open one pull request per afternoon, and make it 3,000 lines. Title it "small refactor". Let the agent tidy unrelated files on the way, so the reviewer has to check every rename to find the one change that matters.

A reviewer facing a wall of plausible code can spend the day on it or approve it. Most approve it, and review becomes a rubber stamp without anyone deciding so.

## Let the agent grade its own homework

Ask the agent to write the feature, then ask the same agent to write the tests. It will read its own code and write assertions that match it. If it misread the ticket, the tests misread it in exactly the same way, and everything passes.

For extra credit, generate 300 cases from one story and measure progress by the count. Set retries to five so flaky tests "pass", and stop reading the flaky list. When something still fails, ask the agent to fix the test until the race condition has somewhere else to hide.

:::compare
::do[Pin the behavior before the code exists]

- A human approves the acceptance criteria.
- The acceptance test is written from those criteria, before the implementation.
- The agent's job is to make that test pass, and it can't edit the test.

::dont[Generate the code, then generate tests from the code]

- The tests mirror whatever the agent built.
- A misread requirement passes, because code and test share the same mistake.
- Green tells you the code agrees with itself.

:::

## Keep the ticket to one line

"Add refunds." That's the whole ticket. A colleague would have asked about partial refunds, currency conversion and disputed payments. The agent asks nothing. It ships a complete, confident feature for the case it assumed, with tests that confirm the assumption.

The classic -10x move was changing requirements late in development [1]. That used to hurt the person making the change, because someone had to rebuild the thing. Now the agent rebuilds it in minutes, so change requirements hourly. Better still, never write them down, and let the agent invent the acceptance criteria from the one-liner.

Building got so cheap that nothing gets cut. Every experiment becomes a feature, and every feature stays: tests to maintain, a support path, a screen to keep accessible. The conversation about which ideas were worth owning no longer has to happen.

## Trust the dashboard and the feeling

Never measure delivery. Put pull requests merged, lines changed and agent usage on the slide. The team will produce more of what the slide rewards. Cut the QA budget because the coverage report looks healthy and the agent writes a test for every change. Bugs per developer rose 9% with AI adoption [2], and those don't appear in a coverage number.

In a 2025 randomized trial, 16 experienced open-source developers worked 246 real issues in repositories they knew well [3]. They expected AI tools to make them 24% faster. With the tools they took 19% longer. Afterward, they still believed AI had sped them up by 20%.

The authors now call those early-2025 results out of date, and say late-2025 AI likely sped developers up [4]. The perception gap is the part that survives. People judge their own speed badly, so a -10x engineer trusts the feeling, the slide and the green suite.

When the project is late, tell everyone to run more agents in parallel. Adding people to a late project makes it later [5]. Agents skip the meetings but keep the cost that matters: every line still has to be reviewed, merged and owned by the same few people.

## Give the agent everything and keep nothing

Turn off every permission prompt. Give the agent your production credentials, because the staging ones are a hassle. Let it run migrations it wrote a minute ago.

Then keep the context in a chat window that's gone tomorrow, so nobody can follow what happened.

## The +1x version

The 2025 DORA survey of nearly 5,000 professionals put it plainly: AI acts as "a mirror and a multiplier" [6]. In cohesive organizations it boosts efficiency. In fragmented ones it highlights weaknesses. A multiplier doesn't care about the sign of what you feed it.

So the antidote is boring, and it mostly happens before the agent starts typing:

- **Write the acceptance criteria first**, with concrete examples and what's out of scope, and have a human approve them.
- **Keep PRs small enough to review in one sitting.** Split the agent's work before it starts, and budget the review queue.
- **Keep tests independent of the code they check.** Write the test from the spec, keep retries low, and keep the agent's hands off the assertion.
- **Keep an independent check.** Coverage and agent-written tests are not a reason to drop QA.
- **Sandbox the agent.** Staging credentials, no production access, permission prompts on for anything destructive.
- **Measure delivery.** Lead time, change failure rate and review time say more than lines written, PRs merged or token spend.
- **When a project is late, cut scope** before you add anything that writes more code.

:::tip
An agent multiplies whatever you point it at, so make sure the number you start with is positive.
:::

## Why it matters for your team

In a payments system, a self-graded test suite can pass a rounding error into the ledger, and the cost lands on customers and the reconciliation team instead of the engineer who shipped it.

Related: [AI Code Smells: A Review Checklist](/blog/ai-code-smells-review-checklist), [How to Sandbox Your AI Coding Agent with a Dev Container](/blog/sandboxing-your-ai-coding-agent), [What Late QA Really Costs](/blog/what-late-qa-really-costs)

## Sources

1. Taylor Troesh, "How to be a -10x Engineer", taylor.town, 2023. <https://taylor.town/-10x>
2. Faros AI, "The AI Productivity Paradox Report 2025", faros.ai, July 23, 2025. <https://www.faros.ai/blog/ai-productivity-paradox-report-2025>
3. Joel Becker, Nate Rush, Beth Barnes, David Rein, "Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity", METR, July 10, 2025. <https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/>
4. METR, "We are Changing our Developer Productivity Experiment Design", METR, February 24, 2026. <https://metr.org/blog/2026-02-24-uplift-update/>
5. Frederick P. Brooks Jr., *The Mythical Man-Month: Essays on Software Engineering*, Addison-Wesley, 1975.
6. Ryan J. Salva, "How are developers using AI? Inside our 2025 DORA report", Google, September 23, 2025. <https://blog.google/technology/developers/dora-report-2025/>
