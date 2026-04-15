import type {
  AuthorityInsight,
  BrandDescriptionInsight,
  BrandNarrative,
  ConsistencyAssessment,
  CoverageInsight,
  DetectInput,
  ResultItem,
} from "@/lib/detect/types";

const UNKNOWN_PATTERNS = [
  "不了解",
  "不清楚",
  "不太了解",
  "没有相关信息",
  "无法确认",
  "无法判断",
  "不确定",
];

const VAGUE_SOURCE_PATTERNS = ["公开资料", "一些资料", "相关资料", "有报道", "据悉", "据相关信息"];

const SOURCE_TYPE_PATTERNS: Array<{ type: AuthorityInsight["sourceTypes"][number]; patterns: string[] }> = [
  { type: "official", patterns: ["官网", "官方网站", "官方公众号", "官方公告", "官方发布"] },
  { type: "media", patterns: ["36氪", "虎嗅", "界面", "钛媒体", "人民日报", "新华社", "媒体", "报道"] },
  { type: "community", patterns: ["知乎", "小红书", "微博", "论坛", "社区", "公众号"] },
  { type: "platform", patterns: ["百度", "微信", "抖音", "淘宝", "天猫", "京东", "亚马逊"] },
  { type: "academic", patterns: ["论文", "期刊", "研究报告", "学术", "白皮书"] },
];

function normalizeText(text: string) {
  return text.replace(/\r/g, "").trim();
}

function toLower(text: string) {
  return normalizeText(text).toLowerCase();
}

