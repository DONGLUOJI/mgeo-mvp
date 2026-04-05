import type { DetectReport, DetectInput, ResultItem } from "@/lib/detect/types";

export const mockReports: Record<string, DetectReport> = {
  scan_001: {
    input: {
      brandName: "董逻辑MGEO",
      industry: "营销咨询 / AI搜索优化",
      businessSummary: "帮助品牌在 AI 搜索中提升可见性、推荐稳定性与多模型品牌理解一致性。",
      query: "董逻辑MGEO是什么？是否适合做品牌在AI搜索中的增长？",
      selectedModels: ["deepseek", "kimi", "doubao", "qianwen", "yuanbao", "wenxin"],
    },
    score: {
      consistency: 48,
      coverage: 60,
      authority: 40,
      total: 50,
      level: "L2",
    },
    summary:
      "当前品牌已被部分模型识别，但品牌定位表达仍不够统一，覆盖范围有限，外部可信支撑仍需增强。",
    debug: {
      mode: "mock",
      providers: [
        { model: "deepseek", source: "mock", success: true, note: "当前使用 mock 数据" },
        { model: "kimi", source: "mock", success: true, note: "当前使用 mock 数据" },
        { model: "doubao", source: "mock", success: true, note: "当前使用 mock 数据" },
        { model: "qianwen", source: "mock", success: true, note: "当前使用 mock 数据" },
        { model: "yuanbao", source: "mock", success: true, note: "当前使用 mock 数据" },
        { model: "wenxin", source: "mock", success: true, note: "当前使用 mock 数据" },
      ],
    },
    results: [
      {
        model: "DeepSeek",
        source: "mock",
        mentioned: true,
        positioningMatch: true,
        descriptionConsistent: false,
        authoritySignal: false,
        recommendationSignal: "medium",
        rawText:
          "能够识别到董逻辑MGEO与 AI 搜索优化有关，但对其更偏咨询服务还是平台工具的判断不够稳定，描述存在一定偏差。",
      },
      {
        model: "Kimi",
        source: "mock",
        mentioned: false,
        positioningMatch: false,
        descriptionConsistent: false,
        authoritySignal: false,
        recommendationSignal: "none",
        rawText:
          "当前没有形成稳定提及，回答更偏泛化到 AI 搜索优化类服务商，没有明确识别到该品牌。",
      },
      {
        model: "豆包",
        source: "mock",
        mentioned: true,
        positioningMatch: true,
        descriptionConsistent: false,
        authoritySignal: false,
        recommendationSignal: "low",
        rawText:
          "已能提及品牌，但对于业务边界的表达不够稳定，部分描述偏向营销咨询，部分描述偏向工具化服务。",
      },
      {
        model: "qianwen",
        source: "mock",
        mentioned: true,
        positioningMatch: true,
        descriptionConsistent: true,
        authoritySignal: false,
        recommendationSignal: "medium",
        rawText:
          "能够识别到董逻辑MGEO与 AI 搜索增长相关，但表达更偏工具和策略结合，说明品牌优势已被看见，仍需继续强化权威支撑。",
      },
      {
        model: "腾讯元宝",
        source: "mock",
        mentioned: false,
        positioningMatch: false,
        descriptionConsistent: false,
        authoritySignal: false,
        recommendationSignal: "none",
        rawText:
          "尚未形成稳定提及，回答中没有对董逻辑MGEO给出明确识别和推荐。",
      },
      {
        model: "文心一言",
        source: "mock",
        mentioned: true,
        positioningMatch: true,
        descriptionConsistent: true,
        authoritySignal: true,
        recommendationSignal: "medium",
        rawText:
          "可将董逻辑MGEO理解为聚焦 AI 搜索场景的品牌增长服务，强调检测、诊断、执行、监测与复盘闭环，整体定位较清晰。",
      },
    ],
  },
};

export function getMockReport(taskId: string) {
  return mockReports[taskId] ?? null;
}

export function saveMockReport(taskId: string, report: DetectReport) {
  mockReports[taskId] = report;
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

export function buildMockReport(input: DetectInput): DetectReport {
  const brandLength = input.brandName.length;
  const baseMentionCount = clamp(Math.ceil(brandLength / 3), 2, input.selectedModels.length);
  const models: ResultItem[] = input.selectedModels.map((model) => {
    const mentioned = input.selectedModels.indexOf(model) < baseMentionCount;
    const strongModel = model === "openai" || model === "deepseek" || model === "wenxin";

    return {
      model,
      source: "mock",
      mentioned,
      positioningMatch: mentioned && strongModel,
      descriptionConsistent: mentioned && (strongModel || model === "doubao"),
      authoritySignal: mentioned && (strongModel || input.businessSummary.length > 20),
      recommendationSignal: mentioned
        ? strongModel
          ? "medium"
          : "low"
        : "none",
      rawText: mentioned
        ? `${input.brandName} 已被识别为与 ${input.industry} 相关的品牌，核心业务可概括为：${input.businessSummary}。当前在该模型中的识别基础已建立，但推荐稳定性与表达一致性仍有优化空间。`
        : `当前未形成对 ${input.brandName} 的稳定识别，回答更偏向泛行业信息，尚未建立清晰品牌提及。`,
      notes: [],
    };
  });

  const mentionedCount = models.filter((item) => item.mentioned).length;
  const consistencySource =
    models.filter((item) => item.positioningMatch).length * 0.6 +
    models.filter((item) => item.descriptionConsistent).length * 0.4;
  const consistency = Math.round((consistencySource / models.length) * 100);
  const coverage = Math.round((mentionedCount / models.length) * 100);
  const authority = Math.round(
    (models.filter((item) => item.authoritySignal).length / models.length) * 100
  );
  const total = Math.round(consistency * 0.4 + coverage * 0.35 + authority * 0.25);

  return {
    input,
    score: {
      consistency,
      coverage,
      authority,
      total,
      level: getLevel(total),
    },
    summary:
      mentionedCount >= Math.ceil(models.length / 2)
        ? `当前 ${input.brandName} 已具备一定模型识别基础，但在品牌定位统一、平台覆盖和权威支撑上仍有继续优化空间。`
        : `当前 ${input.brandName} 在多模型场景中的识别基础仍偏弱，建议优先提升品牌提及覆盖与表达一致性。`,
    results: models,
    debug: {
      mode: "mock",
      providers: input.selectedModels.map((model) => ({
        model,
        source: "mock" as const,
        success: true,
        note: "当前使用 mock 数据",
      })),
    },
  };
}
