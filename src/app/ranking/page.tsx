import type { Metadata } from "next";
import Link from "next/link";

import { SiteShell } from "@/components/marketing/SiteShell";
import { BrandSearchBox } from "@/components/ranking/brand-search-box";
import { CityRequestPanel } from "@/components/ranking/city-request-panel";
import { IndustryLeaderboard } from "@/components/ranking/industry-leaderboard";
import { MoversBoard } from "@/components/ranking/movers-board";
import { PlatformCoverage } from "@/components/ranking/platform-coverage";
import { TrendingQueries } from "@/components/ranking/trending-queries";
import {
  FEATURED_CITY_NAMES,
  getIndustryRankingData,
  getMoversData,
  getPlatformCoverageData,
  SUPPORTED_CITIES,
  getTrendingQueriesData,
} from "@/lib/ranking/data";
import {
  INDUSTRY_OPTIONS,
  PLATFORM_LABELS,
  RANKING_TABS,
  buildRankingHref,
  getCityMeta,
  isSupportedCity,
  type PlatformKey,
  type RankingTabKey,
} from "@/lib/ranking/shared";

export const metadata: Metadata = {
  title: "AI可见性排名 - 董逻辑MGEO",
  description: "实时追踪各行业品牌在 6 大 AI 平台的可见性表现与排名变化。",
};

function isTab(value?: string): value is RankingTabKey {
  return RANKING_TABS.some((tab) => tab.key === value);
}

function getTabHref(
  tab: RankingTabKey,
  currentCity: string,
  currentIndustry: string,
  currentDays: number,
  currentPlatform?: string,
  currentCoverage?: string
) {
  return buildRankingHref({
    tab,
    city: currentCity,
    industry: currentIndustry,
    days: currentDays,
    platform: tab === "platform" ? currentPlatform : undefined,
    coverage: tab === "platform" ? currentCoverage : undefined,
  });
}

