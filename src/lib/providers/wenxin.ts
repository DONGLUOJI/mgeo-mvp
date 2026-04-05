import type { ModelName, ProviderResponse } from "@/lib/detect/types";
import { callChatProvider } from "@/lib/providers/chat-provider";

type RuntimeProvider = {
  name: ModelName;
  enabled: boolean;
  call: (prompt: string) => Promise<ProviderResponse>;
};

export function createWenxinProvider(): RuntimeProvider {
  const baseUrl = process.env.WENXIN_BASE_URL || "https://qianfan.baidubce.com/v2";
  const apiKey = process.env.WENXIN_API_KEY || "";
  const model = process.env.WENXIN_MODEL || "";
  const enabled = Boolean(apiKey && model);

  return {
    name: "wenxin",
    enabled,
    async call(prompt: string) {
      if (!enabled) {
        return {
          model: "wenxin",
          success: false,
          rawText: "",
          latencyMs: 0,
          error: "wenxin 未配置 API Key 或模型名",
        };
      }

      return callChatProvider(
        {
          baseUrl,
          apiKey,
          model,
          modelName: "wenxin",
          endpointPath: "/chat/completions",
        },
        prompt
      );
    },
  };
}
