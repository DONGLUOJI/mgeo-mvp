import type { DetectInput, ProviderResponse, ResultItem } from "@/lib/detect/types";

function includesAny(text: string, values: string[]) {
  return values.some((value) => value && text.includes(value.toLowerCase()));
}

export function parseResult(input: DetectInput, response: ProviderResponse): ResultItem {
  const rawText = response.rawText || "";
  const lower = rawText.toLowerCase();
  const brandLower = input.brandName.toLowerCase();
  const industryLower = input.industry.toLowerCase();
  const businessKeywords = input.businessSummary
    .split(/[，。,、；;\s/]+/)
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length >= 2)
    .slice(0, 6);

  const mentioned =
    lower.includes(brandLower) ||
    includesAny(lower, [input.brandName.replace(/mgeo/gi, ""), input.brandName.replace(/董逻辑/gi, "")]);

  const positioningMatch = mentioned && (lower.includes(industryLower) || includesAny(lower, businessKeywords));

  const descriptionConsistent =
    mentioned &&
    (lower.includes("品牌") ||
      lower.includes("服务") ||
      lower.includes("增长") ||
      lower.includes("优化"));

  const authoritySignal =
    !lower.includes("不确定") &&
    !lower.includes("无法判断") &&
    !lower.includes("不清楚") &&
    rawText.length >= 50;

  const recommendationSignal: ResultItem["recommendationSignal"] = lower.includes("推荐")
    ? "high"
    : lower.includes("可以考虑") || lower.includes("适合")
      ? "medium"
      : mentioned
        ? "low"
        : "none";

  return {
    model: response.model,
    source: "real",
    mentioned,
    positioningMatch,
    descriptionConsistent,
    authoritySignal,
    recommendationSignal,
    rawText,
    notes: response.success ? [] : [response.error || "调用失败"],
  };
}
