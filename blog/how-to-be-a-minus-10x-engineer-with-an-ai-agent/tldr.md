---
title: "How to Be a -10x Engineer With an AI Agent"
slug: how-to-be-a-minus-10x-engineer-with-an-ai-agent
---

- **An agent makes output cheap and moves the cost to review.** High-AI-adoption teams merged 98% more PRs and review time grew 91%, while tasks completed rose 21%. AI adoption also came with 154% larger PRs and 9% more bugs per developer.
- **The -10x moves:** giant "small refactor" PRs, the agent writing (and retrying) its own tests, one-line tickets that change hourly, shipping every idea, running the team off the output slide, adding agents to late projects, and an agent with production keys and no shared context.
- **Perception is unreliable.** In one 2025 trial, developers were 19% slower with AI tools and still believed they were 20% faster.

To be a +1x engineer instead:

1. A human approves acceptance criteria (with examples and out-of-scope) before the agent starts.
2. Write the acceptance test from the criteria; the agent can't edit it. Keep retries low.
3. Split the work so each PR can be reviewed in one sitting, and budget the review queue.
4. Keep an independent check. Coverage is not a reason to drop QA.
5. Sandbox the agent: staging credentials, permission prompts on for destructive actions.
6. Measure lead time, change failure rate and review time, never lines, PR count or token spend.
7. When late, cut scope before adding anything that writes more code.
