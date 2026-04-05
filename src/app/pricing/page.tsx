import Link from "next/link";
import { SiteShell } from "@/components/marketing/SiteShell";

const plans = [
  {
    name: "免费检测版",
    price: "0",
    period: "/月",
    desc: "适合先验证品牌在 AI 搜索中是否被提及、被理解、被推荐。",
    features: ["每月 3 次检测", "TCA 基础评分", "基础报告导出"],
    action: "先做免费检测",
    href: "/#detector",
  },
  {
    name: "标准服务版",
    price: "2999",
    period: "/月",
    desc: "适合已经确认要持续优化品牌可见性，并需要完整交付闭环的团队。",
    features: ["月度诊断与内容建议", "重点问题池整理", "平台适配与发布节奏建议"],
    action: "进入服务沟通",
    href: "/#contact",
  },
  {
    name: "深度增长版",
    price: "8999",
    period: "/月",
    desc: "适合需要长期监测、多平台内容适配与阶段复盘的品牌。",
    features: ["完整 30 天交付闭环", "多平台持续监测", "复盘报告与下一轮策略建议"],
    action: "预约深度方案",
    href: "/#contact",
  },
];

const steps = [
  { index: "01", title: "先免费检测", text: "先确认当前品牌是否被提及、是否被理解、是否具备推荐基础。" },
  { index: "02", title: "看 TCA 诊断", text: "明确当前最需要优先处理的是一致性、覆盖度还是权威性。" },
  { index: "03", title: "匹配服务方案", text: "根据品牌阶段，选择轻量验证、标准交付或深度增长方案。" },
  { index: "04", title: "进入执行闭环", text: "从内容适配、平台分发、效果监测到复盘建议形成长期机制。" },
];

export default function PricingPage() {
  return (
    <SiteShell current="/pricing" ctaHref="/register" ctaLabel="注册" hideFooter>
      <main style={styles.page}>
        <section style={styles.hero}>
          <div style={styles.heroPanel}>
            <h1 style={styles.heroTitle}>服务方案</h1>
            <p style={styles.heroText}>用更接近你本地 `subscription.html` 的版式，把免费检测、诊断、交付与长期增长方案整理成一条清晰路径。</p>
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
              <p style={styles.sectionText}>先做免费验证，再按品牌阶段进入标准服务或深度增长闭环。</p>
            </div>

            <div style={styles.planGrid}>
              {plans.map((plan) => (
                <article key={plan.name} style={styles.planCard}>
                  <h3 style={styles.planTitle}>{plan.name}</h3>
                  <div style={styles.priceRow}>
                    <span style={styles.priceSymbol}>¥</span>
                    <span style={styles.priceValue}>{plan.price}</span>
                    <span style={styles.pricePeriod}>{plan.period}</span>
                  </div>
                  <p style={styles.planDesc}>{plan.desc}</p>
                  <ul style={styles.featureList}>
                    {plan.features.map((feature) => (
                      <li key={feature} style={styles.featureItem}>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} style={styles.planButton}>
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
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 18,
  },
  planCard: {
    background: "#fbfbfc",
    border: "1px solid #ececf0",
    borderRadius: 24,
    padding: 28,
    display: "grid",
    alignContent: "start",
    gap: 16,
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
};
