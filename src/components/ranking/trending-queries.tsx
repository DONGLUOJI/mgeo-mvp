import Link from "next/link";

import type { TrendingQueryRow } from "@/lib/ranking/data";

type TrendingQueriesProps = {
  queries: TrendingQueryRow[];
  industries: readonly string[];
  currentIndustry: string;
};

export function TrendingQueries({ queries, industries, currentIndustry }: TrendingQueriesProps) {
  return (
    <section style={styles.section}>
      <div>
        <h2 style={styles.title}>热门搜索问题榜</h2>
        <p style={styles.text}>让品牌方看到“用户到底在问什么”，从而决定内容、问答和投放的优先级。</p>
      </div>

      <div style={styles.filters}>
        {industries.map((industry) => {
          const active = currentIndustry === industry;
          const href = industry === "全部" ? "/ranking?tab=trending" : `/ranking?tab=trending&industry=${encodeURIComponent(industry)}`;
          return (
            <Link key={industry} href={href} style={{ ...styles.chip, ...(active ? styles.chipActive : {}) }}>
              {industry}
            </Link>
          );
        })}
      </div>

      <div style={styles.list}>
        <div style={styles.headerRow}>
          <span>排名</span>
          <span>搜索问题</span>
          <span>行业</span>
          <span>热度</span>
          <span>推荐品牌数</span>
          <span>趋势</span>
        </div>
        {queries.map((query) => (
          <details key={query.queryText} style={styles.item}>
            <summary style={styles.summary}>
              <div style={styles.rank}>{query.rank}</div>
              <div style={styles.main}>
                <div style={styles.question}>{query.queryText}</div>
              </div>
              <div style={styles.industry}>{query.industry}</div>
              <div style={styles.heat}>{"🔥".repeat(Math.max(1, Math.min(3, Math.round(query.heatScore / 35))))}</div>
              <div style={styles.brandCount}>{query.brandCount} 个品牌</div>
              <div style={styles.trend}>
                {query.trendDirection === "up" ? "↑" : query.trendDirection === "down" ? "↓" : "→"}
              </div>
            </summary>

            <div style={styles.expand}>
              <div style={styles.expandTitle}>各平台推荐品牌</div>
              <div style={styles.brandList}>
                {query.brandsMentioned.map((brand) => (
                  <div key={brand.brand} style={styles.brandCard}>
                    <div style={styles.brandName}>{brand.brand}</div>
                    <div style={styles.brandMeta}>平均提及位置：第 {brand.avgPosition.toFixed(1)} 位</div>
                    <div style={styles.platforms}>{brand.platforms.join(" / ")}</div>
                  </div>
                ))}
              </div>

              <div style={styles.ctaWrap}>
                <div style={styles.ctaText}>你的品牌在这个问题上排第几？</div>
                <Link href="/detect" style={styles.ctaButton}>
                  立即免费检测
                </Link>
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    display: "grid",
    gap: 20,
  },
  title: {
    margin: 0,
    fontSize: 34,
    lineHeight: 1.08,
    letterSpacing: "-0.04em",
    color: "#111827",
  },
  text: {
    margin: "10px 0 0",
    fontSize: 16,
    lineHeight: 1.7,
    color: "#6b7280",
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
    background: "#111827",
    borderColor: "#111827",
    color: "#ffffff",
  },
  list: {
    display: "grid",
    gap: 12,
  },
  headerRow: {
    display: "grid",
    gridTemplateColumns: "48px 1.8fr 0.9fr 0.8fr 1fr 0.5fr",
    gap: 18,
    padding: "0 22px",
    fontSize: 13,
    fontWeight: 800,
    color: "#6b7280",
  },
  item: {
    border: "1px solid #e5e7eb",
    borderRadius: 24,
    background: "#ffffff",
    overflow: "hidden",
  },
  summary: {
    listStyle: "none",
    cursor: "pointer",
    padding: "20px 22px",
    display: "grid",
    gridTemplateColumns: "48px 1.8fr 0.9fr 0.8fr 1fr 0.5fr",
    gap: 18,
    alignItems: "center",
  },
  rank: {
    fontSize: 22,
    fontWeight: 800,
    color: "#111827",
  },
  main: {
    display: "grid",
    gap: 4,
  },
  question: {
    fontSize: 18,
    fontWeight: 800,
    color: "#111827",
  },
  industry: {
    fontSize: 14,
    color: "#4b5563",
    fontWeight: 700,
  },
  brandCount: {
    fontSize: 14,
    color: "#4b5563",
    fontWeight: 700,
  },
  heat: {
    fontSize: 18,
  },
  trend: {
    fontSize: 18,
    fontWeight: 800,
    color: "#0a7c66",
    textAlign: "right",
  },
  expand: {
    borderTop: "1px solid #f0f2f5",
    padding: "0 22px 22px",
  },
  expandTitle: {
    marginTop: 18,
    fontSize: 16,
    fontWeight: 800,
    color: "#111827",
  },
  brandList: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
  },
  brandCard: {
    borderRadius: 18,
    border: "1px solid #eceff3",
    background: "#fafafa",
    padding: 16,
  },
  brandName: {
    fontSize: 16,
    fontWeight: 800,
    color: "#111827",
  },
  brandMeta: {
    marginTop: 8,
    fontSize: 14,
    color: "#4b5563",
  },
  platforms: {
    marginTop: 8,
    fontSize: 13,
    color: "#6b7280",
  },
  ctaWrap: {
    marginTop: 18,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
    borderRadius: 18,
    background: "#111827",
    padding: "16px 18px",
  },
  ctaText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: 700,
  },
  ctaButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: 12,
    textDecoration: "none",
    background: "#ffffff",
    color: "#111827",
    fontWeight: 700,
  },
};
