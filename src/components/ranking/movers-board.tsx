import { IndustryTrendChart } from "./industry-trend-chart";

type MoversBoardProps = {
  risers: Array<{ brandName: string; industry: string; change: number; currentScore: number }>;
  fallers: Array<{ brandName: string; industry: string; change: number; currentScore: number }>;
  overview: {
    topRiser: string;
    topFaller: string;
    trackedWeeks: number;
  };
  industryTrends: Array<{
    industry: string;
    data: Array<{ week: string; avgScore: number }>;
  }>;
};

export function MoversBoard({ risers, fallers, overview, industryTrends }: MoversBoardProps) {
  return (
    <section style={styles.section}>
      <div style={styles.overviewGrid}>
        <article style={styles.overviewCard}>
          <div style={styles.overviewLabel}>本周涨幅最高</div>
          <div style={styles.overviewValueSmall}>{overview.topRiser}</div>
        </article>
        <article style={styles.overviewCard}>
          <div style={styles.overviewLabel}>本周跌幅最高</div>
          <div style={styles.overviewValueSmall}>{overview.topFaller}</div>
        </article>
        <article style={styles.overviewCard}>
          <div style={styles.overviewLabel}>趋势追踪周期</div>
          <div style={styles.overviewValue}>{overview.trackedWeeks} 周</div>
        </article>
      </div>

      <div>
        <h2 style={styles.title}>涨跌幅排行榜</h2>
        <p style={styles.text}>上升和下滑是最具讨论度的内容。把波动做出来，品牌方就更容易形成每周回看习惯。</p>
      </div>

      <div style={styles.columns}>
        <div style={styles.columnCard}>
          <div style={styles.columnTitle}>本周上升最快 TOP 10</div>
          <div style={styles.board}>
            {risers.map((brand, index) => (
              <div key={brand.brandName} style={styles.boardRow}>
                <span style={styles.rank}>{index + 1}</span>
                <span style={styles.brandName}>{brand.brandName}</span>
                <span style={styles.changeUp}>↑ {brand.change.toFixed(1)}</span>
                <span style={styles.score}>{brand.currentScore}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.columnCard}>
          <div style={styles.columnTitle}>本周下降最多 TOP 10</div>
          <div style={styles.board}>
            {fallers.map((brand, index) => (
              <div key={brand.brandName} style={styles.boardRow}>
                <span style={styles.rank}>{index + 1}</span>
                <span style={styles.brandName}>{brand.brandName}</span>
                <span style={styles.changeDown}>↓ {Math.abs(brand.change).toFixed(1)}</span>
                <span style={styles.score}>{brand.currentScore}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <IndustryTrendChart series={industryTrends} />
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
  overviewValueSmall: {
    marginTop: 10,
    fontSize: 18,
    lineHeight: 1.45,
    color: "#111827",
    fontWeight: 800,
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
  columns: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },
  columnCard: {
    borderRadius: 24,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    padding: 22,
  },
  columnTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 14,
  },
  board: {
    display: "grid",
  },
  boardRow: {
    display: "grid",
    gridTemplateColumns: "36px 1fr 88px 52px",
    gap: 12,
    padding: "14px 0",
    borderBottom: "1px solid #f0f2f5",
    alignItems: "center",
  },
  rank: {
    fontSize: 16,
    fontWeight: 800,
    color: "#111827",
  },
  brandName: {
    fontSize: 15,
    fontWeight: 700,
    color: "#111827",
  },
  changeUp: {
    fontSize: 15,
    fontWeight: 800,
    color: "#0a7c66",
    textAlign: "right",
  },
  changeDown: {
    fontSize: 15,
    fontWeight: 800,
    color: "#b42318",
    textAlign: "right",
  },
  score: {
    fontSize: 15,
    fontWeight: 700,
    color: "#4b5563",
    textAlign: "right",
  },
};
