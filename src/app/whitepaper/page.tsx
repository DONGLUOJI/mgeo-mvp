import type { Metadata } from "next";
import Link from "next/link";

import { SiteShell } from "@/components/marketing/SiteShell";
import { MGEO_NAV_ITEMS, MGEO_SHELL_PROPS } from "@/app/mgeo/content";

export const metadata: Metadata = {
  title: "MGEO - 董逻辑MGEO",
  description:
    "了解 MGEO 如何把 GEO 从赛道概念变成企业可执行、可监测、可归因的系统方法，建立 AI 时代的品牌解释权。",
};

const chapters = [
  {
    title: "1. 为什么 GEO 时代不能只停留在内容和提及率",
    text: "AI 回答正在改变品牌进入方式。用户越来越多地先问 AI，再决定看谁、信谁、找谁。真正的问题已经不只是品牌能否被提及，而是品牌能否被准确解释、被稳定引用、被持续验证。仅靠传统 SEO 或零散内容动作，已经不足以支撑这件事。",
  },
  {
    title: "2. MGEO 是什么",
    text: "MGEO 是一套把 GEO 做成企业经营闭环的系统化方法。GEO 定义的是 AI 搜索优化这条赛道，MGEO 回答的是企业如何把这件事做成可执行、可监测、可归因的系统。",
  },
  {
    title: "3. MGEO 的六大交付模块",
    text: "MGEO 的执行路径不是简单多写几篇文章，而是先梳理品牌事实资产，再识别问题宇宙，接着训练内容结构，补充证据链分发，建立监测预警，最后用归因闭环持续复盘。它卖的不是单点优化，而是一整套 GEO 交付系统。",
  },
  {
    title: "4. 为什么 MGEO 代表第二代 GEO",
    text: "很多 GEO 还停留在内容优化和提及监测层面，而 MGEO 更进一步，强调品牌解释权、证据链分发和归因闭环。它的意义不在于造一个新词，而在于重新定义什么才算真正完整的 GEO。",
  },
];

export default function WhitepaperPage() {
  return (
    <SiteShell
      current="/whitepaper"
      hideFooter
      navItems={MGEO_NAV_ITEMS}
      {...MGEO_SHELL_PROPS}
    >
      <main style={styles.page}>
        <section style={styles.hero}>
          <div style={styles.heroPanel}>
            <div style={styles.eyebrow}>MGEO</div>
            <h1 style={styles.title}>MGEO：把 GEO 做成闭环。</h1>
            <p style={styles.text}>
              这份白皮书用来说明 MGEO 如何把 GEO 从赛道概念，进一步做成企业可执行、可监测、可归因的系统方法。它关注的不是抽象概念，而是企业如何在 AI 时代建立更稳定的品牌解释权，并用一套完整的交付结构把这件事做成长期能力。
            </p>
          </div>
        </section>

        <section style={styles.chapterList}>
          {chapters.map((chapter) => (
            <article key={chapter.title} style={styles.chapter}>
              <h2 style={styles.chapterTitle}>{chapter.title}</h2>
              <p style={styles.chapterText}>{chapter.text}</p>
            </article>
          ))}
        </section>

        <section style={styles.notice}>
          <h2 style={styles.noticeTitle}>适合谁读这份白皮书</h2>
          <ul style={styles.noticeList}>
            <li style={styles.noticeItem}>想理解 GEO 和 SEO 在 AI 时代有什么根本差异的创始人和品牌负责人。</li>
            <li style={styles.noticeItem}>已经意识到 AI 入口重要性，但还没有一套成型落地路径的市场、增长和内容团队。</li>
            <li style={styles.noticeItem}>希望把品牌事实资产、问题入口、内容结构、分发、监测和归因连接成闭环的企业。</li>
          </ul>
          <div style={styles.noticeActions}>
            <Link href="/mgeo" style={styles.primaryButton}>
              查看 MGEO 方法
            </Link>
            <Link href="/mgeo/what-is-mgeo" style={styles.secondaryButton}>
              阅读核心文章
            </Link>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1120,
    margin: "0 auto",
    padding: "40px 24px 96px",
    display: "grid",
    gap: 24,
  },
  heroPanel: {
    borderRadius: 32,
    border: "1px solid var(--line)",
    background: "var(--surface)",
    padding: "42px 44px",
    boxShadow: "var(--shadow-whisper)",
  },
  eyebrow: {
    color: "var(--brand-deep)",
    fontSize: 12,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  title: {
    margin: "16px 0 0",
    fontSize: 58,
    lineHeight: 1.08,
    letterSpacing: "-0.05em",
    fontFamily: "var(--font-serif)",
    color: "var(--text)",
  },
  text: {
    margin: "18px 0 0",
    maxWidth: 860,
    fontSize: 18,
    lineHeight: 1.85,
    color: "var(--muted)",
  },
  chapterList: {
    display: "grid",
    gap: 18,
  },
  chapter: {
    borderRadius: 24,
    border: "1px solid var(--line)",
    background: "var(--surface-soft)",
    padding: 24,
  },
  chapterTitle: {
    margin: 0,
    fontSize: 28,
    lineHeight: 1.2,
    color: "var(--text)",
  },
  chapterText: {
    margin: "12px 0 0",
    color: "var(--muted)",
    lineHeight: 1.85,
  },
  notice: {
    borderRadius: 28,
    border: "1px solid var(--line)",
    background: "linear-gradient(135deg, #f6ede6 0%, #f2e3d8 100%)",
    padding: "28px 30px",
  },
  noticeTitle: {
    margin: 0,
    fontSize: 30,
    lineHeight: 1.2,
    fontFamily: "var(--font-serif)",
  },
  noticeList: {
    margin: "16px 0 0",
    paddingLeft: 20,
    display: "grid",
    gap: 10,
  },
  noticeItem: {
    lineHeight: 1.75,
    color: "var(--text-soft)",
  },
  noticeActions: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    marginTop: 22,
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    padding: "0 18px",
    borderRadius: 16,
    background: "var(--brand)",
    color: "var(--surface)",
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
    border: "1px solid var(--line)",
    background: "var(--surface)",
    color: "var(--text)",
    textDecoration: "none",
    fontWeight: 700,
  },
};
