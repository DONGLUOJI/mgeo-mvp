import {
  buildAggregateAuthority,
  buildAggregateConsistency,
  buildAggregateCoverage,
  buildAggregateDescription,
  buildDetectionMeta,
  buildRawModelOutputs,
  buildStructuredSummary,
  getWeakestDimension,
  mergeConfidence,
  normalizeDetectReport,
} from "@/lib/detect/report-shape";
import { scoreReport, scoreResultItem } from "@/lib/detect/scoring";
import type { DetectReport, DetectInput, ResultItem } from "@/lib/detect/types";

export const mockReports: Record<string, DetectReport> = {};

export function getMockReport(taskId: string) {
  const report = mockReports[taskId] ?? null;
  return report ? normalizeDetectReport(report) : null;
}

export function saveMockReport(taskId: string, report: DetectReport) {
  mockReports[taskId] = normalizeDetectReport(report);
}

export function createMockTaskId() {
  return `scan_${Date.now()}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getLevel(total: number): DetectReport["score"]["level"] {
  if (total < 40) return "L1";
  if (total < 60) return "L2";
  if (total < 80) return "L3";
  return "L4";
}

function buildMockResult(input: DetectInput, model: string, index: number): ResultItem {
  const mentioned = index < clamp(Math.ceil(input.brandName.length / 3), 2, input.selectedModels.length);
  const strongModel = model === "openai" || model === "deepseek" || model === "wenxin";
  const mediumModel = strongModel || model === "doubao" || model === "kimi";
  const mentionPosition = mentioned ? (strongModel ? 1 : Math.min(index + 2, 5)) : null;
  const knowsBrand = mentioned || mediumModel;
  const hasVerifiableSource = mentioned && strongModel;

  return scoreResultItem({
    model,
    source: "mock",
    mentioned,
    positioningMatch: mentioned && mediumModel,
    descriptionConsistent: mentioned && mediumModel,
    authoritySignal: hasVerifiableSource,
    recommendationSignal: mentioned ? (strongModel ? "medium" : "low") : "none",
    rawText: mentioned
      ? `${input.brandName} 已在该模型中形成基础识别，回答会将其理解为与 ${input.industry} 相关的品牌。`
      : `当前未形成对 ${input.brandName} 的稳定提及，回答更偏向行业泛化信息。`,
    notes: [],
    coverage: {
      isMentioned: mentioned,
      mentionPosition,
      mentionContext: mentioned
        ? `${input.brandName} 被列为与 ${input.query} 相关的候选项之一。`
        : "",
      competitors: [],
    },
    description: {
      knowsBrand,
      businessSummary: knowsBrand ? input.businessSummary : "我不了解该品牌",
      positioningSummary: knowsBrand
        ? `${input.brandName} 更像一个与 ${input.industry} 相关的品牌或服务方`
        : "我不了解该品牌",
      rawResponse: knowsBrand
        ? `${input.brandName} 是一个与 ${input.industry} 相关的品牌，核心业务是 ${input.businessSummary}。`
        : "我不了解该品牌。",
    },
    authority: {
      hasVerifiableSource,
      sourceNames: hasVerifiableSource ? ["官网", "微信公众号"] : [],
      sourceTypes: hasVerifiableSource ? ["official", "community"] : [],
      rawResponse: hasVerifiableSource
        ? `参考来源：官网、微信公众号。${input.brandName} 在公开信息中被描述为 ${input.businessSummary}。`
        : `未发现明确可核验来源。`,
    },
    consistencyAssessment: {
      knowsBrand,
      hitsCoreNarrative: mentioned && mediumModel,
      hasMajorConflict: false,
      notes: knowsBrand ? "模型对品牌核心方向理解基本正确" : "模型未形成稳定品牌认知",
    },
    confidence: {
      level: hasVerifiableSource ? "high" : mentioned ? "medium" : "low",
      reasons: hasVerifiableSource
        ? ["品牌被提及、被认识，且存在来源支撑"]
        : mentioned
          ? ["品牌已被提及，但缺少可核验来源"]
          : ["品牌未在自然回答中被提及"],
    },
    scoreBreakdown: {
      consistency: 0,
      coverage: 0,
      authority: 0,
      total: 0,
    },
    raw: {
      coverageResponse: mentioned
        ? `${input.brandName} 被列为相关选项之一，位置约为第 ${mentionPosition} 位。`
        : `未提及 ${input.brandName}。`,
      descriptionResponse: knowsBrand
        ? `${input.brandName} 是一个与 ${input.industry} 相关的品牌，核心业务是 ${input.businessSummary}。`
        : "我不了解该品牌。",
      sourceResponse: hasVerifiableSource ? "来源：官网、微信公众号。" : "未发现明确来源。",
    },
  });
}

export function buildMockReport(input: DetectInput): DetectReport {
  const startedAt = Date.now();
  const results = input.selectedModels.map((model, index) => buildMockResult(input, model, index));
  const score = scoreReport(input, results);
  const confidence = mergeConfidence(results);
  const weakestDimension = getWeakestDimension(score);
  const structuredSummary = buildStructuredSummary(input, score, weakestDimension, results);
  const executedAt = new Date().toISOString();

  return normalizeDetectReport({
    input,
    coverage: buildAggregateCoverage(results),
    description: buildAggregateDescription(results),
    authority: buildAggregateAuthority(results),
    consistencyAssessment: buildAggregateConsistency(results),
    scores: score,
    score: {
      ...score,
      level: getLevel(score.total),
    },
    summary: structuredSummary.headline,
    structuredSummary,
    results,
    confidence:
      confidence.level === "high"
        ? { level: "high", reasons: ["多数模型对品牌认知较稳定"] }
        : confidence.level === "medium"
          ? { level: "medium", reasons: ["结果可作为首轮参考，仍建议结合人工判断"] }
          : { level: "low", reasons: ["当前结果主要用于演示链路"] },
    weakestDimension,
    raw: buildRawModelOutputs(results),
    meta: buildDetectionMeta(input, Date.now() - startedAt, executedAt),
    disclaimer: "本次评分为启发式评分，不代表平台官方排名或官方权威判断。",
    debug: {
      mode: "mock",
      providers: input.selectedModels.map((model) => ({
        model,
        source: "mock" as const,
        success: true,
        note: "当前使用 mock 数据",
        })),
    },
  });
}

mockReports.scan_001 = buildMockReport({
  brandName: "董逻辑MGEO",
  industry: "营销咨询 / AI搜索优化",
  businessSummary: "帮助品牌在 AI 搜索中提升可见性、推荐稳定性与多模型品牌理解一致性。",
  query: "董逻辑MGEO是什么？是否适合做品牌在AI搜索中的增长？",
  selectedModels: ["deepseek", "kimi", "doubao", "qianwen", "yuanbao", "wenxin"],
  platform: "multi-model",
});
