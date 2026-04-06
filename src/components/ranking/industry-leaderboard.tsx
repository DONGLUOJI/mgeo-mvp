import Link from "next/link";

import { IndustryTopChart } from "@/components/ranking/industry-top-chart";
import {
  CityTag,
  ChangeBadge,
  DetailTcaBar,
  IndustryTag,
  PlatformDots,
  RankBadge,
  TcaScoreBar,
} from "@/components/ranking/ranking-cell-primitives";
import { PLATFORM_OPTIONS, type RankedBrand } from "@/lib/ranking/data";
import { buildRankingHref, getBrandAnchorId, getIndustryTheme } from "@/lib/ranking/shared";
import stylesModule from "./industry-leaderboard.module.css";

type IndustryLeaderboardProps = {
  brands: RankedBrand[];
  industries: readonly string[];
  currentCity: string;
  currentIndustry: string;
  currentDays: number;
  focusBrand?: string;
  cityQueryHints?: string[];
  overview: {
    topRiser: RankedBrand | null;
    topFaller: RankedBrand | null;
    averageScore: {
      current: number;
      change: number;
      totalBrands: number;
      totalIndustries: number;
    };
  };
};

function sentimentStyle(sentiment: "positive" | "neutral" | "negative" | null) {
  if (sentiment === "positive") return { color: "#085041", background: "#E1F5EE" };
  if (sentiment === "negative") return { color: "#791F1F", background: "#FCEBEB" };
  return { color: "#5F5E5A", background: "#F1EFE8" };
}

function sentimentLabel(sentiment: "positive" | "neutral" | "negative" | null) {
  if (sentiment === "positive") return "正面";
  if (sentiment === "negative") return "负面";
  return "中性";
}

