---
title: "How to Cut QA Busywork with Rules Files, Agent Skills and MCP Servers"
slug: mcp-servers-rules-and-skills-for-qa
description: "A rules file for house style, skills for routine workflows, an MCP server for Jira: copy-paste setup for Claude Code and Cursor, with writes on a leash."
author: Mike Sell
date: 2026-10-10T14:00:00.000Z
tags: AI, QA, Playwright
---

The real gains I get from an AI coding agent in QA work aren't in the clever bits. They're in the menial crap around the tests: pasting a ticket's acceptance criteria into a prompt, explaining again that we don't use `waitForTimeout`, naming the branch, writing the PR description in the team format. Three pieces of configuration take most of that off the table: a rules file, a few skills, and an MCP server for the issue tracker. Below are copy-pasteable files for a TypeScript + Playwright suite (plus a short pytest version), checked against the Claude Code, Cursor and Atlassian docs in October 2026.

## Rules, skills and reach do different jobs

They're easy to conflate:

- A rules file is house style. The agent reads it at the start of every session: how tests are written here, what's banned, which commands to run.
- A skill extends the agent's reasoning for one task. It's a named workflow that tells the agent how to do something, step by step.
- An MCP server extends the agent's reach. It's a connector that gives the agent API access to an external service, like Jira or Confluence.

Skills are the "how." MCP servers are the "what it can touch." The useful combinations use both: a shipping skill that calls the issue-tracker MCP server to pull a ticket's summary, then uses it to name the branch and seed the commit message.

<figure class="diagram">
<svg viewBox="0 0 700 360" role="img" aria-label="Rules files and skills feed the coding agent's context; the agent calls an MCP server that reads freely but passes a permission prompt before writing to Jira or Confluence">
  <text class="d-title" x="110" y="28" text-anchor="middle">How (context)</text>
  <text class="d-title" x="630" y="28" text-anchor="middle">Reach</text>
  <rect class="d-panel" x="10" y="40" width="200" height="270" rx="6"/>
  <rect class="d-box" x="25" y="60" width="170" height="60" rx="4"/>
  <text class="d-text" x="110" y="86" text-anchor="middle">AGENTS.md</text>
  <text class="d-text-sm" x="110" y="104" text-anchor="middle">house style, every run</text>
  <rect class="d-box" x="25" y="145" width="170" height="60" rx="4"/>
  <text class="d-text" x="110" y="171" text-anchor="middle">Scoped rules</text>
  <text class="d-text-sm" x="110" y="189" text-anchor="middle">load for matching files</text>
  <rect class="d-box" x="25" y="230" width="170" height="60" rx="4"/>
  <text class="d-text" x="110" y="256" text-anchor="middle">Skills</text>
  <text class="d-text-sm" x="110" y="274" text-anchor="middle">named workflows</text>
  <path class="d-line" d="M195,90 L232,170 M195,175 L232,175 M195,260 L232,180"/>
  <path class="d-arrow" d="M240,175 l -8,-4 l 0,8 z"/>
  <rect class="d-box-green" x="240" y="145" width="150" height="60" rx="6"/>
  <text class="d-text" x="315" y="171" text-anchor="middle">Coding agent</text>
  <text class="d-text-sm" x="315" y="189" text-anchor="middle">Claude Code or Cursor</text>
  <path class="d-flow" d="M390,175 L421,175"/>
  <path class="d-flow-head" d="M430,175 l -9,-5 l 0,10 z"/>
  <text class="d-edge" x="410" y="137" text-anchor="middle">tool calls</text>
  <rect class="d-box" x="430" y="145" width="110" height="60" rx="4"/>
  <text class="d-text" x="485" y="171" text-anchor="middle">MCP server</text>
  <text class="d-text-sm" x="485" y="189" text-anchor="middle">OAuth, your perms</text>
  <rect class="d-box-green" x="570" y="40" width="120" height="90" rx="4"/>
  <text class="d-text" x="630" y="64" text-anchor="middle">Read</text>
  <text class="d-text-sm" x="630" y="86" text-anchor="middle">ticket text</text>
  <text class="d-text-sm" x="630" y="104" text-anchor="middle">Confluence pages</text>
  <path class="d-line" d="M540,160 L566,94"/>
  <path class="d-arrow" d="M569,86 l -1,9 l -7,-3 z"/>
  <rect class="d-box-amber" x="570" y="160" width="120" height="50" rx="4"/>
  <text class="d-text-sm" x="630" y="181" text-anchor="middle">ask before</text>
  <text class="d-text-sm" x="630" y="197" text-anchor="middle">every write</text>
  <path class="d-line" d="M540,185 L562,185"/>
  <path class="d-arrow" d="M570,185 l -8,-4 l 0,8 z"/>
  <path class="d-line" d="M630,210 L630,232"/>
  <path class="d-arrow" d="M630,240 l -4,-8 l 8,0 z"/>
  <rect class="d-box-red" x="570" y="240" width="120" height="90" rx="4"/>
  <text class="d-text" x="630" y="264" text-anchor="middle">Write</text>
  <text class="d-text-sm" x="630" y="286" text-anchor="middle">create issue</text>
  <text class="d-text-sm" x="630" y="302" text-anchor="middle">transition, comment</text>
  <text class="d-text-sm" x="630" y="318" text-anchor="middle">edit page</text>
  <text class="d-text-sm" x="315" y="345" text-anchor="middle">The left side changes what the agent knows. The right side changes what it can do.</text>
