## TL;DR

Letting an AI agent run commands without permission prompts is fast but dangerous on your real machine. Run it in a dev container that mounts only the repo, add deny rules and an egress allowlist, and keep production credentials out.

```json:.devcontainer/devcontainer.json
{
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
  "containerEnv": { "CLAUDE_CONFIG_DIR": "/home/vscode/.claude" },
  "runArgs": ["--security-opt=no-new-privileges", "--pids-limit=512", "--memory=8g"]
}
```

```json:.claude/settings.json
{
  "permissions": {
    "ask": ["Bash(git push *)", "mcp__atlassian"],
    "deny": ["Read(./.env)", "Read(./.env.*)", "Bash(curl *)", "Bash(wget *)"]
  }
}
```

1. Commit your work, then rebuild the container and run `claude --dangerously-skip-permissions` inside it (it refuses to run as root).
2. Never mount `~/.ssh`, `~/.aws`, the Docker socket or a production `.env`.
3. Limit egress to the model API, registries and named MCP servers (the reference container's `init-firewall.sh` shows how).
4. Treat deny rules as a fence: they don't stop `/usr/bin/curl` or a script that opens files itself. The container is the wall.
5. In Cursor, pick a run mode under Settings > Agents > Approvals & Execution and set `"readBoundary": "workspace"` in `.cursor/sandbox.json`.
