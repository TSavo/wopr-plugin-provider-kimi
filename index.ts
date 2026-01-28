/**
 * WOPR Plugin: Moonshot AI Kimi Provider (OAuth) - DEBUG VERSION
 */

import type { ModelProvider, ModelClient, ModelQueryOptions } from "wopr/dist/types/provider.js";
import type { WOPRPlugin, WOPRPluginContext } from "wopr/dist/types.js";
import { execSync } from "child_process";

function getKimiPath(): string {
  try {
    return execSync("which kimi").toString().trim();
  } catch {
    return "kimi";
  }
}

async function loadSDK() {
  return await import("@moonshot-ai/kimi-agent-sdk");
}

const kimiProvider: ModelProvider = {
  id: "kimi",
  name: "Kimi",
  description: "Moonshot AI Kimi Code CLI with OAuth authentication",
  defaultModel: "kimi-k2",
  supportedModels: ["kimi-k2"],

  async validateCredentials(): Promise<boolean> {
    try {
      const { createSession } = await loadSDK();
      const session = createSession({ workDir: "/tmp", executable: getKimiPath() });
      await session.close();
      return true;
    } catch (error) {
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

class KimiClient implements ModelClient {
  private executable: string;

  constructor(private options?: Record<string, unknown>) {
    this.executable = getKimiPath();
  }

  async *query(opts: ModelQueryOptions): AsyncGenerator<any> {
    console.log(`[kimi-client] Query starting: "${opts.prompt.substring(0, 50)}"`);
    const { createSession } = await loadSDK();
    
    const session = createSession({
      workDir: "/tmp",
      executable: this.executable,
      ...this.options
    });

    try {
      let promptText = opts.prompt;
      if (opts.images && opts.images.length > 0) {
        const imageList = opts.images.map((url, i) => `[Image ${i + 1}]: ${url}`).join('\n');
        promptText = `[User has shared ${opts.images.length} image(s)]\n${imageList}\n\n${opts.prompt}`;
      }

      if (opts.systemPrompt) {
        promptText = `${opts.systemPrompt}\n\n${promptText}`;
      }

      console.log("[kimi-client] Sending prompt...");
      const turn = session.prompt(promptText);

      let eventCount = 0;
      for await (const event of turn) {
        eventCount++;
        console.log(`[kimi-client] Event ${eventCount}: ${event.type}`);
        
        if (event.type === "ContentPart") {
          if (event.payload?.type === "text") {
            console.log(`[kimi-client]   Yielding text: "${event.payload.text?.substring(0, 30)}"`);
            yield { type: "text", content: event.payload.text || "" };
          }
        } else if (event.type === "tool_use" || event.type === "ToolCall") {
          yield { type: "tool_use", toolName: event.payload?.name || "tool" };
        }
      }

      console.log(`[kimi-client] Got ${eventCount} events, waiting for result...`);
      await turn.result;
      console.log("[kimi-client] Yielding complete");
      yield { type: "complete", content: "" };

      await session.close();
      console.log("[kimi-client] Session closed");
    } catch (error) {
      console.error("[kimi-client] Error:", error);
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
    } catch {
      return false;
    }
  }
}

const plugin: WOPRPlugin = {
  name: "provider-kimi",
  version: "1.3.0",
  description: "Moonshot AI Kimi Code CLI provider for WOPR (OAuth) - DEBUG",

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
