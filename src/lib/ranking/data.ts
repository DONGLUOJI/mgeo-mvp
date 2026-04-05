import { listRankingSnapshots } from "@/lib/db/repository";
import {
  INDUSTRY_OPTIONS,
  PLATFORM_LABELS,
  PLATFORM_OPTIONS,
  type PlatformDetail,
  type PlatformKey,
} from "@/lib/ranking/shared";

export { INDUSTRY_OPTIONS, PLATFORM_LABELS, PLATFORM_OPTIONS } from "@/lib/ranking/shared";
export type { PlatformDetail, PlatformKey, RankedBrand, RankingTabKey, TrendingQueryRow } from "@/lib/ranking/shared";

type RankingSnapshotBase = Awaited<ReturnType<typeof listRankingSnapshots>>[number];

const TRENDING_SEEDS = [
  {
    industry: "新茶饮",
    queryText: "推荐好喝的奶茶品牌",
    heatScore: 95,
    trendDirection: "up" as const,
    brandsMentioned: [
      { brand: "霸王茶姬", platforms: ["doubao", "deepseek", "kimi"] as PlatformKey[], avgPosition: 1.3 },
      { brand: "喜茶", platforms: ["doubao", "qianwen", "wenxin"] as PlatformKey[], avgPosition: 1.8 },
      { brand: "茶百道", platforms: ["deepseek", "kimi"] as PlatformKey[], avgPosition: 3.2 },
    ],
  },
  {
    industry: "新茶饮",
    queryText: "低糖奶茶哪个牌子好",
    heatScore: 88,
    trendDirection: "up" as const,
    brandsMentioned: [
      { brand: "喜茶", platforms: ["doubao", "deepseek", "wenxin"] as PlatformKey[], avgPosition: 1.5 },
      { brand: "奈雪的茶", platforms: ["doubao", "qianwen"] as PlatformKey[], avgPosition: 2.9 },
    ],
  },
  {
    industry: "新茶饮",
    queryText: "奶茶加盟品牌推荐",
    heatScore: 82,
    trendDirection: "stable" as const,
    brandsMentioned: [
      { brand: "蜜雪冰城", platforms: ["doubao", "deepseek", "wenxin"] as PlatformKey[], avgPosition: 1.7 },
      { brand: "古茗", platforms: ["kimi", "qianwen"] as PlatformKey[], avgPosition: 2.8 },
    ],
  },
  {
    industry: "新茶饮",
    queryText: "果茶品牌排行",
    heatScore: 75,
    trendDirection: "down" as const,
    brandsMentioned: [
      { brand: "喜茶", platforms: ["doubao", "deepseek"] as PlatformKey[], avgPosition: 1.6 },
      { brand: "奈雪的茶", platforms: ["kimi", "wenxin"] as PlatformKey[], avgPosition: 3.1 },
    ],
  },
  {
    industry: "餐饮连锁",
    queryText: "火锅品牌推荐",
    heatScore: 84,
    trendDirection: "stable" as const,
    brandsMentioned: [
      { brand: "海底捞", platforms: ["doubao", "deepseek", "kimi", "wenxin"] as PlatformKey[], avgPosition: 1.2 },
      { brand: "巴奴火锅", platforms: ["doubao", "deepseek"] as PlatformKey[], avgPosition: 2.8 },
    ],
  },
  {
    industry: "餐饮连锁",
    queryText: "家庭聚餐餐厅推荐",
    heatScore: 79,
    trendDirection: "up" as const,
    brandsMentioned: [
      { brand: "外婆家", platforms: ["doubao", "deepseek", "wenxin"] as PlatformKey[], avgPosition: 1.9 },
      { brand: "绿茶餐厅", platforms: ["doubao", "kimi"] as PlatformKey[], avgPosition: 2.6 },
    ],
  },
  {
    industry: "餐饮连锁",
    queryText: "川菜连锁品牌排行",
    heatScore: 73,
    trendDirection: "stable" as const,
    brandsMentioned: [
      { brand: "费大厨", platforms: ["doubao", "qianwen"] as PlatformKey[], avgPosition: 1.7 },
      { brand: "九毛九", platforms: ["deepseek", "wenxin"] as PlatformKey[], avgPosition: 3.3 },
    ],
  },
  {
    industry: "教培",
    queryText: "少儿思维培训哪个机构好",
    heatScore: 82,
    trendDirection: "up" as const,
    brandsMentioned: [
      { brand: "学而思", platforms: ["doubao", "deepseek", "qianwen"] as PlatformKey[], avgPosition: 1.7 },
      { brand: "火花思维", platforms: ["kimi", "wenxin"] as PlatformKey[], avgPosition: 2.6 },
    ],
  },
  {
    industry: "教培",
    queryText: "英语培训机构排行",
    heatScore: 76,
    trendDirection: "down" as const,
    brandsMentioned: [
      { brand: "新东方", platforms: ["doubao", "deepseek", "kimi", "qianwen"] as PlatformKey[], avgPosition: 1.1 },
      { brand: "高途", platforms: ["wenxin"] as PlatformKey[], avgPosition: 4.2 },
    ],
  },
  {
    industry: "教培",
    queryText: "在线一对一英语哪个好",
    heatScore: 72,
    trendDirection: "stable" as const,
    brandsMentioned: [
      { brand: "VIPKID", platforms: ["doubao", "deepseek"] as PlatformKey[], avgPosition: 1.8 },
      { brand: "51Talk", platforms: ["qianwen", "wenxin"] as PlatformKey[], avgPosition: 2.7 },
    ],
  },
  {
    industry: "教培",
    queryText: "考公培训机构推荐",
    heatScore: 81,
    trendDirection: "up" as const,
    brandsMentioned: [
      { brand: "粉笔", platforms: ["doubao", "deepseek", "kimi"] as PlatformKey[], avgPosition: 1.4 },
      { brand: "中公教育", platforms: ["qianwen", "wenxin"] as PlatformKey[], avgPosition: 2.8 },
    ],
  },
  {
    industry: "家政服务",
    queryText: "北京家政服务推荐",
    heatScore: 78,
    trendDirection: "up" as const,
    brandsMentioned: [
      { brand: "天鹅到家", platforms: ["doubao", "deepseek", "wenxin"] as PlatformKey[], avgPosition: 1.4 },
      { brand: "好慷在家", platforms: ["doubao", "kimi"] as PlatformKey[], avgPosition: 2.7 },
    ],
  },
  {
    industry: "家政服务",
    queryText: "月嫂服务平台哪个好",
    heatScore: 74,
    trendDirection: "stable" as const,
    brandsMentioned: [
      { brand: "好孕妈妈", platforms: ["doubao", "deepseek"] as PlatformKey[], avgPosition: 1.9 },
      { brand: "天鹅到家", platforms: ["doubao", "wenxin"] as PlatformKey[], avgPosition: 2.1 },
    ],
  },
  {
    industry: "家政服务",
    queryText: "上门保洁品牌推荐",
    heatScore: 76,
    trendDirection: "up" as const,
    brandsMentioned: [
      { brand: "轻喜到家", platforms: ["doubao", "deepseek", "kimi"] as PlatformKey[], avgPosition: 1.6 },
      { brand: "好慷在家", platforms: ["qianwen", "wenxin"] as PlatformKey[], avgPosition: 2.5 },
    ],
  },
  {
    industry: "美妆护肤",
    queryText: "敏感肌护肤品牌推荐",
    heatScore: 89,
    trendDirection: "up" as const,
    brandsMentioned: [
      { brand: "薇诺娜", platforms: ["doubao", "deepseek", "qianwen"] as PlatformKey[], avgPosition: 1.2 },
      { brand: "珀莱雅", platforms: ["kimi", "wenxin"] as PlatformKey[], avgPosition: 2.3 },
    ],
  },
  {
    industry: "美妆护肤",
    queryText: "国货抗老护肤品牌推荐",
    heatScore: 83,
    trendDirection: "up" as const,
    brandsMentioned: [
      { brand: "珀莱雅", platforms: ["doubao", "deepseek", "wenxin"] as PlatformKey[], avgPosition: 1.4 },
      { brand: "丸美", platforms: ["kimi", "qianwen"] as PlatformKey[], avgPosition: 2.9 },
    ],
  },
  {
    industry: "美妆护肤",
    queryText: "平价彩妆品牌推荐",
    heatScore: 77,
    trendDirection: "stable" as const,
    brandsMentioned: [
      { brand: "橘朵", platforms: ["doubao", "deepseek"] as PlatformKey[], avgPosition: 1.8 },
      { brand: "完美日记", platforms: ["kimi", "wenxin"] as PlatformKey[], avgPosition: 2.6 },
    ],
  },
  {
    industry: "企业服务",
    queryText: "企业协同办公工具推荐",
    heatScore: 91,
    trendDirection: "stable" as const,
    brandsMentioned: [
      { brand: "飞书", platforms: ["doubao", "deepseek", "kimi", "qianwen", "wenxin"] as PlatformKey[], avgPosition: 1.1 },
      { brand: "钉钉", platforms: ["doubao", "yuanbao", "wenxin"] as PlatformKey[], avgPosition: 2.0 },
    ],
  },
  {
    industry: "企业服务",
    queryText: "CRM 系统推荐",
    heatScore: 86,
    trendDirection: "up" as const,
    brandsMentioned: [
      { brand: "销售易", platforms: ["doubao", "deepseek", "qianwen"] as PlatformKey[], avgPosition: 1.6 },
      { brand: "纷享销客", platforms: ["kimi", "wenxin"] as PlatformKey[], avgPosition: 2.8 },
    ],
  },
  {
    industry: "企业服务",
    queryText: "低代码平台哪个好",
    heatScore: 80,
    trendDirection: "stable" as const,
    brandsMentioned: [
      { brand: "简道云", platforms: ["doubao", "deepseek"] as PlatformKey[], avgPosition: 1.9 },
      { brand: "伙伴云", platforms: ["qianwen", "wenxin"] as PlatformKey[], avgPosition: 2.7 },
    ],
  },
];

