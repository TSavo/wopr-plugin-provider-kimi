/**
 * WOPR Plugin: Moonshot AI Kimi Provider (OAuth)
 */

import type { ModelProvider, ModelClient, ModelQueryOptions } from "wopr/dist/types/provider.js";
import type { WOPRPlugin, WOPRPluginContext } from "wopr/dist/types.js";
import { execSync } from "child_process";

function getKimiPath(): string {
  try { return execSync("which kimi").toString().trim(); } catch { return "kimi"; }
}

async function loadSDK() { return await import("@moonshot-ai/kimi-agent-sdk"); }

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
    } catch { return false; }
  },

  async createClient(_credential: string, options?: Record<string, unknown>): Promise<ModelClient> {
    return new KimiClient(options);
  },

  getCredentialType(): "oauth" { return "oauth"; },
};

class KimiClient implements ModelClient {
  private executable: string;
  constructor(private options?: Record<string, unknown>) {
    this.executable = getKimiPath();
  }

  async *query(opts: ModelQueryOptions): AsyncGenerator<any> {
    const { createSession } = await loadSDK();
    const session = createSession({
      workDir: "/tmp",
      executable: this.executable,
      ...this.options
    });

    try {
      let promptText = opts.prompt;
      if (opts.images?.length) {
        const imageList = opts.images.map((url, i) => `[Image ${i + 1}]: ${url}`).join('\n');
        promptText = `[User has shared ${opts.images.length} image(s)]\n${imageList}\n\n${opts.prompt}`;
      }
      if (opts.systemPrompt) promptText = `${opts.systemPrompt}\n\n${promptText}`;

      const turn = session.prompt(promptText);

      for await (const event of turn) {
        if (event.type === "ContentPart" && event.payload?.type === "text") {
          // Yield in the format inject() expects
          yield {
            type: "assistant",
            message: {
              content: [{ type: "text", text: event.payload.text }]
            }
          };
        }
      }

      await turn.result;
      yield { type: "result", subtype: "success", total_cost_usd: 0 };
      await session.close();
    } catch (error) {
      await session.close();
      throw error;
    }
  }

  async listModels(): Promise<string[]> { return ["kimi-k2"]; }

  async healthCheck(): Promise<boolean> {
    try {
      const { createSession } = await loadSDK();
      const session = createSession({ workDir: "/tmp", executable: this.executable });
      await session.close();
      return true;
    } catch { return false; }
  }
}

const plugin: WOPRPlugin = {
  name: "provider-kimi",
  version: "1.4.0",
  description: "Moonshot AI Kimi Code CLI provider for WOPR (OAuth)",

  async init(ctx: WOPRPluginContext) {
    ctx.log.info("Registering Kimi provider (OAuth)...");
    ctx.registerProvider(kimiProvider);
    ctx.log.info("Kimi provider registered");
  },

  async shutdown() { console.log("[provider-kimi] Shutting down"); },
};

export default plugin;
