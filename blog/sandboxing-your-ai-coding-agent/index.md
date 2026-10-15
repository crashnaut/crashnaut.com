---
title: "How to Sandbox Your AI Coding Agent with a Dev Container"
slug: sandboxing-your-ai-coding-agent
description: "Run your AI coding agent without permission prompts but inside a dev container, with deny rules, read-only mounts, an egress allowlist and no prod credentials."
author: Mike Sell
date: 2026-08-27T00:00:00.000Z
updated: 2026-10-10T00:00:00.000Z
tags: AI, Developer Environment, Testing
---

The fastest way to work with an AI coding agent is to let it run commands without stopping to ask permission for each one. On the laptop that holds your SSH keys, your cloud credentials and every other repo you've touched, it's also the scariest. You don't have to choose: run the agent in a container, and you keep the "just do it" speed while the blast radius shrinks to something you drew on purpose. This post has a working `devcontainer.json` for Claude Code, the permission and network settings to put around it (with Cursor's equivalents), and a checklist, all checked against the vendor docs in October 2026.

## Draw the blast radius before you skip the prompts

The container is the security boundary. Anything you didn't mount, the agent can't see or touch. Each layer you add inside that shrinks what a bad command, or a prompt injection hiding in a README, can reach.

<figure class="diagram">
<svg viewBox="0 0 700 420" role="img" aria-label="Concentric rings: the agent sits inside the workspace, inside a disposable container, inside an egress allowlist; a read-only .gitconfig is bind-mounted into the container wall; SSH keys, cloud credentials, production credentials and other repos sit outside every ring">
  <circle class="d-box-amber" cx="350" cy="205" r="185"/>
  <circle class="d-box" cx="350" cy="205" r="138"/>
  <circle class="d-box-green" cx="350" cy="205" r="90"/>
  <circle class="d-node-green" cx="350" cy="205" r="42"/>
  <text class="d-on-fill" x="350" y="209" text-anchor="middle">agent</text>
  <text class="d-text-sm" x="350" y="40" text-anchor="middle">egress allowlist</text>
  <text class="d-text-sm" x="350" y="54" text-anchor="middle">model API, registries</text>
  <text class="d-text-sm" x="350" y="90" text-anchor="middle">container: non-root,</text>
  <text class="d-text-sm" x="350" y="104" text-anchor="middle">disposable</text>
  <text class="d-text-sm" x="350" y="140" text-anchor="middle">workspace (rw)</text>
  <text class="d-text-sm" x="350" y="154" text-anchor="middle">this repo only</text>
  <rect class="d-box" x="287" y="329" width="126" height="28" rx="4"/>
  <text class="d-text-sm" x="350" y="347" text-anchor="middle">.gitconfig (ro)</text>
  <text class="d-edge" x="350" y="374" text-anchor="middle">bind mount</text>
  <rect class="d-box-red" x="10" y="14" width="150" height="50" rx="4"/>
  <text class="d-text" x="85" y="44" text-anchor="middle">~/.ssh, ~/.aws</text>
  <rect class="d-box-red" x="540" y="14" width="150" height="50" rx="4"/>
  <text class="d-text" x="615" y="44" text-anchor="middle">other repos</text>
  <rect class="d-box-red" x="10" y="356" width="150" height="50" rx="4"/>
  <text class="d-text" x="85" y="386" text-anchor="middle">prod credentials</text>
  <rect class="d-box-red" x="540" y="356" width="150" height="50" rx="4"/>
  <text class="d-text" x="615" y="386" text-anchor="middle">rest of home dir</text>
</svg>
<figcaption>Impact zones, inside out. The agent can wreck the workspace (commit first), and it can reach the hosts on the allowlist. Everything in red is outside every ring because it was never mounted.</figcaption>
</figure>

A human running commands has judgment and hesitation. An agent running with prompts disabled has neither. It has speed and confidence, which is exactly what you want for getting work done and exactly what you don't want pointed at your whole machine. The container turns "I hope it doesn't do anything destructive" into "it can't reach anything I didn't hand it."

