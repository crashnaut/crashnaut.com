## Quick Setup

Install Nix:
```bash
curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install
```

Clone and apply configuration:
```bash
git clone https://github.com/crashnaut/nix.git
cd nix/<your-platform>  # mac, linux, or windows
# Edit flake.nix with your username/hostname
```

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

## What You Get

- **Dev Tools**: Git, Docker, Vim, language toolchains
- **CLI Utils**: `ripgrep`, `bat`, `fd`, `htop`
- **GUI Apps** (Mac/Linux): Brave, Slack, Logseq, Postman

## Daily Usage

```bash
# Update everything
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

Rollback if something breaks:

:::code-group
```bash[title=macOS]
darwin-rebuild switch --rollback
```

```bash[title=Linux/Windows]
home-manager switch --switch-generation <number>
```
:::

## Key Benefits

✅ **5-minute setup** on any machine  
✅ **Reproducible** - same setup every time  
✅ **Atomic updates** - automatic rollback on failure  
✅ **Version controlled** - track your environment like code

## Repository

Check out the full guide: [github.com/crashnaut/nix](https://github.com/crashnaut/nix)

