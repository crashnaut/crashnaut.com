## TL;DR

Rules files hold house style, skills hold routine workflows, MCP servers give the agent reach into Jira and Confluence. Set up all three once and stop re-explaining your conventions.

```md:AGENTS.md
# Test suite rules
- Locate with getByRole / getByLabel / getByTestId. No DOM-structure CSS or XPath.
- Web-first assertions only. No page.waitForTimeout().
- Each test creates its own data. Mock third parties with page.route().
- Never print secrets, never target production, never use real card or customer data.
```

```bash
claude mcp add --transport http --scope project atlassian https://mcp.atlassian.com/v2/mcp
```

1. Put `AGENTS.md` in the repo root. Cursor reads it; Claude Code reads it when there's no `CLAUDE.md`, otherwise add `@AGENTS.md` to your `CLAUDE.md`.
2. Scope file-specific rules with `.cursor/rules/*.mdc` (`globs:`) or `.claude/rules/*.md` (`paths:`).
3. Add skills as `.claude/skills/<name>/SKILL.md`; set `disable-model-invocation: true` on anything that pushes.
4. Add the Atlassian MCP server at project scope, then run `/mcp` to sign in with OAuth.
5. Put write-capable MCP tools behind a prompt: `"permissions": { "ask": ["mcp__atlassian"] }`.
