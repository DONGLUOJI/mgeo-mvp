import type { Metadata } from "next";
import Link from "next/link";

import { SiteShell } from "@/components/marketing/SiteShell";

export const metadata: Metadata = {
  title: "方法案例 - 董逻辑MGEO",
  description: "品牌在 AI 搜索中的问题各不相同，但解决路径是系统化的。查看 MGEO 方法论应对三类典型问题场景的方式。",
};

const scenarioCards = [
  {
    tag: "Consistency 一致性",
    tagStyle: "consistency",
    title: "当品牌在各 AI 平台的描述互相矛盾",
    description:
      "用户在豆包上搜到的品牌介绍和 DeepSeek 上完全不同。品牌定位越模糊，AI 越不敢推荐你。",
    steps: [
      "检测 6 大平台对品牌的描述，量化冲突率",
      "建立统一的品牌叙事框架",
      "在各平台可抓取的内容源中统一品牌信息",
      "持续监测 Consistency 分数变化",
    ],
    outcomes: [
      { label: "典型提升", value: "15-30 分" },
      { label: "冲突率", value: "10% 以内" },
      { label: "周期", value: "2-4 周" },
    ],
    cta: "你的品牌描述一致吗？",
  },
  {
    tag: "Coverage 覆盖度",
    tagStyle: "coverage",
    title: "当品牌只在 1-2 个 AI 平台被提及",
    description:
      "你的品牌在文心里能搜到，但在豆包、DeepSeek、Kimi 上完全不存在。你只触达了不到 20% 的 AI 搜索用户。",
    steps: [
      "检测品牌在 6 大平台的覆盖情况",
      "分析缺失平台的内容偏好",
      "针对缺失平台生产适配内容",
      "持续监测 Coverage 分数变化",
    ],
    outcomes: [
      { label: "覆盖平台", value: "4-5 个" },
      { label: "典型提升", value: "20-40 分" },
      { label: "周期", value: "3-6 周" },
    ],
    cta: "你的品牌覆盖了几个平台？",
  },
  {
    tag: "Authority 权威性",
    tagStyle: "authority",
    title: "当品牌被提及但引用来源不够权威",
    description:
      "AI 提到了你的品牌，但引用的来源是论坛帖子或低质量博客。权威信源的内容会被优先引用和推荐。",
    steps: [
      "检测品牌当前被引用的信源质量",
      "制定高权重信源布局策略",
      "在目标信源平台发布结构化内容",
      "持续监测 Authority 分数变化",
    ],
    outcomes: [
      { label: "高权重信源", value: "3-8 个" },
      { label: "典型提升", value: "10-25 分" },
      { label: "周期", value: "4-8 周" },
    ],
    cta: "你的品牌信源够权威吗？",
  },
] as const;

const timeline = [
  {
    phase: "第 1 周",
    title: "检测 + 诊断",
    bullets: ["TCA 基准评分", "找出核心问题", "制定优化方案"],
  },
  {
    phase: "第 2-3 周",
    title: "内容适配 + 发布",
    bullets: ["统一品牌叙事", "按平台生产内容", "发布到高权重平台"],
  },
  {
    phase: "第 4 周",
    title: "效果监测",
    bullets: ["跟踪 6 平台变化", "对比优化前后", "异常预警"],
  },
  {
    phase: "持续",
    title: "复盘迭代",
    bullets: ["每周数据报告", "策略调整", "下一轮优化"],
  },
] as const;

const scoreCards = [
  {
    name: "Consistency",
    subtitle: "衡量品牌信息统一程度",
    qualified: "60 分",
    excellent: "80 分",
    typical: "2-4 周 +15~30 分",
  },
  {
    name: "Coverage",
    subtitle: "衡量平台触达广度",
    qualified: "60 分",
    excellent: "80 分",
    typical: "3-6 周 +20~40 分",
  },
  {
    name: "Authority",
    subtitle: "衡量信源可信程度",
    qualified: "60 分",
    excellent: "80 分",
    typical: "4-8 周 +10~25 分",
  },
] as const;

type TagStyle = "consistency" | "coverage" | "authority";

const tagStyles: Record<TagStyle, React.CSSProperties> = {
  consistency: {
    background: "#e7f7f1",
    color: "#0a7c66",
  },
  coverage: {
    background: "#ebf2ff",
    color: "#315fd6",
  },
  authority: {
    background: "#f0ecff",
    color: "#6e44d8",
  },
};

