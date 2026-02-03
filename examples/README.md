# 📁 Example Configurations

This directory contains example configuration files for the WOPR Kimi provider plugin.

---

## Available Examples

### [basic.json](basic.json)

Simple configuration for getting started with Kimi provider.

**Features:**
- Default model (kimi-k2)
- Temporary working directory (`/tmp/wopr-basic`)
- Streaming enabled
- Standard timeout (5 minutes)

**Use when:** You're new to WOPR or want a basic setup.

> **Note:** YOLO mode is enabled by default in this provider.

---

### [yolo-mode.json](yolo-mode.json)

Configuration for automated workflows with extended timeout.

**Features:**
- Extended timeout (10 minutes) for long operations
- System prompt optimized for automation
- Custom warnings for safety awareness

**Use when:** You want Kimi to work autonomously on trusted projects.

> **Note:** YOLO mode is enabled by default in this provider. Only use in version-controlled environments!

---

### [multi-model.json](multi-model.json)

Configuration for running multiple Kimi sessions with different purposes.

**Features:**
- 4 specialized sessions (coder, reviewer, debugger, docs)
- Workflow definitions for common tasks
- Each session with optimized system prompts

**Use when:** You want to orchestrate complex development workflows.

---

## Usage

### Load an Example Configuration

```bash
# Load basic configuration
wopr session load examples/basic.json

# Load with custom name
wopr session load examples/yolo-mode.json --name my-automation
```

### Customize Examples

1. Copy the example file:
   ```bash
   cp examples/basic.json my-config.json
   ```

2. Edit the configuration:
   ```bash
   nano my-config.json
   ```

3. Load your customized config:
   ```bash
   wopr session load my-config.json
   ```

---

## Creating Your Own Configurations

See the [Configuration Reference](../docs/CONFIGURATION.md) for all available options.

Basic structure:

```json
{
  "session": {
    "name": "my-session",
    "provider": "kimi",
    "model": "kimi-k2"
  },
  "provider": {
    "kimi": {
      "workDir": "/path/to/project"
    }
  }
}
```

### With A2A/MCP Tools

```json
{
  "session": {
    "name": "my-session",
    "provider": "kimi",
    "model": "kimi-k2"
  },
  "provider": {
    "kimi": {
      "workDir": "/path/to/project"
    }
  },
  "a2aServers": {
    "my-tools": {
      "name": "my-tools",
      "version": "1.0.0",
      "tools": [
        {
          "name": "custom_tool",
          "description": "My custom tool",
          "inputSchema": {
            "type": "object",
            "properties": {
              "input": { "type": "string" }
            }
          }
        }
      ]
    }
  }
}
```

> **Note:** YOLO mode is enabled by default. A2A servers are converted to Kimi's MCP format automatically.

---

## Validation

Validate your configuration before using:

```bash
wopr config validate my-config.json
```
