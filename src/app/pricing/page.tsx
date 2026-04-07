import type { Metadata } from "next";
import Link from "next/link";

import { SiteShell } from "@/components/marketing/SiteShell";

export const metadata: Metadata = {
  title: "服务方案 - 董逻辑MGEO",
  description: "从学习、训练到企业诊断与年度服务，选择适合当前阶段的 MGEO 服务路径。",
};

const plans = [
  {
    name: "MGEO 年度会员",
    price: "2980",
    period: "/年",
    desc: "适合想系统学习 MGEO 的超级个体、小团队与品牌操盘手",
    features: ["方法论持续更新", "案例拆解与实操 SOP", "品牌 AI 可见性认知框架", "进入知识星球学习社群"],
    action: "咨询加入方式",
    href: "/#contact",
  },
  {
    name: "MGEO 线下实战营",
    price: "12800",
    period: "/期",
    desc: "适合想把 MGEO 方法真正落到自己业务上的高意愿用户",
    features: ["线下高密度实战训练", "品牌问题拆解与路径设计", "方法论到业务动作的转化", "小范围同频交流"],
    action: "申请实战营",
    href: "/#contact",
  },
  {
    name: "企业诊断",
    price: "16800",
    period: "/次",
    desc: "适合希望先看清品牌在 AI 场景中问题与机会的企业客户",
    features: ["品牌 AI 可见性诊断", "TCA 缺口识别", "核心问题与优先级建议", "阶段性优化路线图"],
    action: "申请企业诊断",
    href: "/#contact",
  },
  {
    name: "企业年框",
    price: "128000",
    period: "/年起",
    desc: "适合需要长期建设品牌 AI 可见性与生成式内容能力的企业",
    features: ["年度顾问与持续优化", "内容与信源建设建议", "多模型监测与阶段复盘", "品牌 AI 可见性长期策略"],
    action: "预约企业年框",
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
            <p style={styles.heroText}>从学习、训练到企业诊断与年度服务，选择适合你当前阶段的 MGEO 路径。</p>
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
              <p style={styles.sectionText}>从学习、训练到企业诊断与年度服务，选择适合你当前阶段的 MGEO 路径。</p>
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
    display: "flex",
    flexDirection: "column",
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
    minHeight: 132,
  },
  planTitle: {
    margin: 0,
    fontSize: 24,
    lineHeight: 1.25,
  },
  priceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 6,
    flexWrap: "nowrap",
  },
  priceSymbol: {
    fontSize: 18,
    fontWeight: 700,
  },
  priceValue: {
    fontSize: 36,
    lineHeight: 1,
    fontWeight: 700,
  },
  pricePeriod: {
    color: "#6e6e73",
    fontSize: 14,
    whiteSpace: "nowrap",
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
    minHeight: 110,
  },
  featureList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    flex: 1,
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
    marginTop: "auto",
  },
  planButtonFeatured: {
    background: "#0fbc8c",
  },
};
