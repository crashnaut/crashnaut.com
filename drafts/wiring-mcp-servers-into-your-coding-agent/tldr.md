## TL;DR

Your agent is great at code but blind to the ticket, the doc, and the diagram around it. MCP servers give it authenticated access to those systems.

**The distinction:**

- **Skill** = extends *reasoning* (how to do something).
- **MCP server** = extends *reach* (what it can touch — issue tracker, wiki, diagrams).

The strong combos use both: a shipping skill that calls an issue-tracker MCP to pull a ticket and seed the branch name.

**In practice:** "Look up ticket ABC-1234 and start a branch" → agent fetches the summary itself, no copy-paste.

**Wiring it up:**

- **Auth** — prefer OAuth (approve in browser, token cached) over pasted secrets.
- **Scope** — per-project for anything that can write; global only for safe reads.

**Caution:** read-only connectors are low-risk; write-capable ones act on shared systems. Grant write access deliberately and keep it scoped.
