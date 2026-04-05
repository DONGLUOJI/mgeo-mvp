import Link from "next/link";

import { IndustryTrendChart } from "./industry-trend-chart";

type MoversBoardProps = {
  risers: Array<{ brandName: string; industry: string; change: number; currentScore: number }>;
  fallers: Array<{ brandName: string; industry: string; change: number; currentScore: number }>;
  industryTrends: Array<{
    industry: string;
    data: Array<{ week: string; avgScore: number }>;
  }>;
};

export function MoversBoard({ risers, fallers, industryTrends }: MoversBoardProps) {
  return (
    <section style={styles.section}>
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

      <div style={styles.cta}>
        <div>
          <div style={styles.ctaTitle}>不想排名下跌？</div>
          <div style={styles.ctaText}>先从免费检测开始，后续可以再接入排名波动通知和竞品对比。</div>
        </div>
        <div style={styles.ctaActions}>
          <Link href="/register" style={styles.ctaPrimary}>
            注册免费版
          </Link>
          <Link href="/pricing" style={styles.ctaSecondary}>
            查看优化方案
          </Link>
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
  cta: {
    borderRadius: 24,
    background: "#111827",
    padding: "22px 24px",
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    flexWrap: "wrap",
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: "#ffffff",
  },
  ctaText: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.72)",
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
    padding: "12px 16px",
    borderRadius: 12,
    textDecoration: "none",
    background: "#ffffff",
    color: "#111827",
    fontWeight: 700,
  },
  ctaSecondary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: 12,
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#ffffff",
    fontWeight: 700,
  },
};
