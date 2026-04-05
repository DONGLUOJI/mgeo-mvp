import type { Metadata } from "next";
import Link from "next/link";

import { SiteShell } from "@/components/marketing/SiteShell";

export const metadata: Metadata = {
  title: "服务方案 - 董逻辑MGEO",
  description: "从免费检测到持续监控，再到完整交付闭环，选择适合品牌当前阶段的 MGEO 服务路径。",
};

const plans = [
  {
    name: "免费检测版",
    price: "0",
    period: "/月",
    desc: "适合先验证品牌在 AI 搜索中是否被提及",
    features: ["每月 3 次检测", "TCA 基础评分", "基础报告导出"],
    action: "先做免费检测",
    href: "/#detector",
  },
  {
    name: "基础监控版",
    price: "299",
    period: "/月",
    annual: "年付 ¥2,388（省 ¥1,200）",
    desc: "适合持续追踪品牌 AI 可见性变化",
    features: ["5 个关键词每日自动监控", "排名变化趋势图", "月度 TCA 诊断报告", "1 个竞品对比", "每周邮件通知"],
    action: "开通基础版",
    href: "/register",
    featured: true,
  },
  {
    name: "标准服务版",
    price: "2999",
    period: "/月",
    desc: "适合需要完整交付闭环的团队",
    features: ["基础版全部功能", "30 个关键词监控", "无限竞品对比", "月度诊断与内容建议", "重点问题池整理", "平台适配与发布节奏建议"],
    action: "进入服务沟通",
    href: "/#contact",
  },
  {
    name: "深度增长版",
    price: "8999",
    period: "/月",
    desc: "适合长期监测与多平台内容适配",
    features: ["标准版全部功能", "完整 30 天交付闭环", "多平台持续监测", "媒体发布执行", "复盘报告与下一轮策略建议", "专属客户成功经理"],
    action: "预约深度方案",
    href: "/#contact",
  },
] as Array<{
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  action: string;
  href: string;
  annual?: string;
  featured?: boolean;
}>;

const steps = [
  { index: "01", title: "先免费检测", text: "先确认品牌是否被提及、被理解、被推荐。" },
  { index: "02", title: "看 TCA 诊断", text: "快速识别一致性、覆盖度与权威性缺口。" },
  { index: "03", title: "匹配服务方案", text: "根据当前阶段选择最合适的服务路径。" },
  { index: "04", title: "进入执行闭环", text: "围绕平台适配、监测与复盘持续优化。" },
] as const;

export default function PricingPage() {
  return (
    <SiteShell current="/pricing" hideFooter>
      <main style={styles.page}>
        <section style={styles.hero}>
          <div style={styles.heroPanel}>
            <h1 style={styles.heroTitle}>服务方案</h1>
            <p style={styles.heroText}>从免费检测开始，根据品牌当前阶段选择适合的服务路径。</p>
            <div style={styles.heroActions}>
              <Link href="/#detector" style={styles.primaryButton}>
                先做免费检测
              </Link>
              <Link href="/#contact" style={styles.secondaryButton}>
                联系我们
              </Link>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>从检测到交付的服务路径</h2>
              <p style={styles.sectionText}>不是先卖方案，而是先用检测结果建立判断，再进入适合当前品牌阶段的执行方式。</p>
            </div>

            <div style={styles.steps}>
              {steps.map((step) => (
                <article key={step.index} style={styles.stepCard}>
                  <div style={styles.stepIndex}>{step.index}</div>
                  <h3 style={styles.stepTitle}>{step.title}</h3>
                  <p style={styles.stepText}>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>当前可选择的方案</h2>
              <p style={styles.sectionText}>从免费验证、低门槛监控到完整交付闭环，先选最适合你当前阶段的一档。</p>
            </div>

            <div style={styles.planGrid}>
              {plans.map((plan) => (
                <article
                  key={plan.name}
                  style={{
                    ...styles.planCard,
                    ...(plan.featured ? styles.planCardFeatured : {}),
                  }}
                >
                  {plan.featured ? <span style={styles.recommendBadge}>推荐</span> : null}
                  <div style={styles.planHead}>
                    <h3 style={styles.planTitle}>{plan.name}</h3>
                    <div style={styles.priceRow}>
                      <span style={styles.priceSymbol}>¥</span>
                      <span style={styles.priceValue}>{plan.price}</span>
                      <span style={styles.pricePeriod}>{plan.period}</span>
                    </div>
                    {"annual" in plan && plan.annual ? <div style={styles.annualNote}>{plan.annual}</div> : <div style={styles.annualSpacer} />}
                  </div>
                  <p style={styles.planDesc}>{plan.desc}</p>
                  <ul style={styles.featureList}>
                    {plan.features.map((feature) => (
                      <li key={feature} style={styles.featureItem}>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    style={{
                      ...styles.planButton,
                      ...(plan.featured ? styles.planButtonFeatured : {}),
                    }}
                  >
                    {plan.action}
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
  steps: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 18,
  },
  stepCard: {
    background: "#fbfbfc",
    border: "1px solid #ececf0",
    borderRadius: 24,
    padding: 26,
  },
  stepIndex: {
    display: "inline-flex",
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    background: "#0a7c66",
    color: "#ffffff",
    fontWeight: 700,
    marginBottom: 16,
  },
  stepTitle: {
    margin: 0,
    fontSize: 24,
  },
  stepText: {
    margin: "10px 0 0",
    color: "#6e6e73",
    fontSize: 16,
    lineHeight: 1.7,
  },
  planGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 18,
  },
  planCard: {
    position: "relative",
    background: "#fbfbfc",
    border: "1px solid #ececf0",
    borderRadius: 24,
    padding: 28,
    display: "grid",
    alignContent: "start",
    gap: 16,
  },
  planCardFeatured: {
    border: "1px solid rgba(15, 188, 140, 0.34)",
    boxShadow: "0 16px 34px rgba(15, 188, 140, 0.1)",
  },
  recommendBadge: {
    position: "absolute",
    top: 18,
    right: 18,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 28,
    padding: "0 12px",
    borderRadius: 999,
    background: "#0fbc8c",
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 800,
  },
  planHead: {
    display: "grid",
    gap: 10,
  },
  planTitle: {
    margin: 0,
    fontSize: 28,
  },
  priceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 6,
  },
  priceSymbol: {
    fontSize: 20,
    fontWeight: 700,
  },
  priceValue: {
    fontSize: 40,
    lineHeight: 1,
    fontWeight: 700,
  },
  pricePeriod: {
    color: "#6e6e73",
    fontSize: 16,
  },
  annualNote: {
    fontSize: 13,
    color: "#0a7c66",
    fontWeight: 700,
  },
  annualSpacer: {
    minHeight: 18,
  },
  planDesc: {
    margin: 0,
    color: "#6e6e73",
    fontSize: 16,
    lineHeight: 1.7,
  },
  featureList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  featureItem: {
    fontSize: 15,
    lineHeight: 1.6,
    padding: "12px 0",
    borderTop: "1px solid #ececf0",
  },
  planButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    borderRadius: 16,
    background: "#1f1f22",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 700,
    marginTop: 6,
  },
  planButtonFeatured: {
    background: "#0fbc8c",
  },
};
