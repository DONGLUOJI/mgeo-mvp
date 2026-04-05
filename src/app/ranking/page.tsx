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
import { INDUSTRY_OPTIONS, RANKING_TABS, type PlatformKey, type RankingTabKey } from "@/lib/ranking/shared";

function isTab(value?: string): value is RankingTabKey {
  return RANKING_TABS.some((tab) => tab.key === value);
}

function getTabHref(tab: RankingTabKey, currentIndustry: string, currentDays: number, currentPlatform?: string) {
  const params = new URLSearchParams();
  params.set("tab", tab);

  if (currentIndustry !== "全部") params.set("industry", currentIndustry);
  if (currentDays !== 30) params.set("days", String(currentDays));
  if (currentPlatform && tab === "platform") params.set("platform", currentPlatform);

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
  }>;
}) {
  const params = (await searchParams) || {};
  const currentTab: RankingTabKey = isTab(params.tab) ? params.tab : "industry";
  const currentIndustry = INDUSTRY_OPTIONS.includes((params.industry || "全部") as (typeof INDUSTRY_OPTIONS)[number])
    ? params.industry || "全部"
    : "全部";
  const currentDays = [7, 30, 90].includes(Number(params.days)) ? Number(params.days) : 30;
  const currentPlatform = params.platform as PlatformKey | undefined;

  const [industryData, platformData, trendingData, moversData] = await Promise.all([
    getIndustryRankingData({
      industry: currentIndustry,
      days: currentDays,
      limit: 60,
    }),
    getPlatformCoverageData({
      industry: currentIndustry,
      platform: currentPlatform,
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

  return (
    <SiteShell current="/ranking" ctaHref="/register" ctaLabel="注册">
      <main style={styles.page}>
        <div style={styles.wrap}>
          <BrandSearchBox />

          <section style={styles.tabCard}>
            <div style={styles.tabIntro}>
              <div style={styles.tabEyebrow}>多维排名</div>
              <h2 style={styles.tabTitle}>让品牌方每周都回来一次，不靠一句口号，靠持续变化的数据面板</h2>
              <p style={styles.tabText}>这一版先按你文档把结构搭完整：搜索品牌、切换板块、看变化、再转去免费检测。后面你给真实 API 后，我们再把数据更新频率做扎实。</p>
            </div>

            <div style={styles.tabBar}>
              {RANKING_TABS.map((tab) => {
                const active = tab.key === currentTab;
                return (
                  <Link
                    key={tab.key}
                    href={getTabHref(tab.key, currentIndustry, currentDays, currentPlatform)}
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
                  industries={INDUSTRY_OPTIONS}
                  platformStats={platformData.platformStats}
                  brands={platformData.brands}
                />
              ) : null}

              {currentTab === "trending" ? (
                <TrendingQueries queries={trendingData.queries} industries={INDUSTRY_OPTIONS} currentIndustry={currentIndustry} />
              ) : null}

              {currentTab === "movers" ? (
                <MoversBoard risers={moversData.risers} fallers={moversData.fallers} industryTrends={moversData.industryTrends} />
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
  tabIntro: {
    marginBottom: 22,
    paddingBottom: 20,
    borderBottom: "1px solid #eceff3",
  },
  tabEyebrow: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#0a7c66",
  },
  tabTitle: {
    margin: "10px 0 0",
    fontSize: 34,
    lineHeight: 1.08,
    letterSpacing: "-0.04em",
    color: "#111827",
    maxWidth: 900,
  },
  tabText: {
    margin: "12px 0 0",
    fontSize: 16,
    lineHeight: 1.7,
    color: "#6b7280",
    maxWidth: 880,
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
