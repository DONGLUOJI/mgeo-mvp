import { buildPrompt } from "@/lib/detect/build-prompt";
import { parseResult } from "@/lib/detect/parser";
import { scoreReport } from "@/lib/detect/scoring";
import type { DetectInput, DetectReport } from "@/lib/detect/types";
import { buildMockReport } from "@/lib/mock/report-data";
import { providers } from "@/lib/providers";

function buildSummary(report: DetectReport) {
  const mentionCount = report.results.filter((item) => item.mentioned).length;

  if (report.score.total < 40) {
    return `当前 ${report.input.brandName} 在多模型场景中的识别基础仍偏弱，建议优先提升品牌提及覆盖与表达一致性。`;
  }

  if (report.score.total < 60) {
    return `当前 ${report.input.brandName} 已被部分模型识别，但品牌定位表达仍不够统一，覆盖范围有限，外部可信支撑仍需增强。`;
  }

  if (mentionCount >= Math.ceil(report.results.length * 0.8)) {
    return `当前 ${report.input.brandName} 在主流模型中已具备较强识别基础，建议继续强化推荐稳定性与权威支撑。`;
  }

  return `当前 ${report.input.brandName} 已具备一定模型识别基础，但在品牌定位统一、平台覆盖和权威支撑上仍有继续优化空间。`;
}

export async function runDetect(input: DetectInput): Promise<DetectReport> {
  const prompt = buildPrompt(input);
  const mockReport = buildMockReport(input);
  const mockMap = new Map(mockReport.results.map((item) => [item.model, item]));

  const items = await Promise.all(
    input.selectedModels.map(async (modelName) => {
      const provider = providers[modelName];

      if (!provider.enabled) {
        return {
          result: mockMap.get(modelName)!,
          debug: {
            model: modelName,
            source: "mock" as const,
            success: true,
            note: "未配置真实 API，自动回退 mock",
          },
        };
      }

      const response = await provider.call(prompt);

      if (!response.success || !response.rawText) {
        const fallback = mockMap.get(modelName)!;
        return {
          result: {
            ...fallback,
            notes: [...(fallback.notes || []), response.error || "真实调用失败，已回退 mock"],
          },
          debug: {
            model: modelName,
            source: "mock" as const,
            success: false,
            note: response.error || "真实调用失败，已回退 mock",
          },
        };
      }

      return {
        result: parseResult(input, response),
        debug: {
          model: modelName,
          source: "real" as const,
          success: true,
          note: "真实 API 调用成功",
        },
      };
    })
  );

  const results = items.map((item) => item.result);
  const score = scoreReport(input, results);
  const realCount = items.filter((item) => item.debug.source === "real").length;

  const report: DetectReport = {
    input,
    score,
    summary: "",
    results,
    debug: {
      mode:
        realCount === 0 ? "mock" : realCount === items.length ? "real" : "hybrid",
      providers: items.map((item) => item.debug),
    },
  };

  return {
    ...report,
    summary: buildSummary(report),
  };
}
