---
title: Nix Flakes for SDET Setup
slug: nix-flakes-for-sdet-setup
description: A 5-minute guide to set up a reproducible SDET environment using Nix Flakes across Mac, Linux, and Windows.
author: Mike Sell
date: 2025-10-12T00:00:00.000Z
tags: Nix
---

## The Quick Setup

I've created a [Nix Flakes repository](https://github.com/crashnaut/nix) for reproducible SDET environments across Mac, Linux, and Windows (WSL2). Here's how to get started:

### Step 1: Install Nix (2 minutes)

```bash
curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install
```

### Step 2: Clone and Customize (1 minute)

:::code-group
```bash[title=macOS]
git clone https://github.com/crashnaut/nix.git
cd nix/mac
```

```bash[title=Linux]
git clone https://github.com/crashnaut/nix.git
cd nix/linux
```

```bash[title=Windows (WSL2)]
git clone https://github.com/crashnaut/nix.git
cd nix/windows
```
:::

Edit `flake.nix` to set your username and hostname, and customize the package list.

### Step 3: Apply Configuration (2 minutes)

:::code-group
```bash[title=macOS]
nix run nix-darwin -- switch --flake .#your-hostname
```

```bash[title=Linux]
nix run home-manager/master -- switch --flake .#your-username@your-hostname
```

```bash[title=Windows (WSL2)]
nix run home-manager/master -- switch --flake .#your-username@your-hostname
```
:::

Done! All your tools are now installed and configured.

## What's Included

### Development Tools
- Git, GitHub CLI, Vim
- Docker/OrbStack
- Language toolchains (Node, Python, etc.)

### CLI Utilities
- Modern tools: `ripgrep`, `bat`, `fd`, `eza`
- System monitoring: `htop`, `btop`
- Essentials: `curl`, `wget`, `jq`
- Zsh with Oh My Zsh

### GUI Applications (Mac/Linux)
- **Browsers**: Brave, Firefox
- **Communication**: Slack, Telegram, WhatsApp
- **Productivity**: Logseq, Postman, Obsidian

All fully customizable!

## Daily Workflow

### Update Everything

```bash
nix flake update
```

:::code-group
```bash[title=macOS]
darwin-rebuild switch --flake .
```

```bash[title=Linux/Windows]
home-manager switch --flake .
```
:::

### Add a Package

1. Find it at [search.nixos.org](https://search.nixos.org)
2. Add to your `flake.nix`
3. Rebuild

```nix
packages = with pkgs; [
  # ... existing packages
  neofetch  # New package
];
```

### Rollback on Issues

:::code-group
```bash[title=macOS]
darwin-rebuild switch --rollback
```

```bash[title=Linux/Windows]
home-manager generations
home-manager switch --switch-generation <number>
```
:::

## SDET Use Cases

### Consistent Test Environments

Use the same `flake.nix` locally and in CI to eliminate environment drift:

```bash
nix develop  # Same environment everywhere
```

### Quick CI/CD Setup

```dockerfile
FROM nixos/nix
COPY flake.nix flake.lock ./
RUN nix develop
```

### Multi-Platform Testing

Configurations for Mac, Linux, and Windows ensure your automation works everywhere.

### Team Onboarding

Three commands instead of a 20-page doc:

```bash
curl <install-nix>
git clone <your-nix-repo>
nix run <platform-command>
```

## Get Started

Check out the [repository](https://github.com/crashnaut/nix) for platform-specific configurations:

- [🍎 Mac Setup](https://github.com/crashnaut/nix/tree/main/mac)
- [🐧 Linux Setup](https://github.com/crashnaut/nix/tree/main/linux)
- [🪟 Windows Setup](https://github.com/crashnaut/nix/tree/main/windows)

Each includes detailed READMEs with troubleshooting guides.

## Quick FAQ

**Will this conflict with my existing tools?**  
No. Nix installs to `/nix` separately. Uninstall anytime with `/nix/nix-installer uninstall`.

**Disk space needed?**  
~2GB initially. Use `nix-collect-garbage` to clean old generations.

**Works with Docker?**  
Yes! Docker/OrbStack is included in the config.

---

**Questions?** Open an issue on [GitHub](https://github.com/crashnaut/nix) or check the [Nix docs](https://nixos.org/manual/nix/stable/).

