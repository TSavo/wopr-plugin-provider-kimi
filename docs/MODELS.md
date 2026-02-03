# 🤖 Model Information

Detailed information about available Moonshot AI Kimi models in WOPR.

---

## Table of Contents

- [Available Models](#available-models)
- [Model Capabilities](#model-capabilities)
- [Use Case Recommendations](#use-case-recommendations)
- [Pricing](#pricing)
- [Performance](#performance)
- [Context Windows](#context-windows)
- [Model Selection](#model-selection)

---

## Available Models

### Current Models

| Model ID | Name | Status | Description |
|----------|------|--------|-------------|
| `kimi-k2` | Kimi K2 | ✅ Available | Flagship model for coding and general tasks |

### Model Status Legend

- ✅ **Available** - Ready for use
- 🧪 **Preview** - Early access, may have limitations
- ⏳ **Coming Soon** - Announced but not yet available
- 🚫 **Deprecated** - No longer recommended for new sessions

---

## Model Capabilities

### Kimi K2

**Model ID:** `kimi-k2`

The flagship Kimi model optimized for software development tasks.

#### Capabilities

| Capability | Supported | Notes |
|------------|-----------|-------|
| Code Generation | ✅ Yes | Multiple languages, frameworks |
| Code Analysis | ✅ Yes | Review, refactor, debug |
| File Operations | ✅ Yes | Read, write, modify files (YOLO mode enabled by default) |
| Terminal Commands | ✅ Yes | Execute shell commands |
| Image Input | ✅ Yes | Images included as references in prompt |
| Streaming | ✅ Yes | Real-time token streaming via async generators |
| Session Resumption | ✅ Yes | Resume conversations with session ID |
| A2A/MCP Tools | ✅ Yes | Agent-to-agent communication via MCP |

#### Supported Languages

- **Web**: HTML, CSS, JavaScript, TypeScript
- **Systems**: C, C++, Rust, Go
- **Mobile**: Swift, Kotlin, Java
- **Data**: Python, SQL, R
- **Config**: JSON, YAML, TOML, XML
- **Shell**: Bash, PowerShell, Zsh

#### Context Window

| Parameter | Value |
|-----------|-------|
| Context Window | 256,000 tokens |
| Output Limit | 8,192 tokens |
| Training Data | Up to 2024 |

---

## Use Case Recommendations

### 🚀 Code Generation

**Best Model:** `kimi-k2`

```bash
wopr session create code-gen --provider kimi --model kimi-k2
```

**Ideal for:**
- Generating boilerplate code
- Creating new features from specifications
- Implementing algorithms
- Writing test cases

**Recommended Settings:**
```json
{
  "provider": "kimi",
  "model": "kimi-k2",
  "workDir": "./src"
}
```

> **Note:** YOLO mode is enabled by default, allowing autonomous file operations.

---

### 🔍 Code Review

**Best Model:** `kimi-k2`

```bash
wopr prompt my-session "Review the auth module for security issues" \
  --system "You are a security-focused code reviewer."
```

**Ideal for:**
- Security audits
- Performance optimization
- Best practice compliance
- Bug detection

**Recommended Settings:**
```json
{
  "provider": "kimi",
  "model": "kimi-k2"
}
```

Use with a system prompt:
```bash
wopr prompt my-session "Review this code" \
  --system "Review code for security, performance, and maintainability. Provide specific recommendations."
```

---

### 🧪 Testing

**Best Model:** `kimi-k2`

```bash
wopr prompt my-session "Generate unit tests for src/utils.js"
```

**Ideal for:**
- Unit test generation
- Integration test scenarios
- Test data creation
- Edge case identification

---

### 🐛 Debugging

**Best Model:** `kimi-k2`

```bash
wopr prompt my-session "Debug this error: TypeError: Cannot read property..."
```

**Ideal for:**
- Error analysis
- Root cause investigation
- Fix suggestions
- Log analysis

---

### 📚 Documentation

**Best Model:** `kimi-k2`

```bash
wopr prompt my-session "Generate API documentation for src/api.js"
```

**Ideal for:**
- API documentation
- README generation
- Code comments
- Architecture docs

---

### 🖼️ Image Analysis

**Best Model:** `kimi-k2`

```bash
wopr prompt my-session "Describe this UI mockup" --images ./mockup.png
```

**Ideal for:**
- UI/UX analysis
- Screenshot interpretation
- Diagram understanding
- Visual debugging

---

## Pricing

### Token Pricing

Kimi models use a token-based pricing model. Contact [Moonshot AI](https://www.moonshot.cn) for current pricing information.

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| kimi-k2 | Contact Moonshot AI | Contact Moonshot AI |

### Cost Optimization Tips

1. **Use YOLO mode wisely** - Reduces back-and-forth confirmation tokens
2. **Resume sessions** - Avoid re-sending context in new sessions
3. **Set appropriate context** - Don't include unnecessary files
4. **Use streaming** - Cancel if response is going off-track

### Free Tier

Moonshot AI may offer a free tier for testing. Check their [pricing page](https://www.moonshot.cn) for details.

---

## Performance

### Response Times

| Metric | Typical | Notes |
|--------|---------|-------|
| Time to First Token | 1-3s | Initial response latency |
| Token Throughput | 50-100 tokens/s | Streaming speed |
| Session Creation | 2-5s | Including authentication |
| Session Resume | <1s | Fast context restoration |

### Factors Affecting Performance

- **Network latency** - Connection to Moonshot AI servers
- **Context size** - Larger contexts = slower responses
- **Complexity** - Complex reasoning takes more time
- **Time of day** - Peak hours may have higher latency

### Optimization Tips

1. **Keep context focused** - Include only relevant files
2. **Use session resumption** - Avoid rebuilding context
3. **Enable streaming** - See responses immediately
4. **Batch operations** - Group related requests

---

## Context Windows

### Understanding Context

The context window includes:
- System prompt
- Conversation history
- Referenced files
- Images (converted to tokens)

### Context Management

```bash
# Check current context usage
wopr session info my-session

# Clear conversation history (keep system prompt)
wopr session clear my-session --keep-system

# Reset entire session
wopr session reset my-session
```

### Optimizing Context Usage

1. **Use specific file references** instead of "entire codebase"
2. **Summarize long conversations** periodically
3. **Start new sessions** for unrelated topics
4. **Use session resumption** strategically

---

## Model Selection

### Default Model

The default model for Kimi provider is `kimi-k2`.

```bash
# Uses default model (kimi-k2)
wopr session create my-session --provider kimi
```

### Explicit Model Selection

```bash
# Specify model explicitly
wopr session create my-session --provider kimi --model kimi-k2
```

### Checking Available Models

```bash
# List all available models
wopr providers models kimi

# Output format:
# kimi-k2 ✅ - Kimi K2 (default)
```

### Model Aliases

| Alias | Resolves To |
|-------|-------------|
| `default` | `kimi-k2` |
| `latest` | `kimi-k2` |
| `kimi` | `kimi-k2` |

---

## Future Models

### Upcoming Models

Stay tuned for announcements from Moonshot AI about:

- Specialized models for specific domains
- Enhanced vision capabilities
- Extended context windows
- Improved reasoning models

### Model Updates

Models are updated periodically. WOPR automatically:
- Uses the latest version
- Maintains backward compatibility
- Notifies of deprecated models

---

## Comparison with Other WOPR Providers

| Feature | Kimi (kimi-k2) | Claude | OpenAI |
|---------|---------------|--------|--------|
| Code Generation | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Context Window | 256K | 200K | 128K |
| Session Resume | ✅ | ✅ | ❌ |
| YOLO Mode | ✅ | ✅ | ❌ |
| Vision | ✅ | ✅ | ✅ |
| Streaming | ✅ | ✅ | ✅ |

*Ratings are subjective and for reference only*
