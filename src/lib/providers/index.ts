import type { ModelName, ProviderResponse } from "@/lib/detect/types";
import { callChatProvider } from "@/lib/providers/chat-provider";
import { createDoubaoProvider } from "@/lib/providers/doubao";
import { createWenxinProvider } from "@/lib/providers/wenxin";

type RuntimeProvider = {
  name: ModelName;
  enabled: boolean;
  call: (prompt: string) => Promise<ProviderResponse>;
};

function createProvider(
  name: ModelName,
  options: {
    baseUrl?: string;
    apiKey?: string;
    model?: string;
  }
): RuntimeProvider {
  const enabled = Boolean(options.baseUrl && options.apiKey && options.model);

  return {
    name,
    enabled,
    async call(prompt: string) {
      if (!enabled) {
        return {
          model: name,
          success: false,
          rawText: "",
          latencyMs: 0,
          error: `${name} 未配置 API 参数`,
        };
      }

      return callChatProvider(
        {
          baseUrl: options.baseUrl!,
          apiKey: options.apiKey!,
          model: options.model!,
          modelName: name,
        },
        prompt
      );
    },
  };
}

export const providers: Record<ModelName, RuntimeProvider> = {
  openai: createProvider("openai", {
    baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  }),
  deepseek: createProvider("deepseek", {
    baseUrl: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
    apiKey: process.env.DEEPSEEK_API_KEY,
    model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
  }),
  kimi: createProvider("kimi", {
    baseUrl: process.env.KIMI_BASE_URL || "https://api.moonshot.cn/v1",
    apiKey: process.env.KIMI_API_KEY,
    model: process.env.KIMI_MODEL || "moonshot-v1-8k",
  }),
  doubao: createDoubaoProvider(),
  yuanbao: createProvider("yuanbao", {
    baseUrl: process.env.YUANBAO_BASE_URL || "",
    apiKey: process.env.YUANBAO_API_KEY,
    model: process.env.YUANBAO_MODEL || "",
  }),
  wenxin: createWenxinProvider(),
};

export function hasRealProviderConfig(modelNames: ModelName[]) {
  return modelNames.some((modelName) => providers[modelName]?.enabled);
}
