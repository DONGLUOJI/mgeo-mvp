import type { DetectInput, EvidencePage, ImageEvidence, ResultItem } from "@/lib/detect/types";
import { buildResultItem } from "@/lib/detect/parser";
import { scoreResultItem } from "@/lib/detect/scoring";

export type RuntimeImageAsset = {
  base64: string;
  mimeType: string;
  name?: string;
};

type VisionFeature = {
  type: "WEB_DETECTION" | "TEXT_DETECTION";
  maxResults?: number;
};

type VisionAnnotateResponse = {
  responses?: Array<{
    webDetection?: {
      bestGuessLabels?: Array<{ label?: string }>;
      webEntities?: Array<{ description?: string; score?: number }>;
      fullMatchingImages?: Array<{ url?: string }>;
      partialMatchingImages?: Array<{ url?: string }>;
      visuallySimilarImages?: Array<{ url?: string }>;
      pagesWithMatchingImages?: Array<{
        url?: string;
        pageTitle?: string;
        fullMatchingImages?: Array<{ url?: string }>;
        partialMatchingImages?: Array<{ url?: string }>;
      }>;
    };
    fullTextAnnotation?: {
      text?: string;
    };
    textAnnotations?: Array<{
      description?: string;
    }>;
    error?: {
      message?: string;
    };
  }>;
};

const DEFAULT_VISION_ENDPOINT = "https://vision.googleapis.com/v1/images:annotate";
const DEFAULT_FEATURES: VisionFeature[] = [
  { type: "WEB_DETECTION", maxResults: 10 },
  { type: "TEXT_DETECTION", maxResults: 10 },
];
const PAGE_ENRICH_LIMIT = 5;
const PAGE_FETCH_TIMEOUT_MS = 5000;