## A devcontainer.json that keeps the host out

Claude Code's docs ship a [dev container guide](https://code.claude.com/docs/en/devcontainer) and an official Dev Container Feature that installs the CLI. This is my starting file for a TypeScript + Playwright repo. Every key is from the [devcontainer.json reference](https://containers.dev/implementors/json_reference/).

```json:.devcontainer/devcontainer.json
{
  "name": "agent-sandbox",
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu24.04",
  "features": {
    "ghcr.io/devcontainers/features/node:1": {},
    "ghcr.io/anthropics/devcontainer-features/claude-code:1.0": {}
  },
  "remoteUser": "vscode",
  "mounts": [
    "source=claude-config-${devcontainerId},target=/home/vscode/.claude,type=volume",
    "source=${localEnv:HOME}/.gitconfig,target=/home/vscode/.gitconfig,type=bind,readonly"
  ],
  "containerEnv": {
    "CLAUDE_CONFIG_DIR": "/home/vscode/.claude"
  },
  "runArgs": ["--security-opt=no-new-privileges", "--pids-limit=512", "--memory=8g"],
  "postCreateCommand": "npm ci"
}
```

What each part buys you:

- Non-root user. The base image has a `vscode` user. Claude Code refuses `--dangerously-skip-permissions` when run as root, so this is required, not optional.
- Config in a named volume. Sign-in and settings live in `~/.claude`. The volume plus `CLAUDE_CONFIG_DIR` keeps you signed in across rebuilds, and `${devcontainerId}` gives each project its own volume.
- Git identity read-only. Commits are attributed to you, but the agent can't rewrite your global git config. (If `~/.gitconfig` doesn't exist on the host, the mount fails. Create it or drop the line.)
- No new privileges. `no-new-privileges` stops `sudo` and setuid binaries from escalating inside the container. The PID and memory limits stop a runaway loop from taking the laptop down with it.

Open the folder in VS Code or Cursor, run **Dev Containers: Rebuild Container**, then `claude --dangerously-skip-permissions` in the container terminal.

If you don't use an editor with dev container support, the shell function from my original notes still works (`my-agent-image` stands in for an image you build with Claude Code and a non-root `dev` user):

```bash:~/.zshrc
ai-sandbox() {
  docker run -it --rm \
    --security-opt no-new-privileges \
    -v "$(pwd)":/workspace \
    -v "$HOME/.gitconfig":/home/dev/.gitconfig:ro \
    -w /workspace \
    my-agent-image:latest \
    claude --dangerously-skip-permissions
}
```

`--rm` deletes the container on exit, so nothing accumulates and the next session starts from the same known-good image.

:::compare
::do[Mount this]

- The current repo, and nothing above it
- `.gitconfig` read-only
- A named volume for the agent's own config
- Short-lived, repo-scoped tokens passed as env vars

::dont[Never mount this]

