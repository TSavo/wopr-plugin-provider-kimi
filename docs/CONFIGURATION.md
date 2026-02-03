# ⚙️ Configuration Reference

Complete configuration options for the WOPR Kimi provider plugin.

---

## Table of Contents

- [Configuration Methods](#configuration-methods)
- [Global Options](#global-options)
- [Session Options](#session-options)
- [Provider Options](#provider-options)
- [Environment Variables](#environment-variables)
- [Configuration Files](#configuration-files)
- [Examples](#examples)

---

## Configuration Methods

Configuration can be specified through multiple methods (in order of precedence):

1. **Command-line flags** (highest priority)
2. **Session-specific config files**
3. **WOPR global configuration**
4. **Environment variables**
5. **Default values** (lowest priority)

---

## Global Options

### WOPR CLI Options

| Option | Flag | Description |
|--------|------|-------------|
| Provider | `--provider` | Select the provider (kimi) |
| Model | `--model` | Model ID to use |
| YOLO Mode | `--yolo-mode` | Auto-approve filesystem operations |
| Work Directory | `--work-dir` | Working directory for operations |

### Example

```bash
wopr session create my-session \
  --provider kimi \
  --model kimi-k2 \
  --yolo-mode \
  --work-dir /home/user/project
```

---

## Session Options

### Core Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `provider` | string | - | Must be `"kimi"` |
| `model` | string | `kimi-k2` | Model identifier (currently only `kimi-k2` supported) |
| `workDir` | string | `/tmp` | Base working directory |
| `resume` | string | - | Session ID to resume a previous conversation |
| `a2aServers` | object | - | A2A/MCP server configuration for agent-to-agent communication |

> **Note:** YOLO mode (auto-approve filesystem operations) is always enabled in the current provider version.

### Authentication Options

| Option | Type | Description |
|--------|------|-------------|
| `auth.type` | string | Authentication type (`"oauth"`) |
| `auth.token` | string | OAuth token (auto-managed) |
| `auth.refreshToken` | string | Refresh token (auto-managed) |

### Query Options

These options can be passed when sending prompts:

| Option | Type | Description |
|--------|------|-------------|
| `prompt` | string | The user prompt text |
| `systemPrompt` | string | System prompt prepended to the user prompt |
| `images` | string[] | Array of image URLs/paths to include in the prompt |

> **Note:** The Kimi Agent SDK handles streaming automatically. Images are converted to text references in the prompt.

---

## Provider Options

### Provider-Specific Settings

The plugin looks for the Kimi CLI at `~/.local/share/uv/tools/kimi-cli/bin/kimi` by default, falling back to `kimi` in PATH.

```json
{
  "provider": "kimi",
  "kimi": {
    "kimiPath": "/custom/path/to/kimi"
  }
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `kimiPath` | string | auto-detected | Path to kimi-cli binary |

### A2A/MCP Server Configuration

The plugin supports A2A (Agent-to-Agent) communication via MCP server configuration:

```json
{
  "provider": "kimi",
  "a2aServers": {
    "my-tools": {
      "name": "my-tools",
      "version": "1.0.0",
      "tools": [
        {
          "name": "search_docs",
          "description": "Search documentation",
          "inputSchema": {
            "type": "object",
            "properties": {
              "query": { "type": "string" }
            }
          }
        }
      ]
    }
  }
}
```

The plugin converts A2A server configs to Kimi's MCP format for seamless integration.

---

## Environment Variables

### Core Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `WOPR_PROVIDER_KIMI_MODEL` | Default model | `kimi-k2` |
| `WOPR_PROVIDER_KIMI_YOLO` | Default YOLO mode | `true` or `false` |
| `WOPR_PROVIDER_KIMI_WORKDIR` | Default working directory | `/home/user/projects` |

### Authentication Variables

| Variable | Description |
|----------|-------------|
| `KIMI_ACCESS_TOKEN` | OAuth access token (if manually managing) |
| `KIMI_REFRESH_TOKEN` | OAuth refresh token |

### Debug Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WOPR_DEBUG` | Enable debug logging | `false` |
| `KIMI_DEBUG` | Enable Kimi CLI debug mode | `false` |
| `KIMI_LOG_LEVEL` | Log level (error, warn, info, debug) | `warn` |

---

## Configuration Files

### WOPR Global Config

Location: `~/.wopr/config.json`

```json
{
  "providers": {
    "kimi": {
      "defaultModel": "kimi-k2",
      "defaultOptions": {
        "yoloMode": false,
        "workDir": "/home/user/wopr-work"
      }
    }
  }
}
```

### Session Config Files

Location: `~/.wopr/sessions/{session-name}.json`

```json
{
  "name": "my-session",
  "provider": "kimi",
  "model": "kimi-k2",
  "options": {
    "yoloMode": true,
    "workDir": "/home/user/project",
    "systemPrompt": "You are a helpful coding assistant."
  },
  "metadata": {
    "created": "2024-01-15T10:30:00Z",
    "lastUsed": "2024-01-15T14:22:00Z"
  }
}
```

### Project-Level Config

Location: `./.wopr.json` (in project root)

```json
{
  "defaultProvider": "kimi",
  "sessions": {
    "dev": {
      "provider": "kimi",
      "model": "kimi-k2",
      "yoloMode": true,
      "workDir": "."
    }
  }
}
```

---

## Examples

### Basic Configuration

```json
{
  "provider": "kimi",
  "model": "kimi-k2"
}
```

### Development Session

```json
{
  "provider": "kimi",
  "model": "kimi-k2",
  "yoloMode": true,
  "workDir": "/home/user/myproject",
  "systemPrompt": "Focus on clean, well-documented code. Use TypeScript best practices."
}
```

### Session with A2A Tools

```json
{
  "provider": "kimi",
  "model": "kimi-k2",
  "workDir": "/home/user/project",
  "a2aServers": {
    "project-tools": {
      "name": "project-tools",
      "version": "1.0.0",
      "tools": [
        {
          "name": "run_tests",
          "description": "Run project test suite",
          "inputSchema": {}
        }
      ]
    }
  }
}
```

> **Note:** YOLO mode is enabled by default in this provider.

### Resume Previous Session

```json
{
  "provider": "kimi",
  "model": "kimi-k2",
  "resume": "sess_abc123xyz"
}
```

### Multi-Model Setup

```json
{
  "sessions": {
    "kimi-main": {
      "provider": "kimi",
      "model": "kimi-k2",
      "yoloMode": false
    },
    "kimi-auto": {
      "provider": "kimi",
      "model": "kimi-k2",
      "yoloMode": true
    }
  }
}
```

---

## Configuration Precedence

When multiple configurations specify the same option:

```
CLI Flag > Session Config > Project Config > Global Config > Environment > Default
```

Example:

```bash
# Environment variable
export WOPR_PROVIDER_KIMI_YOLO=false

# Global config has yoloMode: true
# Session config has yoloMode: false
# CLI flag: --yolo-mode

# Result: YOLO mode is ENABLED (CLI flag wins)
```

---

## Validation

### Validate Configuration

```bash
# Check a configuration file
wopr config validate ./my-config.json

# Validate current session
wopr session validate my-session

# Show effective configuration
wopr session config my-session --effective
```

### Common Validation Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid model` | Unknown model ID | Check available models with `wopr providers models kimi` |
| `Missing provider` | No provider specified | Add `"provider": "kimi"` |
| `Invalid workDir` | Directory doesn't exist | Create the directory or use an existing one |
| `YOLO without auth` | Not authenticated | Run `wopr providers auth kimi` first |

---

## Best Practices

1. **Use project-level configs** for team consistency
2. **Keep sensitive data in environment variables** or WOPR's credential store
3. **Use YOLO mode cautiously** - only in version-controlled environments
4. **Set appropriate working directories** to limit filesystem access
5. **Use session resumption** for long-running conversations
