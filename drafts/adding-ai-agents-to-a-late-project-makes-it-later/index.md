---
title: "Adding AI Agents to a Late Project Makes It Later"
slug: adding-ai-agents-to-a-late-project-makes-it-later
description: "Brooks's law is over 50 years old and coding agents haven't repealed it. They moved the bottleneck to review and decisions, where late projects already hurt."
date: 2026-11-21
tags: AI, Code Review, Testing Strategy
---

<!-- TODO(mike): Add one real story of a project that got slower after people (or agents)
were added, if you have one. Never invent one; the draft has none. -->

The project is late, so someone adds three more people, and now it's even later. Fred Brooks wrote this down in 1975, and the 2026 version of the reflex is to add five more agents. Agents skip some of the costs that made Brooks right, but they keep the one that matters most on a late project. This post covers what changes, what doesn't, and what to do instead when the deadline slips.

## Brooks's law in one paragraph

Brooks's law says "adding manpower to a late software project makes it later" [1]. It comes from *The Mythical Man-Month*, and it rests on three costs [2]. New people need ramp-up time, and the experienced people stop working to teach them. Communication channels grow much faster than headcount. Some tasks can't be split at all: one woman makes a baby in nine months, and nine women can't make one in a month.

Brooks himself called the law an "outrageous oversimplification" [2]. It only applies to projects that are already late. Even so, it describes the general rule well enough that teams still rediscover it the hard way.

## Agents look like the exception

One common criticism of the law is that it treats all added labor as equal [2]. Agents seem to break that assumption. They start in seconds, they don't need a desk or a one-to-one, and they never join a meeting. If ramp-up and meetings were the problem, an agent should be the perfect late addition.

So the reflex has changed shape. Fewer teams hire three contractors in week 10 now. Instead, every engineer on the team gets told to run more agents in parallel.

## The ramp-up comes back every session

A new hire ramps up once. An agent session usually starts from what's in the repo, the prompt and whatever context files the team maintains. When the session ends, most of what it learned goes with it.

This means the senior engineer who used to explain the codebase to the new hire now explains it to the agent, in smaller pieces, many times a day. The explanation is shorter, but it's never finished. On a late project, that senior engineer is the person you can least afford to distract.

## Every line ends at the same desk

A team of n people has n(n−1)/2 possible conversations. Five people have 10. Eight people have 28. Adding three people almost triples the coordination.

:::bar-chart[Possible conversations in a team of n people, n(n−1)/2]
3 people | 3 | neutral
5 people | 10 | info
8 people (5 + 3 late) | 28 | bad
12 people | 66 | neutral
:::

Agents change the shape of the network. They mostly don't talk to each other, so their lines don't form a mesh. Every one of them runs to a human, who has to read the output, resolve the conflicts between agents and decide what ships.

<figure class="diagram">
<svg viewBox="0 0 700 320" role="img" aria-label="Left: five people connected by ten lines in a mesh. Right: one reviewer at the center of six agents, with two agents editing the same file marked as a conflict; every line runs to one reviewer">
  <text class="d-title" x="160" y="30" text-anchor="middle">5 people: 10 lines</text>
  <path class="d-line" d="M160,80 L245,142 M160,80 L213,242 M160,80 L107,242 M160,80 L75,142 M245,142 L213,242 M245,142 L107,242 M245,142 L75,142 M213,242 L107,242 M213,242 L75,142 M107,242 L75,142"/>
  <circle class="d-node" cx="160" cy="80" r="14"/>
  <circle class="d-node" cx="245" cy="142" r="14"/>
  <circle class="d-node" cx="213" cy="242" r="14"/>
  <circle class="d-node" cx="107" cy="242" r="14"/>
  <circle class="d-node" cx="75" cy="142" r="14"/>
  <text class="d-text-sm" x="160" y="295" text-anchor="middle">load is shared across the team</text>
  <text class="d-title" x="520" y="30" text-anchor="middle">1 reviewer, 6 agents</text>
  <path class="d-flow" d="M520,170 L520,80 M520,170 L598,125 M520,170 L598,215 M520,170 L520,260 M520,170 L442,215 M520,170 L442,125"/>
  <circle class="d-node-green" cx="520" cy="80" r="14"/>
  <circle class="d-node-green" cx="598" cy="125" r="14"/>
  <circle class="d-node-red" cx="598" cy="215" r="14"/>
  <circle class="d-node-red" cx="520" cy="260" r="14"/>
  <circle class="d-node-green" cx="442" cy="215" r="14"/>
  <circle class="d-node-green" cx="442" cy="125" r="14"/>
  <rect class="d-fill" x="474" y="152" width="92" height="36" rx="6"/>
  <text class="d-on-fill" x="520" y="175" text-anchor="middle">reviewer</text>
  <path class="d-line" d="M598,229 Q600,262 534,260"/>
  <text class="d-edge" x="608" y="250">same file</text>
  <text class="d-text-sm" x="520" y="295" text-anchor="middle">every PR and conflict lands on one desk</text>
