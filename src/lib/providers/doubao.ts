import type { ModelName, ProviderResponse } from "@/lib/detect/types";
import { callChatProvider } from "@/lib/providers/chat-provider";

type RuntimeProvider = {
  name: ModelName;
  enabled: boolean;
  call: (prompt: string) => Promise<ProviderResponse>;
};

export function createDoubaoProvider(): RuntimeProvider {
  const baseUrl = process.env.DOUBAO_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";
  const apiKey = process.env.DOUBAO_API_KEY || "";
  const model = process.env.DOUBAO_MODEL || "";
  const enabled = Boolean(apiKey && model);

  return {
    name: "doubao",
    enabled,
    async call(prompt: string) {
      if (!enabled) {
        return {
          model: "doubao",
          success: false,
          rawText: "",
          latencyMs: 0,
          error: "doubao 未配置 API Key 或模型/接入点 ID",
        };
      }

      return callChatProvider(
        {
          baseUrl,
          apiKey,
          model,
          modelName: "doubao",
          endpointPath: "/chat/completions",
        },
        prompt
      );
    },
  };
}