- `$HOME`, `~/.ssh` or `~/.aws`
- `/var/run/docker.sock` (it drives the host's Docker daemon)
- A `.env` holding production database URLs
- Exports of real customer or card data

:::

The Claude Code docs are blunt about the limit here: with `--dangerously-skip-permissions`, a dev container doesn't stop a malicious project from exfiltrating anything inside the container, including the Claude Code credentials in `~/.claude`. Use it with repos you trust, and keep host secrets out.

## Permission rules are the first fence, not the wall

Inside the container I still commit a `.claude/settings.json`, because it travels with the repo and covers teammates who run the agent on bare metal:

```json:.claude/settings.json
{
  "permissions": {
    "allow": ["Bash(npx playwright test *)", "Bash(npm run lint)"],
    "ask": ["Bash(git push *)", "mcp__atlassian"],
    "deny": ["Read(./.env)", "Read(./.env.*)", "Read(./secrets/**)", "Bash(curl *)", "Bash(wget *)"]
  }
}
```

Claude Code checks deny, then ask, then allow, and the first match wins. Deny and ask rules apply as soon as the file exists; allow rules wait until each teammate trusts the folder. The docs also say plainly what these rules don't do. `Bash(curl *)` doesn't stop `/usr/bin/curl` or `sh -c 'curl …'`, and a `Read` deny doesn't stop a Node or Python script that opens the file itself. That's why they're a fence and the container is the wall.

On a machine without a container, turn on the [Bash sandbox](https://code.claude.com/docs/en/sandboxing) with `/sandbox` or `"sandbox": { "enabled": true }`. It's enforced by the OS (Seatbelt on macOS, bubblewrap on Linux and WSL2) and keeps shell commands writing only inside the working directory, with network traffic going through a proxy that checks each host against `sandbox.network.allowedDomains`. It covers shell commands only: Claude's file tools and MCP servers run outside it. To stop anyone running with prompts off at all, set `permissions.disableBypassPermissionsMode` to `"disable"` in managed settings.

Cursor has the same ideas under different names. Under **Settings > Agents > Approvals & Execution** pick a run mode: Auto-review, Allowlist or Run Everything. Cursor's own docs say "Auto-review is not a security boundary". Its terminal sandbox (Seatbelt on macOS; Landlock on Linux 6.2+) is configured in `.cursor/sandbox.json`, and `.cursorignore` hides files from the agent:

```json:.cursor/sandbox.json
{
  "readBoundary": "workspace"
}
```

<figure class="diagram">
<svg viewBox="0 0 700 300" role="img" aria-label="Matrix of five risky actions against four controls, showing which control blocks, partly blocks or leaves open each action">
  <text class="d-text" x="245" y="38" text-anchor="middle">Deny rules</text>
  <text class="d-text" x="375" y="38" text-anchor="middle">Bash sandbox</text>
  <text class="d-text" x="505" y="38" text-anchor="middle">Container</text>
  <text class="d-text" x="635" y="38" text-anchor="middle">Egress firewall</text>
  <text class="d-text" x="12" y="78">rm -rf ~</text>
  <text class="d-text" x="12" y="122">read ~/.ssh</text>
  <text class="d-text" x="12" y="166">read repo .env</text>
  <text class="d-text" x="12" y="210">curl data out</text>
  <text class="d-text" x="12" y="254">MCP write to Jira</text>
  <rect class="d-box-amber" x="185" y="56" width="120" height="34" rx="4"/><text class="d-text-sm" x="245" y="77" text-anchor="middle">partial</text>
  <rect class="d-box-green" x="315" y="56" width="120" height="34" rx="4"/><text class="d-text-sm" x="375" y="77" text-anchor="middle">blocks</text>
  <rect class="d-box-green" x="445" y="56" width="120" height="34" rx="4"/><text class="d-text-sm" x="505" y="77" text-anchor="middle">blocks</text>
  <rect class="d-box" x="575" y="56" width="120" height="34" rx="4"/><text class="d-text-sm" x="635" y="77" text-anchor="middle">n/a</text>
  <rect class="d-box-amber" x="185" y="100" width="120" height="34" rx="4"/><text class="d-text-sm" x="245" y="121" text-anchor="middle">partial</text>
  <rect class="d-box-amber" x="315" y="100" width="120" height="34" rx="4"/><text class="d-text-sm" x="375" y="121" text-anchor="middle">if denyRead set</text>
  <rect class="d-box-green" x="445" y="100" width="120" height="34" rx="4"/><text class="d-text-sm" x="505" y="121" text-anchor="middle">blocks</text>
  <rect class="d-box" x="575" y="100" width="120" height="34" rx="4"/><text class="d-text-sm" x="635" y="121" text-anchor="middle">n/a</text>
  <rect class="d-box-amber" x="185" y="144" width="120" height="34" rx="4"/><text class="d-text-sm" x="245" y="165" text-anchor="middle">partial</text>
  <rect class="d-box-amber" x="315" y="144" width="120" height="34" rx="4"/><text class="d-text-sm" x="375" y="165" text-anchor="middle">if denyRead set</text>
  <rect class="d-box-red" x="445" y="144" width="120" height="34" rx="4"/><text class="d-text-sm" x="505" y="165" text-anchor="middle">open</text>
  <rect class="d-box" x="575" y="144" width="120" height="34" rx="4"/><text class="d-text-sm" x="635" y="165" text-anchor="middle">n/a</text>
  <rect class="d-box-amber" x="185" y="188" width="120" height="34" rx="4"/><text class="d-text-sm" x="245" y="209" text-anchor="middle">partial</text>
  <rect class="d-box-green" x="315" y="188" width="120" height="34" rx="4"/><text class="d-text-sm" x="375" y="209" text-anchor="middle">allowlist</text>
  <rect class="d-box-red" x="445" y="188" width="120" height="34" rx="4"/><text class="d-text-sm" x="505" y="209" text-anchor="middle">open</text>
  <rect class="d-box-green" x="575" y="188" width="120" height="34" rx="4"/><text class="d-text-sm" x="635" y="209" text-anchor="middle">blocks</text>
  <rect class="d-box-green" x="185" y="232" width="120" height="34" rx="4"/><text class="d-text-sm" x="245" y="253" text-anchor="middle">ask rule prompts</text>
  <rect class="d-box-red" x="315" y="232" width="120" height="34" rx="4"/><text class="d-text-sm" x="375" y="253" text-anchor="middle">open</text>
  <rect class="d-box-red" x="445" y="232" width="120" height="34" rx="4"/><text class="d-text-sm" x="505" y="253" text-anchor="middle">open</text>
  <rect class="d-box-amber" x="575" y="232" width="120" height="34" rx="4"/><text class="d-text-sm" x="635" y="253" text-anchor="middle">all or nothing</text>
  <text class="d-text-sm" x="350" y="290" text-anchor="middle">No column is green all the way down. That is the case for layering them.</text>
</svg>
<figcaption>Which control stops which crash. A <code>.env</code> inside the repo is visible to a container, and an MCP write goes around both the sandbox and the container, so those two need deny rules and an ask rule.</figcaption>
</figure>

## Limit network egress, because that's where secrets leave

A container with open networking can still post your workspace to anywhere. The [reference dev container](https://github.com/anthropics/claude-code/tree/main/.devcontainer) handles this with an `init-firewall.sh` script that limits outbound traffic to the hosts it allows, run at container start; it needs the `NET_ADMIN` and `NET_RAW` capabilities added through `runArgs`. It runs the script through `sudo`, so if you adopt it, drop `no-new-privileges` from my file or move the firewall into the image. Add your MCP servers' domains and your package registry to the list, and nothing else.

For steps that don't need the model API at all, such as running a generated test suite you haven't reviewed yet, `docker run --network none` gives the container a loopback interface and nothing more.

## The guardrails checklist

- [ ] Agent runs as a non-root user in a container that mounts only the current repo.
- [ ] No `~/.ssh`, `~/.aws`, Docker socket or production `.env` inside the container.
- [ ] Credentials are short-lived and scoped to the repo, passed as environment variables.
- [ ] `.gitconfig` and anything else you share is mounted read-only.
- [ ] Outbound network limited to the model API, registries and named MCP servers.
- [ ] `.claude/settings.json` denies reading secrets and asks before `git push` and MCP writes.
- [ ] Work is committed before a prompt-free session, so `git diff` shows exactly what the agent changed.
- [ ] Rules files and skills tell the agent the conventions; [the setup for those is here](/blog/mcp-servers-rules-and-skills-for-qa).

:::tip
Decide what the agent can reach before you turn the prompts off, then put that decision in a container and a committed settings file so it holds for the whole team.
:::

## Why it matters for your team

If production credentials and customer card data are never mounted into the container, a misfired command or an injected prompt can't leak them, and that's a far easier story to tell your security team than "we told the agent not to."

The diffs a prompt-free agent produces still need a human pass; [the AI code smells checklist](/blog/ai-code-smells-review-checklist) is the one I use. For pinning the rest of the toolchain the same way on every machine, see [Nix Flakes for SDET Setup](/blog/nix-flakes-for-sdet-setup).
