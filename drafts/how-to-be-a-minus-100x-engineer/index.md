---
title: "How to Be a -100x Engineer: Let the Agent Read Your Messages"
slug: how-to-be-a-minus-100x-engineer
description: "A -10x engineer wastes a team's week. A -100x engineer lets an agent read Jira and Slack and post the replies. The economics, and a three-question fix."
date: 2026-11-21
tags: AI, QA, Testing Strategy
---

<!-- TODO(mike): Part 2 of the -10x series (drafts/minus-10x-series.md). Check the
wall-of-text story matches how it happened, and use your exact words if they differ.
Add part 1 to the Related line once it's published. -->

A -10x engineer wastes 400 engineering hours a week, the output of ten colleagues [1]. My QA peers joked that this undersold what we were seeing, because we had -100x engineers in our midst. They were too busy to read a Jira ticket or a Slack thread, so they had an agent read it for them and post the reply. This post covers how the loop works, why it costs ten times more than it looks, and the three questions that stop it.

## The loop

MCP (Model Context Protocol) is "an open-source standard for connecting AI applications to external systems" [2]. With an MCP server for Jira and another for Slack, an agent can read a ticket, read the thread about it, draft an answer and post it. Used well, this saves a lot of tab switching.

The -100x engineer uses it to remove themselves from the loop entirely. The ticket goes in, the summary comes out, and the summary goes straight back into the channel. At no point does a human read the ticket, and at no point does a human read the reply.

<figure class="diagram">
<svg viewBox="0 0 700 300" role="img" aria-label="A loop from a Jira ticket and a Slack thread through an MCP server into an agent, which posts a long reply back to the channel. The engineer sits outside the loop and reads nothing; forty readers each pay to read the reply.">
  <rect class="d-box" x="30" y="40" width="150" height="56" rx="6"/>
  <text class="d-text" x="105" y="73" text-anchor="middle">Jira ticket</text>
  <rect class="d-box" x="30" y="150" width="150" height="56" rx="6"/>
  <text class="d-text" x="105" y="183" text-anchor="middle">Slack thread</text>
  <path class="d-flow" d="M180,68 L263,110.5 M180,178 L263,135.5"/>
  <path class="d-flow-head" d="M274,116 L260.6,115.9 L266,105.2 z"/>
  <path class="d-flow-head" d="M274,130 L266,140.9 L260.6,130.2 z"/>
  <rect class="d-box-amber" x="275" y="90" width="150" height="66" rx="6"/>
  <text class="d-text" x="350" y="118" text-anchor="middle">Agent via MCP</text>
  <text class="d-text-sm" x="350" y="138" text-anchor="middle">reads for you</text>
  <path class="d-flow" d="M425,123 L505,123"/>
  <path class="d-flow-head" d="M517,123 l -12,-6 l 0,12 z"/>
  <text class="d-edge" x="465" y="110" text-anchor="middle">600 words</text>
  <rect class="d-box-red" x="520" y="90" width="150" height="66" rx="6"/>
  <text class="d-text" x="595" y="118" text-anchor="middle">Channel</text>
  <text class="d-text-sm" x="595" y="138" text-anchor="middle">40 readers pay</text>
  <path class="d-line" d="M595,156 L595,230 L105,230 L105,206"/>
  <path class="d-arrow" d="M105,206 l -4,8 l 8,0 z"/>
  <text class="d-edge" x="350" y="248" text-anchor="middle">the next reply is generated from the last one</text>
  <rect class="d-panel" x="275" y="20" width="150" height="40" rx="6"/>
  <text class="d-text-sm" x="350" y="44" text-anchor="middle">engineer: reads nothing</text>
  <path class="d-line" d="M350,60 L350,90"/>
  <text class="d-edge" x="358" y="79">out of the loop</text>
  <text class="d-text-sm" x="350" y="285" text-anchor="middle">Illustrative, not measured</text>
</svg>
<figcaption>The -100x loop. The engineer sits outside it, so the only people who read anything are the ones who didn't write it.</figcaption>
</figure>

## The economics of a message

Two years ago, a long message cost its writer real effort, and that effort limited how many long messages anyone wrote. Now a 600-word update costs its sender a few seconds. The cost to read it hasn't changed, and every reader pays it separately.

Take an example, with made-up but ordinary numbers. A 600-word update takes about three minutes to read properly. Post it in a channel where 40 people feel they should read it, and it costs two hours of team time. Post ten of those a day and one engineer spends 20 hours of other people's time daily, about 100 hours a week. Four engineers with the same habit cost the org a -10x engineer.

:::bar-chart[Example: team hours spent reading one engineer's AI-written posts per week (600 words, 40 readers)]
2 posts a day | 20 | amber
5 posts a day | 50 | bad
10 posts a day | 100 | bad
:::

The extra zero comes from the asymmetry. The original -10x engineer had to write the long messages by hand [1]. The -100x engineer has a machine that writes them for free, and the cost lands on everyone else.

## Never read the ticket

The -100x engineer starts work from the agent's summary of the ticket. Acceptance criteria get flattened into a paragraph, and the edge case the product owner added in a comment disappears.

Then the agent asks clarifying questions in the thread. The answers are already in the ticket, so the product owner answers them again. Everyone involved has now read the ticket except the person building it.

## Reply to everything, at length

An agent with Slack access never runs out of opinions. It replies to every thread, summarizes discussions that were three messages long, and writes a status update with headings for a change that took ten minutes.

The tone is always confident and the structure is always tidy, which makes the slop hard to skip. A reader can't tell from the first paragraph whether the post contains one important fact or none, so they read all of it.

## The wall of text

I ran into this myself. An engineer posted a long AI-written update and got angry when I refused to read and engage with his "wall of text". So I called him and asked three questions: what did you do, why, and what was the value? I got crickets. The phrase is now quoted all over the org.

Those three questions are the cheapest filter I know. If the author can't answer them in a minute, the text was never really theirs, and nobody else should spend time on it.

## The +1x version

The fix keeps the agent and puts the human back in the loop:

:::compare
::do[Use the agent to read, then write it yourself]

- Read the ticket yourself. Use the agent to find related tickets and code.
- Post the answer to the three questions: what you did, why, and what it was worth.
- Ask the agent to make your message shorter.
- Give MCP servers read access by default. Posting on your behalf is a permission you grant on purpose.

::dont[Pipe the agent's output into the channel]

- Start work from an agent summary of the ticket.
- Post generated updates you haven't read.
- Reply to every thread because the agent can.
- Let the agent answer questions about work you haven't looked at.

:::

:::tip
If you can't say what you did, why, and what it was worth in three sentences, nobody else should have to read the long version.
:::

## Why it matters for your team

In FinTech, the tickets and threads are part of the record of why a change to a payment flow shipped, and an auditor or an incident review can't use a record that nobody wrote.

Related: [How to Cut QA Busywork with Rules Files, Agent Skills and MCP Servers](/blog/mcp-servers-rules-and-skills-for-qa), [AI Code Smells: A Review Checklist](/blog/ai-code-smells-review-checklist)

## Sources

1. Taylor Troesh, "How to be a -10x Engineer", taylor.town, 2023. <https://taylor.town/-10x>
2. Model Context Protocol, "What is the Model Context Protocol (MCP)?", modelcontextprotocol.io, accessed November 21, 2026. <https://modelcontextprotocol.io/docs/getting-started/intro>
