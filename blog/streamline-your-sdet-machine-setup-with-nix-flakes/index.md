---
title: Fast SDET Setup with Nix Flakes
slug: fast-sdet-setup-with-nix-flakes
description: Stop spending hours configuring new machines. Use reproducible development environment for Mac, Linux, or Windows in just 5 minutes using Nix Flakes.
author: Mike Sell
date: 2025-10-12T00:00:00.000Z
tags: Nix, DevOps, Testing, Automation
---

## The Problem: Machine Setup Shouldn't Take Hours

As an SDET how many times have you had to set up a new machine? Whether it's a new laptop, a CI runner, or helping a teammate get started, the process is painful:

- Installing dozens of tools individually
- Tracking down the right versions
- Configuring each tool properly
- Documenting the process (that inevitably gets outdated)
- Dealing with "it works on my machine" issues

What if you could go from a fresh machine to a fully configured development environment in **5 minutes**?

## The Solution: Nix Flakes

I've created a [Nix Flakes repository](https://github.com/crashnaut/nix) that provides reproducible development environments across Mac, Linux, and Windows (WSL2). The entire setup is declarative, version-controlled, and atomic.

### Why Nix Flakes?

**Declarative Configuration**: Your entire environment is defined in a single `flake.nix` file. Want to know what's installed? Just read the file.

**Reproducible**: The same configuration produces the same result every time, on every machine. No more "it worked yesterday" mysteries.

**Atomic Updates**: Changes either succeed completely or rollback automatically. No more broken environments from partial updates.

**Cross-Platform**: The same approach works on Mac, Linux, and Windows (via WSL2).

**Version Control**: Your environment configuration is just code. Track changes, branch, and merge like any other codebase.

## What's Included

The repository includes platform-specific configurations for:

### Development Tools
- Git, GitHub CLI, Vim
- Docker/OrbStack
- Language-specific toolchains (Node, Python, etc.)

### CLI Utilities
- Modern replacements: `ripgrep`, `bat`, `fd`, `eza`
- System monitoring: `htop`, `btop`
- Essential tools: `curl`, `wget`, `jq`
- Zsh with Oh My Zsh

### GUI Applications (Mac/Linux)
- **Browsers**: Brave, Firefox
- **Communication**: Slack, Telegram, WhatsApp
- **Productivity**: Logseq, Postman, Obsidian
- **Cloud**: Dropbox

All customizable to your needs!

## The 5-Minute Setup

### Step 1: Install Nix (2 minutes)

```bash
curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install
```