export default function CasesPage() {
  return (
    <SiteShell current="/cases" hideFooter>
      <main style={styles.page}>
        <section style={styles.hero}>
          <div style={styles.heroPanel}>
            <h1 style={styles.heroTitle}>方法案例</h1>
            <p style={styles.heroText}>
              品牌在 AI 搜索中的问题各不相同，但解决路径是系统化的。以下是最常见的三类问题场景，以及 MGEO 方法论的应对方式。
            </p>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionEyebrow}>三种典型问题场景</div>
          </div>
          <div style={styles.cardGrid}>
            {scenarioCards.map((item) => (
              <article key={item.title} style={styles.sceneCard}>
                <span style={{ ...styles.sceneTag, ...tagStyles[item.tagStyle] }}>{item.tag}</span>
                <h2 style={styles.sceneTitle}>{item.title}</h2>
                <p style={styles.sceneDescription}>{item.description}</p>

                <div style={styles.stepsBlock}>
                  <div style={styles.stepsTitle}>MGEO 方法</div>
                  <ol style={styles.stepsList}>
                    {item.steps.map((step) => (
                      <li key={step} style={styles.stepItem}>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <div style={styles.metricsGrid}>
                  {item.outcomes.map((metric) => (
                    <div key={metric.label} style={styles.metricCard}>
                      <div style={styles.metricLabel}>{metric.label}</div>
                      <div style={styles.metricValue}>{metric.value}</div>
                    </div>
                  ))}
                </div>

                <Link href="/#detector" style={styles.sceneCta}>
                  {item.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionCard}>
            <div style={styles.blockHeader}>
              <h2 style={styles.blockTitle}>无论哪种问题，解决路径都是清晰的</h2>
            </div>

            <div style={styles.timeline}>
              {timeline.map((item, index) => (
                <article key={item.phase} style={styles.timelineItem}>
                  <div style={styles.timelineTop}>
                    <span style={styles.timelineDot} />
                    {index < timeline.length - 1 ? <span style={styles.timelineLine} /> : null}
                  </div>
                  <div style={styles.timelinePhase}>{item.phase}</div>
                  <h3 style={styles.timelineTitle}>{item.title}</h3>
                  <ul style={styles.timelineList}>
                    {item.bullets.map((bullet) => (
                      <li key={bullet} style={styles.timelineBullet}>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionCard}>
            <div style={styles.blockHeader}>
              <h2 style={styles.blockTitle}>我们用数据衡量效果，而不是感觉</h2>
            </div>

            <div style={styles.scoreGrid}>
              {scoreCards.map((item) => (
                <article key={item.name} style={styles.scoreCard}>
                  <h3 style={styles.scoreTitle}>{item.name}</h3>
                  <p style={styles.scoreSubtitle}>{item.subtitle}</p>
                  <div style={styles.scoreRow}>
                    <span>合格线</span>
                    <strong>{item.qualified}</strong>
                  </div>
                  <div style={styles.scoreRow}>
                    <span>优秀线</span>
                    <strong>{item.excellent}</strong>
                  </div>
                  <div style={styles.scoreTypical}>
                    <span style={styles.scoreTypicalLabel}>典型提升</span>
                    <strong style={styles.scoreTypicalValue}>{item.typical}</strong>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.ctaSection}>
          <div style={styles.ctaCard}>
            <div style={styles.ctaBody}>
              <h2 style={styles.ctaTitle}>你的品牌属于哪种情况？</h2>
              <p style={styles.ctaText}>先做一次免费检测，30 秒内拿到 TCA 评分，就知道应该优先解决什么。</p>
            </div>
            <div style={styles.ctaActions}>
              <Link href="/#detector" style={styles.ctaPrimary}>
                免费检测你的品牌
              </Link>
              <Link href="/#contact" style={styles.ctaSecondary}>
                联系我们获取定制方案
              </Link>
            </div>
            <div style={styles.ctaNote}>
              以上预期效果基于 MGEO 方法论的典型应用场景，具体效果因品牌和行业差异而异。
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
    margin: "38px auto 32px",
    padding: "0 24px",
  },
  heroPanel: {
    background: "linear-gradient(135deg, #0d1117 0%, #17382f 100%)",
    color: "#ffffff",
    borderRadius: 36,
    padding: "56px 54px 58px",
    boxShadow: "0 18px 44px rgba(15, 23, 42, 0.08)",
  },
  heroTitle: {
    margin: 0,
    fontSize: 68,
    lineHeight: 1.02,
    letterSpacing: "-0.04em",
    fontWeight: 800,
  },
  heroText: {
    maxWidth: 980,
    margin: "22px 0 0",
    fontSize: 21,
    lineHeight: 1.8,
    color: "rgba(255,255,255,0.82)",
  },
  section: {
    maxWidth: 1240,
    margin: "0 auto 32px",
    padding: "0 24px",
  },
  sectionHeader: {
    display: "grid",
    justifyItems: "start",
    textAlign: "left",
    marginBottom: 26,
    padding: "0 6px",
  },
  sectionEyebrow: {
    color: "#0a7c66",
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.5,
    letterSpacing: "-0.01em",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 22,
  },
  sceneCard: {
    background: "#ffffff",
    border: "1px solid #e6e9ef",
    borderRadius: 32,
    padding: 32,
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.05)",
    display: "grid",
    alignContent: "start",
  },
  sceneTag: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "fit-content",
    borderRadius: 999,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 18,
  },
  sceneTitle: {
    margin: 0,
    fontSize: 32,
    lineHeight: 1.18,
    color: "#1d1d1f",
    letterSpacing: "-0.03em",
    fontWeight: 800,
  },
  sceneDescription: {
    margin: "14px 0 0",
    fontSize: 16,
    lineHeight: 1.85,
    color: "#4f5562",
  },
  stepsBlock: {
    marginTop: 24,
    paddingLeft: 20,
    borderLeft: "2px solid #dde4ed",
  },
  stepsTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#202226",
    marginBottom: 14,
  },
  stepsList: {
    margin: 0,
    paddingLeft: 18,
    display: "grid",
    gap: 12,
  },
  stepItem: {
    color: "#2f3440",
    fontSize: 16,
    lineHeight: 1.72,
    paddingLeft: 2,
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
    marginTop: 24,
  },
  metricCard: {
    background: "#f7f8fb",
    borderRadius: 20,
    padding: "16px 16px 18px",
    minHeight: 96,
  },
  metricLabel: {
    color: "#818897",
    fontSize: 12,
    lineHeight: 1.4,
  },
  metricValue: {
    marginTop: 10,
    color: "#1d1d1f",
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: "-0.03em",
  },
  sceneCta: {
    display: "inline-flex",
    alignItems: "center",
    marginTop: 24,
    paddingTop: 18,
    borderTop: "1px solid #edf0f4",
    color: "#0a7c66",
    textDecoration: "none",
    fontSize: 16,
    fontWeight: 700,
  },
  sectionCard: {
    background: "#ffffff",
    borderRadius: 34,
    padding: 48,
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.06)",
  },
  blockHeader: {
    maxWidth: 820,
    marginBottom: 30,
  },
  blockTitle: {
    margin: 0,
    fontSize: 44,
    lineHeight: 1.1,
    letterSpacing: "-0.03em",
    color: "#1d1d1f",
  },
  timeline: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 24,
  },
  timelineItem: {
    position: "relative",
  },
  timelineTop: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    minHeight: 20,
    marginBottom: 18,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    background: "#0a7c66",
    boxShadow: "0 0 0 6px rgba(10, 124, 102, 0.12)",
    flexShrink: 0,
    position: "relative",
    zIndex: 2,
  },
  timelineLine: {
    height: 2,
    flex: 1,
    background: "#dbe3eb",
    marginLeft: 10,
  },
  timelinePhase: {
    color: "#0a7c66",
    fontSize: 15,
    fontWeight: 700,
  },
  timelineTitle: {
    margin: "10px 0 0",
    fontSize: 28,
    lineHeight: 1.22,
    color: "#1d1d1f",
  },
  timelineList: {
    listStyle: "none",
    margin: "14px 0 0",
    padding: 0,
    display: "grid",
    gap: 10,
  },
  timelineBullet: {
    color: "#5a6270",
    fontSize: 16,
    lineHeight: 1.72,
  },
  scoreGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 20,
  },
  scoreCard: {
    background: "#f7f8fb",
    borderRadius: 28,
    padding: 30,
  },
  scoreTitle: {
    margin: 0,
    fontSize: 34,
    lineHeight: 1.1,
    color: "#1d1d1f",
  },
  scoreSubtitle: {
    margin: "12px 0 0",
    fontSize: 16,
    lineHeight: 1.75,
    color: "#667085",
  },
  scoreRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
    fontSize: 16,
    color: "#475467",
  },
  scoreTypical: {
    marginTop: 22,
    paddingTop: 18,
    borderTop: "1px solid #e4e7ec",
  },
  scoreTypicalLabel: {
    display: "block",
    color: "#818897",
    fontSize: 12,
  },
  scoreTypicalValue: {
    display: "block",
    marginTop: 10,
    color: "#1d1d1f",
    fontSize: 24,
    lineHeight: 1.35,
  },
  ctaSection: {
    maxWidth: 1240,
    margin: "0 auto 28px",
    padding: "0 24px",
  },
  ctaCard: {
    borderRadius: 30,
    padding: "38px 40px",
    background: "#111827",
    color: "#ffffff",
    display: "grid",
    gap: 20,
  },
  ctaBody: {
    maxWidth: 820,
  },
  ctaTitle: {
    margin: 0,
    fontSize: 40,
    lineHeight: 1.08,
  },
  ctaText: {
    margin: "12px 0 0",
    fontSize: 18,
    lineHeight: 1.8,
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
    minHeight: 56,
    padding: "0 20px",
    borderRadius: 14,
    background: "#0fbc8c",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 700,
  },
  ctaSecondary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    padding: "0 20px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.28)",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 700,
  },
  ctaNote: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 13,
    lineHeight: 1.7,
  },
};
