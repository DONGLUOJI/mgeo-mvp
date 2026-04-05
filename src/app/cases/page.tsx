import Link from "next/link";
import { SiteShell } from "@/components/marketing/SiteShell";

const cases = [
  {
    tag: "企业服务",
    title: "品牌定位混乱的咨询公司",
    summary: "30 天内品牌理解一致性明显提升，稳定提及平台增加 3 个。",
    detail: "通过统一品牌叙事、补齐关键内容支撑和诊断报告解读，让多模型对品牌的理解从泛化服务商收敛到明确的 AI 搜索增长服务。",
    metrics: ["Consistency +22%", "覆盖平台 +3", "报告转化率 41%"],
    bullets: ["统一品牌关键词与一句话定位", "补齐平台可引用内容入口", "把检测报告改造成服务沟通材料"],
  },
  {
    tag: "本地生活",
    title: "区域门店业务的 AI 覆盖不足",
    summary: "重点问题场景覆盖提升 48%，区域推荐出现率进入 Top 3。",
    detail: "围绕本地场景、用户决策问题和门店关键词补齐内容入口，缩短从被识别到被推荐的距离。",
    metrics: ["覆盖场景 +48%", "区域推荐 Top3", "线索成本 -18%"],
    bullets: ["围绕门店与区域问题补内容", "强化高频问答中的品牌提及", "持续看推荐位而不只看提及数"],
  },
  {
    tag: "品牌增长",
    title: "已有内容基础但信源偏弱的品牌",
    summary: "权威性评分提升 2.1 分，高质量引用入口增加 4 个。",
    detail: "通过补强外部支撑内容和可信引用结构，让模型对品牌给出更稳定、更可信的表达与推荐。",
    metrics: ["Authority +2.1", "外部引用 +4", "推荐稳定性提升"],
    bullets: ["重建可信引用链路", "补足权威内容与案例信源", "把内容分发到更适合的平台生态"],
  },
];

export default function CasesPage() {
  return (
    <SiteShell current="/cases" ctaHref="/register" ctaLabel="注册" hideFooter>
      <main style={styles.page}>
        <section style={styles.hero}>
          <div style={styles.heroPanel}>
            <h1 style={styles.heroTitle}>案例成果</h1>
            <p style={styles.heroText}>
              用更接近你原始 HTML 的页面结构，展示品牌在 AI 搜索场景中的问题、动作与结果变化，让案例页同时承担认知与转化作用。
            </p>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>结构化案例说明品牌在 AI 搜索中的变化路径</h2>
              <p style={styles.sectionText}>从问题识别、执行动作到结果变化，案例页用于展示 MGEO 服务的实际交付方式与增长结果。</p>
            </div>

            <div style={styles.caseGrid}>
              {cases.map((item) => (
                <article key={item.title} style={styles.caseCard}>
                  <span style={styles.caseTag}>{item.tag}</span>
                  <h3 style={styles.caseTitle}>{item.title}</h3>
                  <p style={styles.caseSummary}>{item.summary}</p>
                  <p style={styles.caseMeta}>{item.detail}</p>

                  <div style={styles.caseMetrics}>
                    {item.metrics.map((metric) => (
                      <div key={metric} style={styles.caseMetric}>
                        <strong>{metric.split(" ")[0]}</strong>
                        <span>{metric.slice(metric.indexOf(" ") + 1)}</span>
                      </div>
                    ))}
                  </div>

                  <ul style={styles.caseList}>
                    {item.bullets.map((bullet) => (
                      <li key={bullet} style={styles.caseListItem}>
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  <Link href="/#detector" style={styles.caseLink}>
                    先检测我的品牌
                  </Link>
                </article>
              ))}
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
    background: "linear-gradient(135deg, #0d1117 0%, #17382f 100%)",
    color: "#ffffff",
    borderRadius: 32,
    padding: 46,
    boxShadow: "0 12px 36px rgba(15, 23, 42, 0.06)",
  },
  heroTitle: {
    margin: 0,
    fontSize: 58,
    lineHeight: 1.08,
    letterSpacing: "-0.04em",
  },
  heroText: {
    maxWidth: 860,
    margin: "16px 0 0",
    fontSize: 19,
    lineHeight: 1.75,
    color: "rgba(255,255,255,0.82)",
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
    maxWidth: 760,
    marginBottom: 24,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 40,
    lineHeight: 1.15,
    letterSpacing: "-0.03em",
  },
  sectionText: {
    margin: "12px 0 0",
    fontSize: 17,
    lineHeight: 1.65,
    color: "#6e6e73",
  },
  caseGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 18,
  },
  caseCard: {
    background: "#fbfbfc",
    border: "1px solid #ececf0",
    borderRadius: 26,
    padding: 26,
  },
  caseTag: {
    display: "inline-block",
    marginBottom: 14,
    padding: "6px 12px",
    borderRadius: 999,
    background: "#e9f7f3",
    color: "#0a7c66",
    fontSize: 13,
    fontWeight: 700,
  },
  caseTitle: {
    margin: 0,
    fontSize: 24,
    lineHeight: 1.35,
    color: "#1d1d1f",
  },
  caseSummary: {
    margin: "12px 0 0",
    fontSize: 18,
    lineHeight: 1.6,
    color: "#0a7c66",
    fontWeight: 600,
  },
  caseMeta: {
    margin: "14px 0 0",
    fontSize: 15,
    lineHeight: 1.7,
    color: "#1d1d1f",
  },
  caseMetrics: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 18,
    marginBottom: 18,
  },
  caseMetric: {
    display: "inline-flex",
    alignItems: "baseline",
    gap: 6,
    padding: "8px 12px",
    borderRadius: 14,
    background: "#ffffff",
    border: "1px solid #ececf0",
  },
  caseList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  caseListItem: {
    fontSize: 15,
    lineHeight: 1.6,
    padding: "12px 0",
    borderTop: "1px solid #ececf0",
  },
  caseLink: {
    display: "inline-flex",
    alignItems: "center",
    marginTop: 18,
    color: "#0a7c66",
    textDecoration: "none",
    fontWeight: 700,
  },
};
