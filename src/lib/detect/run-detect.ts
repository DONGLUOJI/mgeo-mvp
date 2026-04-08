import { buildPromptSet } from "@/lib/detect/build-prompt";
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
import { buildResultItem } from "@/lib/detect/parser";
import { scoreReport, scoreResultItem } from "@/lib/detect/scoring";
import type { DetectInput, DetectReport, ProviderDebugItem } from "@/lib/detect/types";
import { buildMockReport } from "@/lib/mock/report-data";
import { providers } from "@/lib/providers";

async function runRealDetectionForModel(input: DetectInput, modelName: DetectInput["selectedModels"][number]) {
  const provider = providers[modelName];
  const prompts = buildPromptSet(input);

  const [coverageResponse, descriptionResponse, sourceResponse] = await Promise.all([
    provider.call(prompts.coverage),
    provider.call(prompts.description),
    provider.call(prompts.source),
  ]);

  const failures = [coverageResponse, descriptionResponse, sourceResponse].filter(
    (item) => !item.success || !item.rawText
  );

  if (failures.length) {
    return {
      ok: false as const,
      note:
        failures
          .map((item) => item.error)
          .filter(Boolean)
          .join("；") || "部分真实调用失败",
    };
  }

  return {
    ok: true as const,
    result: scoreResultItem(
      buildResultItem({
        input,
        model: modelName,
        source: "real",
        coverageResponse: coverageResponse.rawText,
        descriptionResponse: descriptionResponse.rawText,
        sourceResponse: sourceResponse.rawText,
      })
    ),
  };
}

export async function runDetection(input: DetectInput): Promise<DetectReport> {
  const startedAt = Date.now();
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
          } satisfies ProviderDebugItem,
        };
      }

      const runtime = await runRealDetectionForModel(input, modelName);

      if (!runtime.ok) {
        const fallback = mockMap.get(modelName)!;
        return {
          result: {
            ...fallback,
            notes: [...(fallback.notes || []), runtime.note, "真实调用失败，已回退 mock"],
          },
          debug: {
            model: modelName,
            source: "mock" as const,
            success: false,
            note: runtime.note,
          } satisfies ProviderDebugItem,
        };
      }

      return {
        result: runtime.result,
        debug: {
          model: modelName,
          source: "real" as const,
          success: true,
          note: "真实 API 调用成功（coverage / description / source）",
        } satisfies ProviderDebugItem,
      };
    })
  );

  const results = items.map((item) => item.result);
  const score = scoreReport(input, results);
  const weakestDimension = getWeakestDimension(score);
  const structuredSummary = buildStructuredSummary(input, score, weakestDimension, results);
  const realCount = items.filter((item) => item.debug.source === "real").length;
  const executedAt = new Date().toISOString();
  const durationMs = Date.now() - startedAt;

  const report: DetectReport = {
    input,
    coverage: buildAggregateCoverage(results),
    description: buildAggregateDescription(results),
    authority: buildAggregateAuthority(results),
    consistencyAssessment: buildAggregateConsistency(results),
    scores: score,
    score,
    summary: structuredSummary.headline,
    structuredSummary,
    results,
    confidence: mergeConfidence(results),
    weakestDimension,
    raw: buildRawModelOutputs(results),
    meta: buildDetectionMeta(input, durationMs, executedAt),
    disclaimer: "本次评分为启发式评分，不代表平台官方排名或官方权威判断。",
    debug: {
      mode: realCount === 0 ? "mock" : realCount === items.length ? "real" : "hybrid",
      providers: items.map((item) => item.debug),
    },
  };

  return normalizeDetectReport(report);
}

export const runDetect = runDetection;
