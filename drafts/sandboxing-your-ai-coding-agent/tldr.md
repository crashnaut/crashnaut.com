## TL;DR

Letting an AI agent run commands without permission prompts is fast but dangerous on your real machine. Run it in a container instead — the container is the security boundary.

```bash
ai-sandbox() {
  docker run -it --rm \
    -v "$(pwd)":/workspace \
    -v "$HOME/.gitconfig":/home/dev/.gitconfig:ro \
    --workdir /workspace \
    my-agent-image:latest agent --skip-permission-prompts
}
```

**What the boundary buys you:**

- **Filesystem isolation** — agent sees only the current project, not your home dir or other repos.
- **Scoped credentials** — mount only what's needed; sensitive files read-only.
- **Reproducible env** — pinned image; everyone's sandbox matches.
- **Clean disposal** — `--rm` wipes the container on exit; no drift.

Agents have speed and confidence but no hesitation. The container turns "I hope it doesn't" into "it can't." Draw the boundary once, then let it move fast inside it.
