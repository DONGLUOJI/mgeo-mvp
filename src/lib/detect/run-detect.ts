import { buildPromptSet } from "@/lib/detect/build-prompt";
import {
  DEFAULT_DETECTION_DISCLAIMER,
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
import type { DetectInput, DetectReport, ProviderDebugItem, ProviderResponse } from "@/lib/detect/types";
import {
  buildEvidenceBackedResult,
  runGoogleVisionEvidence,
  type RuntimeImageAsset,
} from "@/lib/evidence/google-vision";
import { buildMockReport } from "@/lib/mock/report-data";
import { providers } from "@/lib/providers";

type DetectRuntimeOptions = {
  sampleImage?: RuntimeImageAsset | null;
};

async function callWithRetry(
  modelName: DetectInput["selectedModels"][number],
  provider: (typeof providers)[DetectInput["selectedModels"][number]],
  prompt: string,
  label: "coverage" | "description" | "source"
) {
  let lastResponse: ProviderResponse | null = null;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const response = await provider.call(prompt);
    lastResponse = response;

    if (response.success && response.rawText.trim()) {
      return {
        response,
        recovered: attempt > 1,
      };
    }
  }

  return {
    response:
      lastResponse ||
      ({
        model: modelName,
        success: false,
        rawText: "",
        latencyMs: 0,
        error: `${label} 调用失败`,
      } satisfies ProviderResponse),
    recovered: false,
  };
}

async function runRealDetectionForModel(input: DetectInput, modelName: DetectInput["selectedModels"][number]) {
  const provider = providers[modelName];
  const prompts = buildPromptSet(input);

  const [coverageRuntime, descriptionRuntime, sourceRuntime] = await Promise.all([
    callWithRetry(modelName, provider, prompts.coverage, "coverage"),
    callWithRetry(modelName, provider, prompts.description, "description"),
    callWithRetry(modelName, provider, prompts.source, "source"),
  ]);
  const coverageResponse = coverageRuntime.response;
  const descriptionResponse = descriptionRuntime.response;
  const sourceResponse = sourceRuntime.response;

  const failures = [coverageResponse, descriptionResponse, sourceResponse].filter(
    (item) => !item.success || !item.rawText
  );

  if (failures.length === 3) {
    return {
      ok: false as const,
      note:
        failures
          .map((item) => item.error)
          .filter(Boolean)
          .join("；") || "部分真实调用失败",
    };
  }

  const notes = [
    coverageRuntime.recovered ? "coverage 调用第 2 次重试成功" : "",
    descriptionRuntime.recovered ? "description 调用第 2 次重试成功" : "",
    sourceRuntime.recovered ? "source 调用第 2 次重试成功" : "",
    !coverageResponse.success || !coverageResponse.rawText ? `coverage 调用失败：${coverageResponse.error || "已回退为空结果"}` : "",
    !descriptionResponse.success || !descriptionResponse.rawText
      ? `description 调用失败：${descriptionResponse.error || "已回退为不了解品牌"}`
      : "",
    !sourceResponse.success || !sourceResponse.rawText
      ? `source 调用失败：${sourceResponse.error || "已回退为无明确来源"}`
      : "",
  ].filter(Boolean);

  return {
    ok: true as const,
    result: scoreResultItem(
      buildResultItem({
        input,
        model: modelName,
        source: "real",
        coverageResponse: coverageResponse.rawText || "未提及该品牌。",
        descriptionResponse: descriptionResponse.rawText || "我不了解该品牌。",
        sourceResponse: sourceResponse.rawText || "未发现明确可核验来源。",
        notes,
      })
    ),
    note: notes.join("；"),
  };
}

export async function runDetection(
  input: DetectInput,
  options: DetectRuntimeOptions = {}
): Promise<DetectReport> {
  const startedAt = Date.now();
  const mockReport = buildMockReport(input);
  const mockMap = new Map(mockReport.results.map((item) => [item.model, item]));
  const evidence = options.sampleImage ? await runGoogleVisionEvidence(options.sampleImage) : null;

  if (evidence) {
    const results = input.selectedModels.map((modelName) =>
      buildEvidenceBackedResult({
        input,
        model: modelName,
        evidence,
      })
    );
    const score = scoreReport(input, results);
    const weakestDimension = getWeakestDimension(score);
    const structuredSummary = buildStructuredSummary(input, score, weakestDimension, results);
    const executedAt = new Date().toISOString();
    const durationMs = Date.now() - startedAt;

    return normalizeDetectReport({
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
      evidence,
      disclaimer: DEFAULT_DETECTION_DISCLAIMER,
      debug: {
        mode: "real",
        providers: input.selectedModels.map(
          (model) =>
            ({
              model,
              source: "real",
              success: true,
              note: "已使用 Google Vision 图源证据生成结果",
            }) satisfies ProviderDebugItem
        ),
      },
    });
  }

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
          note: runtime.note || "真实 API 调用成功（coverage / description / source）",
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
    disclaimer: DEFAULT_DETECTION_DISCLAIMER,
    debug: {
      mode: realCount === 0 ? "mock" : realCount === items.length ? "real" : "hybrid",
      providers: items.map((item) => item.debug),
    },
  };

  return normalizeDetectReport(report);
}

export const runDetect = runDetection;
