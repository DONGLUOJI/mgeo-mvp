import type { Metadata } from "next";

import { SiteShell } from "@/components/marketing/SiteShell";

import { MGEO_NAV_ITEMS, MGEO_SHELL_PROPS } from "../content";

export const metadata: Metadata = {
  title: "MGEO是什么 - 董逻辑MGEO",
  description:
    "MGEO 是一套把 GEO 做成可执行、可监测、可归因闭环的系统化方法，用品牌底座、问题入口、内容结构、分发、监测和归因形成企业可运行的系统。",
};

const sections = [
  {
    title: "MGEO和GEO是什么关系",
    text: "GEO 定义的是 AI 搜索优化这条赛道，MGEO 回答的是企业如何把这件事真正做成系统。它不是给 GEO 换一个名字，而是把品牌、问题、内容、分发、监测和归因连接成一条可执行的交付链。",
  },
  {
    title: "为什么企业不能只停留在GEO概念层",
    text: "只停留在概念层，企业通常会陷入三个问题：只会多发内容、只追被提及、做完无法复盘。MGEO 的作用就是把这些分散动作收回到统一的经营系统里。",
  },
  {
    title: "MGEO的核心组成",
    text: "MGEO 至少由品牌事实资产、问题宇宙、内容可引用性、证据链分发、多平台监测和归因复盘构成。它不是单点优化，而是一套从输入到输出都能被追踪的方法。",
  },
  {
    title: "MGEO和传统内容优化有什么不同",
    text: "传统内容优化更容易把注意力放在流量和页面表现，MGEO 则把重点放在 AI 是否能稳定理解品牌、是否能抓到一致定义、是否有足够证据链支撑推荐。",
  },
];

export default function WhatIsMgeoPage() {
  return (
    <SiteShell current="/mgeo" navItems={MGEO_NAV_ITEMS} hideFooter={false} {...MGEO_SHELL_PROPS}>
      <main style={styles.page}>
        <section style={styles.hero}>
          <div style={styles.eyebrow}>Definition</div>
          <h1 style={styles.title}>MGEO是什么：GEO时代的系统化交付方法</h1>
          <p style={styles.lead}>
            MGEO 是一套把 GEO 做成可执行、可监测、可归因闭环的系统化方法。如果说 GEO 定义了 AI 搜索优化这条赛道，那么 MGEO 更强调企业如何把品牌事实资产、问题入口、内容结构、证据链分发、监测与归因连接成一个可持续运行的系统。
          </p>
        </section>

        <section style={styles.content}>
          {sections.map((section) => (
            <article key={section.title} style={styles.sectionCard}>
              <h2 style={styles.sectionTitle}>{section.title}</h2>
              <p style={styles.sectionText}>{section.text}</p>
            </article>
          ))}
        </section>

        <section style={styles.summary}>
          <h2 style={styles.summaryTitle}>总结</h2>
          <p style={styles.summaryText}>
            MGEO 的价值不在于多一个字母，而在于让企业从“知道 GEO”走到“真正能执行 GEO”。它把赛道概念变成可验证的方法，把内容动作变成经营闭环。
          </p>
        </section>
      </main>
    </SiteShell>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 980,
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
  content: {
    display: "grid",
    gap: 16,
  },
  sectionCard: {
    borderRadius: 24,
    border: "1px solid var(--line)",
    background: "var(--surface-soft)",
    padding: 24,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 28,
    lineHeight: 1.22,
  },
  sectionText: {
    margin: "12px 0 0",
    color: "var(--muted)",
    lineHeight: 1.85,
    fontSize: 17,
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
