import type { Metadata } from "next";

import { SiteShell } from "@/components/marketing/SiteShell";

import { MGEO_NAV_ITEMS, MGEO_SHELL_PROPS } from "../content";

export const metadata: Metadata = {
  title: "MGEO和SEO有什么区别 - 董逻辑MGEO",
  description:
    "SEO 竞争搜索结果页位置，GEO 竞争 AI 回答中的品牌可见性，MGEO 则把 GEO 做成企业可执行、可监测、可归因的闭环。",
};

const rows = [
  {
    label: "关注对象",
    seo: "搜索引擎结果页与网页点击",
    geo: "AI 回答中的提及与引用",
    mgeo: "品牌解释权、证据链分发与归因闭环",
  },
  {
    label: "目标",
    seo: "拿排名、拿流量",
    geo: "提升 AI 可见性",
    mgeo: "让品牌被看见、被理解、被推荐、被验证",
  },
  {
    label: "内容要求",
    seo: "更偏关键词与页面结构",
    geo: "更偏可引用性与答案结构",
    mgeo: "在内容之前先定义品牌底座和问题入口",
  },
  {
    label: "交付方式",
    seo: "优化页与关键词",
    geo: "优化内容和 AI 可见表现",
    mgeo: "品牌信息 + 问题训练 + 文章训练 + 分发 + 监测 + 归因",
  },
  {
    label: "验证方式",
    seo: "排名、点击、转化",
    geo: "提及率、覆盖度、引用率",
    mgeo: "一致性、覆盖度、权威性、风险与归因结果",
  },
];

export default function MgeoVsSeoPage() {
  return (
    <SiteShell current="/mgeo" navItems={MGEO_NAV_ITEMS} hideFooter={false} {...MGEO_SHELL_PROPS}>
      <main style={styles.page}>
        <section style={styles.hero}>
          <div style={styles.eyebrow}>Comparison</div>
          <h1 style={styles.title}>MGEO和SEO有什么区别：从搜索排名到品牌解释权</h1>
          <p style={styles.lead}>
            SEO 主要竞争搜索结果页的位置，GEO 主要竞争品牌在 AI 回答中的可见性，而 MGEO 的重点是把 GEO 这件事做成企业能够长期运行的经营闭环。它们不是简单替代关系，而是不同阶段下的不同作战方式。
          </p>
        </section>

        <section style={styles.tablePanel}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>维度</th>
                <th style={styles.th}>SEO</th>
                <th style={styles.th}>GEO</th>
                <th style={styles.th}>MGEO</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <td style={styles.tdLabel}>{row.label}</td>
                  <td style={styles.td}>{row.seo}</td>
                  <td style={styles.td}>{row.geo}</td>
                  <td style={styles.tdStrong}>{row.mgeo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section style={styles.summary}>
          <h2 style={styles.summaryTitle}>总结</h2>
          <p style={styles.summaryText}>
            SEO 没有过时，但它已经不足以覆盖 AI 时代品牌竞争的全部逻辑。GEO 补上了 AI 回答中的可见性问题，MGEO 则进一步解决企业如何把这件事做成方法、流程和结果闭环的问题。
          </p>
        </section>
      </main>
    </SiteShell>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1080,
    margin: "0 auto",
    padding: "40px 24px 88px",
    display: "grid",
    gap: 22,
  },
  hero: {
    borderRadius: 32,
    border: "1px solid var(--line)",
    background: "var(--surface)",
    padding: "42px 42px 36px",
    boxShadow: "var(--shadow-whisper)",
  },
  eyebrow: {
    color: "var(--brand-deep)",
    fontSize: 12,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontWeight: 700,
  },
  title: {
    margin: "16px 0 0",
    fontSize: "clamp(38px, 5vw, 60px)",
    lineHeight: 1.06,
    letterSpacing: "-0.04em",
    fontFamily: "var(--font-serif)",
  },
  lead: {
    margin: "18px 0 0",
    fontSize: 18,
    lineHeight: 1.85,
    color: "var(--muted)",
  },
  tablePanel: {
    borderRadius: 28,
    border: "1px solid var(--line)",
    background: "var(--surface)",
    padding: 26,
    boxShadow: "var(--shadow-whisper)",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "16px 14px",
    background: "#1f1f1e",
    color: "var(--surface)",
    fontSize: 15,
  },
  tdLabel: {
    padding: "18px 14px",
    borderBottom: "1px solid var(--line)",
    fontWeight: 700,
    verticalAlign: "top",
  },
  td: {
    padding: "18px 14px",
    borderBottom: "1px solid var(--line)",
    color: "var(--text-soft)",
    verticalAlign: "top",
    lineHeight: 1.7,
  },
  tdStrong: {
    padding: "18px 14px",
    borderBottom: "1px solid var(--line)",
    color: "var(--text)",
    fontWeight: 700,
    verticalAlign: "top",
    lineHeight: 1.7,
  },
  summary: {
    borderRadius: 28,
    border: "1px solid var(--line)",
    background: "linear-gradient(135deg, #f6ede6 0%, #f2e3d8 100%)",
    padding: "28px 30px",
  },
  summaryTitle: {
    margin: 0,
    fontSize: 32,
    lineHeight: 1.18,
    fontFamily: "var(--font-serif)",
  },
  summaryText: {
    margin: "12px 0 0",
    color: "var(--text-soft)",
    lineHeight: 1.85,
  },
};
