export const RANKING_TABS = [
  { key: "industry", label: "行业排行" },
  { key: "platform", label: "平台覆盖" },
  { key: "trending", label: "热搜问题" },
  { key: "movers", label: "涨跌榜" },
] as const;

export type RankingTabKey = (typeof RANKING_TABS)[number]["key"];

export const INDUSTRY_OPTIONS = [
  "全部",
  "新茶饮",
  "餐饮连锁",
  "教培",
  "家政服务",
  "美妆护肤",
  "企业服务",
] as const;

export const PLATFORM_OPTIONS = [
  { key: "doubao", label: "豆包" },
  { key: "deepseek", label: "DeepSeek" },
  { key: "kimi", label: "Kimi" },
  { key: "qianwen", label: "千问" },
  { key: "yuanbao", label: "元宝" },
  { key: "wenxin", label: "文心" },
] as const;

export type PlatformKey = (typeof PLATFORM_OPTIONS)[number]["key"];

export type PlatformDetail = {
  mentioned: boolean;
  position: number | null;
  sentiment: "positive" | "neutral" | "negative" | null;
};

export type RankedBrand = {
  rank: number;
  brandName: string;
  industry: string;
  tcaTotal: number;
  tcaConsistency: number;
  tcaCoverage: number;
  tcaAuthority: number;
  platformCoverage: number;
  platformTotal: number;
  change7d: number;
  snapshotDate: string;
  prevTcaTotal: number;
  platformDetail: Record<PlatformKey, PlatformDetail>;
};

export type TrendingQueryRow = {
  rank: number;
  queryText: string;
  industry: string;
  heatScore: number;
  brandCount: number;
  trendDirection: "up" | "down" | "stable";
  brandsMentioned: Array<{
    brand: string;
    platforms: PlatformKey[];
    avgPosition: number;
  }>;
};

export function getBrandAnchorId(brandName: string) {
  return `brand-${encodeURIComponent(brandName).replace(/%/g, "").toLowerCase()}`;
}
