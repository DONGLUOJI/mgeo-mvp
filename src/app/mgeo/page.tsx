import type { Metadata } from "next";
import Link from "next/link";

import { SiteShell } from "@/components/marketing/SiteShell";

import { MGEO_NAV_ITEMS, MGEO_SHELL_PROPS } from "./content";

export const metadata: Metadata = {
  title: "MGEO - AI时代的品牌解释权系统",
  description:
    "MGEO 是一套把 GEO 做成可执行、可监测、可归因闭环的系统化方法，帮助企业建立 AI 时代的品牌解释权。",
};

const cards = [
  {
    title: "品牌事实资产",
    text: "先定义品牌是谁、能解决什么问题、哪些表述必须一致，给 AI 一个稳定可引用的官方知识底座。",
  },
  {
    title: "问题宇宙",
    text: "把用户会问的问题拆成认知、理解、比较和决策四层，让品牌不只是被搜到，而是在关键问题下被看见。",
  },
  {
    title: "监测与归因",
    text: "不只看有没有被提及，还看是否被准确解释、被优先引用，并把结果回收到业务动作里做复盘。",
  },
];

const comparisonRows = [
  {
    dimension: "定义层级",
    seo: "搜索优化方法",
    geo: "AI 搜索优化赛道",
    mgeo: "董逻辑的 GEO 系统方法",
  },
  {
    dimension: "核心目标",
    seo: "获取收录、排名与点击",
    geo: "提升品牌在 AI 回答中的可见性",
    mgeo: "建立品牌解释权，并形成可执行闭环",
  },
  {
    dimension: "优化对象",
    seo: "页面、关键词、结果页位置",
    geo: "AI 问答与引用表现",
    mgeo: "品牌底座、问题入口、内容结构、分发、监测与归因",
  },
  {
    dimension: "验证方式",
    seo: "收录、排名、点击流量",
    geo: "提及率、引用率、覆盖度",
    mgeo: "一致性、覆盖度、权威性、风险与归因结果",
  },
];

const frameworkSteps = [
  "品牌信息梳理",
  "问题训练",
  "文章训练",
  "证据链分发",
  "监测归因",
];

const articleLinks = [
  {
    href: "/mgeo/what-is-mgeo",
    title: "MGEO是什么",
    text: "解释 GEO 是赛道、MGEO 是方法，回答企业为什么不能只停留在概念层。",
  },
  {
    href: "/mgeo/mgeo-vs-seo",
    title: "MGEO和SEO有什么区别",
    text: "从搜索排名走到品牌解释权，讲清 GEO 和 SEO 不是简单的替代关系。",
  },
];

