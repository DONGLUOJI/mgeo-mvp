import Link from "next/link";

import { PLATFORM_LABELS, PLATFORM_OPTIONS, type PlatformKey } from "@/lib/ranking/data";

import { PlatformMatrix } from "./platform-matrix";
import { PlatformCoverageChart } from "./platform-coverage-chart";

type PlatformCoverageProps = {
  currentIndustry: string;
  currentPlatform?: PlatformKey;
  currentCoverage?: "low" | "medium" | "high";
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
  currentCoverage,
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

        <div style={styles.filters}>
          {[
            { key: "", label: "全部覆盖率" },
            { key: "high", label: "高覆盖" },
            { key: "medium", label: "中覆盖" },
            { key: "low", label: "低覆盖" },
          ].map((item) => {
            const active = (currentCoverage || "") === item.key;
            const params = new URLSearchParams();
            params.set("tab", "platform");
            if (currentIndustry !== "全部") params.set("industry", currentIndustry);
            if (currentPlatform) params.set("platform", currentPlatform);
            if (item.key) params.set("coverage", item.key);

            return (
              <Link key={item.label} href={`/ranking?${params.toString()}`} style={{ ...styles.chip, ...(active ? styles.chipActive : {}) }}>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div style={styles.statsCard}>
        <div style={styles.statsHead}>六大平台品牌平均覆盖率</div>
        <div style={styles.statsText}>品牌方最在意的不是抽象分数，而是“我的竞品在多少个平台被提及，我漏了哪些平台”。</div>
        <PlatformCoverageChart
          data={PLATFORM_OPTIONS.map((platform) => ({
            label: PLATFORM_LABELS[platform.key],
            rate: Math.round(platformStats[platform.key].rate * 100),
          }))}
        />
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
};
