import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/marketing/SiteShell";

export const metadata: Metadata = {
  title: "MGEO标准白皮书 - 董逻辑MGEO",
  description: "查看 MGEO 标准白皮书的核心目录、摘要预览与 TCA 三支柱模型说明。",
};

const toc = [
  { id: "ch1", title: "第一章：前言与背景" },
  { id: "ch2", title: "第二章：MGEO基础理论" },
  { id: "ch3", title: "第三章：MGEO三支柱模型（TCA Model）" },
  { id: "ch4", title: "第四章：MGEO技术架构" },
  { id: "ch5", title: "第五章：MGEO实施标准" },
  { id: "ch6", title: "第六章：MGEO评估体系" },
];

const previewPoints = [
  "6 章核心目录，帮助快速理解 MGEO 的方法框架",
  "TCA 三支柱模型，明确一致性、覆盖度、权威性的诊断逻辑",
  "适合先读摘要，再回到免费检测查看自己品牌的真实问题",
];

export default function WhitepaperPage() {
  return (
    <SiteShell current="/whitepaper" hideFooter>
      <main style={styles.page}>
        <section style={styles.hero}>
          <h1 style={styles.heroTitle}>MGEO标准白皮书</h1>
          <p style={styles.heroSubtitle}>Multi-model Generative Engine Optimization Standard White Paper</p>
          <div style={styles.heroMeta}>
            <span>提出者：董逻辑</span>
          </div>
        </section>

        <div style={styles.mainContent}>
          <section style={styles.toc}>
            <div style={styles.tocHead}>
              <div>
                <h2 style={styles.tocTitle}>目录</h2>
                <p style={styles.tocText}>当前页保留核心摘要，帮助你先快速理解 MGEO 的理论框架与评分逻辑。</p>
              </div>
              <span style={styles.previewBadge}>摘要预览</span>
            </div>
            <ul style={styles.tocList}>
              {toc.map((item) => (
                <li key={item.id} style={styles.tocItem}>
                  <a href={`#${item.id}`} style={styles.tocLink}>
                    <span style={styles.tocTitleRow}>
                      <span>{item.title}</span>
                      <span style={styles.summaryPill}>摘要</span>
                    </span>
                    <span>→</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section style={styles.previewPanel}>
            <div style={styles.previewCopy}>
              <div style={styles.previewEyebrow}>阅读建议</div>
              <h2 style={styles.previewTitle}>先看摘要，再回到检测页验证自己的品牌问题</h2>
              <p style={styles.previewText}>
                白皮书页当前更适合作为方法框架预览。你可以先理解 MGEO 的核心概念、评分方式和实施思路，再结合品牌检测结果做判断。
              </p>
            </div>
            <div style={styles.previewMeta}>
              {previewPoints.map((point) => (
                <div key={point} style={styles.previewItem}>
                  {point}
                </div>
              ))}
              <div style={styles.previewActions}>
                <Link href="/#detector" style={styles.previewPrimary}>
                  回到免费检测
                </Link>
                <Link href="/pricing" style={styles.previewSecondary}>
                  查看服务方案
                </Link>
              </div>
            </div>
          </section>

          <section id="ch1" style={styles.chapter}>
            <h2 style={styles.chapterTitle}>
              第一章：前言与背景
              <span style={styles.chapterBadge}>摘要</span>
            </h2>
            <h3 style={styles.chapterSubtitle}>1.1 生成式AI的范式转移</h3>
            <ul style={styles.list}>
              <li style={styles.listItem}>从搜索引擎到生成式引擎</li>
              <li style={styles.listItem}>单一模型到模型融合的演进</li>
              <li style={styles.listItem}>品牌可见性面临的全新挑战</li>
            </ul>
            <h3 style={styles.chapterSubtitle}>1.2 为什么需要MGEO？</h3>
            <ul style={styles.list}>
              <li style={styles.listItem}>传统 SEO / GEO 的局限性</li>
              <li style={styles.listItem}>模型融合时代的“民主投票”机制</li>
              <li style={styles.listItem}>品牌一致性的商业价值</li>
            </ul>
          </section>

          <section id="ch2" style={styles.chapter}>
            <h2 style={styles.chapterTitle}>
              第二章：MGEO基础理论
              <span style={styles.chapterBadge}>摘要</span>
            </h2>
            <h3 style={styles.chapterSubtitle}>2.1 核心定义</h3>
            <div style={styles.quoteBox}>
              <p style={styles.quoteText}>
                MGEO（Multi-model Generative Engine Optimization）：通过系统性优化品牌信息在多个生成式AI模型中的一致性、覆盖度和权威性，确保在模型融合场景下获得更高曝光权重与推荐优先级的策略体系。
              </p>
            </div>

            <h3 style={styles.chapterSubtitle}>2.2 MGEO vs GEO vs SEO</h3>
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
                <tr>
                  <td style={styles.td}>优化对象</td>
                  <td style={styles.td}>搜索引擎</td>
                  <td style={styles.td}>单一AI模型</td>
                  <td style={styles.td}>多模型 + 融合机制</td>
                </tr>
                <tr>
                  <td style={styles.td}>核心指标</td>
                  <td style={styles.td}>排名</td>
                  <td style={styles.td}>提及率</td>
                  <td style={styles.td}>一致性 + 覆盖度 + 权威性</td>
                </tr>
                <tr>
                  <td style={styles.td}>适用场景</td>
                  <td style={styles.td}>传统搜索</td>
                  <td style={styles.td}>AI搜索初期</td>
                  <td style={styles.td}>AI融合时代</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section id="ch3" style={styles.chapter}>
            <h2 style={styles.chapterTitle}>
              第三章：MGEO三支柱模型（TCA Model）
              <span style={styles.chapterBadge}>摘要</span>
            </h2>
            <h3 style={styles.chapterSubtitle}>3.1 Consistency（一致性）</h3>
            <p style={styles.paragraph}>定义：品牌信息在不同 AI 模型中的描述统一度。</p>
            <h3 style={styles.chapterSubtitle}>3.2 Coverage（覆盖度）</h3>
            <p style={styles.paragraph}>定义：品牌在主流 AI 模型中的可见性覆盖范围。</p>
            <h3 style={styles.chapterSubtitle}>3.3 Authority（权威性）</h3>
            <p style={styles.paragraph}>定义：品牌信息被 AI 模型采信的程度。</p>
          </section>

          <section id="ch4" style={styles.chapter}>
            <h2 style={styles.chapterTitle}>
              第四章：MGEO技术架构
              <span style={styles.chapterBadge}>摘要</span>
            </h2>
            <ul style={styles.list}>
              <li style={styles.listItem}>多模型监测体系：主流模型 API 接入、实时查询与结果抓取、结构化数据存储与分析。</li>
              <li style={styles.listItem}>一致性分析引擎：NLP 语义相似度计算、实体识别与对齐、冲突检测与预警。</li>
              <li style={styles.listItem}>优化建议生成器：基于 TCA 评分的诊断报告与自动化建议。</li>
            </ul>
          </section>

          <section id="ch5" style={styles.chapter}>
            <h2 style={styles.chapterTitle}>
              第五章：MGEO实施标准
              <span style={styles.chapterBadge}>摘要</span>
            </h2>
            <h3 style={styles.chapterSubtitle}>5.1 MGEO成熟度等级</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>等级</th>
                  <th style={styles.th}>名称</th>
                  <th style={styles.th}>TCA评分</th>
                  <th style={styles.th}>特征</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}>L0</td>
                  <td style={styles.td}>初始级</td>
                  <td style={styles.td}>{"<30"}</td>
                  <td style={styles.td}>仅 1-2 个平台有提及，描述混乱</td>
                </tr>
                <tr>
                  <td style={styles.td}>L1</td>
                  <td style={styles.td}>基础级</td>
                  <td style={styles.td}>30-50</td>
                  <td style={styles.td}>主流平台有覆盖，但一致性差</td>
                </tr>
                <tr>
                  <td style={styles.td}>L2</td>
                  <td style={styles.td}>进阶级</td>
                  <td style={styles.td}>50-70</td>
                  <td style={styles.td}>覆盖较全，一致性良好</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section id="ch6" style={styles.chapter}>
            <h2 style={styles.chapterTitle}>
              第六章：MGEO评估体系
              <span style={styles.chapterBadge}>摘要</span>
            </h2>
            <h3 style={styles.chapterSubtitle}>6.1 MGEO Score（综合评分）</h3>
            <div style={styles.formula}>MGEO Score = (Consistency × 0.4) + (Coverage × 0.3) + (Authority × 0.3)</div>
            <p style={styles.paragraph}>满分 100 分，合格线 60 分，优秀线 80 分。它不是单看“是否被提及”，而是把品牌在模型里的稳定理解与推荐基础一起考虑。</p>
          </section>

          <section style={styles.ctaPanel}>
            <div>
              <h2 style={styles.ctaTitle}>看完白皮书，下一步更适合直接做一次检测</h2>
              <p style={styles.ctaText}>先用真实品牌问题生成一份检测报告，再判断你当前更适合补一致性、覆盖度还是权威性。</p>
            </div>
            <div style={styles.ctaActions}>
              <Link href="/#detector" style={styles.primaryButton}>
                回到免费检测
              </Link>
              <Link href="/pricing" style={styles.secondaryButton}>
                查看服务方案
              </Link>
            </div>
          </section>
        </div>

        <footer style={styles.footer}>
          <div style={styles.footerCopyright}>Copyright © 2026 董逻辑MGEO. 保留所有权利。</div>
        </footer>
      </main>
    </SiteShell>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "#ffffff",
    minHeight: "100vh",
  },
  hero: {
    background: "linear-gradient(180deg, #1a1f2e 0%, #2d3748 100%)",
    padding: "120px 40px 80px",
    textAlign: "center",
    marginTop: 52,
  },
  heroTitle: {
    margin: 0,
    fontSize: 48,
    fontWeight: 700,
    color: "#f5f5f7",
  },
  heroSubtitle: {
    fontSize: 21,
    color: "#a1a1a6",
    maxWidth: 800,
    margin: "16px auto 40px",
  },
  heroMeta: {
    display: "flex",
    justifyContent: "center",
    gap: 40,
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    fontWeight: 500,
    flexWrap: "wrap",
  },
  mainContent: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "60px 40px",
  },
  toc: {
    background: "#f5f5f7",
    borderRadius: 16,
    padding: 32,
    marginBottom: 60,
  },
  tocHead: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 18,
    flexWrap: "wrap",
  },
  tocTitle: {
    fontSize: 24,
    fontWeight: 600,
    margin: 0,
    color: "#1d1d1f",
  },
  tocText: {
    margin: "10px 0 0",
    maxWidth: 560,
    color: "#667085",
    fontSize: 15,
    lineHeight: 1.7,
  },
  previewBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 34,
    padding: "0 14px",
    borderRadius: 999,
    background: "#e9f7f3",
    color: "#0a7c66",
    fontWeight: 700,
    fontSize: 13,
  },
  tocList: {
    listStyle: "none",
    margin: "24px 0 0",
    padding: 0,
  },
  tocItem: {
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
    fontSize: 16,
  },
  tocLink: {
    color: "#1d1d1f",
    textDecoration: "none",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  tocTitleRow: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  summaryPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 24,
    padding: "0 10px",
    borderRadius: 999,
    background: "#ffffff",
    border: "1px solid #d7dde5",
    color: "#667085",
    fontSize: 12,
    fontWeight: 700,
  },
  previewPanel: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: 22,
    padding: "30px 32px",
    borderRadius: 24,
    background: "#f8f8f6",
    border: "1px solid #ece8df",
    marginBottom: 60,
  },
  previewCopy: {
    display: "grid",
    alignContent: "start",
    gap: 14,
  },
  previewEyebrow: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0a7c66",
  },
  previewTitle: {
    margin: 0,
    fontSize: 34,
    lineHeight: 1.18,
    color: "#1d1d1f",
    letterSpacing: "-0.03em",
  },
  previewText: {
    margin: 0,
    fontSize: 16,
    lineHeight: 1.8,
    color: "#667085",
  },
  previewMeta: {
    display: "grid",
    gap: 12,
    alignContent: "start",
  },
  previewItem: {
    padding: "14px 16px",
    borderRadius: 16,
    background: "#ffffff",
    border: "1px solid #e7e2d9",
    color: "#3f4652",
    fontSize: 14,
    lineHeight: 1.7,
  },
  previewActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 8,
  },
  previewPrimary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    padding: "0 18px",
    borderRadius: 14,
    background: "#0fbc8c",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 700,
  },
  previewSecondary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    padding: "0 18px",
    borderRadius: 14,
    background: "#ffffff",
    color: "#111827",
    textDecoration: "none",
    fontWeight: 700,
    border: "1px solid #d7dde5",
  },
  chapter: {
    marginBottom: 80,
  },
  chapterTitle: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    fontSize: 32,
    fontWeight: 700,
    color: "#1d1d1f",
    margin: 0,
    paddingBottom: 16,
    borderBottom: "2px solid #1d1d1f",
  },
  chapterBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 28,
    padding: "0 12px",
    borderRadius: 999,
    background: "#eef3f8",
    color: "#455468",
    fontSize: 12,
    fontWeight: 700,
  },
  chapterSubtitle: {
    fontSize: 24,
    fontWeight: 600,
    color: "#1d1d1f",
    margin: "40px 0 20px",
  },
  paragraph: {
    fontSize: 17,
    lineHeight: 1.8,
    color: "#4b5563",
    margin: "0 0 20px",
  },
  list: {
    margin: "20px 0",
    paddingLeft: 28,
  },
  listItem: {
    fontSize: 17,
    lineHeight: 1.8,
    color: "#4b5563",
    marginBottom: 12,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    margin: "32px 0",
    fontSize: 15,
  },
  th: {
    background: "#1d1d1f",
    color: "#ffffff",
    padding: 16,
    textAlign: "left",
    fontWeight: 600,
  },
  td: {
    padding: 16,
    borderBottom: "1px solid #e5e7eb",
    color: "#4b5563",
  },
  quoteBox: {
    background: "#f5f5f7",
    borderLeft: "4px solid #1d1d1f",
    padding: 24,
    margin: "32px 0",
    borderRadius: "0 12px 12px 0",
  },
  quoteText: {
    margin: 0,
    fontSize: 18,
    fontWeight: 500,
    color: "#1d1d1f",
    lineHeight: 1.8,
  },
  formula: {
    background: "#f5f5f7",
    padding: 24,
    borderRadius: 12,
    textAlign: "center",
    margin: "32px 0",
    fontSize: 20,
    fontWeight: 600,
    color: "#1d1d1f",
  },
  ctaPanel: {
    background: "linear-gradient(135deg, #0d1117 0%, #132f27 100%)",
    color: "#ffffff",
    borderRadius: 30,
    padding: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 28,
    flexWrap: "wrap",
  },
  ctaTitle: {
    margin: 0,
    fontSize: 34,
  },
  ctaText: {
    margin: "10px 0 0",
    color: "rgba(255,255,255,0.78)",
    fontSize: 18,
    lineHeight: 1.55,
    maxWidth: 620,
  },
  ctaActions: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "16px 22px",
    borderRadius: 14,
    background: "#ffffff",
    color: "#111827",
    textDecoration: "none",
    fontWeight: 700,
  },
  secondaryButton: {
    padding: "16px 22px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 600,
    background: "rgba(255,255,255,0.04)",
  },
  footer: {
    padding: "18px 24px 22px",
    borderTop: "1px solid #e4e8ef",
    textAlign: "center",
    background: "#1f1f22",
  },
  footerCopyright: {
    color: "#8d93a0",
    fontSize: 14,
  },
};