export function IndustryLeaderboard({
  brands,
  industries,
  currentCity,
  currentIndustry,
  currentDays,
  focusBrand,
  cityQueryHints = [],
  overview,
}: IndustryLeaderboardProps) {
  const selectedIndustry = currentIndustry !== "全部";
  const localBrandCount = brands.filter((brand) => brand.marketScope === "local").length;
  const nationalBrandCount = brands.filter((brand) => brand.marketScope === "national").length;
  const localBrandShare = brands.length ? Math.round((localBrandCount / brands.length) * 100) : 0;
  const displayHints =
    cityQueryHints.length > 0
      ? cityQueryHints
      : currentCity !== "全国"
        ? [
            `${currentCity}${currentIndustry === "全部" ? "本地品牌推荐" : currentIndustry + "推荐"}`,
            `${currentCity}${currentIndustry === "全部" ? "热门商家排行" : currentIndustry + "哪家好"}`,
          ]
        : [];

  return (
    <section style={styles.section}>
      <div style={styles.overviewGrid}>
        <article style={styles.overviewCard}>
          <div style={styles.overviewLabel}>{currentCity === "全国" ? "本周涨幅最大" : `${currentCity}涨幅最大`}</div>
          <div style={styles.overviewMain}>{overview.topRiser?.brandName || "-"}</div>
          <div style={styles.overviewAccentUp}>
            {overview.topRiser ? `↑ ${overview.topRiser.change7d.toFixed(1)}` : "-"}
          </div>
          <div style={styles.overviewMeta}>
            {overview.topRiser ? (
              <span style={styles.metaWrap}>
                <IndustryTag industry={overview.topRiser.industry} />
                {currentCity !== "全国" ? <CityTag city={currentCity} /> : null}
              </span>
            ) : (
              "暂无数据"
            )}
          </div>
        </article>

        <article style={styles.overviewCard}>
          <div style={styles.overviewLabel}>{currentCity === "全国" ? "本周跌幅最大" : `${currentCity}跌幅最大`}</div>
          <div style={styles.overviewMain}>{overview.topFaller?.brandName || "-"}</div>
          <div style={styles.overviewAccentDown}>
            {overview.topFaller ? `↓ ${Math.abs(overview.topFaller.change7d).toFixed(1)}` : "-"}
          </div>
          <div style={styles.overviewMeta}>
            {overview.topFaller ? (
              <span style={styles.metaWrap}>
                <IndustryTag industry={overview.topFaller.industry} />
                {currentCity !== "全国" ? <CityTag city={currentCity} /> : null}
              </span>
            ) : (
              "暂无数据"
            )}
          </div>
        </article>

        <article style={styles.overviewCard}>
          <div style={styles.overviewLabel}>{currentCity === "全国" ? "当前行业均分" : `${currentCity}本地品牌占比`}</div>
          <div style={styles.overviewMainLarge}>{currentCity === "全国" ? overview.averageScore.current.toFixed(1) : `${localBrandShare}%`}</div>
          <div
            style={{
              ...styles.overviewAccentNeutral,
              color: currentCity === "全国" ? (overview.averageScore.change >= 0 ? "#0fbc8c" : "#E24B4A") : "#35506C",
            }}
          >
            {currentCity === "全国"
              ? `较上周 ${overview.averageScore.change >= 0 ? "↑" : "↓"} ${Math.abs(overview.averageScore.change).toFixed(1)}`
              : `本地品牌 ${localBrandCount} 个 / 连锁品牌 ${nationalBrandCount} 个`}
          </div>
          <div style={styles.overviewMeta}>
            {overview.averageScore.totalIndustries} 个行业 {overview.averageScore.totalBrands} 个品牌
          </div>
        </article>
      </div>

      <div style={styles.sectionHead}>
        <div style={styles.titleWrap}>
          <h2 style={styles.title}>{currentCity === "全国" ? "行业 AI 可见性排行榜" : `${currentCity} AI 可见性排行榜`}</h2>
          {currentCity !== "全国" ? (
            <p style={styles.cityLead}>
              本地搜索场景会放大城市品牌差异。这里展示的是品牌在 <strong>{currentCity}</strong> 相关问答中的实际可见性表现。
            </p>
          ) : null}
        </div>
      </div>

      {currentCity !== "全国" ? (
        <div style={styles.localSignals}>
          <div style={styles.localSignalsHead}>
            <div style={styles.localSignalsTitle}>本地搜索场景</div>
            <div style={styles.localSignalsText}>这些更接近用户在城市里真实会问的问题，也更能体现本地商家在 AI 搜索中的存在感。</div>
          </div>
          <div style={styles.localSignalChips}>
            {displayHints.map((hint) => (
              <span key={hint} style={styles.localSignalChip}>
                {hint}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div style={styles.filters}>
        {industries.map((industry) => {
          const active = industry === currentIndustry;
          const theme = getIndustryTheme(industry);
          const href = buildRankingHref({
            tab: "industry",
            city: currentCity,
            industry,
            days: currentDays,
          });

          return (
            <Link
              key={industry}
              href={href}
              style={{
                ...styles.chip,
                color: theme.text,
                background: theme.background,
                borderColor: theme.border,
                ...(active
                  ? {
                      color: "#ffffff",
                      background: theme.text,
                      borderColor: theme.text,
                    }
                  : {}),
              }}
            >
              {industry}
            </Link>
          );
        })}
      </div>

      <div style={styles.filters}>
        {[7, 30, 90].map((days) => {
          const active = currentDays === days;
          const href = buildRankingHref({
            tab: "industry",
            city: currentCity,
            industry: currentIndustry,
            days,
          });
          return (
            <Link key={days} href={href} style={{ ...styles.chip, ...(active ? styles.chipActive : {}) }}>
              最近 {days} 天
            </Link>
          );
        })}
      </div>

      {selectedIndustry ? <IndustryTopChart data={brands.slice(0, 10)} currentCity={currentCity} /> : null}

      <div style={styles.tableCard}>
        <div style={styles.tableHead}>
          <span>{currentCity === "全国" ? "排名" : "城市排名"}</span>
          <span>品牌</span>
          <span>行业</span>
          <span>TCA 综合分</span>
          <span>平台覆盖</span>
          <span>7 天变化</span>
          <span>操作</span>
        </div>

        <div>
          {brands.map((brand, index) => {
            const focused = focusBrand === brand.brandName;

            return (
              <details
                key={brand.brandName}
                id={getBrandAnchorId(brand.brandName)}
                className={`${stylesModule.rowState} ${index % 2 === 0 ? stylesModule.odd : stylesModule.even} ${focused ? stylesModule.focused : ""}`}
                style={styles.row}
                open={focused}
              >
                <summary className={stylesModule.summaryState} style={styles.summary}>
                  <span>
                    <RankBadge rank={brand.rank} />
                  </span>
                  <span style={styles.brandCell}>
                    <span style={styles.brandName}>{brand.brandName}</span>
                    {brand.city !== "全国" ? <CityTag city={brand.city} /> : null}
                    {currentCity !== "全国" ? (
                      <span style={{ ...styles.scopeTag, ...(brand.marketScope === "local" ? styles.scopeTagLocal : styles.scopeTagNational) }}>
                        {brand.marketScope === "local" ? "本地品牌" : "全国连锁"}
                      </span>
                    ) : null}
                  </span>
                  <span>
                    <IndustryTag industry={brand.industry} />
                  </span>
                  <span>
                    <TcaScoreBar value={brand.tcaTotal} />
                  </span>
                  <span>
                    <PlatformDots coverage={brand.platformCoverage} total={brand.platformTotal} detail={brand.platformDetail} />
                  </span>
                  <span>
                    <ChangeBadge value={brand.change7d} />
                  </span>
                  <span style={styles.actions}>详情 / 对比</span>
                </summary>

                <div style={styles.expand}>
                  <div style={styles.expandGrid}>
                    <div style={styles.metricBlock}>
                      <div style={styles.metricLabel}>TCA 三项分数</div>
                      <div style={styles.metricStack}>
                        <DetailTcaBar label="Consistency" value={brand.tcaConsistency} />
                        <DetailTcaBar label="Coverage" value={brand.tcaCoverage} />
                        <DetailTcaBar label="Authority" value={brand.tcaAuthority} />
                      </div>
                    </div>

                    <div style={styles.metricBlock}>
                      <div style={styles.metricLabel}>各平台覆盖情况</div>
                      <div style={styles.platformGrid}>
                        {PLATFORM_OPTIONS.map((platform) => {
                          const detail = brand.platformDetail[platform.key];
                          const sentiment = sentimentStyle(detail.sentiment);

                          return (
                            <div key={platform.key} style={styles.platformRow}>
                              <span
                                style={{
                                  ...styles.platformStatusDot,
                                  background: detail.mentioned ? "#0fbc8c" : "#ffffff",
                                  borderColor: detail.mentioned ? "#0fbc8c" : "#D3D1C7",
                                }}
                              />
                              <span style={styles.platformName}>{platform.label}</span>
                              {detail.mentioned ? (
                                <>
                                  <span style={styles.platformPosition}>第 {detail.position} 位</span>
                                  <span style={{ ...styles.sentimentTag, ...sentiment }}>{sentimentLabel(detail.sentiment)}</span>
                                </>
                              ) : (
                                <span style={styles.platformMiss}>未被提及</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div style={styles.expandFooter}>
                    <Link href="/login" style={styles.reportButton}>
                      查看完整报告
                    </Link>
                    <Link
                      href={`/detect?brandName=${encodeURIComponent(brand.brandName)}${currentCity !== "全国" ? `&city=${encodeURIComponent(currentCity)}` : ""}`}
                      style={styles.compareButton}
                    >
                      免费检测并对比
                    </Link>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </div>

    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    display: "grid",
    gap: 20,
  },
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 16,
  },
  overviewCard: {
    background: "#F8F8F6",
    borderRadius: 12,
    padding: "20px 24px",
    display: "grid",
    gap: 6,
  },
  overviewLabel: {
    fontSize: 13,
    color: "#8a8a8a",
    fontWeight: 700,
  },
  overviewMain: {
    fontSize: 24,
    lineHeight: 1.15,
    color: "#1a1a1a",
    fontWeight: 700,
  },
  overviewMainLarge: {
    fontSize: 32,
    lineHeight: 1.1,
    color: "#1a1a1a",
    fontWeight: 800,
  },
  overviewAccentUp: {
    fontSize: 16,
    color: "#0fbc8c",
    fontWeight: 700,
  },
  overviewAccentDown: {
    fontSize: 16,
    color: "#E24B4A",
    fontWeight: 700,
  },
  overviewAccentNeutral: {
    fontSize: 16,
    fontWeight: 700,
  },
  overviewMeta: {
    fontSize: 12,
    color: "#aaaaaa",
  },
  metaWrap: {
    display: "inline-flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },
  sectionHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },
  titleWrap: {
    display: "grid",
    gap: 8,
  },
  title: {
    margin: 0,
    fontSize: 34,
    lineHeight: 1.08,
    letterSpacing: "-0.04em",
    color: "#111827",
  },
  cityLead: {
    margin: 0,
    maxWidth: 760,
    fontSize: 15,
    lineHeight: 1.75,
    color: "#6b7280",
  },
  localSignals: {
    display: "grid",
    gap: 12,
    padding: "18px 20px",
    borderRadius: 20,
    background: "linear-gradient(180deg, #f7fbfa 0%, #eef8f5 100%)",
    border: "1px solid #d8efe8",
  },
  localSignalsHead: {
    display: "grid",
    gap: 4,
  },
  localSignalsTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: "#0a7c66",
  },
  localSignalsText: {
    fontSize: 14,
    lineHeight: 1.7,
    color: "#62707f",
  },
  localSignalChips: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  localSignalChip: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    borderRadius: 999,
    background: "#ffffff",
    border: "1px solid #cfe7df",
    color: "#135f52",
    fontSize: 13,
    fontWeight: 700,
  },
  filters: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 14px",
    borderRadius: 999,
    textDecoration: "none",
    border: "1px solid #d8dde5",
    color: "#111827",
    background: "#ffffff",
    fontSize: 14,
    fontWeight: 700,
  },
  chipActive: {
    color: "#ffffff",
    background: "#111827",
    borderColor: "#111827",
  },
  tableCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 24,
    background: "#ffffff",
    overflow: "hidden",
  },
  tableHead: {
    display: "grid",
    gridTemplateColumns: "72px 1.5fr 1fr 1.35fr 1.2fr 1fr 120px",
    gap: 12,
    padding: "18px 20px",
    background: "#f8fafc",
    borderBottom: "1px solid #e5e7eb",
    fontSize: 14,
    fontWeight: 800,
    color: "#6b7280",
  },
  row: {
    borderBottom: "1px solid #f0f2f5",
  },
  summary: {
    listStyle: "none",
    cursor: "pointer",
    display: "grid",
    gridTemplateColumns: "72px 1.5fr 1fr 1.35fr 1.2fr 1fr 120px",
    gap: 12,
    padding: "18px 20px",
    alignItems: "center",
    transition: "background 0.15s ease",
  },
  brandCell: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  brandName: {
    fontSize: 17,
    fontWeight: 800,
    color: "#111827",
  },
  scopeTag: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "3px 8px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  scopeTagLocal: {
    background: "#e8faf4",
    color: "#0a7c66",
  },
  scopeTagNational: {
    background: "#eef3f8",
    color: "#35506C",
  },
  actions: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: 700,
  },
  expand: {
    padding: "0 20px 20px",
    background: "#ffffff",
  },
  expandGrid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr",
    gap: 18,
  },
  metricBlock: {
    borderRadius: 18,
    background: "#fbfbf9",
    border: "1px solid #eceae3",
    padding: 18,
    display: "grid",
    gap: 16,
  },
  metricLabel: {
    fontSize: 15,
    fontWeight: 800,
    color: "#111827",
  },
  metricStack: {
    display: "grid",
    gap: 12,
  },
  platformGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  platformRow: {
    display: "grid",
    gridTemplateColumns: "12px 54px 1fr auto",
    alignItems: "center",
    gap: 8,
    minHeight: 34,
  },
  platformStatusDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    border: "1px solid #D3D1C7",
    boxSizing: "border-box",
  },
  platformName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
  },
  platformPosition: {
    fontSize: 13,
    color: "#4b5563",
  },
  platformMiss: {
    fontSize: 13,
    color: "#b42318",
    fontWeight: 700,
  },
  sentimentTag: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },
  expandFooter: {
    display: "flex",
    gap: 12,
    marginTop: 16,
  },
  reportButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: 12,
    textDecoration: "none",
    background: "#111827",
    color: "#ffffff",
    fontWeight: 700,
  },
  compareButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: 12,
    textDecoration: "none",
    background: "#ecfdf3",
    color: "#0a7c66",
    fontWeight: 700,
  },
};
