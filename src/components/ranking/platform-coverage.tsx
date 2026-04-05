import Link from "next/link";

import { PLATFORM_OPTIONS, type PlatformKey } from "@/lib/ranking/data";

import { PlatformMatrix } from "./platform-matrix";

type PlatformCoverageProps = {
  currentIndustry: string;
  currentPlatform?: PlatformKey;
  industries: readonly string[];
  overview: {
    trackedBrands: number;
    averageCoverageRate: number;
    strongestPlatform: string;
  };
  platformStats: Record<PlatformKey, { totalBrands: number; covered: number; rate: number }>;
  brands: Array<{
    brandName: string;
    industry: string;
    platforms: Record<PlatformKey, boolean>;
    coverageRate: number;
  }>;
};

export function PlatformCoverage({
  currentIndustry,
  currentPlatform,
  industries,
  overview,
  platformStats,
  brands,
}: PlatformCoverageProps) {
  return (
    <section style={styles.section}>
      <div style={styles.overviewGrid}>
        <article style={styles.overviewCard}>
          <div style={styles.overviewLabel}>参与统计品牌</div>
          <div style={styles.overviewValue}>{overview.trackedBrands} 个</div>
        </article>
        <article style={styles.overviewCard}>
          <div style={styles.overviewLabel}>平均覆盖率</div>
          <div style={styles.overviewValue}>{overview.averageCoverageRate}%</div>
        </article>
        <article style={styles.overviewCard}>
          <div style={styles.overviewLabel}>当前最强平台</div>
          <div style={styles.overviewValue}>{overview.strongestPlatform}</div>
        </article>
      </div>

      <div>
        <h2 style={styles.title}>AI 平台覆盖率排行</h2>
        <p style={styles.text}>用平台平均覆盖率 + 品牌矩阵，直接回答“竞品覆盖了几个平台、我覆盖了几个”。</p>
      </div>

      <div style={styles.filterStack}>
        <div style={styles.filters}>
          {industries.map((industry) => {
            const active = currentIndustry === industry;
            const href = industry === "全部" ? "/ranking?tab=platform" : `/ranking?tab=platform&industry=${encodeURIComponent(industry)}`;
            return (
              <Link key={industry} href={href} style={{ ...styles.chip, ...(active ? styles.chipActive : {}) }}>
                {industry}
              </Link>
            );
          })}
        </div>

        <div style={styles.filters}>
          <Link href={currentIndustry === "全部" ? "/ranking?tab=platform" : `/ranking?tab=platform&industry=${encodeURIComponent(currentIndustry)}`} style={{ ...styles.chip, ...(!currentPlatform ? styles.chipActive : {}) }}>
            全部平台
          </Link>
          {PLATFORM_OPTIONS.map((platform) => {
            const active = currentPlatform === platform.key;
            const href =
              currentIndustry === "全部"
                ? `/ranking?tab=platform&platform=${platform.key}`
                : `/ranking?tab=platform&industry=${encodeURIComponent(currentIndustry)}&platform=${platform.key}`;

            return (
              <Link key={platform.key} href={href} style={{ ...styles.chip, ...(active ? styles.chipActive : {}) }}>
                {platform.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div style={styles.statsCard}>
        <div style={styles.statsHead}>六大平台品牌平均覆盖率</div>
        <div style={styles.statsText}>品牌方最在意的不是抽象分数，而是“我的竞品在多少个平台被提及，我漏了哪些平台”。</div>
        <div style={styles.barList}>
          {PLATFORM_OPTIONS.map((platform) => {
            const stat = platformStats[platform.key];
            return (
              <div key={platform.key} style={styles.barItem}>
                <div style={styles.barLabelRow}>
                  <span style={styles.barLabel}>{platform.label}</span>
                  <span style={styles.barRate}>{Math.round(stat.rate * 100)}%</span>
                </div>
                <div style={styles.track}>
                  <div style={{ ...styles.fill, width: `${Math.round(stat.rate * 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PlatformMatrix brands={brands} />
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
  filterStack: {
    display: "grid",
    gap: 12,
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
  statsCard: {
    borderRadius: 24,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    padding: 22,
  },
  statsHead: {
    fontSize: 18,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 8,
  },
  statsText: {
    fontSize: 14,
    lineHeight: 1.7,
    color: "#6b7280",
    marginBottom: 16,
  },
  barList: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 18,
  },
  barItem: {
    display: "grid",
    gap: 8,
  },
  barLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  barLabel: {
    fontSize: 15,
    fontWeight: 700,
    color: "#111827",
  },
  barRate: {
    fontSize: 14,
    fontWeight: 700,
    color: "#6b7280",
  },
  track: {
    height: 12,
    borderRadius: 999,
    background: "#e5e7eb",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
    background: "#111827",
  },
};
