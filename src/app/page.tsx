import type { Metadata } from "next";
import Link from "next/link";

import { DetectForm } from "@/components/detect/DetectForm";
import { ConsultForm } from "@/components/marketing/consult-form";
import { SiteShell } from "@/components/marketing/SiteShell";
import { MGEO_NAV_ITEMS, MGEO_SHELL_PROPS } from "@/app/mgeo/content";

export const metadata: Metadata = {
  title: "董逻辑MGEO - AI时代的品牌解释权系统",
  description:
    "董逻辑MGEO 帮助企业把 GEO 做成可执行、可监测、可归因的闭环，在 AI 搜索时代建立更稳定的品牌解释权。",
};

const featureCards = [
  {
    title: "品牌事实资产",
    text: "先把品牌标准答案、关键优势、禁止表述与可信证据整理成 AI 可理解的品牌底座。",
  },
  {
    title: "问题宇宙",
    text: "识别用户会问什么、品牌应该在哪些问题下被看见、被解释和被推荐。",
  },
  {
    title: "监测与归因",
    text: "追踪关键问题、关键平台与品牌信号变化，并把提及、引用、分发和经营信号连接成闭环。",
  },
];

export default function MarketingHomePage() {
  return (
    <SiteShell
      current="/"
      navItems={MGEO_NAV_ITEMS}
      hideFooter
      {...MGEO_SHELL_PROPS}
    >
      <main style={styles.page}>
        <section style={styles.hero}>
          <div style={styles.heroCopy}>
            <div style={styles.eyebrow}>董逻辑MGEO</div>
            <h1 style={styles.title}>MGEO：把 GEO 做成闭环</h1>
            <p style={styles.text}>
              GEO 是赛道，MGEO 是方法。它把品牌事实资产、问题入口、证据链分发、监测预警和归因分析接成闭环，不只解决能不能被看见，更解决能不能被说对、被引用、被验证。
            </p>
            <div style={styles.actions}>
              <Link href="/mgeo" style={styles.primaryButton}>
                查看方法
              </Link>
              <Link href="/whitepaper" style={styles.secondaryButton}>
                下载白皮书
              </Link>
            </div>
          </div>

          <div style={styles.heroCard}>
            <div style={styles.heroCardLabel}>核心闭环</div>
            <div style={styles.heroCardText}>品牌信息与事实资产</div>
            <div style={styles.heroCardText}>问题训练与文章训练</div>
            <div style={styles.heroCardText}>分发、监测与归因</div>
          </div>
        </section>

        <section id="detector" style={styles.detectorSection}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionEyebrow}>免费检测</div>
            <h2 style={styles.sectionTitle}>先看清品牌在 AI 里是怎么被理解的，再决定下一步怎么做。</h2>
          </div>
          <DetectForm embedded />
        </section>

        <section id="signals" style={styles.featuresSection}>
          <div style={styles.featureGrid}>
            {featureCards.map((card) => (
              <article key={card.title} style={styles.featureCard}>
                <h3 style={styles.featureTitle}>{card.title}</h3>
                <p style={styles.featureText}>{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" style={styles.contactSection}>
          <div style={styles.contactCopy}>
            <div style={styles.sectionEyebrow}>企业接入</div>
            <h2 style={styles.sectionTitle}>如果你想把 GEO 变成企业能力，而不是一组零散动作，可以直接聊。</h2>
            <p style={styles.contactText}>
              当前可承接企业诊断、30天验证项目、长期陪跑与交付后台建设。重点不是堆内容，而是先建立适合 AI 时代的品牌解释权系统。
            </p>
          </div>
          <div style={styles.contactCard}>
            <ConsultForm />
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
    padding: "36px 20px 88px",
    display: "grid",
    gap: 24,
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.2fr) 320px",
    gap: 20,
    alignItems: "stretch",
  },
  heroCopy: {
    padding: "34px 34px 30px",
    borderRadius: 32,
    border: "1px solid var(--line)",
    background: "var(--surface)",
    boxShadow: "var(--shadow-whisper)",
  },
  eyebrow: {
    display: "inline-flex",
    padding: "8px 12px",
    borderRadius: 999,
    background: "var(--surface-warm)",
    color: "var(--brand-deep)",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  title: {
    margin: "18px 0 0",
    fontSize: "clamp(38px, 6vw, 64px)",
    lineHeight: 1.04,
    letterSpacing: "-0.05em",
    color: "var(--text)",
    fontFamily: "var(--font-serif)",
  },
  text: {
    margin: "18px 0 0",
    maxWidth: 760,
    fontSize: 18,
    lineHeight: 1.9,
    color: "var(--muted)",
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
    minHeight: 52,
    padding: "0 20px",
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
    minHeight: 52,
    padding: "0 20px",
    borderRadius: 16,
    border: "1px solid var(--line)",
    background: "var(--surface)",
    color: "var(--text)",
    textDecoration: "none",
    fontWeight: 700,
  },
  heroCard: {
    borderRadius: 32,
    border: "1px solid var(--line)",
    background: "linear-gradient(180deg, #f7efe7 0%, #f2e2d3 100%)",
    padding: "28px 24px",
    display: "grid",
    alignContent: "start",
    gap: 12,
    boxShadow: "var(--shadow-whisper)",
  },
  heroCardLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--brand-deep)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  heroCardText: {
    fontSize: 24,
    lineHeight: 1.3,
    color: "var(--text)",
    fontFamily: "var(--font-serif)",
  },
  detectorSection: {
    display: "grid",
    gap: 18,
  },
  sectionHeader: {
    display: "grid",
    gap: 8,
  },
  sectionEyebrow: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--brand-deep)",
  },
  sectionTitle: {
    margin: 0,
    fontSize: 34,
    lineHeight: 1.15,
    color: "var(--text)",
    fontFamily: "var(--font-serif)",
  },
  featuresSection: {
    marginTop: 4,
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 16,
  },
  featureCard: {
    borderRadius: 24,
    border: "1px solid var(--line)",
    background: "var(--surface)",
    padding: 24,
  },
  featureTitle: {
    margin: 0,
    fontSize: 24,
    color: "var(--text)",
  },
  featureText: {
    margin: "10px 0 0",
    color: "var(--muted)",
    lineHeight: 1.8,
  },
  contactSection: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)",
    gap: 20,
    alignItems: "start",
  },
  contactCopy: {
    padding: "18px 6px",
  },
  contactText: {
    margin: "12px 0 0",
    color: "var(--muted)",
    lineHeight: 1.8,
  },
  contactCard: {
    borderRadius: 24,
    border: "1px solid var(--line)",
    background: "var(--surface)",
    padding: 24,
    boxShadow: "var(--shadow-whisper)",
  },
};
