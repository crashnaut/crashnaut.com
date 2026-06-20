---
title: "Sandboxing Your AI Coding Agent"
slug: sandboxing-your-ai-coding-agent
description: "Running an AI coding agent with permissions skipped is fast — and terrifying on your real machine. Put it in a container with a clear blast radius, and you get the speed without betting your home directory on it."
author: Mike Sell
date: 2026-05-06T00:00:00.000Z
tags: ai, tooling, security
---

# Sandboxing Your AI Coding Agent

The fastest way to work with an AI coding agent is to let it run commands without stopping to ask permission for each one. The scariest way to work with an AI coding agent is to let it run commands without stopping to ask permission for each one — directly on the machine that has your SSH keys, your cloud credentials, and every other project you've ever touched.

You don't have to choose. Run the agent inside a container, and you keep the "just do it" speed while shrinking the blast radius to something you've deliberately drawn.

## The idea

Instead of launching the agent in your shell, launch it in a disposable container that mounts only what the task needs. The container is the security boundary. Anything you didn't explicitly mount, the agent simply cannot see or touch.

A small shell function is enough to make this the default way you start a session:

```bash
ai-sandbox() {
  docker run -it --rm \
    -v "$(pwd)":/workspace \                 # only THIS project
    -v "$HOME/.config/agent":/home/dev/.config/agent \  # agent settings
    -v "$HOME/.gitconfig":/home/dev/.gitconfig:ro \      # identity, read-only
    --workdir /workspace \
    my-agent-image:latest \
    agent --skip-permission-prompts
}
```

Now `ai-sandbox` works from any directory and always runs against the current project only.

## What the boundary actually buys you

**Filesystem isolation.** The agent sees `/workspace` — the current project — and nothing else. Your other repos, your home directory, your dotfiles, and your system are off the table. A misfired `rm -rf` or an over-eager "cleanup" can't escape the container.

**Scoped credentials.** Mount only the credentials this task needs, and mount the sensitive ones read-only. Your git identity is available so commits are attributed correctly, but the agent can't rewrite your global git config. Cloud credentials, if needed, are scoped to the work — not your whole account.

**A reproducible environment.** The image pins the runtime, the tools, and their versions. Every engineer runs the agent in the same place, so "works on my machine" stops being part of the conversation. Pull the latest image and everyone's sandbox updates together.

**A clean disposal story.** `--rm` means the container evaporates when you exit. Nothing accumulates, nothing drifts. The next session starts from the same known-good image.

## Why this matters more with agents than with people

A human running commands has judgment and hesitation. An agent running with permission prompts disabled has neither — it has speed and confidence, which is exactly the combination you want for getting work done and exactly the combination you don't want pointed at your entire machine. The container turns "I hope it doesn't do anything destructive" into "it physically cannot reach anything I didn't hand it."

That's the whole trade: a few lines in your shell startup file, in exchange for never having to think hard about what the agent might touch. Draw the boundary once, and then you're free to let it move fast inside it.
