import Link from "next/link";

import { PLATFORM_OPTIONS, type RankedBrand } from "@/lib/ranking/data";
import { getBrandAnchorId, getIndustryTheme } from "@/lib/ranking/shared";

type IndustryLeaderboardProps = {
  brands: RankedBrand[];
  industries: readonly string[];
  currentIndustry: string;
  currentDays: number;
  focusBrand?: string;
  overview: {
    brandCount: number;
    industryCount: number;
    averageScore: number;
    snapshotDate: string;
  };
};

export function IndustryLeaderboard({
  brands,
  industries,
  currentIndustry,
  currentDays,
  focusBrand,
  overview,
}: IndustryLeaderboardProps) {
  return (
    <section style={styles.section}>
      <div style={styles.overviewGrid}>
        <article style={styles.overviewCard}>
          <div style={styles.overviewLabel}>收录品牌总数</div>
          <div style={styles.overviewValue}>{overview.brandCount} 个</div>
        </article>
        <article style={styles.overviewCard}>
          <div style={styles.overviewLabel}>覆盖行业数</div>
          <div style={styles.overviewValue}>{overview.industryCount} 个</div>
        </article>
        <article style={styles.overviewCard}>
          <div style={styles.overviewLabel}>数据更新时间</div>
          <div style={styles.overviewValue}>{overview.snapshotDate}</div>
        </article>
      </div>

      <div style={styles.sectionHead}>
        <div>
          <h2 style={styles.title}>行业 AI 可见性排行榜</h2>
        </div>
      </div>

      <div style={styles.filters}>
        {industries.map((industry) => {
          const active = industry === currentIndustry;
          const theme = getIndustryTheme(industry);
          const href = industry === "全部" ? `/ranking?tab=industry&days=${currentDays}` : `/ranking?tab=industry&industry=${encodeURIComponent(industry)}&days=${currentDays}`;
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
          const href = currentIndustry === "全部" ? `/ranking?tab=industry&days=${days}` : `/ranking?tab=industry&industry=${encodeURIComponent(currentIndustry)}&days=${days}`;
          return (
            <Link key={days} href={href} style={{ ...styles.chip, ...(active ? styles.chipActive : {}) }}>
              最近 {days} 天
            </Link>
          );
        })}
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableHead}>
          <span>排名</span>
          <span>品牌</span>
          <span>行业</span>
          <span>TCA 综合分</span>
          <span>平台覆盖</span>
          <span>7 天变化</span>
          <span>操作</span>
        </div>

        <div>
          {brands.map((brand) => (
            <details
              key={brand.brandName}
              id={getBrandAnchorId(brand.brandName)}
              style={styles.row}
              open={focusBrand === brand.brandName}
            >
              <summary
                style={{
                  ...styles.summary,
                  ...(focusBrand === brand.brandName ? styles.summaryFocused : {}),
                }}
              >
                <span style={styles.rank}>{brand.rank}</span>
                <span style={styles.brandName}>{brand.brandName}</span>
                <span
                  style={{
                    ...styles.industryPill,
                    color: getIndustryTheme(brand.industry).text,
                    background: getIndustryTheme(brand.industry).background,
                    borderColor: getIndustryTheme(brand.industry).border,
                  }}
                >
                  {brand.industry}
                </span>
                <span style={styles.score}>{brand.tcaTotal}</span>
                <span style={styles.coverage}>
                  {brand.platformCoverage}/{brand.platformTotal}
                </span>
                <span style={{ ...styles.change, color: brand.change7d >= 0 ? "#0a7c66" : "#b42318" }}>
                  {brand.change7d >= 0 ? "↑" : "↓"} {Math.abs(brand.change7d).toFixed(1)}
                </span>
                <span style={styles.actions}>详情 / 对比</span>
              </summary>

              <div style={styles.expand}>
                <div style={styles.expandGrid}>
                  <div style={styles.metricBlock}>
                    <div style={styles.metricLabel}>TCA 三项分数</div>
                    {[
                      { label: "Consistency", value: brand.tcaConsistency },
                      { label: "Coverage", value: brand.tcaCoverage },
                      { label: "Authority", value: brand.tcaAuthority },
                    ].map((item) => (
                      <div key={item.label} style={styles.barRow}>
                        <span style={styles.barLabel}>{item.label}</span>
                        <div style={styles.barTrack}>
                          <div style={{ ...styles.barFill, width: `${item.value}%` }} />
                        </div>
                        <span style={styles.barValue}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div style={styles.metricBlock}>
                    <div style={styles.metricLabel}>各平台覆盖情况</div>
                    <div style={styles.platformGrid}>
                      {PLATFORM_OPTIONS.map((platform) => {
                        const detail = brand.platformDetail[platform.key];
                        return (
                          <div key={platform.key} style={styles.platformCard}>
                            <div style={styles.platformName}>{platform.label}</div>
                            <div style={detail.mentioned ? styles.platformHit : styles.platformMiss}>
                              {detail.mentioned ? `已提及 · 第 ${detail.position} 位` : "未被提及"}
                            </div>
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
                  <Link href={`/detect?brandName=${encodeURIComponent(brand.brandName)}`} style={styles.compareButton}>
                    免费检测并对比
                  </Link>
                </div>
              </div>
            </details>
          ))}
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
    background: "#ffffff",
    borderRadius: 22,
    border: "1px solid #e5e7eb",
    padding: "18px 20px",
  },
  overviewLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: 700,
  },
  overviewValue: {
    marginTop: 10,
    fontSize: 26,
    lineHeight: 1.1,
    letterSpacing: "-0.03em",
    color: "#111827",
    fontWeight: 800,
  },
  sectionHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: 34,
    lineHeight: 1.08,
    letterSpacing: "-0.04em",
    color: "#111827",
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
  tableCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 24,
    background: "#ffffff",
    overflow: "hidden",
  },
  tableHead: {
    display: "grid",
    gridTemplateColumns: "72px 1.7fr 1fr 1fr 1fr 1fr 120px",
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
    gridTemplateColumns: "72px 1.7fr 1fr 1fr 1fr 1fr 120px",
    gap: 12,
    padding: "20px",
    alignItems: "center",
  },
  summaryFocused: {
    background: "#ecfdf3",
    boxShadow: "inset 0 0 0 1px #86efac",
  },
  rank: {
    fontSize: 22,
    fontWeight: 800,
    color: "#111827",
  },
  brandName: {
    fontSize: 17,
    fontWeight: 800,
    color: "#111827",
  },
  industryPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "fit-content",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid transparent",
    fontSize: 13,
    fontWeight: 800,
  },
  score: {
    fontSize: 16,
    fontWeight: 800,
    color: "#111827",
  },
  coverage: {
    fontSize: 15,
    color: "#4b5563",
  },
  change: {
    fontSize: 15,
    fontWeight: 700,
  },
  actions: {
    fontSize: 14,
    color: "#0a7c66",
    fontWeight: 700,
  },
  expand: {
    padding: "0 20px 22px",
  },
  expandGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18,
  },
  metricBlock: {
    borderRadius: 20,
    border: "1px solid #eceff3",
    background: "#fafafa",
    padding: 18,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 14,
  },
  barRow: {
    display: "grid",
    gridTemplateColumns: "108px 1fr 42px",
    gap: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  barLabel: {
    fontSize: 14,
    color: "#4b5563",
  },
  barTrack: {
    height: 10,
    borderRadius: 999,
    background: "#e5e7eb",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    background: "#111827",
  },
  barValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
    textAlign: "right",
  },
  platformGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
  },
  platformCard: {
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    padding: "12px 14px",
  },
  platformName: {
    fontSize: 14,
    fontWeight: 800,
    color: "#111827",
  },
  platformHit: {
    marginTop: 6,
    fontSize: 13,
    color: "#0a7c66",
  },
  platformMiss: {
    marginTop: 6,
    fontSize: 13,
    color: "#9ca3af",
  },
  expandFooter: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
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
    border: "1px solid #d0d5dd",
    color: "#111827",
    fontWeight: 700,
    background: "#ffffff",
  },
};
