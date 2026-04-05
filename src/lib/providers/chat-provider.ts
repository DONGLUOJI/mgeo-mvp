import type { ModelName, ProviderResponse } from "@/lib/detect/types";

type ProviderConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
  modelName: ModelName;
  endpointPath?: string;
  extraHeaders?: Record<string, string>;
};

export async function callChatProvider(
  config: ProviderConfig,
  prompt: string
): Promise<ProviderResponse> {
  const start = Date.now();
  const endpointPath = config.endpointPath || "/chat/completions";

  try {
    const res = await fetch(`${config.baseUrl}${endpointPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
        ...config.extraHeaders,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: "你是一个严谨的品牌信息识别助手。",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!res.ok) {
      const message = await res.text();

      return {
        model: config.modelName,
        success: false,
        rawText: "",
        latencyMs: Date.now() - start,
        error: `HTTP ${res.status}: ${message}`,
      };
    }

    const data = await res.json();
    const rawText =
      data.choices?.[0]?.message?.content ||
      data.result ||
      data.body?.result ||
      data.output_text ||
      "";

    return {
      model: config.modelName,
      success: true,
      rawText,
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      model: config.modelName,
      success: false,
      rawText: "",
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