export default function MgeoIndexPage() {
  return (
    <SiteShell
      current="/mgeo"
      hideFooter={false}
      navItems={MGEO_NAV_ITEMS}
      {...MGEO_SHELL_PROPS}
    >
      <main style={styles.page}>
        <section style={styles.hero}>
          <div style={styles.heroPanel}>
            <div style={styles.eyebrow}>MGEO</div>
            <h1 style={styles.title}>MGEO：把 GEO 做成闭环</h1>
            <p style={styles.text}>
              GEO 讲的是品牌如何在 AI 回答里被看见，MGEO 讲的是企业如何把这件事做成一套可执行、可验证、可持续优化的系统。它把品牌事实资产、问题入口、内容结构、证据链分发、监测与归因连接起来，形成一套面向 AI 时代品牌解释权的完整方法闭环。
            </p>
            <div style={styles.actions}>
              <Link href="#framework" style={styles.primaryButton}>
                查看方法
              </Link>
              <Link href="#whitepaper" style={styles.secondaryButton}>
                下载白皮书
              </Link>
              <Link href="/#detector" style={styles.secondaryButton}>
                免费检测
              </Link>
            </div>
          </div>
        </section>

        <section style={styles.cardGrid}>
          {cards.map((card) => (
            <article key={card.title} style={styles.card}>
              <h2 style={styles.cardTitle}>{card.title}</h2>
              <p style={styles.cardText}>{card.text}</p>
            </article>
          ))}
        </section>

        <section style={styles.section} id="comparison">
          <div style={styles.sectionPanel}>
            <div style={styles.sectionEyebrow}>MGEO vs GEO vs SEO</div>
            <h2 style={styles.sectionTitle}>MGEO 不是多一个模型，而是把 GEO 做成系统。</h2>
            <p style={styles.sectionText}>
              真正的区别不在技术名词，而在于企业是否有一套从品牌底座、问题入口、内容结构、分发、监测到归因的完整经营闭环。
            </p>
            <div style={styles.tableWrap}>
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
                  {comparisonRows.map((row) => (
                    <tr key={row.dimension}>
                      <td style={styles.tdLabel}>{row.dimension}</td>
                      <td style={styles.td}>{row.seo}</td>
                      <td style={styles.td}>{row.geo}</td>
                      <td style={styles.tdStrong}>{row.mgeo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section style={styles.section} id="framework">
          <div style={styles.sectionPanel}>
            <div style={styles.sectionEyebrow}>How MGEO Works</div>
            <h2 style={styles.sectionTitle}>MGEO 怎么做</h2>
            <p style={styles.sectionText}>
              MGEO 不从“先写几篇文章”开始，而是从“先定义品牌如何被 AI 正确理解”开始。它最少需要走完下面 5 步，才能形成可运行的 GEO 闭环。
            </p>
            <div style={styles.stepGrid}>
              {frameworkSteps.map((step, index) => (
                <div key={step} style={styles.stepCard}>
                  <div style={styles.stepIndex}>0{index + 1}</div>
                  <div style={styles.stepText}>{step}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.section} id="articles">
          <div style={styles.sectionPanel}>
            <div style={styles.sectionEyebrow}>Core Articles</div>
            <h2 style={styles.sectionTitle}>核心文章入口</h2>
            <div style={styles.articleGrid}>
              {articleLinks.map((article) => (
                <article key={article.href} style={styles.articleCard}>
                  <h3 style={styles.articleTitle}>{article.title}</h3>
                  <p style={styles.articleText}>{article.text}</p>
                  <Link href={article.href} style={styles.articleLink}>
                    阅读这篇
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.section} id="whitepaper">
          <div style={styles.whitepaperPanel}>
            <div>
              <div style={styles.sectionEyebrow}>Whitepaper</div>
              <h2 style={styles.sectionTitle}>MGEO 白皮书</h2>
              <p style={styles.sectionText}>
                适合想快速理解 GEO 时代品牌解释权竞争、MGEO 方法结构以及企业落地路径的人先看。它不只是概念介绍，而是董逻辑当前的系统判断。
              </p>
            </div>
            <div style={styles.whitepaperActions}>
              <Link href="/whitepaper" style={styles.primaryButton}>
                查看白皮书
              </Link>
              <Link href="/#contact" style={styles.secondaryButton}>
                获取方案
              </Link>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "40px 24px 88px",
    display: "grid",
    gap: 24,
  },
  hero: {
    display: "grid",
  },
  heroPanel: {
    borderRadius: 36,
    padding: "46px 44px",
    background: "linear-gradient(135deg, #1b1a18 0%, #324536 100%)",
    color: "var(--surface)",
    boxShadow: "var(--shadow-whisper)",
  },
  eyebrow: {
    display: "inline-flex",
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.1)",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  title: {
    margin: "18px 0 0",
    fontSize: "clamp(40px, 6vw, 64px)",
    lineHeight: 1.05,
    letterSpacing: "-0.05em",
    fontFamily: "var(--font-serif)",
  },
  text: {
    margin: "18px 0 0",
    maxWidth: 860,
    fontSize: 18,
    lineHeight: 1.85,
    color: "rgba(255,255,255,0.82)",
  },
  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 24,
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    padding: "0 18px",
    borderRadius: 16,
    background: "var(--surface)",
    color: "var(--dark)",
    textDecoration: "none",
    fontWeight: 700,
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    padding: "0 18px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    color: "var(--surface)",
    textDecoration: "none",
    fontWeight: 700,
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 16,
  },
  card: {
    borderRadius: 24,
    border: "1px solid var(--line)",
    background: "var(--surface)",
    padding: 24,
    boxShadow: "var(--shadow-whisper)",
  },
  cardTitle: {
    margin: 0,
    fontSize: 28,
    lineHeight: 1.2,
  },
  cardText: {
    margin: "12px 0 0",
    color: "var(--muted)",
    lineHeight: 1.8,
  },
  section: {
    display: "grid",
  },
  sectionPanel: {
    borderRadius: 28,
    border: "1px solid var(--line)",
    background: "var(--surface)",
    padding: 32,
    boxShadow: "var(--shadow-whisper)",
  },
  sectionEyebrow: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--brand-deep)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  sectionTitle: {
    margin: "12px 0 0",
    fontSize: 40,
    lineHeight: 1.12,
    letterSpacing: "-0.03em",
    fontFamily: "var(--font-serif)",
    color: "var(--text)",
  },
  sectionText: {
    margin: "14px 0 0",
    maxWidth: 860,
    color: "var(--muted)",
    lineHeight: 1.85,
    fontSize: 17,
  },
  tableWrap: {
    marginTop: 22,
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
  stepGrid: {
    marginTop: 22,
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 14,
  },
  stepCard: {
    borderRadius: 20,
    border: "1px solid var(--line)",
    background: "var(--surface-soft)",
    padding: 18,
    display: "grid",
    gap: 10,
    alignContent: "start",
  },
  stepIndex: {
    width: 38,
    height: 38,
    borderRadius: 999,
    background: "var(--brand-soft)",
    color: "var(--brand)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
  },
  stepText: {
    fontSize: 18,
    lineHeight: 1.5,
    color: "var(--text)",
    fontWeight: 600,
  },
  articleGrid: {
    marginTop: 22,
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },
  articleCard: {
    borderRadius: 22,
    border: "1px solid var(--line)",
    background: "var(--surface-soft)",
    padding: 24,
  },
  articleTitle: {
    margin: 0,
    fontSize: 28,
    lineHeight: 1.2,
  },
  articleText: {
    margin: "12px 0 0",
    color: "var(--muted)",
    lineHeight: 1.8,
  },
  articleLink: {
    display: "inline-flex",
    marginTop: 18,
    textDecoration: "none",
    color: "var(--brand)",
    fontWeight: 700,
  },
  whitepaperPanel: {
    borderRadius: 28,
    border: "1px solid var(--line)",
    background: "linear-gradient(135deg, #efe1d4 0%, #f6ede6 100%)",
    padding: "30px 32px",
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
    alignItems: "center",
  },
  whitepaperActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
};
