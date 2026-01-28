/**
 * WOPR Plugin: Moonshot AI Kimi Provider
 * 
 * Provides Moonshot AI Kimi Code CLI access via OAuth + Kimi Agent SDK.
 */

import type { ModelProvider, ModelClient, ModelQueryOptions } from "wopr/dist/types/provider.js";
import type { WOPRPlugin, WOPRPluginContext } from "wopr/dist/types.js";
import { execSync } from "child_process";

// Get kimi CLI path
function getKimiPath(): string {
  try {
    return execSync("which kimi").toString().trim();
  } catch {
    return "kimi";
  }
}

// Lazy load SDK
async function loadSDK() {
  try {
    return await import("@moonshot-ai/kimi-agent-sdk");
  } catch (error) {
    throw new Error("Kimi Agent SDK not installed. Run: npm install @moonshot-ai/kimi-agent-sdk");
  }
}

/**
 * Kimi provider implementation
 */
const kimiProvider: ModelProvider = {
  id: "kimi",
  name: "Kimi",
  description: "Moonshot AI Kimi Code CLI with OAuth authentication",
  defaultModel: "kimi-k2",
  supportedModels: ["kimi-k2"],

  async validateCredentials(credential: string): Promise<boolean> {
    // OAuth - no credential to validate, CLI handles auth
    try {
      const { createSession } = await loadSDK();
      const session = createSession({
        workDir: "/tmp",
        executable: getKimiPath()
      });
      await session.close();
      return true;
    } catch (error) {
      return false;
    }
  },

  async createClient(credential: string, options?: Record<string, unknown>): Promise<ModelClient> {
    return new KimiClient(options);
  },

  getCredentialType(): "api-key" | "oauth" | "custom" {
    return "oauth";
  },
};

/**
 * Kimi client implementation
 */
class KimiClient implements ModelClient {
  private sdk: any;
  private executable: string;

  constructor(private options?: Record<string, unknown>) {
    this.executable = getKimiPath();
  }

  private async initSDK() {
    if (!this.sdk) {
      this.sdk = await loadSDK();
    }
    return this.sdk;
  }

  async *query(opts: ModelQueryOptions): AsyncGenerator<any> {
    const { createSession } = await this.initSDK();
    
    const session = createSession({
      workDir: "/tmp",
      executable: this.executable,
      ...this.options
    });

    try {
      // Prepare prompt with images
      let promptText = opts.prompt;
      if (opts.images && opts.images.length > 0) {
        const imageList = opts.images.map((url, i) => `[Image ${i + 1}]: ${url}`).join('\n');
        promptText = `[User has shared ${opts.images.length} image(s)]\n${imageList}\n\n${opts.prompt}`;
      }

      if (opts.systemPrompt) {
        promptText = `${opts.systemPrompt}\n\n${promptText}`;
      }

      const turn = session.prompt(promptText);

      for await (const event of turn) {
        if (event.type === "text") {
          yield {
            type: "text",
            content: event.text || "",
          };
        } else if (event.type === "tool_call") {
          yield {
            type: "tool_use",
            toolName: event.tool_call?.name || "tool",
          };
        }
      }

      const result = await turn.result;
      yield {
        type: "complete",
        content: "",
        total_cost_usd: result.token_usage?.total_tokens || 0,
      };

      await session.close();
    } catch (error) {
      await session.close();
      throw error;
    }
  }

  async listModels(): Promise<string[]> {
    return ["kimi-k2"];
  }

  async healthCheck(): Promise<boolean> {
    try {
      const { createSession } = await this.initSDK();
      const session = createSession({
        workDir: "/tmp",
        executable: this.executable
      });
      await session.close();
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Plugin export
 */
const plugin: WOPRPlugin = {
  name: "provider-kimi",
  version: "1.1.0",
  description: "Moonshot AI Kimi Code CLI provider for WOPR (OAuth)",

  async init(ctx: WOPRPluginContext) {
    ctx.log.info("Registering Kimi provider (OAuth)...");
    ctx.registerProvider(kimiProvider);
    ctx.log.info("Kimi provider registered");
  },

  async shutdown() {
    console.log("[provider-kimi] Shutting down");
  },
};

export default plugin;
