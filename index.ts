/**
 * WOPR Plugin: Moonshot AI Kimi Provider (OAuth)
 *
 * Provides Kimi AI access via the Kimi Agent SDK.
 * Supports A2A tools via MCP server configuration.
 * Install: wopr plugin install wopr-plugin-provider-kimi
 */

import winston from "winston";
import { homedir } from "os";
import { join } from "path";
import { existsSync } from "fs";

// Type definitions (peer dependency from wopr)
interface A2AToolResult {
  content: Array<{
    type: "text" | "image" | "resource";
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

interface A2AToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<A2AToolResult>;
}

interface A2AServerConfig {
  name: string;
  version?: string;
  tools: A2AToolDefinition[];
}

interface ModelQueryOptions {
  prompt: string;
  systemPrompt?: string;
  resume?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  images?: string[];
  tools?: string[];
  a2aServers?: Record<string, A2AServerConfig>;
  allowedTools?: string[];
  providerOptions?: Record<string, unknown>;
}

interface ModelClient {
  query(options: ModelQueryOptions): AsyncGenerator<unknown>;
  listModels(): Promise<string[]>;
  healthCheck(): Promise<boolean>;
}

interface ModelProvider {
  id: string;
  name: string;
  description: string;
  defaultModel: string;
  supportedModels: string[];
  validateCredentials(credentials: string): Promise<boolean>;
  createClient(credential: string, options?: Record<string, unknown>): Promise<ModelClient>;
  getCredentialType(): "api-key" | "oauth" | "custom";
}

interface ConfigField {
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
  options?: Array<{ value: string; label: string }>;
  default?: unknown;
}

interface ConfigSchema {
  title: string;
  description: string;
  fields: ConfigField[];
}

interface WOPRPluginContext {
  log: { info: (msg: string) => void };
  registerProvider: (provider: ModelProvider) => void;
  registerConfigSchema: (name: string, schema: ConfigSchema) => void;
}

interface WOPRPlugin {
  name: string;
  version: string;
  description: string;
  init(ctx: WOPRPluginContext): Promise<void>;
  shutdown(): Promise<void>;
}

// Setup winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "wopr-plugin-provider-kimi" },
  transports: [
    new winston.transports.Console({ level: "warn" })
  ],
});

const KIMI_PATH = join(homedir(), ".local/share/uv/tools/kimi-cli/bin/kimi");

function getKimiPath(): string {
  if (existsSync(KIMI_PATH)) return KIMI_PATH;
  return "kimi";
}

async function loadSDK(): Promise<any> {
  return await import("/tmp/wopr-test/plugins/wopr-plugin-provider-kimi/node_modules/@moonshot-ai/kimi-agent-sdk/dist/index.mjs");
}

/**
 * Convert A2A server configs to Kimi MCP config format
 * Kimi expects: { mcpServers: { name: { url: string } | { command: string, args: string[] } } }
 */
function convertA2AToKimiMcpConfig(a2aServers: Record<string, A2AServerConfig>): Record<string, any> {
  const mcpServers: Record<string, any> = {};

  for (const [serverName, config] of Object.entries(a2aServers)) {
    // For A2A servers, we create a virtual MCP config
    // The actual tool execution is handled by WOPR's A2A system
    mcpServers[serverName] = {
      // Mark as WOPR-managed A2A server
      woprA2A: true,
      name: config.name,
      version: config.version || "1.0.0",
      tools: config.tools.map(t => t.name),
    };
    logger.info(`[kimi] Registered A2A server: ${serverName} with ${config.tools.length} tools`);
  }

  return mcpServers;
}

/**
 * Kimi provider implementation
 */
const kimiProvider: ModelProvider = {
  id: "kimi",
  name: "Kimi",
  description: "Moonshot AI Kimi Code CLI with OAuth and A2A/MCP support",
  defaultModel: "kimi-k2",
  supportedModels: ["kimi-k2"],

  async validateCredentials(): Promise<boolean> {
    try {
      const { createSession } = await loadSDK();
      const session = createSession({ workDir: "/tmp", executable: getKimiPath(), yoloMode: true });
      await session.close();
      return true;
    } catch (error) {
      logger.error("[kimi] Credential validation failed:", error);
      return false;
    }
  },

  async createClient(_credential: string, options?: Record<string, unknown>): Promise<ModelClient> {
    return new KimiClient(options);
  },

  getCredentialType(): "api-key" | "oauth" | "custom" {
    return "oauth";
  },
};

