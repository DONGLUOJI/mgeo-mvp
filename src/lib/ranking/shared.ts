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

export const PLATFORM_LABELS = Object.fromEntries(
  PLATFORM_OPTIONS.map((item) => [item.key, item.label])
) as Record<(typeof PLATFORM_OPTIONS)[number]["key"], string>;

export const INDUSTRY_THEMES = {
  全部: {
    text: "#5F5E5A",
    background: "#F1EFE8",
    border: "#E2DED2",
    line: "#7A766E",
  },
  新茶饮: {
    text: "#993C1D",
    background: "#FAECE7",
    border: "#F2D1C6",
    line: "#B85834",
  },
  餐饮连锁: {
    text: "#993C1D",
    background: "#FAECE7",
    border: "#F2D1C6",
    line: "#B85834",
  },
  教培: {
    text: "#0C447C",
    background: "#E6F1FB",
    border: "#C8DDF3",
    line: "#2D6AA8",
  },
  家政服务: {
    text: "#085041",
    background: "#E1F5EE",
    border: "#BEE7D8",
    line: "#157960",
  },
  美妆护肤: {
    text: "#72243E",
    background: "#FBEAF0",
    border: "#F0C8D6",
    line: "#A3476A",
  },
  企业服务: {
    text: "#3C3489",
    background: "#EEEDFE",
    border: "#D8D5FA",
    line: "#5E57B0",
  },
  营销咨询: {
    text: "#5F5E5A",
    background: "#F1EFE8",
    border: "#E2DED2",
    line: "#7A766E",
  },
} as const;

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

export function getIndustryTheme(industry: string) {
  return INDUSTRY_THEMES[industry as keyof typeof INDUSTRY_THEMES] || INDUSTRY_THEMES.全部;
}