This installs Nix using the [Determinate Systems installer](https://github.com/DeterminateSystems/nix-installer), which provides a better experience than the official installer.

### Step 2: Clone and Customize (1 minute)

```bash
git clone https://github.com/crashnaut/nix.git
cd nix/<your-platform>  # mac, linux, or windows
```

Edit the `flake.nix` file to customize:
- Your username
- Your hostname
- Packages you want to include/exclude

### Step 3: Apply the Configuration (2 minutes)

**For macOS:**
```bash
nix run nix-darwin -- switch --flake .#your-hostname
```

**For Linux:**
```bash
nix run home-manager/master -- switch --flake .#your-username@your-hostname
```

**For Windows (WSL2):**
```bash
nix run home-manager/master -- switch --flake .#your-username@your-hostname
```

That's it! All your tools and applications are now installed and configured.

## Real-World Benefits for SDETs

### Consistent Test Environments

Ever had a test pass locally but fail in CI? With Nix, you can ensure your local environment matches your CI environment exactly. The same `flake.nix` that sets up your laptop can configure your CI runners.

```bash
# In CI, use the same configuration
nix develop
# Your tests now run in the same environment as local
```

### Quick CI/CD Agent Setup

Need to spin up new test runners? Instead of maintaining complex setup scripts, use your Nix configuration:

```dockerfile
FROM nixos/nix
COPY flake.nix flake.lock ./
RUN nix develop
```

### Testing Across Multiple OS

The repository includes configurations for Mac, Linux, and Windows. Test your automation scripts across all platforms with confidence that each environment is properly configured.

### Onboarding Made Simple

New team member? Instead of a 20-page setup document that's probably outdated, give them three commands:

```bash
curl <install-nix>
git clone <your-nix-repo>
nix run <platform-command>
```

## Daily Usage

Once set up, managing your environment is straightforward:

### Updating Everything

```bash
# Update all packages
nix flake update

# Apply updates (example for macOS)
darwin-rebuild switch --flake .
```

### Adding a New Package

1. Find the package at [search.nixos.org](https://search.nixos.org)
2. Add it to your `flake.nix`
3. Run the rebuild command

```nix
# In flake.nix
packages = with pkgs; [
  # ... existing packages
  neofetch  # New package
];
```

### Something Broke? Rollback!

Nix keeps track of previous configurations. If an update breaks something:

**macOS:**
```bash
darwin-rebuild switch --rollback
```

**Linux/Windows:**
```bash
home-manager generations
home-manager switch --switch-generation <number>
```

## Customization Guide

The `flake.nix` files are heavily commented and designed for modification:

### Adding Packages

```nix
packages = with pkgs; [
  git
  vim
  # Add any package from nixpkgs
  ripgrep
  docker
];
```

### Adding Homebrew Apps (macOS)

```nix
homebrew = {
  casks = [
    "slack"
    "docker"
    # Add any Homebrew cask
  ];
};
```

### Configuring Git

```nix
programs.git = {
  enable = true;
  userName = "Your Name";
  userEmail = "your.email@example.com";
  extraConfig = {
    init.defaultBranch = "main";
    pull.rebase = true;
  };
};
```

### Shell Aliases

```nix
programs.zsh = {
  shellAliases = {
    ll = "ls -la";
    gs = "git status";
    # Add your custom aliases
  };
};
```

## Platform-Specific Details

The repository has three separate configurations optimized for each platform:

### macOS (`mac/`)
- Uses `nix-darwin` for system-level configuration
- Integrates with Homebrew for GUI apps
- Supports Mac App Store automation with `mas`
- Proper Spotlight and Launchpad integration

### Linux (`linux/`)
- Uses `home-manager` for user-level packages
- No sudo required after initial Nix install
- Works on any Linux distribution
- Includes Docker configuration

### Windows WSL2 (`windows/`)
- Full Linux environment inside Windows
- Windows filesystem integration
- Docker Desktop support
- Native Linux performance

Each platform has its own detailed README with specific instructions and troubleshooting.

## Getting Started

Ready to try it? Check out the [repository](https://github.com/crashnaut/nix) and choose your platform:

- [🍎 Mac Setup](https://github.com/crashnaut/nix/tree/main/mac)
- [🐧 Linux Setup](https://github.com/crashnaut/nix/tree/main/linux)
- [🪟 Windows Setup](https://github.com/crashnaut/nix/tree/main/windows)

## Common Questions

**Q: Will this mess up my existing setup?**

No! Nix installs everything to `/nix` and doesn't touch your existing packages. You can try it safely and uninstall anytime with `/nix/nix-installer uninstall`.

**Q: What's the disk space requirement?**

Initial install is about 2GB. It grows over time as you add packages, but Nix has built-in garbage collection to clean up old versions.

**Q: Can I use this for work machines?**

Yes! Many companies use Nix for development environments. Just check your company's IT policies first.

**Q: What if I need a package that's not in nixpkgs?**

You can still use `npm`, `pip`, `gem`, etc. alongside Nix. Or you can package it yourself using Nix's derivation system.

**Q: Does this work with Docker?**

Absolutely! Docker (or OrbStack on Mac) is included in the configuration. You can also use Nix to build Docker images with reproducible layers.

## Conclusion

As SDETs and automation engineers, our job is to make software delivery reliable and repeatable. Why not apply the same principles to our own development environments?

With Nix Flakes, you get:
- **5-minute machine setup** instead of hours
- **Reproducible environments** that eliminate "works on my machine"
- **Version-controlled configuration** you can track and share
- **Safe updates** with automatic rollback
- **Consistent testing** across local and CI environments

The [repository](https://github.com/crashnaut/nix) is open source and ready to use. Clone it, customize it, and never waste hours on machine setup again.

---

**Have questions or improvements?** The repo is on [GitHub](https://github.com/crashnaut/nix) – PRs welcome!

**Want to learn more about Nix?** Check out the [official documentation](https://nixos.org/manual/nix/stable/) and the [NixOS Discourse](https://discourse.nixos.org/).

