# 🔧 Troubleshooting Guide

Common issues and solutions for the WOPR Kimi provider plugin.

---

## Table of Contents

- [Installation Issues](#installation-issues)
- [Authentication Issues](#authentication-issues)
- [Session Issues](#session-issues)
- [Runtime Issues](#runtime-issues)
- [Performance Issues](#performance-issues)
- [Getting Help](#getting-help)

---

## Installation Issues

### "Python 3.12+ required"

**Symptoms:**
```
[kimi-provider] Python 3.11 found, but 3.12+ required
```

**Solutions:**

1. **Let the auto-installer handle it:**
   ```bash
   wopr plugin reinstall wopr-plugin-provider-kimi
   ```

2. **Manual Python installation:**
   ```bash
   # Install uv
   curl -LsSf https://astral.sh/uv/install.sh | sh
   
   # Install Python 3.12
   uv python install 3.12
   ```

3. **Using package manager:**
   ```bash
   # macOS
   brew install python@3.12
   
   # Ubuntu/Debian
   sudo apt install python3.12
   ```

---

### "uv not found"

**Symptoms:**
```
[kimi-provider] uv not found
[kimi-provider] Cannot proceed without uv
```

**Solutions:**

1. **Install uv:**
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

2. **Add to PATH:**
   ```bash
   # Add to ~/.bashrc or ~/.zshrc
   export PATH="$HOME/.cargo/bin:$PATH"
   
   # Reload shell
   source ~/.bashrc  # or ~/.zshrc
   ```

---

### "kimi-cli not found"

**Symptoms:**
```
Error: kimi command not found
```

**Solutions:**

1. **Re-install kimi-cli:**
   ```bash
   uv tool install kimi-cli --python python3.12
   ```

2. **Check installation path:**
   ```bash
   # Check if kimi is installed
   ls ~/.local/share/uv/tools/kimi-cli/bin/kimi
   
   # Add to PATH if needed
   export PATH="$HOME/.local/share/uv/tools/kimi-cli/bin:$PATH"
   ```

3. **Use full path in config:**
   ```json
   {
     "provider": "kimi",
     "kimi": {
       "executable": "/home/username/.local/share/uv/tools/kimi-cli/bin/kimi"
     }
   }
   ```

---

## Authentication Issues

### "OAuth authentication failed"

**Symptoms:**
```
Error: OAuth authentication failed
Error: Unable to obtain access token
```

**Solutions:**

1. **Check internet connection:**
   ```bash
   ping www.moonshot.cn
   ```

2. **Reset credentials:**
   ```bash
   wopr providers remove kimi
   wopr providers auth kimi
   ```

3. **Check browser:**
   - Ensure default browser opens
   - Allow popups for WOPR
   - Complete the OAuth flow without closing the browser

4. **Check credentials file:**
   ```bash
   # Credentials stored at
   ls ~/.wopr/credentials/kimi
   ```

---

### "Invalid credentials" / "Token expired"

**Symptoms:**
```
Error: Invalid credentials
Error: Token expired
```

**Solutions:**

1. **Re-authenticate:**
   ```bash
   wopr providers auth kimi
   ```

2. **Check token status:**
   ```bash
   wopr providers check kimi
   ```

3. **Force token refresh:**
   ```bash
   wopr providers refresh kimi
   ```

---

### "Authentication required"

**Symptoms:**
```
Error: Authentication required for YOLO mode
```

**Solutions:**

1. **Authenticate first:**
   ```bash
   wopr providers auth kimi
   ```

2. **Check authentication status:**
   ```bash
   wopr providers list
   ```

---

## Session Issues

### "Session not found"

**Symptoms:**
```
Error: Session 'my-session' not found
```

**Solutions:**

1. **List available sessions:**
   ```bash
   wopr session list
   ```

2. **Create the session:**
   ```bash
   wopr session create my-session --provider kimi
   ```

3. **Check session file:**
   ```bash
   ls ~/.wopr/sessions/
   ```

---

### "Session resumption failed"

**Symptoms:**
```
Error: Failed to resume session sess_abc123
Error: Session expired or invalid
```

**Causes & Solutions:**

1. **Session expired** (30 days of inactivity):
   - Start a new session
   - Sessions cannot be recovered after expiration

2. **Invalid session ID:**
   ```bash
   # Check available sessions
   wopr session list
   
   # Verify session ID
   wopr session info my-session
   ```

3. **Server-side invalidation:**
   - Some sessions may be invalidated by Moonshot AI
   - Create a new session and copy over context if needed

---

### "Provider not registered for session"

**Symptoms:**
```
Error: Provider 'kimi' not registered for session
```

**Solutions:**

1. **Set the provider:**
   ```bash
   wopr session set-provider my-session kimi
   ```

2. **Recreate the session:**
   ```bash
   wopr session delete my-session
   wopr session create my-session --provider kimi
   ```

---

## Runtime Issues

### "Query failed" / "Request timeout"

**Symptoms:**
```
Error: Query failed after 300000ms
Error: Request timeout
```

**Solutions:**

1. **Check network:**
   ```bash
   curl -I https://www.moonshot.cn
   ```

2. **Increase timeout:**
   ```json
   {
     "provider": "kimi",
     "timeout": 600000
   }
   ```

3. **Simplify the request:**
   - Reduce context size
   - Break into smaller prompts
   - Remove unnecessary files

4. **Try again:**
   - Temporary service issues may resolve quickly
   - Check [Moonshot AI status](https://status.moonshot.cn)

---

### "Model not available"

**Symptoms:**
```
Error: Model 'kimi-k2' not available
```

**Solutions:**

1. **Check available models:**
   ```bash
   wopr providers models kimi
   ```

2. **Use default model:**
   ```bash
   # Don't specify model, uses default
   wopr session create my-session --provider kimi
   ```

3. **Update the plugin:**
   ```bash
   wopr plugin update wopr-plugin-provider-kimi
   ```

---

### File Operations Not Working

**Symptoms:**
```
Error: File operation failed
```

**Solutions:**

1. **Check working directory permissions:**
   ```bash
   ls -la /path/to/workDir
   ```

2. **Ensure the directory exists:**
   ```bash
   mkdir -p /path/to/workDir
   ```

3. **Check Kimi CLI is authenticated:**
   ```bash
   wopr providers check kimi
   ```

> **Note:** YOLO mode is enabled by default in this provider, so filesystem operations should be auto-approved.

---

### "Image processing failed"

**Symptoms:**
```
Error: Failed to process image
Error: Image too large
```

**Solutions:**

1. **Check image format:**
   - Supported: PNG, JPG, GIF, WebP
   - Max size: 20MB per image

2. **Reduce image size:**
   ```bash
   # Resize image
   convert large.png -resize 50% smaller.png
   ```

3. **Check file exists:**
   ```bash
   ls -la ./image.png
   ```

---

## Performance Issues

### Slow response times

**Symptoms:**
- Responses take >10 seconds
- Streaming is jerky/delayed

**Solutions:**

1. **Check network speed:**
   ```bash
   speedtest-cli
   ```

2. **Reduce context:**
   - Don't include entire codebase
   - Reference specific files
   - Clear old conversation history

3. **Use streaming:**
   - Already enabled by default
   - Shows tokens as they arrive

4. **Check system resources:**
   ```bash
   # CPU/Memory
   htop
   
   # Disk space
   df -h
   ```

---

### High memory usage

**Symptoms:**
- System slows down during sessions
- Out of memory errors

**Solutions:**

1. **Close unused sessions:**
   ```bash
   wopr session list
   wopr session delete old-session
   ```

2. **Limit concurrent sessions:**
   - Keep only 2-3 active sessions
   - Use session resumption instead of multiple sessions

3. **Restart WOPR:**
   ```bash
   wopr daemon restart
   ```

---

### Plugin crashes

**Symptoms:**
- WOPR daemon crashes
- Plugin becomes unresponsive

**Solutions:**

1. **Check logs:**
   ```bash
   # WOPR logs
   tail -f ~/.wopr/logs/wopr.log
   
   # Plugin logs
   tail -f ~/.wopr/logs/provider-kimi.log
   ```

2. **Restart the plugin:**
   ```bash
   wopr plugin restart wopr-plugin-provider-kimi
   ```

3. **Reinstall:**
   ```bash
   wopr plugin uninstall wopr-plugin-provider-kimi
   wopr plugin install wopr-plugin-provider-kimi
   ```

---

## Debug Mode

### Enable Debug Logging

```bash
# Enable WOPR debug mode
export WOPR_DEBUG=true

# Enable Kimi provider debug
export KIMI_DEBUG=true
export KIMI_LOG_LEVEL=debug

# Run your command
wopr prompt my-session "test"
```

### Check Plugin Version

```bash
# Get plugin version
wopr plugin info wopr-plugin-provider-kimi

# Expected: 1.6.0 or higher
```

### Verify Installation

```bash
# Run diagnostics
wopr doctor

# Check specifically for kimi
wopr doctor --provider kimi
```

---

## Getting Help

### Community Resources

1. **GitHub Issues**
   - Report bugs: [wopr-plugin-provider-kimi/issues](https://github.com/TSavo/wopr-plugin-provider-kimi/issues)
   - Check existing issues first

2. **WOPR Discussions**
   - General help: [wopr/discussions](https://github.com/TSavo/wopr/discussions)
   - Share tips and tricks

3. **Moonshot AI Support**
   - API issues: [Moonshot AI Support](https://www.moonshot.cn)

### Providing Bug Reports

When reporting issues, include:

1. **Plugin version:**
   ```bash
   wopr plugin info wopr-plugin-provider-kimi
   ```

2. **WOPR version:**
   ```bash
   wopr --version
   ```

3. **System info:**
   ```bash
   node --version
   python3 --version
   uname -a
   ```

4. **Error logs:**
   ```bash
   cat ~/.wopr/logs/provider-kimi.log
   ```

5. **Steps to reproduce**

### Emergency Recovery

If everything fails:

```bash
# 1. Stop WOPR
wopr daemon stop

# 2. Clear plugin data
rm -rf ~/.wopr/plugins/wopr-plugin-provider-kimi

# 3. Reinstall
wopr plugin install wopr-plugin-provider-kimi

# 4. Re-authenticate
wopr providers auth kimi

# 5. Create new session
wopr session create fresh --provider kimi
```
