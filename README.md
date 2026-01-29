# wopr-plugin-provider-kimi

[![npm version](https://img.shields.io/npm/v/wopr-plugin-provider-kimi.svg)](https://www.npmjs.com/package/wopr-plugin-provider-kimi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![WOPR](https://img.shields.io/badge/WOPR-Plugin-blue)](https://github.com/TSavo/wopr)

Moonshot AI Kimi Code CLI provider plugin for [WOPR](https://github.com/TSavo/wopr).

> Part of the [WOPR](https://github.com/TSavo/wopr) ecosystem - Self-sovereign AI session management over P2P.

## Installation

```bash
wopr plugin install wopr-plugin-provider-kimi
```

## Configuration

Add your Moonshot API key:

```bash
wopr providers add kimi sk-...
```

## Usage

Create a session with Kimi provider:

```bash
wopr session create my-session --provider kimi
```

Or set provider on existing session:

```bash
wopr session set-provider my-session kimi
```

## Supported Models

- `kimi-k2` (default) - Kimi K2 model
- `kimi-for-coding` - Optimized for coding tasks

## Development

```bash
npm install
npm run build
```

## About Kimi Code CLI

Kimi Code CLI is Moonshot AI's terminal-based AI agent for software development.
Learn more: https://www.kimi.com/code
