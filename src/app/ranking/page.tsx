import Link from "next/link";
import { SiteShell } from "@/components/marketing/SiteShell";
import { listRankingSnapshots } from "@/lib/db/repository";

export default async function RankingPage({
  searchParams,
}: {
  searchParams?: Promise<{ industry?: string; days?: string }>;
}) {
  const params = (await searchParams) || {};
  const currentIndustry = params.industry || "全部";
  const currentDays = [7, 30, 90].includes(Number(params.days)) ? Number(params.days) : 30;
  const rows = await listRankingSnapshots({
    industry: currentIndustry === "全部" ? undefined : currentIndustry,
    days: currentDays,
    limit: 20,
  });
  const industries = ["全部", "营销咨询", "本地生活", "连锁品牌", "企业服务", "教育"];
  const topThree = rows.slice(0, 3);
  const latestDate = rows[0]?.snapshotDate || "2026-04-05";

  return (
    <SiteShell current="/ranking">
      <main style={styles.page}>
        <section style={styles.hero}>
          <span style={styles.badge}>公开排名</span>
          <h1 style={styles.title}>行业品牌 AI 可见性排名</h1>
          <p style={styles.text}>
            基于 TCA 综合分、平台覆盖数和阶段变化，展示不同行业品牌在 AI 搜索场景中的当前表现。
          </p>
          <div style={styles.meta}>统计窗口：最近 {currentDays} 天 | 最近快照：{latestDate}</div>
        </section>

        <section style={styles.summaryGrid}>
          <article style={styles.summaryCard}>
            <div style={styles.summaryLabel}>榜首品牌</div>
            <div style={styles.summaryValue}>{topThree[0]?.brandName || "-"}</div>
            <div style={styles.summaryHint}>
              TCA {topThree[0]?.tcaTotal ?? "-"} / 平台覆盖 {topThree[0]?.platformCoverage ?? "-"} / 6
            </div>
          </article>
          <article style={styles.summaryCard}>
            <div style={styles.summaryLabel}>行业均分</div>
            <div style={styles.summaryValue}>
              {rows.length ? Math.round(rows.reduce((sum, row) => sum + row.tcaTotal, 0) / rows.length) : 0}
            </div>
            <div style={styles.summaryHint}>基于当前筛选条件下的榜单样本</div>
          </article>
          <article style={styles.summaryCard}>
            <div style={styles.summaryLabel}>平均平台覆盖</div>
            <div style={styles.summaryValue}>
              {rows.length ? (rows.reduce((sum, row) => sum + row.platformCoverage, 0) / rows.length).toFixed(1) : "0.0"}
            </div>
            <div style={styles.summaryHint}>反映品牌被稳定提及的平台广度</div>
          </article>
        </section>

        <section style={styles.controlsCard}>
          <div style={styles.filters}>
            {industries.map((industry) => {
              const active = industry === currentIndustry;
              const href =
                industry === "全部"
                  ? `/ranking?days=${currentDays}`
                  : `/ranking?industry=${encodeURIComponent(industry)}&days=${currentDays}`;
              return (
                <Link
                  key={industry}
                  href={href}
                  style={{
                    ...styles.filterChip,
                    ...(active ? styles.filterChipActive : {}),
                  }}
                >
                  {industry}
                </Link>
              );
            })}
          </div>
          <div style={styles.filters}>
            {[7, 30, 90].map((days) => {
              const active = days === currentDays;
              const href =
                currentIndustry === "全部"
                  ? `/ranking?days=${days}`
                  : `/ranking?industry=${encodeURIComponent(currentIndustry)}&days=${days}`;
              return (
                <Link
                  key={days}
                  href={href}
                  style={{
                    ...styles.filterChip,
                    ...(active ? styles.filterChipActive : {}),
                  }}
                >
                  最近{days}天
                </Link>
              );
            })}
          </div>
        </section>

        <section style={styles.methodGrid}>
          <article style={styles.methodCard}>
            <div style={styles.methodTitle}>排名依据</div>
            <p style={styles.methodText}>榜单按照 TCA 综合分优先排序，并参考平台覆盖数与 7 天变化，反映品牌当前在 AI 搜索场景中的综合表现。</p>
          </article>
          <article style={styles.methodCard}>
            <div style={styles.methodTitle}>TCA 三支柱</div>
            <p style={styles.methodText}>Consistency 评估品牌描述一致性，Coverage 评估平台覆盖广度，Authority 评估品牌被引用的可信程度。</p>
          </article>
          <article style={styles.methodCard}>
            <div style={styles.methodTitle}>使用建议</div>
            <p style={styles.methodText}>适合先看行业平均水位，再结合免费检测报告判断自己品牌当前处于哪个阶段、下一步该优先补哪一项。</p>
          </article>
        </section>

        <section style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>排名</th>
                <th style={styles.th}>品牌</th>
                <th style={styles.th}>行业</th>
                <th style={styles.th}>TCA 综合分</th>
                <th style={styles.th}>Consistency</th>
                <th style={styles.th}>Coverage</th>
                <th style={styles.th}>Authority</th>
                <th style={styles.th}>覆盖平台数</th>
                <th style={styles.th}>7 天变化</th>
                <th style={styles.th}>快照日期</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.brandName}-${row.snapshotDate}`}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.tdStrong}>{row.brandName}</td>
                  <td style={styles.td}>{row.industry}</td>
                  <td style={styles.tdStrong}>{row.tcaTotal}</td>
                  <td style={styles.td}>{row.tcaConsistency}</td>
                  <td style={styles.td}>{row.tcaCoverage}</td>
                  <td style={styles.td}>{row.tcaAuthority}</td>
                  <td style={styles.td}>
                    {row.platformCoverage} / 6
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      color: row.delta7d >= 0 ? "#0f8b7f" : "#b42318",
                    }}
                  >
                    {row.delta7d >= 0 ? "↑" : "↓"} {Math.abs(row.delta7d).toFixed(1)}
                  </td>
                  <td style={styles.td}>{row.snapshotDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section style={styles.ctaCard}>
          <h2 style={styles.ctaTitle}>想知道你的品牌目前排在哪？</h2>
          <p style={styles.ctaText}>先做一次免费检测，快速获得一份围绕 TCA 三支柱的品牌可见性报告。</p>
          <Link href="/detect" style={styles.ctaButton}>
            免费检测你的品牌
          </Link>
        </section>
      </main>
    </SiteShell>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1240,
    margin: "0 auto",
    padding: "64px 24px 0",
  },
  hero: {
    display: "grid",
    gap: 16,
    justifyItems: "center",
    textAlign: "center",
    marginBottom: 32,
  },
  badge: {
    display: "inline-flex",
    height: 34,
    padding: "0 14px",
    alignItems: "center",
    borderRadius: 999,
    background: "#edf8f6",
    color: "#0f8b7f",
    fontSize: 14,
    fontWeight: 700,
  },
  title: {
    margin: 0,
    fontSize: 48,
    lineHeight: 1.12,
    letterSpacing: "-0.04em",
  },
  text: {
    margin: 0,
    maxWidth: 860,
    color: "#667085",
    fontSize: 18,
    lineHeight: 1.8,
  },
  meta: {
    color: "#98a2b3",
    fontSize: 14,
    fontWeight: 600,
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 18,
    marginBottom: 20,
  },
  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#667085",
    fontWeight: 700,
  },
  summaryValue: {
    fontSize: 30,
    lineHeight: 1.15,
    fontWeight: 800,
    color: "#101828",
  },
  summaryHint: {
    fontSize: 14,
    lineHeight: 1.7,
    color: "#98a2b3",
  },
  controlsCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 18,
    display: "grid",
    gap: 14,
    marginBottom: 20,
  },
  filters: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  methodGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 18,
    marginBottom: 20,
  },
  methodCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 10,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "#101828",
  },
  methodText: {
    margin: 0,
    color: "#667085",
    fontSize: 15,
    lineHeight: 1.85,
  },
  filterChip: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    padding: "0 16px",
    borderRadius: 999,
    background: "#ffffff",
    border: "1px solid #dbe3eb",
    textDecoration: "none",
    color: "#344054",
    fontWeight: 600,
  },
  filterChipActive: {
    background: "#0f8b7f",
    border: "1px solid #0f8b7f",
    color: "#ffffff",
  },
  tableCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 28,
    padding: 12,
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "16px 18px",
    fontSize: 14,
    color: "#667085",
    fontWeight: 700,
    borderBottom: "1px solid #e7ebf0",
  },
  td: {
    padding: "18px",
    fontSize: 16,
    color: "#475467",
    borderBottom: "1px solid #f0f2f5",
  },
  tdStrong: {
    padding: "18px",
    fontSize: 16,
    color: "#101828",
    fontWeight: 700,
    borderBottom: "1px solid #f0f2f5",
  },
  ctaCard: {
    marginTop: 28,
    background: "#111827",
    borderRadius: 28,
    padding: 34,
    color: "#ffffff",
    display: "grid",
    justifyItems: "center",
    textAlign: "center",
    gap: 12,
  },
  ctaTitle: {
    margin: 0,
    fontSize: 34,
  },
  ctaText: {
    margin: 0,
    maxWidth: 720,
    color: "rgba(255,255,255,0.72)",
    fontSize: 18,
    lineHeight: 1.8,
  },
  ctaButton: {
    marginTop: 8,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    padding: "0 22px",
    borderRadius: 999,
    background: "#ffffff",
    color: "#101828",
    textDecoration: "none",
    fontWeight: 800,
  },
};
