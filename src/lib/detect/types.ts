export type ModelName =
  | "openai"
  | "deepseek"
  | "kimi"
  | "doubao"
  | "qianwen"
  | "yuanbao"
  | "wenxin";

export type BrandNarrative = {
  oneLiner: string;
  coreKeywords: string[];
  forbiddenClaims?: string[];
  commonConflicts?: string[];
};

export type DetectionInput = {
  brandName: string;
  query: string;
  platform: string;
  locale?: string;
  brandNarrative?: BrandNarrative;
  competitors?: string[];
};

export type DetectInput = DetectionInput & {
  industry: string;
  businessSummary: string;
  selectedModels: ModelName[];
};

export type Score = {
  consistency: number;
  coverage: number;
  authority: number;
  total: number;
  level: "L1" | "L2" | "L3" | "L4";
};

export type ConfidenceLevel = "high" | "medium" | "low";
export type ConfidenceResult = {
  level: ConfidenceLevel;
  reasons: string[];
};

export type CoverageInsight = {
  isMentioned: boolean;
  mentionPosition: number | null;
  mentionContext: string;
  competitors: string[];
};
export type CoverageResult = CoverageInsight;

export type BrandDescriptionInsight = {
  knowsBrand: boolean;
  businessSummary: string;
  positioningSummary: string;
  rawResponse: string;
};
export type BrandDescriptionResult = BrandDescriptionInsight;

export type AuthorityInsight = {
  hasVerifiableSource: boolean;
  sourceNames: string[];
  sourceTypes: string[];
  rawResponse: string;
};
export type AuthorityResult = AuthorityInsight;

export type ConsistencyAssessment = {
  knowsBrand: boolean;
  hitsCoreNarrative: boolean;
  hasMajorConflict: boolean;
  notes: string;
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
  coverage: CoverageInsight;
  description: BrandDescriptionInsight;
  authority: AuthorityInsight;
  consistencyAssessment: ConsistencyAssessment;
  confidence: {
    level: ConfidenceLevel;
    reasons: string[];
  };
  scoreBreakdown: {
    consistency: number;
    coverage: number;
    authority: number;
    total: number;
  };
  raw: {
    coverageResponse: string;
    descriptionResponse: string;
    sourceResponse: string;
  };
};

export type ProviderDebugItem = {
  model: string;
  source: "real" | "mock";
  success: boolean;
  note: string;
};

export type DetectionScores = {
  coverage: number;
  consistency: number;
  authority: number;
  total: number;
};

export type DetectionSummary = {
  headline: string;
  weakestDimension: "coverage" | "consistency" | "authority";
  nextAction: string;
};

export type RawModelOutputs = {
  coverageResponse: string;
  descriptionResponse: string;
  sourceResponse: string;
};

export type DetectionMeta = {
  version: "v1";
  executedAt: string;
  model: string;
  provider: string;
  durationMs: number;
  mode: "free" | "enterprise";
};

export type DetectReport = {
  input: DetectInput;
  coverage: CoverageResult;
  description: BrandDescriptionResult;
  authority: AuthorityResult;
  consistencyAssessment: ConsistencyAssessment;
  scores: DetectionScores;
  score: Score;
  summary: string;
  structuredSummary: DetectionSummary;
  results: ResultItem[];
  confidence: ConfidenceResult;
  weakestDimension: "consistency" | "coverage" | "authority";
  raw: RawModelOutputs;
  meta: DetectionMeta;
  disclaimer: string;
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

export type DetectPromptSet = {
  coverage: string;
  description: string;
  source: string;
};
