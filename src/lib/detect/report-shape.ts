import type {
  AuthorityResult,
  ConfidenceLevel,
  ConfidenceResult,
  ConsistencyAssessment,
  CoverageResult,
  BrandDescriptionResult,
  DetectInput,
  DetectionMeta,
  DetectReport,
  DetectionScores,
  DetectionSummary,
  RawModelOutputs,
  ResultItem,
  Score,
} from "@/lib/detect/types";

export const DEFAULT_DETECTION_DISCLAIMER =
  "本次评分为启发式评分，不代表平台官方排名或官方权威判断。";

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function dedupe(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function pickBestResult(results: ResultItem[], predicate?: (item: ResultItem) => boolean) {
  const candidates = predicate ? results.filter(predicate) : results;
  return [...candidates].sort((a, b) => b.scoreBreakdown.total - a.scoreBreakdown.total)[0] || null;
}

export function buildSummaryText(input: DetectInput, score: DetectionScores, results: ResultItem[]) {
  const mentionCount = results.filter((item) => item.mentioned).length;
  const weakestDimension = getWeakestDimension(score);

  if (score.total < 40) {
    return `当前 ${input.brandName} 在目标 AI 场景中的可见性较弱，尚未形成稳定提及与可信来源。`;
  }

  if (score.total < 60) {
    return `当前 ${input.brandName} 已在部分 AI 场景中被提及，但描述稳定性、覆盖度或来源可信度仍需加强。`;
  }

  if (mentionCount >= Math.ceil(results.length * 0.8)) {
    return `当前 ${input.brandName} 已在多数目标 AI 场景中形成稳定露出，下一步应继续补齐${weakestDimension === "authority" ? "可信来源" : weakestDimension === "consistency" ? "品牌表述一致性" : "高价值问题覆盖"}。`;
  }

  return `当前 ${input.brandName} 在部分 AI 场景中的可见性仍有提升空间，建议优先补强${weakestDimension === "authority" ? "来源信号" : weakestDimension === "consistency" ? "品牌叙事一致性" : "问题覆盖范围"}。`;
}

export function getScoreLevel(total: number): Score["level"] {
  if (total < 40) return "L1";
  if (total < 60) return "L2";
  if (total < 80) return "L3";
  return "L4";
}

export function getWeakestDimension(score: Score | DetectionScores) {
  const pairs = [
    { key: "consistency" as const, value: score.consistency },
    { key: "coverage" as const, value: score.coverage },
    { key: "authority" as const, value: score.authority },
  ];

  return pairs.sort((a, b) => a.value - b.value)[0]?.key || "coverage";
}

function buildScoresFromResults(results: ResultItem[]): DetectionScores {
  const coverage = average(results.map((item) => item.scoreBreakdown?.coverage || 0));
  const consistency = average(results.map((item) => item.scoreBreakdown?.consistency || 0));
  const authority = average(results.map((item) => item.scoreBreakdown?.authority || 0));
  const total = Math.round(consistency * 0.4 + coverage * 0.3 + authority * 0.3);

  return {
    coverage,
    consistency,
    authority,
    total,
  };
}

function normalizeResults(results: ResultItem[]) {
  return results.map((item) => ({
    ...item,
    raw: item.raw || {
      coverageResponse: item.coverage?.mentionContext || item.rawText || "",
      descriptionResponse: item.description?.rawResponse || item.rawText || "",
      sourceResponse: item.authority?.rawResponse || item.rawText || "",
    },
  }));
}

export function normalizeDetectReport(
  source: Partial<DetectReport> | DetectReport,
  options?: { createdAt?: string | null }
): DetectReport {
  const fallbackExecutedAt = options?.createdAt || new Date().toISOString();
  const input = {
    ...(source.input || ({} as DetectInput)),
    platform:
      source.input?.platform ||
      (source.input?.selectedModels?.length === 1 ? String(source.input.selectedModels[0]) : "multi-model"),
    locale: source.input?.locale || "zh-CN",
    competitors: source.input?.competitors || [],
  } as DetectInput;

  const results = normalizeResults(source.results || []);
  const scores = source.scores || source.score || buildScoresFromResults(results);
  const weakestDimension = source.weakestDimension || getWeakestDimension(scores);
  const structuredSummary =
    source.structuredSummary || buildStructuredSummary(input, scores, weakestDimension, results);
  const meta = {
    version: "v1" as const,
    executedAt: source.meta?.executedAt || fallbackExecutedAt,
    model: source.meta?.model || input.selectedModels?.join(", ") || "",
    provider:
      source.meta?.provider ||
      input.platform ||
      (input.selectedModels?.length === 1 ? String(input.selectedModels[0]) : "multi-model"),
    durationMs: source.meta?.durationMs || 0,
    mode:
      source.meta?.mode ||
      (input.brandNarrative || input.competitors?.length ? "enterprise" : "free"),
  };

  return {
    input,
    coverage: source.coverage || buildAggregateCoverage(results),
    description: source.description || buildAggregateDescription(results),
    authority: source.authority || buildAggregateAuthority(results),
    consistencyAssessment: source.consistencyAssessment || buildAggregateConsistency(results),
    scores,
    score: source.score || {
      ...scores,
      level: getScoreLevel(scores.total),
    },
    summary: source.summary || structuredSummary.headline,
    structuredSummary,
    results,
    confidence: source.confidence || mergeConfidence(results),
    weakestDimension,
    raw: source.raw || buildRawModelOutputs(results),
    meta,
    disclaimer: source.disclaimer || DEFAULT_DETECTION_DISCLAIMER,
    evidence: source.evidence,
    debug: source.debug,
  };
}

export function mergeConfidence(results: ResultItem[]): ConfidenceResult {
  const levels = results.map((item) => item.confidence.level);
  const allReasons = [...new Set(results.flatMap((item) => item.confidence.reasons).filter(Boolean))];
  let level: ConfidenceLevel = "low";

  if (levels.every((item) => item === "high")) {
    level = "high";
  } else if (levels.some((item) => item === "high" || item === "medium")) {
    level = "medium";
  }

  return {
    level,
    reasons: allReasons.slice(0, 5),
  };
}

export function buildAggregateCoverage(results: ResultItem[]): CoverageResult {
  const mentionedResults = results.filter((item) => item.coverage.isMentioned);
  const bestMention =
    [...mentionedResults].sort((a, b) => {
      const aPosition = a.coverage.mentionPosition ?? Number.MAX_SAFE_INTEGER;
      const bPosition = b.coverage.mentionPosition ?? Number.MAX_SAFE_INTEGER;
      if (aPosition !== bPosition) return aPosition - bPosition;
      return b.scoreBreakdown.total - a.scoreBreakdown.total;
    })[0] || null;

  return {
    isMentioned: mentionedResults.length > 0,
    mentionPosition: bestMention?.coverage.mentionPosition ?? null,
    mentionContext: bestMention?.coverage.mentionContext || "",
    competitors: dedupe(mentionedResults.flatMap((item) => item.coverage.competitors)).slice(0, 8),
  };
}

export function buildAggregateDescription(results: ResultItem[]): BrandDescriptionResult {
  const bestKnown =
    pickBestResult(results, (item) => item.description.knowsBrand) ||
    pickBestResult(results, (item) => !!item.description.rawResponse) ||
    results[0] ||
    null;

  return {
    knowsBrand: results.some((item) => item.description.knowsBrand),
    businessSummary: bestKnown?.description.businessSummary || "当前没有足够公开资料说明该样本",
    positioningSummary: bestKnown?.description.positioningSummary || "当前没有足够公开资料说明该样本",
    rawResponse: bestKnown?.description.rawResponse || "当前没有足够公开资料说明该样本",
  };
}

export function buildAggregateAuthority(results: ResultItem[]): AuthorityResult {
  const bestAuthority =
    pickBestResult(results, (item) => item.authority.hasVerifiableSource) ||
    pickBestResult(results, (item) => !!item.authority.rawResponse) ||
    results[0] ||
    null;

  return {
    hasVerifiableSource: results.some((item) => item.authority.hasVerifiableSource),
    sourceNames: dedupe(results.flatMap((item) => item.authority.sourceNames)).slice(0, 12),
    sourceTypes: dedupe(results.flatMap((item) => item.authority.sourceTypes)).slice(0, 8),
    strongSourceCount: Math.max(...results.map((item) => item.authority.strongSourceCount || 0), 0),
    datedSourceCount: Math.max(...results.map((item) => item.authority.datedSourceCount || 0), 0),
    rawResponse: bestAuthority?.authority.rawResponse || "未发现明确可核验来源。",
  };
}

export function buildAggregateConsistency(results: ResultItem[]): ConsistencyAssessment {
  if (!results.some((item) => item.consistencyAssessment.knowsBrand)) {
    return {
      knowsBrand: false,
      hitsCoreNarrative: false,
      hasMajorConflict: false,
      notes: "公开线索尚未形成稳定的资料认知",
    };
  }

  const conflictResult = results.find((item) => item.consistencyAssessment.hasMajorConflict);
  if (conflictResult) {
    return {
      knowsBrand: true,
      hitsCoreNarrative: results.some((item) => item.consistencyAssessment.hitsCoreNarrative),
      hasMajorConflict: true,
      notes: conflictResult.consistencyAssessment.notes,
    };
  }

  if (!results.some((item) => item.consistencyAssessment.hitsCoreNarrative)) {
    return {
      knowsBrand: true,
      hitsCoreNarrative: false,
      hasMajorConflict: false,
      notes: "公开线索已命中样本，但未命中核心场景关键词",
    };
  }

  return {
    knowsBrand: true,
    hitsCoreNarrative: true,
    hasMajorConflict: false,
    notes: "公开线索对该样本的核心展示方向理解基本正确",
  };
}

export function buildRawModelOutputs(results: ResultItem[]): RawModelOutputs {
  return {
    coverageResponse: results
      .map((item) => `[${item.model}] ${item.raw.coverageResponse}`)
      .join("\n\n"),
    descriptionResponse: results
      .map((item) => `[${item.model}] ${item.raw.descriptionResponse}`)
      .join("\n\n"),
    sourceResponse: results
      .map((item) => `[${item.model}] ${item.raw.sourceResponse}`)
      .join("\n\n"),
  };
}

export function buildDetectionMeta(
  input: DetectInput,
  durationMs: number,
  executedAt: string
): DetectionMeta {
  const providerLabel = input.selectedModels.length === 1 ? input.selectedModels[0] : "multi-model";

  return {
    version: "v1",
    executedAt,
    model: input.selectedModels.join(", "),
    provider: providerLabel,
    durationMs,
    mode: input.brandNarrative || input.competitors?.length ? "enterprise" : "free",
  };
}

export function buildStructuredSummary(
  input: DetectInput,
  score: DetectionScores,
  weakestDimension: DetectionSummary["weakestDimension"],
  results: ResultItem[]
): DetectionSummary {
  const nextActionMap: Record<DetectionSummary["weakestDimension"], string> = {
    consistency: `优先统一 ${input.brandName} 的品牌主叙事、定位表达与关键描述。`,
    coverage: `优先补足 ${input.brandName} 在核心搜索问题中的自然提及与推荐覆盖。`,
    authority: `优先补充 ${input.brandName} 的官网、媒体、百科等外部可信来源。`,
  };

  return {
    headline: buildSummaryText(input, score, results),
    weakestDimension,
    nextAction: nextActionMap[weakestDimension],
  };
}
