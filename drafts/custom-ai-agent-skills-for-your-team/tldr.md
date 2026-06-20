## TL;DR

Team conventions (branch names, commit format, PR structure) usually rot in a wiki. Put them in a **skill** — a reusable slash-command workflow — and the agent applies them the same way for everyone.

**Prompt vs skill:** a prompt helps once; a skill captures the workflow anyone can invoke.

Example — a `commit-and-mr` skill runs the same steps every time:

```
ticket → inventory → branch → stage → commit → push → open MR → report
```

**Good skill candidates** (common + convention-heavy):

- Shipping a change (branch + commit + PR description)
- Cutting a hotfix (cherry-pick onto a release branch)
- Generating consistent docs from code
- Writing tests in your house style

**Lifecycle:** invoke → instructions injected → research (reads files/tools) → execute → report.

**Why it beats a wiki:** conventions apply by default, new hires ship correctly on day one, reviews get faster.