</svg>
<figcaption>Rules and skills only shape the agent's context. The MCP server is where it touches shared systems, so the write path goes through a permission prompt and the read path doesn't.</figcaption>
</figure>

## Write one rules file and point every tool at it

The file I care about most is `AGENTS.md` in the repo root, because both tools read it:

| Tool        | Project instructions                                     | Rules for some files                      |
| ----------- | -------------------------------------------------------- | ----------------------------------------- |
| Claude Code | `CLAUDE.md`, or `AGENTS.md` when there's no `CLAUDE.md`  | `.claude/rules/*.md` with `paths:`        |
| Cursor      | `AGENTS.md`, plain markdown with no metadata             | `.cursor/rules/*.mdc` with `globs:`       |

Claude Code reads `AGENTS.md` directly only when there's no `CLAUDE.md` in or above the working directory (v2.1.277 or later). If you already have a `CLAUDE.md`, put `@AGENTS.md` at the top of it to import the shared file, and keep any Claude-only notes below.

A starting point for a Playwright suite (the paths are illustrative):

```md:AGENTS.md
# Test suite rules

Stack: TypeScript, Playwright Test. Run `npx playwright test` before saying a change works.

## Writing tests
- Locate elements with `getByRole`, `getByLabel` or `getByTestId`. No CSS or XPath tied to DOM structure.
- Use web-first assertions: `await expect(locator).toBeVisible()`, never `expect(await locator.isVisible()).toBe(true)`.
- No `page.waitForTimeout()`. Wait for the state you need with an assertion.
- Each test creates its own data through fixtures or the API. No test relies on another test's leftovers.
- Mock third-party services at the network boundary with `page.route()`. Don't mock our own modules.
- Page objects live in `tests/pages/` and come from the fixtures in `tests/fixtures.ts`.

## Never
- Never print, log or commit secrets, tokens or `.env` values.
- Never point a test at production. Base URLs come from `playwright.config.ts`.
- Never use real card numbers or customer data. Use the factories in `tests/data/`.
- Never add a retry or a longer timeout to make a flaky test pass. Report it instead.
```

