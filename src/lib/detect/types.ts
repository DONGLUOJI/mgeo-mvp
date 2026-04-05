export type ModelName =
  | "openai"
  | "deepseek"
  | "kimi"
  | "doubao"
  | "yuanbao"
  | "wenxin";

export type DetectInput = {
  brandName: string;
  industry: string;
  businessSummary: string;
  query: string;
  selectedModels: ModelName[];
};

export type Score = {
  consistency: number;
  coverage: number;
  authority: number;
  total: number;
  level: "L1" | "L2" | "L3" | "L4";
};

export type ResultItem = {
  model: string;
  source: "real" | "mock";
  mentioned: boolean;
  positioningMatch: boolean;
  descriptionConsistent: boolean;
  authoritySignal: boolean;
  recommendationSignal: "high" | "medium" | "low" | "none";
  rawText: string;
  notes?: string[];
};

export type ProviderDebugItem = {
  model: string;
  source: "real" | "mock";
  success: boolean;
  note: string;
};

export type DetectReport = {
  input: DetectInput;
  score: Score;
  summary: string;
  results: ResultItem[];
  debug?: {
    mode: "real" | "mock" | "hybrid";
    providers: ProviderDebugItem[];
  };
};

export type ProviderResponse = {
  model: ModelName;
  success: boolean;
  rawText: string;
  latencyMs: number;
  error?: string;
};