/**
 * Kimi client implementation with A2A support
 */
class KimiClient implements ModelClient {
  private executable: string;

  constructor(private options?: Record<string, unknown>) {
    this.executable = getKimiPath();
  }

  async *query(opts: ModelQueryOptions): AsyncGenerator<unknown> {
    const { createSession } = await loadSDK();
    const sessionOptions: any = {
      workDir: "/tmp",
      executable: this.executable,
      yoloMode: true, // Auto-approve filesystem operations
      ...this.options
    };

    // Session resumption
    if (opts.resume) {
      sessionOptions.sessionId = opts.resume;
      logger.info(`[kimi] Resuming session: ${opts.resume}`);
    }

    // A2A MCP server support
    // Kimi uses mcpConfig for MCP integration
    if (opts.a2aServers && Object.keys(opts.a2aServers).length > 0) {
      sessionOptions.mcpConfig = {
        mcpServers: convertA2AToKimiMcpConfig(opts.a2aServers)
      };
      logger.info(`[kimi] A2A MCP servers configured: ${Object.keys(opts.a2aServers).join(", ")}`);
    }

    const session = createSession(sessionOptions);

    // Yield session ID so WOPR can persist it for resumption
    yield { type: "system", subtype: "init", session_id: session.sessionId };

    try {
      let promptText = opts.prompt;
      if (opts.images?.length) {
        const imageList = opts.images.map((url: string, i: number) => `[Image ${i + 1}]: ${url}`).join('\n');
        promptText = `[User has shared ${opts.images.length} image(s)]\n${imageList}\n\n${promptText}`;
      }
      if (opts.systemPrompt) promptText = `${opts.systemPrompt}\n\n${promptText}`;

      const turn = session.prompt(promptText);

      for await (const event of turn) {
        if (event.type === "ContentPart" && event.payload?.type === "text") {
          yield {
            type: "assistant",
            message: {
              content: [{ type: "text", text: event.payload.text }]
            }
          };
        } else if (event.type === "ToolUse") {
          yield {
            type: "assistant",
            message: {
              content: [{ type: "tool_use", name: event.payload?.name }]
            }
          };
        }
      }

      await turn.result;
      yield { type: "result", subtype: "success", total_cost_usd: 0 };
      await session.close();
    } catch (error) {
      logger.error("[kimi] Query failed:", error);
      await session.close();
      throw error;
    }
  }

  async listModels(): Promise<string[]> {
    return ["kimi-k2"];
  }

  async healthCheck(): Promise<boolean> {
    try {
      const { createSession } = await loadSDK();
      const session = createSession({ workDir: "/tmp", executable: this.executable });
      await session.close();
      return true;
    } catch (error) {
      logger.error("[kimi] Health check failed:", error);
      return false;
    }
  }
}

/**
 * Plugin export
 */
const plugin: WOPRPlugin = {
  name: "provider-kimi",
  version: "1.6.0", // Bumped for A2A support
  description: "Moonshot AI Kimi Code CLI provider with A2A/MCP support",

  async init(ctx: WOPRPluginContext) {
    ctx.log.info("Registering Kimi provider (OAuth)...");
    ctx.registerProvider(kimiProvider);
    ctx.log.info("Kimi provider registered (supports session resumption, yoloMode, A2A/MCP)");

    // Register config schema for UI
    ctx.registerConfigSchema("provider-kimi", {
      title: "Kimi",
      description: "Configure Moonshot AI Kimi settings",
      fields: [
        {
          name: "kimiPath",
          type: "text",
          label: "Kimi CLI Path",
          placeholder: "kimi (or full path)",
          required: false,
          description: "Path to Kimi CLI executable (defaults to 'kimi')",
        },
      ],
    });
    ctx.log.info("Registered Kimi config schema");
  },

  async shutdown() {
    logger.info("[provider-kimi] Shutting down");
  },
};

export default plugin;
