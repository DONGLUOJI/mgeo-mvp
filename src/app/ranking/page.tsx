import Link from "next/link";

import { SiteShell } from "@/components/marketing/SiteShell";
import { BrandSearchBox } from "@/components/ranking/brand-search-box";
import { IndustryLeaderboard } from "@/components/ranking/industry-leaderboard";
import { MoversBoard } from "@/components/ranking/movers-board";
import { PlatformCoverage } from "@/components/ranking/platform-coverage";
import { TrendingQueries } from "@/components/ranking/trending-queries";
import {
  getIndustryRankingData,
  getMoversData,
  getPlatformCoverageData,
  getTrendingQueriesData,
} from "@/lib/ranking/data";
import { INDUSTRY_OPTIONS, PLATFORM_LABELS, RANKING_TABS, type PlatformKey, type RankingTabKey } from "@/lib/ranking/shared";

function isTab(value?: string): value is RankingTabKey {
  return RANKING_TABS.some((tab) => tab.key === value);
}

function getTabHref(
  tab: RankingTabKey,
  currentIndustry: string,
  currentDays: number,
  currentPlatform?: string,
  currentCoverage?: string
) {
  const params = new URLSearchParams();
  params.set("tab", tab);

  if (currentIndustry !== "全部") params.set("industry", currentIndustry);
  if (currentDays !== 30) params.set("days", String(currentDays));
  if (currentPlatform && tab === "platform") params.set("platform", currentPlatform);
  if (currentCoverage && tab === "platform") params.set("coverage", currentCoverage);

  return `/ranking?${params.toString()}`;
}

export default async function RankingPage({
  searchParams,
}: {
  searchParams?: Promise<{
    tab?: string;
    industry?: string;
    days?: string;
    platform?: string;
    coverage?: string;
    focusBrand?: string;
  }>;
}) {
  const params = (await searchParams) || {};
  const currentTab: RankingTabKey = isTab(params.tab) ? params.tab : "industry";
  const currentIndustry = INDUSTRY_OPTIONS.includes((params.industry || "全部") as (typeof INDUSTRY_OPTIONS)[number])
    ? params.industry || "全部"
    : "全部";
  const currentDays = [7, 30, 90].includes(Number(params.days)) ? Number(params.days) : 30;
  const currentPlatform = params.platform as PlatformKey | undefined;
  const currentCoverage = params.coverage as "low" | "medium" | "high" | undefined;
  const focusBrand = params.focusBrand || "";

  const [industryData, platformData, trendingData, moversData] = await Promise.all([
    getIndustryRankingData({
      industry: currentIndustry,
      days: currentDays,
      limit: 60,
    }),
    getPlatformCoverageData({
      industry: currentIndustry,
      platform: currentPlatform,
      coverage: currentCoverage,
      limit: 40,
    }),
    getTrendingQueriesData({
      industry: currentIndustry,
      limit: 12,
    }),
    getMoversData({
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

  return (
    <SiteShell current="/ranking" ctaHref="/register" ctaLabel="注册">
      <main style={styles.page}>
        <div style={styles.wrap}>
          <BrandSearchBox
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
                    href={getTabHref(tab.key, currentIndustry, currentDays, currentPlatform, currentCoverage)}
                    style={{ ...styles.tabLink, ...(active ? styles.tabLinkActive : {}) }}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>

            <div style={styles.content}>
              {currentTab === "industry" ? (
                <IndustryLeaderboard
                  brands={industryData.brands}
                  industries={INDUSTRY_OPTIONS}
                  currentIndustry={currentIndustry}
                  currentDays={currentDays}
                  focusBrand={focusBrand}
                  overview={{
                    brandCount: industryData.overview.brandCount,
                    industryCount: industryData.overview.industryCount,
                    averageScore: industryData.overview.averageScore,
                    snapshotDate: industryData.snapshotDate,
                  }}
                />
              ) : null}

              {currentTab === "platform" ? (
                <PlatformCoverage
                  currentIndustry={currentIndustry}
                  currentPlatform={currentPlatform}
                  currentCoverage={currentCoverage}
                  industries={INDUSTRY_OPTIONS}
                  overview={platformOverview}
                  platformStats={platformData.platformStats}
                  brands={platformData.brands}
                />
              ) : null}

              {currentTab === "trending" ? (
                <TrendingQueries
                  queries={trendingData.queries}
                  industries={INDUSTRY_OPTIONS}
                  currentIndustry={currentIndustry}
                  overview={trendingOverview}
                />
              ) : null}

              {currentTab === "movers" ? (
                <MoversBoard
                  risers={moversData.risers}
                  fallers={moversData.fallers}
                  overview={moversOverview}
                  industryTrends={moversData.industryTrends}
                />
              ) : null}
            </div>
          </section>

          <section style={styles.ctaSection}>
            {currentTab === "industry" ? (
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

            {currentTab === "platform" ? (
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

            {currentTab === "trending" ? (
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

            {currentTab === "movers" ? (
              <>
                <div>
                  <div style={styles.ctaTitle}>不想排名下跌？</div>
                  <div style={styles.ctaText}>先注册建立监控节奏，后续你给 API 和自动化需求后，我再帮你把通知链路接完整。</div>
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