function brandHash(input: string) {
  return Array.from(input).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function buildPlatformDetail(row: RankingSnapshotBase) {
  const start = brandHash(row.brandName) % PLATFORM_OPTIONS.length;
  const activeKeys = new Set<PlatformKey>();

  for (let index = 0; index < row.platformCoverage; index += 1) {
    activeKeys.add(PLATFORM_OPTIONS[(start + index) % PLATFORM_OPTIONS.length].key);
  }

  return Object.fromEntries(
    PLATFORM_OPTIONS.map((platform, index) => {
      const mentioned = activeKeys.has(platform.key);
      const sentimentIndex = (brandHash(`${row.brandName}-${platform.key}`) + index) % 3;
      const sentiment = mentioned ? (["positive", "neutral", "negative"][sentimentIndex] as PlatformDetail["sentiment"]) : null;

      return [
        platform.key,
        {
          mentioned,
          position: mentioned ? ((brandHash(platform.key + row.brandName) % 5) + 1) : null,
          sentiment,
        },
      ];
    })
  ) as Record<PlatformKey, PlatformDetail>;
}

async function getLatestSnapshots(days = 30) {
  const rows = await listRankingSnapshots({ days, limit: 240 });
  const deduped = new Map<string, RankingSnapshotBase>();

  rows.forEach((row) => {
    if (!deduped.has(row.brandName)) {
      deduped.set(row.brandName, row);
    }
  });

  return Array.from(deduped.values());
}

function enrichRankingRows(rows: RankingSnapshotBase[]) {
  return rows
    .sort((left, right) => right.tcaTotal - left.tcaTotal)
    .map((row, index) => ({
      rank: index + 1,
      brandName: row.brandName,
      industry: row.industry,
      tcaTotal: row.tcaTotal,
      tcaConsistency: row.tcaConsistency,
      tcaCoverage: row.tcaCoverage,
      tcaAuthority: row.tcaAuthority,
      platformCoverage: row.platformCoverage,
      platformTotal: PLATFORM_OPTIONS.length,
      change7d: row.delta7d,
      snapshotDate: row.snapshotDate,
      prevTcaTotal: Number((row.tcaTotal - row.delta7d).toFixed(1)),
      platformDetail: buildPlatformDetail(row),
    }));
}

export async function getIndustryRankingData(options?: {
  industry?: string;
  days?: number;
  limit?: number;
  offset?: number;
  q?: string;
}) {
  const { industry, days = 30, limit = 50, offset = 0, q } = options || {};
  const snapshots = await getLatestSnapshots(days);
  const keyword = q?.trim().toLowerCase();

  const filtered = snapshots.filter((row) => {
    const matchIndustry = !industry || industry === "全部" || row.industry === industry;
    const matchQuery = !keyword || row.brandName.toLowerCase().includes(keyword);
    return matchIndustry && matchQuery;
  });

  const brands = enrichRankingRows(filtered);
  const paged = brands.slice(offset, offset + limit);

  return {
    total: brands.length,
    snapshotDate: brands[0]?.snapshotDate || "2026-04-05",
    overview: {
      brandCount: brands.length,
      industryCount: new Set(snapshots.map((row) => row.industry)).size,
      averageScore: brands.length
        ? Math.round(brands.reduce((sum, row) => sum + row.tcaTotal, 0) / brands.length)
        : 0,
    },
    brands: paged,
  };
}

export async function getPlatformCoverageData(options?: {
  industry?: string;
  platform?: PlatformKey;
  coverage?: "low" | "medium" | "high";
  limit?: number;
  offset?: number;
}) {
  const { industry, platform, coverage, limit = 50, offset = 0 } = options || {};
  const industryData = await getIndustryRankingData({
    industry,
    limit: 240,
    offset: 0,
  });

  const filteredBrands = industryData.brands.filter((brand) => {
    if (!platform) return true;
    return brand.platformDetail[platform].mentioned;
  }).filter((brand) => {
    if (!coverage) return true;
    const rate = brand.platformCoverage / brand.platformTotal;
    if (coverage === "low") return rate < 0.5;
    if (coverage === "medium") return rate >= 0.5 && rate < 0.8;
    return rate >= 0.8;
  });

  const platformStats = Object.fromEntries(
    PLATFORM_OPTIONS.map((platformItem) => {
      const covered = industryData.brands.filter((brand) => brand.platformDetail[platformItem.key].mentioned).length;
      const total = industryData.brands.length || 1;

      return [
        platformItem.key,
        {
          totalBrands: industryData.brands.length,
          covered,
          rate: Number((covered / total).toFixed(2)),
        },
      ];
    })
  ) as Record<PlatformKey, { totalBrands: number; covered: number; rate: number }>;

  return {
    platformStats,
    brands: filteredBrands.slice(offset, offset + limit).map((brand) => ({
      brandName: brand.brandName,
      industry: brand.industry,
      platforms: Object.fromEntries(
        PLATFORM_OPTIONS.map((platformItem) => [platformItem.key, brand.platformDetail[platformItem.key].mentioned])
      ) as Record<PlatformKey, boolean>,
      coverageRate: Number((brand.platformCoverage / brand.platformTotal).toFixed(2)),
    })),
  };
}

export async function getTrendingQueriesData(options?: {
  industry?: string;
  days?: number;
  limit?: number;
  offset?: number;
}) {
  const { industry, limit = 20, offset = 0 } = options || {};
  const filtered = TRENDING_SEEDS.filter((row) => !industry || industry === "全部" || row.industry === industry)
    .map((row, index) => ({
      rank: index + 1,
      queryText: row.queryText,
      industry: row.industry,
      heatScore: row.heatScore,
      brandCount: row.brandsMentioned.length,
      trendDirection: row.trendDirection,
      brandsMentioned: row.brandsMentioned,
    }))
    .slice(offset, offset + limit);

  return { queries: filtered };
}

export async function getMoversData(options?: {
  industry?: string;
  days?: number;
  limit?: number;
}) {
  const { industry, days = 7, limit = 10 } = options || {};
  const industryData = await getIndustryRankingData({
    industry,
    days,
    limit: 240,
  });

  const sortedByChange = [...industryData.brands].sort((left, right) => right.change7d - left.change7d);
  const risers = sortedByChange.slice(0, limit).map((brand) => ({
    brandName: brand.brandName,
    industry: brand.industry,
    change: brand.change7d,
    currentScore: brand.tcaTotal,
  }));
  const fallers = [...sortedByChange]
    .reverse()
    .slice(0, limit)
    .map((brand) => ({
      brandName: brand.brandName,
      industry: brand.industry,
      change: brand.change7d,
      currentScore: brand.tcaTotal,
    }));

  const industryTrends = INDUSTRY_OPTIONS.filter((item) => item !== "全部").map((industryName, industryIndex) => ({
    industry: industryName,
    data: Array.from({ length: 12 }, (_, index) => ({
      week: `W${index + 1}`,
      avgScore: 58 + industryIndex * 4 + index + ((index + industryIndex) % 3),
    })),
  }));

  return { risers, fallers, industryTrends };
}