function dedupe(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function normalizePublishedAt(value: string) {
  const normalized = value.trim().replace(/\//g, "-");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function extractFirstMatch(html: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return "";
}

function decodeHtml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function extractTitleFromHtml(html: string) {
  const title =
    extractFirstMatch(html, [
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i,
      /<title[^>]*>([^<]+)<\/title>/i,
    ]) || "";

  return decodeHtml(title.replace(/\s+/g, " ").trim());
}

function extractPublishedAtFromHtml(html: string) {
  const raw =
    extractFirstMatch(html, [
      /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+name=["']pubdate["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+name=["']publishdate["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+name=["']date["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+name=["']dc\.date["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+name=["']parsely-pub-date["'][^>]+content=["']([^"']+)["']/i,
      /<time[^>]+datetime=["']([^"']+)["']/i,
      /"datePublished"\s*:\s*"([^"]+)"/i,
      /"uploadDate"\s*:\s*"([^"]+)"/i,
      /(\d{4}-\d{1,2}-\d{1,2}(?:[ T]\d{1,2}:\d{2}(?::\d{2})?)?)/,
    ]) || "";

  return raw ? normalizePublishedAt(raw) : "";
}

function includesDomain(domain: string, patterns: string[]) {
  return patterns.some((item) => domain === item || domain.endsWith(`.${item}`));
}

function classifyDomainRisk(domain: string, publishedAt?: string) {
  const trustedDomains = [
    "instagram.com",
    "x.com",
    "twitter.com",
    "weibo.com",
    "xiaohongshu.com",
    "douyin.com",
    "taobao.com",
    "tmall.com",
    "jd.com",
    "amazon.com",
    "1688.com",
    "pinduoduo.com",
    "vogue.com",
    "forbes.com",
    "bbc.com",
    "cnn.com",
    "people.com.cn",
    "xinhuanet.com",
    "thepaper.cn",
    "qq.com",
    "163.com",
  ];
  const communityDomains = [
    "pinterest.com",
    "reddit.com",
    "zhihu.com",
    "bilibili.com",
    "medium.com",
    "substack.com",
    "tumblr.com",
    "blogspot.com",
    "wordpress.com",
  ];
  const highRiskPatterns = /(cdn|img|image|static|media|cache|proxy|upload|file|pic|photo|short|link|googleusercontent|twimg|pinimg|qpic|alicdn|cloudfront|akamai|byteimg|hdslb)/i;

  if (!domain) {
    return {
      riskTier: "high" as const,
      riskLabel: "高风险域名",
      riskReason: "域名无法识别，页面上下文较弱",
    };
  }

  if (highRiskPatterns.test(domain)) {
    return {
      riskTier: "high" as const,
      riskLabel: "高风险域名",
      riskReason: "更像图片/CDN/缓存域名，原始上下文较弱",
    };
  }

  if (includesDomain(domain, trustedDomains)) {
    return {
      riskTier: "low" as const,
      riskLabel: "低风险域名",
      riskReason: "主流社媒、电商或媒体域名，可复核度较高",
    };
  }

  if (includesDomain(domain, communityDomains)) {
    return {
      riskTier: "medium" as const,
      riskLabel: "中风险域名",
      riskReason: "社区或聚合平台，需要结合更多来源交叉验证",
    };
  }

  if (publishedAt) {
    return {
      riskTier: "medium" as const,
      riskLabel: "中风险域名",
      riskReason: "页面可提取发布时间，但域名仍需结合其他来源验证",
    };
  }

  return {
    riskTier: "high" as const,
    riskLabel: "高风险域名",
    riskReason: "非头部平台且缺少清晰发布时间，证据强度偏弱",
  };
}

async function fetchPageMetadata(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PAGE_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; FakeCheckBot/1.0; +https://www.dongluoji.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const html = await res.text();
    const finalUrl = res.url || url;

    return {
      finalUrl,
      title: extractTitleFromHtml(html),
      publishedAt: extractPublishedAtFromHtml(html),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function sortEvidencePages(a: EvidencePage, b: EvidencePage) {
  const tierScore = { low: 0, medium: 1, high: 2 };
  if (tierScore[a.riskTier] !== tierScore[b.riskTier]) {
    return tierScore[a.riskTier] - tierScore[b.riskTier];
  }
  if (a.publishedAt && b.publishedAt && a.publishedAt !== b.publishedAt) {
    return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
  }
  if (a.publishedAt && !b.publishedAt) return -1;
  if (!a.publishedAt && b.publishedAt) return 1;
  return (b.fullMatchCount + b.partialMatchCount) - (a.fullMatchCount + a.partialMatchCount);
}

export function hasGoogleVisionConfig() {
  return Boolean(process.env.GOOGLE_VISION_API_KEY || process.env.GOOGLE_VISION_BEARER_TOKEN);
}

export function parseImageDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!match) {
    throw new Error("图片格式无效，请重新上传 JPG、PNG、WEBP 或 GIF 图片。");
  }

  return {
    mimeType: match[1],
    base64: match[2],
  };
}

function buildVisionEndpoint() {
  const endpoint = process.env.GOOGLE_VISION_ENDPOINT || DEFAULT_VISION_ENDPOINT;
  const apiKey = process.env.GOOGLE_VISION_API_KEY;

  if (!apiKey) return endpoint;
  const separator = endpoint.includes("?") ? "&" : "?";
  return `${endpoint}${separator}key=${encodeURIComponent(apiKey)}`;
}

function buildHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const bearer = process.env.GOOGLE_VISION_BEARER_TOKEN;

  if (bearer) {
    headers.Authorization = `Bearer ${bearer}`;
  }

  return headers;
}

export async function runGoogleVisionEvidence(asset: RuntimeImageAsset): Promise<ImageEvidence | null> {
  if (!hasGoogleVisionConfig()) return null;

  const res = await fetch(buildVisionEndpoint(), {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({
      requests: [
        {
          image: {
            content: asset.base64,
          },
          features: DEFAULT_FEATURES,
          imageContext: {
            languageHints: ["zh", "en"],
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`Google Vision 调用失败：HTTP ${res.status} ${message}`);
  }

  const data = (await res.json()) as VisionAnnotateResponse;
  const item = data.responses?.[0];

  if (!item) {
    return null;
  }

  if (item.error?.message) {
    throw new Error(`Google Vision 返回错误：${item.error.message}`);
  }

  const web = item.webDetection;
  const rawPages =
    web?.pagesWithMatchingImages
      ?.map((page) => ({
        url: page.url || "",
        title: (page.pageTitle || "").replace(/<[^>]+>/g, "").trim(),
        domain: toDomain(page.url || ""),
        fullMatchCount: page.fullMatchingImages?.length || 0,
        partialMatchCount: page.partialMatchingImages?.length || 0,
      }))
      .filter((page) => page.url)
      .sort((a, b) => (b.fullMatchCount + b.partialMatchCount) - (a.fullMatchCount + a.partialMatchCount))
      .slice(0, 8) || [];

  const enriched: EvidencePage[] = await Promise.all(
    rawPages.map(async (page, index): Promise<EvidencePage> => {
      if (index >= PAGE_ENRICH_LIMIT) {
        const risk = classifyDomainRisk(page.domain);
        return {
          ...page,
          publishedAt: undefined,
          riskTier: risk.riskTier,
          riskLabel: risk.riskLabel,
          riskReason: risk.riskReason,
        } satisfies EvidencePage;
      }

      if (index > 0) {
        await sleep(80);
      }

      const metadata = await fetchPageMetadata(page.url);
      const finalDomain = toDomain(metadata?.finalUrl || page.url) || page.domain;
      const publishedAt = metadata?.publishedAt || "";
      const risk = classifyDomainRisk(finalDomain, publishedAt);

      return {
        ...page,
        url: metadata?.finalUrl || page.url,
        title: metadata?.title || page.title,
        domain: finalDomain,
        publishedAt: publishedAt || undefined,
        riskTier: risk.riskTier,
        riskLabel: risk.riskLabel,
        riskReason: risk.riskReason,
      } satisfies EvidencePage;
    })
  );

  const pages = enriched.sort(sortEvidencePages);

  const bestGuessLabels = dedupe((web?.bestGuessLabels || []).map((item) => item.label || "")).slice(0, 6);
  const webEntities = dedupe((web?.webEntities || []).map((item) => item.description || "")).slice(0, 8);
  const fullMatchingImageUrls = dedupe((web?.fullMatchingImages || []).map((item) => item.url || "")).slice(0, 8);
  const partialMatchingImageUrls = dedupe((web?.partialMatchingImages || []).map((item) => item.url || "")).slice(0, 8);
  const visuallySimilarImageUrls = dedupe((web?.visuallySimilarImages || []).map((item) => item.url || "")).slice(0, 8);
  const extractedText = (item.fullTextAnnotation?.text || item.textAnnotations?.[0]?.description || "").trim();
  const datedPages = pages.filter((page) => page.publishedAt);
  const earliestPublishedAt = datedPages.length
    ? [...datedPages].sort((a, b) => new Date(a.publishedAt!).getTime() - new Date(b.publishedAt!).getTime())[0]?.publishedAt
    : "";
  const lowRiskPageCount = pages.filter((page) => page.riskTier === "low").length;

  const riskSignals: string[] = [];

  if (fullMatchingImageUrls.length > 0) {
    riskSignals.push(`发现 ${fullMatchingImageUrls.length} 条完整匹配图片结果`);
  }
  if (pages.length >= 3) {
    riskSignals.push(`公开网页中至少有 ${pages.length} 个相关页面在复用该图片或其裁切版本`);
  }
  if (lowRiskPageCount >= 2) {
    riskSignals.push(`命中了 ${lowRiskPageCount} 个低风险域名页面，证据可信度更高`);
  }
  if (earliestPublishedAt) {
    riskSignals.push(`当前可提取到的最早发布时间为 ${new Date(earliestPublishedAt).toLocaleDateString("zh-CN")}`);
  }
  if (partialMatchingImageUrls.length >= 5) {
    riskSignals.push(`存在较多局部相似图，疑似被裁切、拼图或二次搬运`);
  }
  if (extractedText) {
    riskSignals.push("样本图片中可提取到文本，可继续结合文案和定位做复核");
  }

  const summaryParts = [
    pages.length ? `命中 ${pages.length} 个公开相关页面` : "未命中明确公开页面",
    earliestPublishedAt ? `最早可提取发布时间：${new Date(earliestPublishedAt).toLocaleDateString("zh-CN")}` : "",
    lowRiskPageCount ? `${lowRiskPageCount} 个低风险域名页面` : "",
    fullMatchingImageUrls.length ? `${fullMatchingImageUrls.length} 条完整匹配图片` : "",
    partialMatchingImageUrls.length ? `${partialMatchingImageUrls.length} 条局部匹配图片` : "",
    bestGuessLabels.length ? `最佳猜测标签：${bestGuessLabels.join(" / ")}` : "",
  ].filter(Boolean);

  return {
    provider: "google-vision",
    summary: summaryParts.join("；"),
    matchedPageCount: pages.length,
    fullMatchingImageCount: fullMatchingImageUrls.length,
    partialMatchingImageCount: partialMatchingImageUrls.length,
    visuallySimilarImageCount: visuallySimilarImageUrls.length,
    bestGuessLabels,
    webEntities,
    extractedText,
    riskSignals,
    earliestPublishedAt: earliestPublishedAt || undefined,
    datedPageCount: datedPages.length,
    lowRiskPageCount,
    matchingPages: pages,
    fullMatchingImageUrls,
    partialMatchingImageUrls,
    visuallySimilarImageUrls,
  };
}

function buildCoverageResponse(input: DetectInput, evidence: ImageEvidence) {
  const topPages = evidence.matchingPages
    .slice(0, 3)
    .map((page, index) => {
      const date = page.publishedAt ? `，发布时间 ${new Date(page.publishedAt).toLocaleDateString("zh-CN")}` : "";
      return `${index + 1}. ${page.title || page.domain || page.url}（${page.domain || page.url}，${page.riskLabel}${date}）`;
    })
    .join("；");

  return [
    `${input.brandName} 在公开网页图源检索中命中了 ${evidence.matchedPageCount} 个相关页面。`,
    evidence.earliestPublishedAt
      ? `当前可提取到的最早发布时间为 ${new Date(evidence.earliestPublishedAt).toLocaleDateString("zh-CN")}。`
      : "",
    evidence.fullMatchingImageCount
      ? `其中发现 ${evidence.fullMatchingImageCount} 条完整匹配图片结果。`
      : "暂未发现完整匹配图片结果。",
    topPages ? `靠前页面包括：${topPages}。` : "",
  ]
    .filter(Boolean)
    .join("");
}

function buildDescriptionResponse(input: DetectInput, evidence: ImageEvidence) {
  const labels = evidence.bestGuessLabels.length
    ? `Google Vision 最佳猜测标签包括：${evidence.bestGuessLabels.join("、")}。`
    : "";
  const entities = evidence.webEntities.length
    ? `关联实体包括：${evidence.webEntities.join("、")}。`
    : "";
  const text = evidence.extractedText
    ? `图片 OCR 文本：${evidence.extractedText.replace(/\s+/g, " ").slice(0, 160)}。`
    : "";

  return [
    `${input.brandName} 主要展示与 ${input.industry} 相关的内容。`,
    `样本描述：${input.businessSummary}。`,
    labels,
    entities,
    text,
  ]
    .filter(Boolean)
    .join("");
}

function buildSourceResponse(evidence: ImageEvidence) {
  const pageDomains = evidence.matchingPages
    .map((page) =>
      page.domain
        ? `${page.domain}（${page.riskLabel}${page.publishedAt ? `，${new Date(page.publishedAt).toLocaleDateString("zh-CN")}` : ""}）`
        : page.url
    )
    .filter(Boolean);
  const sourceLine = pageDomains.length ? `来源：${dedupe(pageDomains).slice(0, 8).join("、")}。` : "未发现明确来源。";
  const signalLine = evidence.riskSignals.length ? `线索：${evidence.riskSignals.join("；")}。` : "";
  return `${sourceLine}${signalLine}`;
}

export function buildEvidenceBackedResult(params: {
  input: DetectInput;
  model: string;
  evidence: ImageEvidence;
}): ResultItem {
  const item = buildResultItem({
    input: params.input,
    model: params.model,
    source: "real",
    coverageResponse: buildCoverageResponse(params.input, params.evidence),
    descriptionResponse: buildDescriptionResponse(params.input, params.evidence),
    sourceResponse: buildSourceResponse(params.evidence),
    notes: params.evidence.riskSignals,
  });

  return scoreResultItem({
    ...item,
    authority: {
      ...item.authority,
      strongSourceCount: params.evidence.lowRiskPageCount,
      datedSourceCount: params.evidence.datedPageCount,
    },
  });
}
