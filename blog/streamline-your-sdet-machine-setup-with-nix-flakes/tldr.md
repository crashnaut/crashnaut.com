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

## What You Get

- **Dev Tools**: Git, Docker, Vim, language toolchains
- **CLI Utils**: `ripgrep`, `bat`, `fd`, `htop`
- **GUI Apps** (Mac/Linux): Brave, Slack, Logseq, Postman

## Daily Usage

```bash
# Update everything
nix flake update
darwin-rebuild switch --flake .  # macOS
# or
home-manager switch --flake .    # Linux/Windows

# Rollback if something breaks
darwin-rebuild switch --rollback
```

## Key Benefits

✅ **5-minute setup** on any machine  
✅ **Reproducible** - same setup every time  
✅ **Atomic updates** - automatic rollback on failure  
✅ **Version controlled** - track your environment like code

## Repository

Check out the full guide: [github.com/crashnaut/nix](https://github.com/crashnaut/nix)

