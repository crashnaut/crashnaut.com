## 5-Minute Setup

Install Nix:
```bash
curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install
```

Clone and configure:

:::code-group
```bash[title=macOS]
git clone https://github.com/crashnaut/nix.git
cd nix/mac
# Edit flake.nix with your username/hostname
```

```bash[title=Linux]
git clone https://github.com/crashnaut/nix.git
cd nix/linux
# Edit flake.nix with your username/hostname
```

```bash[title=Windows (WSL2)]
git clone https://github.com/crashnaut/nix.git
cd nix/windows
# Edit flake.nix with your username/hostname
```
:::

Apply:

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
- **CLI Utils**: `ripgrep`, `bat`, `fd`, `htop`, `jq`
- **GUI Apps** (Mac/Linux): Brave, Slack, Logseq, Postman

## Update & Rollback

```bash
nix flake update
```

:::code-group
```bash[title=macOS]
darwin-rebuild switch --flake .
# Rollback: darwin-rebuild switch --rollback
```

```bash[title=Linux/Windows]
home-manager switch --flake .
# Rollback: home-manager switch --switch-generation <number>
```
:::

## Key Benefits

✅ 5-minute setup on any machine  
✅ Reproducible environments  
✅ Atomic updates with rollback  
✅ Version controlled configuration

**Repo**: [github.com/crashnaut/nix](https://github.com/crashnaut/nix)

