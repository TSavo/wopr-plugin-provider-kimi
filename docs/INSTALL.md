# 📖 Installation Guide

Complete installation instructions for the WOPR Kimi provider plugin.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Install](#quick-install)
- [Manual Installation](#manual-installation)
- [Dependency Installation](#dependency-installation)
- [Verification](#verification)
- [Uninstallation](#uninstallation)

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18+ | WOPR runtime environment |
| Python | 3.12+ | Kimi CLI runtime |
| uv | latest | Python package manager |
| WOPR | 0.0.1+ | Core WOPR CLI |

### System Requirements

- **OS**: Linux, macOS, or Windows (WSL2 recommended)
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 2GB free space
- **Network**: Internet connection for OAuth and model access

---

## Quick Install

The fastest way to get started:

```bash
# Install the plugin via WOPR
wopr plugin install wopr-plugin-provider-kimi
```

This single command will:
1. Download and install the plugin
2. Check for Python 3.12+ (install via `uv` if missing)
3. Install `uv` Python package manager (if not present)
4. Install `kimi-cli` via `uv`
5. Verify the installation

---

## Manual Installation

### Step 1: Install WOPR

If you haven't already installed WOPR:

```bash
npm install -g wopr
```

### Step 2: Install Python 3.12+

The plugin can auto-install Python, but you can also install manually:

**macOS/Linux (with Homebrew):**
```bash
brew install python@3.12
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install python3.12 python3.12-venv
```

**Using uv (recommended):**
```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install Python 3.12
uv python install 3.12
```

### Step 3: Install Kimi CLI

```bash
# Using uv (recommended)
uv tool install kimi-cli --python python3.12

# Or using pipx
pipx install kimi-cli --python python3.12
```

### Step 4: Install the Plugin

```bash
npm install -g wopr-plugin-provider-kimi
```

---

## Dependency Installation

### Automatic (Recommended)

The plugin handles all dependencies automatically:

```bash
wopr plugin install wopr-plugin-provider-kimi
```

During installation, you'll see output like:

```
[kimi-provider] Checking dependencies...
[kimi-provider] ✓ uv available
[kimi-provider] ✓ Python 3.12.4 meets requirements
[kimi-provider] ✓ kimi-cli already installed
[kimi-provider] ✓ All dependencies installed
```

### Manual Dependency Check

If you need to verify or manually install dependencies:

**1. Check Python:**
```bash
python3 --version
# Should be 3.12 or higher
```

**2. Check uv:**
```bash
uv --version
```

**3. Check Kimi CLI:**
```bash
kimi --version
# Or check the full path
~/.local/share/uv/tools/kimi-cli/bin/kimi --version
```

**4. Install missing dependencies:**

```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install Python 3.12
uv python install 3.12

# Install kimi-cli
uv tool install kimi-cli --python python3.12
```

---

## Verification

### Verify Plugin Installation

```bash
# List installed plugins
wopr plugin list

# Should show:
# ✓ wopr-plugin-provider-kimi@1.6.0
```

### Verify Provider Registration

```bash
# List available providers
wopr providers list

# Should show:
# kimi - Moonshot AI Kimi Code CLI with OAuth and A2A/MCP support
```

### Test Authentication

```bash
# Authenticate (OAuth flow)
wopr providers auth kimi

# Verify authentication
wopr providers check kimi
```

### Test Basic Functionality

```bash
# Create a test session
wopr session create test --provider kimi

# Send a test prompt
wopr prompt test "Hello, can you confirm you're working?"

# Clean up
wopr session delete test
```

---

## Uninstallation

### Remove the Plugin

```bash
wopr plugin uninstall wopr-plugin-provider-kimi
```

### Remove Kimi CLI (Optional)

```bash
# If installed via uv
uv tool uninstall kimi-cli

# Remove Python (only if installed specifically for Kimi)
# uv python uninstall 3.12
```

### Remove WOPR Credentials

```bash
# Remove stored OAuth tokens
wopr providers remove kimi
```

---

## Troubleshooting Installation

### "Python 3.12+ required"

The auto-installer should handle this, but if it fails:

```bash
# Manual Python installation
curl -LsSf https://astral.sh/uv/install.sh | sh
uv python install 3.12
```

### "kimi command not found"

The CLI might not be in your PATH:

```bash
# Add to your shell profile (.bashrc, .zshrc, etc.)
export PATH="$HOME/.local/share/uv/tools/kimi-cli/bin:$PATH"
```

### "OAuth authentication fails"

1. Check your internet connection
2. Ensure you have a valid Moonshot AI account
3. Try resetting credentials:
   ```bash
   wopr providers remove kimi
   wopr providers auth kimi
   ```

### Permission Denied

If you get permission errors during installation:

```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Then retry installation
npm install -g wopr-plugin-provider-kimi
```

---

## Next Steps

- [Configure your sessions](CONFIGURATION.md)
- [Learn about available models](MODELS.md)
- [Review troubleshooting guide](TROUBLESHOOTING.md)