function splitBlocks(text: string) {
  return normalizeText(text)
    .split(/\n+|(?<=[。！？])/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitKeywords(text: string) {
  return text
    .split(/[，。,、；;：:\s/|]+/)
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length >= 2)
    .slice(0, 8);
}

function dedupe(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

export function buildBrandNarrative(input: DetectInput): BrandNarrative {
  return {
    oneLiner: `${input.brandName}是一个与${input.industry}相关的品牌，核心业务是${input.businessSummary}`,
    coreKeywords: dedupe([
      ...splitKeywords(input.industry),
      ...splitKeywords(input.businessSummary),
      ...splitKeywords(input.brandName),
    ]).slice(0, 8),
    forbiddenClaims: [],
    commonConflicts: [],
  };
}

function extractLikelyCompetitors(text: string, brandName: string) {
  const candidates = normalizeText(text).match(/[\u4e00-\u9fa5A-Za-z0-9·-]{2,24}/g) || [];
  return dedupe(
    candidates.filter((value) => {
      if (value === brandName) return false;
      if (value.length < 2) return false;
      if (/^(请|如果|回答|问题|品牌|来源|推荐|直接|不要|以及|一个|这个|可以)$/u.test(value)) {
        return false;
      }
      return /[A-Za-z]/.test(value) || /[\u4e00-\u9fa5]/.test(value);
    })
  ).slice(0, 5);
}

export function parseCoverage(rawText: string, brandName: string): CoverageInsight {
  const text = normalizeText(rawText);
  const blocks = splitBlocks(text);
  const lowerBrand = brandName.toLowerCase();

  let mentionPosition: number | null = null;
  let mentionContext = "";

  blocks.some((block, index) => {
    if (block.toLowerCase().includes(lowerBrand)) {
      mentionPosition = index + 1;
      mentionContext = block;
      return true;
    }
    return false;
  });

  return {
    isMentioned: mentionPosition !== null,
    mentionPosition,
    mentionContext,
    competitors: mentionContext ? extractLikelyCompetitors(mentionContext, brandName) : [],
  };
}

export function parseBrandDescription(rawText: string): BrandDescriptionInsight {
  const text = normalizeText(rawText);
  const lower = toLower(text);
  const knowsBrand = !UNKNOWN_PATTERNS.some((pattern) => lower.includes(pattern));
  const blocks = splitBlocks(text);

  const businessSummary =
    blocks.find((block) => /做什么|提供|主营|业务|服务|产品/u.test(block)) ||
    blocks[1] ||
    blocks[0] ||
    "";
  const positioningSummary =
    blocks.find((block) => /定位|理解|属于|更像|方向/u.test(block)) ||
    blocks[2] ||
    businessSummary;

  return {
    knowsBrand,
    businessSummary,
    positioningSummary,
    rawResponse: text,
  };
}

function classifySourceType(name: string): string {
  const lower = name.toLowerCase();
  const matched = SOURCE_TYPE_PATTERNS.find((item) =>
    item.patterns.some((pattern) => lower.includes(pattern.toLowerCase()))
  );

  return matched?.type || "unknown";
}

function extractSourceNames(rawText: string) {
  const names = new Set<string>();
  const blocks = splitBlocks(rawText);

  for (const block of blocks) {
    if (VAGUE_SOURCE_PATTERNS.some((pattern) => block.includes(pattern))) {
      continue;
    }

    const matchAfterColon = block.match(/(?:来源|参考|包括|例如|比如)[：:]\s*(.+)$/u);
    if (matchAfterColon?.[1]) {
      matchAfterColon[1]
        .split(/[、，,；;]/)
        .map((item) => item.trim())
        .filter((item) => item.length >= 2)
        .forEach((item) => names.add(item));
    }

    const directNames = block.match(/(?:知乎|小红书|36氪|虎嗅|界面新闻|人民日报|新华社|官网|官方网站|官方公众号|百度百科|微信公众号|抖音|微信|亚马逊|淘宝|天猫|京东|研究报告|白皮书)/g) || [];
    directNames.forEach((item) => names.add(item.trim()));
  }

  return [...names];
}

export function parseAuthority(rawText: string): AuthorityInsight {
  const text = normalizeText(rawText);
  const sourceNames = extractSourceNames(text);

  return {
    hasVerifiableSource: sourceNames.length > 0,
    sourceNames,
    sourceTypes: dedupe(sourceNames.map((item) => classifySourceType(item))),
    strongSourceCount: 0,
    datedSourceCount: 0,
    rawResponse: text,
  };
}

export function assessConsistency(
  description: BrandDescriptionInsight,
  brandNarrative: BrandNarrative
): ConsistencyAssessment {
  const combined = toLower(
    `${description.businessSummary} ${description.positioningSummary} ${description.rawResponse}`
  );
  const hitsCoreNarrative = brandNarrative.coreKeywords.some((keyword) =>
    combined.includes(keyword.toLowerCase())
  );
  const hasForbiddenClaim = (brandNarrative.forbiddenClaims || []).some((claim) =>
    combined.includes(claim.toLowerCase())
  );
  const hasCommonConflict = (brandNarrative.commonConflicts || []).some((claim) =>
    combined.includes(claim.toLowerCase())
  );
  const hasMajorConflict = description.knowsBrand && (hasForbiddenClaim || hasCommonConflict);

  let notes = "模型对品牌认知较弱";
  if (!description.knowsBrand) {
    notes = "模型未形成稳定品牌认知";
  } else if (hasMajorConflict) {
    notes = "模型知道品牌，但定位理解存在明显冲突";
  } else if (!hitsCoreNarrative) {
    notes = "模型知道品牌，但未命中核心叙事关键词";
  } else {
    notes = "模型对品牌的核心方向理解基本正确";
  }

  return {
    knowsBrand: description.knowsBrand,
    hitsCoreNarrative,
    hasMajorConflict,
    notes,
  };
}

export function assessConsistencyForInput(
  input: DetectInput,
  description: BrandDescriptionInsight
): ConsistencyAssessment {
  return assessConsistency(description, input.brandNarrative || buildBrandNarrative(input));
}

function buildConfidence(
  coverage: CoverageInsight,
  description: BrandDescriptionInsight,
  authority: AuthorityInsight
) {
  const reasons: string[] = [];

  if (!coverage.isMentioned) reasons.push("品牌未在自然回答中被提及");
  if (!description.knowsBrand) reasons.push("模型对品牌认知较弱");
  if (!authority.hasVerifiableSource) reasons.push("回答缺少可核验来源");

  if (coverage.isMentioned && description.knowsBrand && authority.hasVerifiableSource) {
    return {
      level: "high" as const,
      reasons: ["品牌被提及、被认识，且存在来源支撑"],
    };
  }

  if (coverage.isMentioned || description.knowsBrand) {
    return {
      level: "medium" as const,
      reasons: reasons.length ? reasons : ["结果具有一定参考价值，但仍需结合人工判断"],
    };
  }

  return {
    level: "low" as const,
    reasons: reasons.length ? reasons : ["结果证据不足"],
  };
}

function buildRecommendationSignal(
  coverage: CoverageInsight,
  assessment: ConsistencyAssessment,
  authority: AuthorityInsight
): ResultItem["recommendationSignal"] {
  if (!coverage.isMentioned) return "none";
  if (coverage.mentionPosition === 1 && assessment.hitsCoreNarrative && authority.hasVerifiableSource) {
    return "high";
  }
  if ((coverage.mentionPosition || 99) <= 3 || assessment.hitsCoreNarrative) {
    return "medium";
  }
  return "low";
}

export function buildResultItem(params: {
  input: DetectInput;
  model: string;
  source: "real" | "mock";
  coverageResponse: string;
  descriptionResponse: string;
  sourceResponse: string;
  notes?: string[];
}): ResultItem {
  const coverage = parseCoverage(params.coverageResponse, params.input.brandName);
  const description = parseBrandDescription(params.descriptionResponse);
  const authority = parseAuthority(params.sourceResponse);
  const consistencyAssessment = assessConsistencyForInput(params.input, description);
  const confidence = buildConfidence(coverage, description, authority);
  const positioningMatch = description.knowsBrand && consistencyAssessment.hitsCoreNarrative;
  const descriptionConsistent = description.knowsBrand && !consistencyAssessment.hasMajorConflict;
  const authoritySignal = authority.hasVerifiableSource;
  const recommendationSignal = buildRecommendationSignal(
    coverage,
    consistencyAssessment,
    authority
  );

  return {
    model: params.model,
    source: params.source,
    mentioned: coverage.isMentioned,
    positioningMatch,
    descriptionConsistent,
    authoritySignal,
    recommendationSignal,
    rawText: coverage.mentionContext || description.rawResponse || params.coverageResponse,
    notes: params.notes || [],
    coverage,
    description,
    authority,
    consistencyAssessment,
    confidence,
    scoreBreakdown: {
      consistency: 0,
      coverage: 0,
      authority: 0,
      total: 0,
    },
    raw: {
      coverageResponse: params.coverageResponse,
      descriptionResponse: params.descriptionResponse,
      sourceResponse: params.sourceResponse,
    },
  };
}