</svg>
<figcaption>People spread coordination across a mesh. Agents route it all through the humans who review and merge, so their time becomes the limit.</figcaption>
</figure>

Telemetry from over 10,000 developers shows what that desk looks like [3]. On teams with high AI adoption, developers merged 98% more pull requests and PR review time grew 91%. Across all teams, AI adoption was linked to 154% larger PRs. Output grew much faster than anyone's capacity to read it.

This is the economic change of the last two years. Writing a line of code used to be the expensive part, so adding hands looked like the fix for a late project. Now writing costs almost nothing. Reading, reviewing and maintaining the code cost the same as before, and the person paying is the one you were trying to free up.

## Some work still doesn't split

An agent can write ten endpoints at once. It can't decide in parallel what the customer needs, or whether the ledger should store amounts in minor units. Those decisions are the indivisible tasks in Brooks's argument, and late projects are often late because of them. With the middle of the work getting thin, effort moves to both ends: understanding the requirement before the agent starts, and checking the result after. Both ends are human work, and neither splits well.

Running more agents against an unmade decision produces several confident versions of the wrong thing. Someone then has to read all of them to find out which, if any, matches what the business meant.

## What works on a late project

The classic advice mostly survives, with the reviewer standing where the new hire used to be:

:::compare
::do[Treat review and decisions as the scarce resource]

- Cut scope first, and ship the smaller version on time.
- Add agents at the start of a project or not at all.
- Give each agent a bounded piece: its own files and its own acceptance test, written before it starts.
- Cap open agent PRs per reviewer, the same way you'd cap work in progress.
- Protect the senior engineers' focus time. They're the bottleneck.

::dont[Treat generated code as progress]

- Run more agents in parallel against the same module.
- Hand an agent "help out where needed" with no spec.
- Let PR count or lines changed stand in for delivery.
- Ask the reviewer to keep up by skimming.

:::

:::tip
When a project is late, the scarce resource is review and decisions, so cut scope before you add anything that writes code.
:::

## Why it matters for your team

In a payments or lending system, a reviewer skimming the fifth agent PR of the day is the last check before a change reaches customers' money, so that reviewer's time is the capacity to plan for.

Related: [What Late QA Really Costs](/blog/what-late-qa-really-costs), [AI Code Smells: A Review Checklist](/blog/ai-code-smells-review-checklist)

## Sources

1. Frederick P. Brooks Jr., *The Mythical Man-Month: Essays on Software Engineering*, Addison-Wesley, 1975.
2. Wikipedia, "Brooks's law", accessed November 21, 2026. <https://en.wikipedia.org/wiki/Brooks%27s_law>
3. Faros AI, "The AI Productivity Paradox Report 2025", faros.ai, July 23, 2025. <https://www.faros.ai/blog/ai-productivity-paradox-report-2025>