export default async function RankingPage({
  searchParams,
}: {
  searchParams?: Promise<{
    tab?: string;
    city?: string;
    industry?: string;
    days?: string;
    platform?: string;
    coverage?: string;
    focusBrand?: string;
  }>;
}) {
  const params = (await searchParams) || {};
  const currentTab: RankingTabKey = isTab(params.tab) ? params.tab : "industry";
  const currentCity = isSupportedCity(params.city) ? params.city : "全国";
  const currentIndustry = INDUSTRY_OPTIONS.includes((params.industry || "全部") as (typeof INDUSTRY_OPTIONS)[number])
    ? params.industry || "全部"
    : "全部";
  const currentDays = [7, 30, 90].includes(Number(params.days)) ? Number(params.days) : 30;
  const currentPlatform = params.platform as PlatformKey | undefined;
  const currentCoverage = params.coverage as "low" | "medium" | "high" | undefined;
  const focusBrand = params.focusBrand || "";

  const [industryData, platformData, trendingData, moversData] = await Promise.all([
    getIndustryRankingData({
      city: currentCity,
      industry: currentIndustry,
      days: currentDays,
      limit: 60,
    }),
    getPlatformCoverageData({
      city: currentCity,
      industry: currentIndustry,
      platform: currentPlatform,
      coverage: currentCoverage,
      limit: 40,
    }),
    getTrendingQueriesData({
      city: currentCity,
      industry: currentIndustry,
      limit: 12,
    }),
    getMoversData({
      city: currentCity,
      industry: currentIndustry,
      days: 7,
      limit: 10,
    }),
  ]);

  const strongestPlatformEntry = Object.entries(platformData.platformStats).sort((a, b) => b[1].rate - a[1].rate)[0];
  const focusedBrand = focusBrand ? industryData.brands.find((brand) => brand.brandName === focusBrand) || null : null;
  const platformOverview = {
    trackedBrands: platformData.brands.length,
    averageCoverageRate: platformData.brands.length
      ? Math.round((platformData.brands.reduce((sum, brand) => sum + brand.coverageRate, 0) / platformData.brands.length) * 100)
      : 0,
    strongestPlatform: strongestPlatformEntry ? PLATFORM_LABELS[strongestPlatformEntry[0] as PlatformKey] : "豆包",
  };
  const hottestQuery = [...trendingData.queries].sort((a, b) => b.heatScore - a.heatScore)[0];
  const trendingOverview = {
    questionCount: trendingData.queries.length,
    totalRecommendedBrands: trendingData.queries.reduce((sum, query) => sum + query.brandCount, 0),
    hottestQuestion: hottestQuery?.queryText || "-",
  };
  const moversOverview = {
    topRiser: moversData.risers[0] ? `${moversData.risers[0].brandName} ↑ ${moversData.risers[0].change.toFixed(1)}` : "-",
    topFaller: moversData.fallers[0] ? `${moversData.fallers[0].brandName} ↓ ${Math.abs(moversData.fallers[0].change).toFixed(1)}` : "-",
    trackedWeeks: moversData.industryTrends[0]?.data.length || 12,
  };
  const currentCityMeta = getCityMeta(currentCity);
  const hasCityData = currentCity === "全国" || industryData.total > 0;
  const moreCities = SUPPORTED_CITIES.filter((item) => !FEATURED_CITY_NAMES.includes(item.name as (typeof FEATURED_CITY_NAMES)[number]));
  const citySummary = currentCity === "全国"
    ? "查看全国品牌在 AI 搜索中的综合表现，适合观察行业头部与整体趋势。"
    : `切换到 ${currentCity} 后，榜单会优先反映本地推荐场景，更适合本地品牌和区域连锁判断自己在城市搜索中的位置。`;

  return (
    <SiteShell current="/ranking">
      <main style={styles.page}>
        <div style={styles.wrap}>
          <BrandSearchBox
            currentCity={currentCity}
            initialQuery={focusBrand}
            initialResult={
              focusedBrand
                ? {
                    found: true,
                    brand: {
                      rank: focusedBrand.rank,
                      brand_name: focusedBrand.brandName,
                      tca_total: focusedBrand.tcaTotal,
                      industry: focusedBrand.industry,
                    },
                  }
                : null
            }
          />

          <section style={styles.tabCard}>
            <div style={styles.tabBar}>
              {RANKING_TABS.map((tab) => {
                const active = tab.key === currentTab;
                return (
                  <Link
                    key={tab.key}
                    href={getTabHref(tab.key, currentCity, currentIndustry, currentDays, currentPlatform, currentCoverage)}
                    style={{ ...styles.tabLink, ...(active ? styles.tabLinkActive : {}) }}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>

            <div style={styles.cityFilterShell}>
              <div style={styles.cityHeader}>
                <div>
                  <div style={styles.cityLabel}>城市 / 区域维度</div>
                  <div style={styles.cityTitleRow}>
                    <h2 style={styles.cityTitle}>{currentCityMeta.name}</h2>
                    <span style={{ ...styles.cityStatus, ...(currentCityMeta.hasData ? styles.cityStatusLive : styles.cityStatusSoon) }}>
                      {currentCityMeta.hasData ? "已上线" : "收录中"}
                    </span>
                  </div>
                  <p style={styles.citySummary}>{citySummary}</p>
                </div>
                <div style={styles.cityMetaCard}>
                  <div style={styles.cityMetaLabel}>当前区域</div>
                  <div style={styles.cityMetaValue}>{currentCityMeta.region}</div>
                  <div style={styles.cityMetaSub}>{currentCityMeta.hasData ? "城市榜单已可查看" : "预计 1-2 周内补齐数据"}</div>
                </div>
              </div>
              <div style={styles.cityRow}>
                {FEATURED_CITY_NAMES.map((cityName) => {
                  const active = cityName === currentCity;
                  return (
                    <Link
                      key={cityName}
                      href={buildRankingHref({ tab: currentTab, city: cityName, industry: currentIndustry, days: currentDays, platform: currentPlatform, coverage: currentCoverage })}
                      style={{ ...styles.cityChip, ...(active ? styles.cityChipActive : {}) }}
                    >
                      {cityName}
                    </Link>
                  );
                })}

                {moreCities.length ? (
                  <CityRequestPanel
                    cities={moreCities}
                    currentTab={currentTab}
                    currentCity={currentCity}
                    currentIndustry={currentIndustry}
                    currentDays={currentDays}
                    currentPlatform={currentPlatform}
                    currentCoverage={currentCoverage}
                  />
                ) : null}
              </div>
            </div>

            <div style={styles.content}>
              {!hasCityData ? (
                <section style={styles.emptyState}>
                  <div style={styles.emptyIcon}>📍</div>
                  <h2 style={styles.emptyTitle}>{currentCity} 的品牌数据正在收录中</h2>
                  <p style={styles.emptyText}>
                    我们正在收录 {currentCityMeta.name} 地区的品牌数据，预计 1-2 周内上线。你也可以现在就先检测自己的品牌在 {currentCityMeta.name} 的 AI 可见性。
                  </p>
                  <Link href={`/detect?city=${encodeURIComponent(currentCityMeta.name)}`} style={styles.emptyButton}>
                    免费检测你的品牌
                  </Link>
                </section>
              ) : null}

              {hasCityData && currentTab === "industry" ? (
                <IndustryLeaderboard
                  brands={industryData.brands}
                  industries={INDUSTRY_OPTIONS}
                  currentCity={currentCity}
                  currentIndustry={currentIndustry}
                  currentDays={currentDays}
                  focusBrand={focusBrand}
                  cityQueryHints={industryData.cityQueryHints}
                  overview={industryData.overview}
                />
              ) : null}

              {hasCityData && currentTab === "platform" ? (
                <PlatformCoverage
                  currentCity={currentCity}
                  currentIndustry={currentIndustry}
                  currentPlatform={currentPlatform}
                  currentCoverage={currentCoverage}
                  industries={INDUSTRY_OPTIONS}
                  overview={platformOverview}
                  platformStats={platformData.platformStats}
                  brands={platformData.brands}
                />
              ) : null}

              {hasCityData && currentTab === "trending" ? (
                <TrendingQueries
                  queries={trendingData.queries}
                  industries={INDUSTRY_OPTIONS}
                  currentCity={currentCity}
                  currentIndustry={currentIndustry}
                  overview={trendingOverview}
                />
              ) : null}

              {hasCityData && currentTab === "movers" ? (
                <MoversBoard
                  currentCity={currentCity}
                  risers={moversData.risers}
                  fallers={moversData.fallers}
                  overview={moversOverview}
                  industryTrends={moversData.industryTrends}
                />
              ) : null}
            </div>
          </section>

          <section style={styles.ctaSection}>
            {hasCityData && currentTab === "industry" ? (
              <>
                <div>
                  <div style={styles.ctaTitle}>想让你的品牌进入 TOP 10？</div>
                  <div style={styles.ctaText}>先做一次免费检测，拿到 TCA 基线和平台覆盖缺口，再决定优化动作。</div>
                </div>
                <div style={styles.ctaActions}>
                  <Link href="/detect" style={styles.ctaPrimary}>
                    免费检测
                  </Link>
                  <Link href="/pricing" style={styles.ctaSecondary}>
                    查看优化方案
                  </Link>
                </div>
              </>
            ) : null}

            {hasCityData && currentTab === "platform" ? (
              <>
                <div>
                  <div style={styles.ctaTitle}>你的品牌覆盖了几个平台？</div>
                  <div style={styles.ctaText}>先补齐缺失平台，再谈排名提升。平台覆盖本身就是用户持续回看的核心指标。</div>
                </div>
                <div style={styles.ctaActions}>
                  <Link href="/detect" style={styles.ctaPrimary}>
                    立即检测覆盖率
                  </Link>
                </div>
              </>
            ) : null}

            {hasCityData && currentTab === "trending" ? (
              <>
                <div>
                  <div style={styles.ctaTitle}>你的品牌在这些热搜问题中被推荐了吗？</div>
                  <div style={styles.ctaText}>围绕热门问题做内容，是把品牌送进 AI 推荐答案的最快路径之一。</div>
                </div>
                <div style={styles.ctaActions}>
                  <Link href="/detect" style={styles.ctaPrimary}>
                    检测你的品牌
                  </Link>
                </div>
              </>
            ) : null}

            {hasCityData && currentTab === "movers" ? (
              <>
                <div>
                  <div style={styles.ctaTitle}>不想排名下跌？</div>
                  <div style={styles.ctaText}>先建立监控节奏，再把排名波动、竞品对比和周度复盘串起来。</div>
                </div>
                <div style={styles.ctaActions}>
                  <Link href="/register" style={styles.ctaPrimary}>
                    注册免费版
                  </Link>
                  <Link href="/pricing" style={styles.ctaSecondary}>
                    升级方案
                  </Link>
                </div>
              </>
            ) : null}
          </section>
        </div>
      </main>
    </SiteShell>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "#f6f7f8",
    padding: "32px 0 72px",
  },
  wrap: {
    maxWidth: 1240,
    margin: "0 auto",
    padding: "0 24px",
    display: "grid",
    gap: 24,
  },
  tabCard: {
    background: "#ffffff",
    borderRadius: 28,
    border: "1px solid #e5e7eb",
    padding: 24,
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.04)",
  },
  cityFilterShell: {
    display: "grid",
    gap: 10,
    marginBottom: 22,
    padding: "18px 18px 16px",
    borderRadius: 22,
    background: "linear-gradient(180deg, #fbfcfd 0%, #f6f8fb 100%)",
    border: "1px solid #e7ebf1",
  },
  cityHeader: {
    display: "grid",
    gridTemplateColumns: "1fr 220px",
    gap: 18,
    alignItems: "start",
  },
  cityLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: 800,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  cityTitleRow: {
    marginTop: 8,
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  cityTitle: {
    margin: 0,
    fontSize: 34,
    lineHeight: 1.05,
    letterSpacing: "-0.04em",
    color: "#111827",
  },
  cityStatus: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 30,
    padding: "0 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
  },
  cityStatusLive: {
    background: "#e9faf4",
    color: "#0a7c66",
  },
  cityStatusSoon: {
    background: "#f3f4f6",
    color: "#6b7280",
  },
  citySummary: {
    margin: "10px 0 0",
    maxWidth: 760,
    fontSize: 15,
    lineHeight: 1.8,
    color: "#667085",
  },
  cityMetaCard: {
    padding: "16px 18px",
    borderRadius: 18,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
  },
  cityMetaLabel: {
    fontSize: 12,
    fontWeight: 800,
    color: "#8a8a8a",
  },
  cityMetaValue: {
    marginTop: 8,
    fontSize: 24,
    lineHeight: 1.1,
    fontWeight: 800,
    color: "#111827",
  },
  cityMetaSub: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 1.6,
    color: "#6b7280",
  },
  cityRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
    overflowX: "auto",
    paddingBottom: 2,
  },
  cityChip: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 38,
    padding: "6px 16px",
    borderRadius: 999,
    textDecoration: "none",
    background: "#ffffff",
    border: "1px solid #d8dde5",
    color: "#666666",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    listStyle: "none",
    boxShadow: "0 1px 0 rgba(15, 23, 42, 0.02)",
  },
  cityChipActive: {
    background: "linear-gradient(135deg, #202328 0%, #353a42 100%)",
    color: "#ffffff",
    borderColor: "#202328",
    boxShadow: "0 10px 24px rgba(17, 24, 39, 0.18)",
  },
  tabBar: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
    marginBottom: 24,
  },
  tabLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    borderRadius: 16,
    textDecoration: "none",
    background: "#f3f4f6",
    color: "#111827",
    fontSize: 16,
    fontWeight: 800,
  },
  tabLinkActive: {
    background: "#111827",
    color: "#ffffff",
  },
  content: {
    minHeight: 520,
  },
  emptyState: {
    minHeight: 520,
    borderRadius: 28,
    border: "1px dashed #d6dbe3",
    background: "#fafafa",
    display: "grid",
    placeItems: "center",
    textAlign: "center",
    padding: "56px 24px",
  },
  emptyIcon: {
    fontSize: 42,
  },
  emptyTitle: {
    margin: "14px 0 0",
    fontSize: 34,
    lineHeight: 1.15,
    letterSpacing: "-0.03em",
    color: "#111827",
  },
  emptyText: {
    margin: "12px auto 0",
    maxWidth: 680,
    fontSize: 16,
    lineHeight: 1.8,
    color: "#6b7280",
  },
  emptyButton: {
    marginTop: 18,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 18px",
    borderRadius: 12,
    textDecoration: "none",
    background: "#0a7c66",
    color: "#ffffff",
    fontWeight: 800,
  },
  ctaSection: {
    borderRadius: 28,
    background: "#111827",
    color: "#ffffff",
    padding: "24px 26px",
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
    alignItems: "center",
    flexWrap: "wrap",
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: "-0.03em",
  },
  ctaText: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.75)",
    maxWidth: 760,
  },
  ctaActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  ctaPrimary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 18px",
    borderRadius: 12,
    background: "#ffffff",
    color: "#111827",
    textDecoration: "none",
    fontWeight: 700,
  },
  ctaSecondary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 18px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 700,
  },
};
