import { listRankingObservationTrending, listRankingSnapshots } from "@/lib/db/repository";
import {
  FEATURED_CITY_NAMES,
  INDUSTRY_OPTIONS,
  PLATFORM_LABELS,
  PLATFORM_OPTIONS,
  SUPPORTED_CITIES,
  type PlatformDetail,
  type PlatformKey,
  type SupportedCityName,
} from "@/lib/ranking/shared";

export { FEATURED_CITY_NAMES, INDUSTRY_OPTIONS, PLATFORM_LABELS, PLATFORM_OPTIONS, SUPPORTED_CITIES } from "@/lib/ranking/shared";
export type { PlatformDetail, PlatformKey, RankedBrand, RankingTabKey, TrendingQueryRow, SupportedCityName } from "@/lib/ranking/shared";

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

const INDUSTRY_AVERAGE_TARGETS = {
  新茶饮: 68,
  餐饮连锁: 72,
  教培: 60,
  家政服务: 48,
  美妆护肤: 65,
  企业服务: 63,
} as const;

const PLATFORM_PREFERENCES: Record<string, PlatformKey[]> = {
  新茶饮: ["doubao", "yuanbao", "qianwen", "wenxin", "deepseek", "kimi"],
  餐饮连锁: ["doubao", "wenxin", "yuanbao", "qianwen", "deepseek", "kimi"],
  教培: ["deepseek", "kimi", "doubao", "qianwen", "wenxin", "yuanbao"],
  家政服务: ["doubao", "wenxin", "qianwen", "yuanbao", "deepseek", "kimi"],
  美妆护肤: ["yuanbao", "doubao", "wenxin", "qianwen", "deepseek", "kimi"],
  企业服务: ["deepseek", "kimi", "qianwen", "doubao", "wenxin", "yuanbao"],
};

const CITY_QUERY_HINTS: Record<string, string[]> = {
  深圳: ["深圳推荐好喝的奶茶品牌", "深圳哪家奶茶好喝", "深圳附近家政推荐"],
  杭州: ["杭州推荐好喝的奶茶品牌", "杭州少儿编程培训机构推荐", "杭州企业协同工具推荐"],
  成都: ["成都火锅品牌推荐", "成都本地奶茶推荐", "成都家政公司哪家靠谱"],
};

