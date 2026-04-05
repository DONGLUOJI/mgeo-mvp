import type { ModelName } from "@/lib/detect/types";

export const MODEL_META: Record<ModelName, { label: string }> = {
  openai: { label: "OpenAI" },
  deepseek: { label: "DeepSeek" },
  kimi: { label: "Kimi" },
  doubao: { label: "豆包" },
  yuanbao: { label: "腾讯元宝" },
  wenxin: { label: "文心一言" },
};

export const DEFAULT_MODELS: ModelName[] = [
  "deepseek",
  "kimi",
  "doubao",
  "yuanbao",
  "wenxin",
];
