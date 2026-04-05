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
    <SiteShell current="/ranking" ctaHref="/register" ctaLabel="注册" hideFooter>
      <main style={styles.page}>
        <section style={styles.hero}>
          <div style={styles.heroPanel}>
            <h1 style={styles.heroTitle}>排名</h1>
            <p style={styles.heroText}>查看不同行业品牌在 AI 搜索中的当前表现，并用更接近你原始 HTML 的结构统一承接排名、筛选与免费检测转化。</p>
            <div style={styles.heroActions}>
              <Link href="/#detector" style={styles.primaryButton}>
                免费检测
              </Link>
              <Link href="/pricing" style={styles.secondaryButton}>
                查看服务方案
              </Link>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>行业品牌 AI 可见性排名</h2>
              <p style={styles.sectionText}>统计窗口：最近 {currentDays} 天 | 最近快照：{latestDate}</p>
            </div>

            <div style={styles.infoGrid}>
              <article style={styles.infoCard}>
                <h3 style={styles.infoTitle}>榜首品牌</h3>
                <p style={styles.infoText}>{topThree[0]?.brandName || "-"}</p>
              </article>
              <article style={styles.infoCard}>
                <h3 style={styles.infoTitle}>行业均分</h3>
                <p style={styles.infoText}>{rows.length ? Math.round(rows.reduce((sum, row) => sum + row.tcaTotal, 0) / rows.length) : 0}</p>
              </article>
              <article style={styles.infoCard}>
                <h3 style={styles.infoTitle}>平均平台覆盖</h3>
                <p style={styles.infoText}>{rows.length ? (rows.reduce((sum, row) => sum + row.platformCoverage, 0) / rows.length).toFixed(1) : "0.0"}</p>
              </article>
            </div>

            <div style={styles.controls}>
              <div style={styles.filters}>
                {industries.map((industry) => {
                  const active = industry === currentIndustry;
                  const href =
                    industry === "全部"
                      ? `/ranking?days=${currentDays}`
                      : `/ranking?industry=${encodeURIComponent(industry)}&days=${currentDays}`;
                  return (
                    <Link key={industry} href={href} style={{ ...styles.filterChip, ...(active ? styles.filterChipActive : {}) }}>
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
                    <Link key={days} href={href} style={{ ...styles.filterChip, ...(active ? styles.filterChipActive : {}) }}>
                      最近{days}天
                    </Link>
                  );
                })}
              </div>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>排名</th>
                    <th style={styles.th}>品牌</th>
                    <th style={styles.th}>行业</th>
                    <th style={styles.th}>TCA 综合分</th>
                    <th style={styles.th}>平台覆盖</th>
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
                      <td style={styles.td}>{row.platformCoverage} / 6</td>
                      <td style={{ ...styles.td, color: row.delta7d >= 0 ? "#0a7c66" : "#b42318" }}>
                        {row.delta7d >= 0 ? "↑" : "↓"} {Math.abs(row.delta7d).toFixed(1)}
                      </td>
                      <td style={styles.td}>{row.snapshotDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    paddingTop: 52,
    background: "#f5f5f7",
  },
  hero: {
    maxWidth: 1240,
    margin: "34px auto 28px",
    padding: "0 24px",
  },
  heroPanel: {
    borderRadius: 38,
    padding: "52px 56px",
    color: "#ffffff",
    background: "linear-gradient(135deg, #0d1117 0%, #17382f 100%)",
    boxShadow: "0 20px 48px rgba(15, 23, 42, 0.14)",
  },
  heroTitle: {
    margin: 0,
    fontSize: 58,
    lineHeight: 1.1,
    letterSpacing: "-0.04em",
  },
  heroText: {
    maxWidth: 860,
    fontSize: 19,
    lineHeight: 1.75,
    color: "rgba(255,255,255,0.82)",
    margin: "20px 0 30px",
  },
  heroActions: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 180,
    padding: "18px 28px",
    borderRadius: 20,
    textDecoration: "none",
    fontSize: 18,
    fontWeight: 600,
    background: "#1f1f22",
    color: "#ffffff",
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 180,
    padding: "18px 28px",
    borderRadius: 20,
    textDecoration: "none",
    fontSize: 18,
    fontWeight: 600,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.16)",
    color: "#ffffff",
  },
  section: {
    maxWidth: 1240,
    margin: "0 auto 28px",
    padding: "0 24px",
  },
  sectionCard: {
    background: "#ffffff",
    borderRadius: 32,
    padding: 46,
    boxShadow: "0 12px 36px rgba(15, 23, 42, 0.06)",
  },
  sectionHeader: {
    maxWidth: 860,
    marginBottom: 28,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 40,
    lineHeight: 1.15,
    letterSpacing: "-0.03em",
  },
  sectionText: {
    margin: "12px 0 0",
    fontSize: 18,
    lineHeight: 1.7,
    color: "#6e6e73",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 18,
    marginBottom: 24,
  },
  infoCard: {
    background: "#fbfbfc",
    border: "1px solid #ececf0",
    borderRadius: 24,
    padding: 28,
  },
  infoTitle: {
    margin: 0,
    fontSize: 28,
  },
  infoText: {
    margin: "12px 0 0",
    color: "#6e6e73",
    fontSize: 16,
    lineHeight: 1.7,
  },
  controls: {
    display: "grid",
    gap: 14,
    marginBottom: 24,
  },
  filters: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  filterChip: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
    padding: "0 16px",
    borderRadius: 999,
    textDecoration: "none",
    background: "#fbfbfc",
    border: "1px solid #ececf0",
    color: "#1d1d1f",
    fontSize: 15,
    fontWeight: 600,
  },
  filterChipActive: {
    background: "#0a7c66",
    border: "1px solid #0a7c66",
    color: "#ffffff",
  },
  tableWrap: {
    overflowX: "auto",
    border: "1px solid #ececf0",
    borderRadius: 20,
    background: "#ffffff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "16px 18px",
    textAlign: "left",
    borderBottom: "1px solid #f0f0f2",
    fontSize: 15,
    color: "#6e6e73",
    fontWeight: 600,
    background: "#f8f8fa",
  },
  td: {
    padding: "16px 18px",
    textAlign: "left",
    borderBottom: "1px solid #f0f0f2",
    fontSize: 15,
    color: "#1d1d1f",
  },
  tdStrong: {
    padding: "16px 18px",
    textAlign: "left",
    borderBottom: "1px solid #f0f0f2",
    fontSize: 15,
    color: "#1d1d1f",
    fontWeight: 700,
  },
};