function brandHash(input: string) {
  return Array.from(input).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function rotateValues<T>(values: readonly T[], offset: number) {
  const normalized = ((offset % values.length) + values.length) % values.length;
  return values.slice(normalized).concat(values.slice(0, normalized));
}

function getPositionRange(score: number) {
  if (score >= 90) return [1, 3] as const;
  if (score >= 80) return [1, 4] as const;
  if (score >= 70) return [2, 6] as const;
  if (score >= 60) return [3, 7] as const;
  if (score >= 50) return [4, 8] as const;
  if (score >= 40) return [6, 9] as const;
  return [7, 10] as const;
}

function buildPlatformDetail(row: RankingSnapshotBase) {
  if (row.platformDetail) {
    return row.platformDetail;
  }

  const hash = brandHash(`${row.industry}-${row.brandName}`);
  const preferences = PLATFORM_PREFERENCES[row.industry] || PLATFORM_OPTIONS.map((item) => item.key);
  const orderedPlatforms = rotateValues(preferences, hash % preferences.length);
  const activeKeys = new Set<PlatformKey>(orderedPlatforms.slice(0, row.platformCoverage));
  const [minPosition, maxPosition] = getPositionRange(row.tcaTotal);
  const span = maxPosition - minPosition + 1;

  return Object.fromEntries(
    PLATFORM_OPTIONS.map((platform, index) => {
      const mentioned = activeKeys.has(platform.key);
      const preferenceIndex = orderedPlatforms.indexOf(platform.key);
      const positionSeed = brandHash(`${row.brandName}-${platform.key}-${row.tcaTotal}`) + index * 3;
      const position = mentioned ? Math.min(10, minPosition + (positionSeed % span) + Math.max(0, preferenceIndex - 1)) : null;

      let sentiment: PlatformDetail["sentiment"] = null;
      if (mentioned) {
        if (position !== null && (position <= 3 || (row.tcaTotal >= 82 && preferenceIndex <= 1))) {
          sentiment = "positive";
        } else if (position !== null && (position >= 8 || row.tcaTotal < 45)) {
          sentiment = "negative";
        } else {
          sentiment = "neutral";
        }
      }

      return [
        platform.key,
        {
          mentioned,
          position,
          sentiment,
        },
      ];
    })
  ) as Record<PlatformKey, PlatformDetail>;
}

async function getLatestSnapshots(days = 30, city: string = "全国") {
  const rows = await listRankingSnapshots({ days, city, limit: 240 });
  const deduped = new Map<string, RankingSnapshotBase>();

  rows.forEach((row) => {
    const key = `${row.city}-${row.brandName}`;
    if (!deduped.has(key)) {
      deduped.set(key, row);
    }
  });

  return Array.from(deduped.values());
}

function enrichRankingRows(rows: RankingSnapshotBase[], nationalBrandNames: Set<string>) {
  return rows
    .sort((left, right) => right.tcaTotal - left.tcaTotal)
    .map((row, index) => ({
      rank: index + 1,
      brandName: row.brandName,
      industry: row.industry,
      city: row.city,
      marketScope:
        row.brandType === "local"
          ? ("local" as const)
          : row.city !== "全国" && !nationalBrandNames.has(row.brandName)
            ? ("local" as const)
            : ("national" as const),
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
  city?: string;
  days?: number;
  limit?: number;
  offset?: number;
  q?: string;
}) {
  const { industry, city = "全国", days = 30, limit = 50, offset = 0, q } = options || {};
  const snapshots = await getLatestSnapshots(days, city);
  const nationalSnapshots = city === "全国" ? snapshots : await getLatestSnapshots(days, "全国");
  const nationalBrandNames = new Set(nationalSnapshots.map((item) => item.brandName));
  const keyword = q?.trim().toLowerCase();

  const filtered = snapshots.filter((row) => {
    const matchIndustry = !industry || industry === "全部" || row.industry === industry;
    const matchQuery = !keyword || row.brandName.toLowerCase().includes(keyword);
    return matchIndustry && matchQuery;
  });

  const brands = enrichRankingRows(filtered, nationalBrandNames);
  const paged = brands.slice(offset, offset + limit);

  return {
    total: brands.length,
    snapshotDate: brands[0]?.snapshotDate || "2026-04-05",
    city,
    cityQueryHints: CITY_QUERY_HINTS[city] || [],
    overview: {
      topRiser: brands[0]
        ? [...brands].sort((left, right) => right.change7d - left.change7d)[0]
        : null,
      topFaller: brands[0]
        ? [...brands].sort((left, right) => left.change7d - right.change7d)[0]
        : null,
      averageScore: {
        current: brands.length ? Number((brands.reduce((sum, row) => sum + row.tcaTotal, 0) / brands.length).toFixed(1)) : 0,
        change: brands.length
          ? Number(
              (
                brands.reduce((sum, row) => sum + row.tcaTotal, 0) / brands.length -
                brands.reduce((sum, row) => sum + row.prevTcaTotal, 0) / brands.length
              ).toFixed(1)
            )
          : 0,
        totalBrands: brands.length,
        totalIndustries: new Set(filtered.map((row) => row.industry)).size || new Set(snapshots.map((row) => row.industry)).size,
      },
    },
    brands: paged,
  };
}

export async function getPlatformCoverageData(options?: {
  industry?: string;
  city?: string;
  platform?: PlatformKey;
  coverage?: "low" | "medium" | "high";
  limit?: number;
  offset?: number;
}) {
  const { industry, city = "全国", platform, coverage, limit = 50, offset = 0 } = options || {};
  const industryData = await getIndustryRankingData({
    industry,
    city,
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
  city?: string;
  days?: number;
  limit?: number;
  offset?: number;
}) {
  const { industry, city = "全国", days = 30, limit = 20, offset = 0 } = options || {};
  const realRows = await listRankingObservationTrending({ industry, city, days, limit: limit + offset });

  if (realRows.length) {
    return {
      queries: realRows.slice(offset, offset + limit),
    };
  }

  const cityHasData = SUPPORTED_CITIES.find((item) => item.name === city)?.hasData ?? city === "全国";
  const availableCityIndustries = new Set(
    city === "全国"
      ? INDUSTRY_OPTIONS.filter((item) => item !== "全部")
      : (await getLatestSnapshots(30, city)).map((row) => row.industry),
  );
  const filtered = (cityHasData
    ? TRENDING_SEEDS.filter((row) => (!industry || industry === "全部" || row.industry === industry) && availableCityIndustries.has(row.industry))
    .map((row, index) => ({
      rank: index + 1,
      queryText:
        city === "全国" || row.queryText.includes(city)
          ? row.queryText
          : row.industry === "新茶饮"
            ? `${city}${row.queryText}`
            : `${city}${row.queryText.replace(/推荐|排行|品牌/g, "")}`.trim(),
      industry: row.industry,
      city,
      heatScore: row.heatScore,
      brandCount: row.brandsMentioned.length,
      trendDirection: row.trendDirection,
      brandsMentioned: row.brandsMentioned,
    }))
    : []
  ).slice(offset, offset + limit);

  return { queries: filtered };
}

export async function getMoversData(options?: {
  industry?: string;
  city?: string;
  days?: number;
  limit?: number;
}) {
  const { industry, city = "全国", days = 7, limit = 10 } = options || {};
  const industryData = await getIndustryRankingData({
    industry,
    city,
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

  const activeIndustries = city === "全国"
    ? INDUSTRY_OPTIONS.filter((item) => item !== "全部")
    : Array.from(new Set(industryData.brands.map((item) => item.industry)));

  const cityPenalty = city === "全国" ? 0 : 12;
  const industryTrends = activeIndustries.map((industryName) => {
    const target = (INDUSTRY_AVERAGE_TARGETS[industryName as keyof typeof INDUSTRY_AVERAGE_TARGETS] || 60) - cityPenalty;

    return {
      industry: industryName,
      data: Array.from({ length: 12 }, (_, index) => {
        const swing = ((index % 4) - 1.5) * 1.4;
        const recovery = index > 7 ? (index - 7) * 0.6 : 0;
        return {
          week: `W${index + 1}`,
          avgScore: Number((target - 4 + swing + recovery).toFixed(1)),
        };
      }),
    };
  });

  return { risers, fallers, industryTrends };
}