The locator, assertion, isolation and `page.route()` rules come straight from [Playwright's best practices](https://playwright.dev/docs/best-practices). The "Never" list is mine, and on a payments codebase it's the part that matters.

If you also run a Python suite, say pytest against a GraphQL API backed by Neo4j, the same file takes a short section:

```md:AGENTS.md
## pytest suite (api-tests/)
- Setup and teardown go in pytest fixtures in `conftest.py`, not `setUp`/`tearDown` methods.
- No `time.sleep()`. Poll for the condition with a timeout.
- Mock HTTP at the client boundary, not our own functions.
- Each test cleans up the graph data it creates. Never run against a shared database.
```

For rules that only apply to some files, both tools support scoping. In Cursor a project rule must use the `.mdc` extension (a plain `.md` file in `.cursor/rules` is ignored):

```md:.cursor/rules/playwright-specs.mdc
---
globs: tests/**/*.spec.ts
alwaysApply: false
---

- One `test.describe` per user journey.
- Tag smoke tests with `@smoke` in the title.
```

The Claude Code equivalent is `.claude/rules/playwright-specs.md`, with a `paths:` list of quoted globs in place of `globs:`. For a bigger worked example, see [this site's own AGENTS.md](https://github.com/crashnaut/crashnaut.com/blob/main/AGENTS.md): working rules, content rules and a repo map.

One caveat from the Claude Code docs: these files are context, not enforced configuration. To actually block an action you need permission rules or a sandbox, which is what [How to Sandbox Your AI Coding Agent with a Dev Container](/blog/sandboxing-your-ai-coding-agent) covers.

## Package the routine workflows as skills

A good prompt helps you once. A skill captures it as a workflow anyone can invoke without remembering the details. In Claude Code a skill is a folder with a `SKILL.md` in it: `.claude/skills/<name>/` in the repo (commit it to share), or `~/.claude/skills/<name>/` for just you. You run it as `/<name>`, and Claude can also load it on its own when a request matches the `description`. Custom slash commands have been merged into skills, so an old `.claude/commands/ship.md` file still works.

The one I use most is shipping a change. Done ad hoc, every engineer prompts differently and you get different branch names, commit styles and PR descriptions. As a skill it runs the same steps every time:

```md:.claude/skills/commit-and-mr/SKILL.md
---
name: commit-and-mr
description: Branch, commit, push and open a merge request for the current change using team conventions.
disable-model-invocation: true
allowed-tools: Bash(git diff *)
---

1. Use the ticket key from $ARGUMENTS, or ask for one. Fetch the ticket summary.
2. Run `git status` and `git diff` to see what's staged and unstaged.
3. Create a branch named `<type>/<TICKET-KEY>-<short-summary>`.
4. Commit with `<TICKET-KEY>: <imperative summary>`.
5. Push to origin.
6. Open the merge request with three sections: What, Files Changed, How to Test.
7. Report the link and a one-line summary.
```

`disable-model-invocation: true` means only a person can start it, which is what I want for anything that pushes. `allowed-tools` lets the read-only `git diff` run without a prompt while the skill is active. Nobody has to remember the branch-naming rule, because the skill _is_ the rule.

<figure class="diagram">
<svg viewBox="0 0 700 200" role="img" aria-label="A skill run in five stages: invoke, load, research and report are read-only, while execute writes to git and the issue tracker">
  <rect class="d-box" x="8" y="40" width="124" height="60" rx="4"/>
  <text class="d-text" x="70" y="65" text-anchor="middle">1 Invoke</text>
  <text class="d-text-sm" x="70" y="84" text-anchor="middle">/commit-and-mr</text>
  <rect class="d-box" x="150" y="40" width="124" height="60" rx="4"/>
  <text class="d-text" x="212" y="65" text-anchor="middle">2 Load</text>
  <text class="d-text-sm" x="212" y="84" text-anchor="middle">SKILL.md text</text>
  <rect class="d-box" x="292" y="40" width="124" height="60" rx="4"/>
  <text class="d-text" x="354" y="65" text-anchor="middle">3 Research</text>
  <text class="d-text-sm" x="354" y="84" text-anchor="middle">git diff, ticket</text>
  <rect class="d-box-amber" x="434" y="40" width="124" height="60" rx="4"/>
  <text class="d-text" x="496" y="65" text-anchor="middle">4 Execute</text>
  <text class="d-text-sm" x="496" y="84" text-anchor="middle">branch, push, MR</text>
  <rect class="d-box" x="576" y="40" width="116" height="60" rx="4"/>
  <text class="d-text" x="634" y="65" text-anchor="middle">5 Report</text>
  <text class="d-text-sm" x="634" y="84" text-anchor="middle">link + summary</text>
  <path class="d-flow" d="M132,70 L142,70 M274,70 L284,70 M416,70 L426,70 M558,70 L568,70"/>
  <path class="d-flow-head" d="M150,70 l -8,-5 l 0,10 z"/>
  <path class="d-flow-head" d="M292,70 l -8,-5 l 0,10 z"/>
  <path class="d-flow-head" d="M434,70 l -8,-5 l 0,10 z"/>
  <path class="d-flow-head" d="M576,70 l -8,-5 l 0,10 z"/>
  <rect class="d-box-green" x="8" y="124" width="408" height="30" rx="4"/>
  <text class="d-text-sm" x="212" y="143" text-anchor="middle">read only: fine to run without a prompt</text>
  <rect class="d-box-red" x="434" y="124" width="124" height="30" rx="4"/>
  <text class="d-text-sm" x="496" y="143" text-anchor="middle">impact zone</text>
  <rect class="d-box-green" x="576" y="124" width="116" height="30" rx="4"/>
  <text class="d-text-sm" x="634" y="143" text-anchor="middle">read only</text>
  <text class="d-text-sm" x="350" y="185" text-anchor="middle">Only stage 4 changes anything other people can see. Keep the prompts there.</text>
</svg>
<figcaption>Every skill run has the same shape. Auto-approve the read-only stages and leave the permission prompt on the one stage that writes.</figcaption>
</figure>

Other QA chores with a "correct" shape that's tedious to re-explain: cutting a hotfix (cherry-pick a merged PR's commits onto a release branch), scaffolding a spec from a ticket's acceptance criteria, and writing tests for the current diff in house style. A wiki page relies on people remembering it under deadline pressure. Write the convention down once, as a skill, and it stops being something you enforce.

## Give the agent reach with an MCP server

An agent is good at code but blind to everything around it: the ticket, the design doc, the wiki page. An MCP server fixes that. For Jira and Confluence, Atlassian hosts one, the Rovo MCP Server, at `https://mcp.atlassian.com/v2/mcp`. You sign in with OAuth 2.1, and it acts with your existing Atlassian permissions and no more. It reads, and it can also create, edit, transition and comment on Jira work items and create or update Confluence pages.

In Claude Code:

```bash
claude mcp add --transport http --scope project atlassian https://mcp.atlassian.com/v2/mcp
# then, inside a session, run /mcp and follow the browser login
```

`--scope project` writes `.mcp.json` in the repo root so the team shares one definition. The default `local` scope keeps it private to you in `~/.claude.json`, and `user` makes it live in every project. Cursor reads the same idea from `.cursor/mcp.json`:

```json:.cursor/mcp.json
{
  "mcpServers": {
    "atlassian": {
      "url": "https://mcp.atlassian.com/v2/mcp"
    }
  }
}
```

Now "look up ABC-1234 and start a branch for it" works without copy-paste, and the `commit-and-mr` skill can fetch the ticket summary itself.

## Keep write access on a leash

Reach cuts both ways. A connector that can _read_ your issue tracker is low risk. A connector that can _write_ is acting on shared systems your teammates rely on, with your name on every change. The MCP spec makes authorization optional, uses OAuth 2.1 for HTTP servers, and has local stdio servers take credentials from the environment, so check which kind you're installing.

:::compare
::do[Wire it like this]

- Project scope, so it's only live in repos that need it
- OAuth sign-in, scoped and revocable
- Every call behind a prompt: `"ask": ["mcp__atlassian"]`
- Read the ticket, not the attachments with customer data

::dont[Not like this]

- User scope, live in every directory you open
- A long-lived API token pasted into a config file
- Every tool auto-approved so the prompts go away
- One connector shared between a test site and production

:::

In Claude Code's `permissions` settings, `mcp__atlassian` matches every tool from that server, so the `ask` rule above prompts on each call. Cursor asks for approval before MCP tools by default. Either way the agent's output still needs review, and [the AI code smells checklist](/blog/ai-code-smells-review-checklist) is what I run over its diffs.

:::tip
Put each convention where the agent reads it every run: house style in `AGENTS.md`, routine workflows in skills, and ticket access behind an MCP server that asks before it writes.
:::

## Why it matters for your team

On a team shipping payment code, this setup lets the agent read the ticket and follow the house rules while it stays away from customer data, PCI scope and production credentials.

The enforcement side is in [How to Sandbox Your AI Coding Agent with a Dev Container](/blog/sandboxing-your-ai-coding-agent). For the page objects the rules file refers to, see [Vanilla Playwright with Page Object Model](/blog/vanilla-playwright-pom-setup).
