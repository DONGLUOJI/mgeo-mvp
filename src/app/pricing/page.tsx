import Link from "next/link";
import { getServerSession } from "next-auth";
import { SiteShell } from "@/components/marketing/SiteShell";
import { PlanStatusCard } from "@/app/pricing/plan-status-card";
import { authOptions } from "@/lib/auth/auth-options";
import { getDetectQuotaStatus, getUserById } from "@/lib/db/repository";

const plans = [
  {
    name: "免费版",
    price: "0",
    period: "/月",
    features: ["每月 3 次检测", "TCA 基础评分", "HTML/PDF 报告导出"],
    action: "先做免费检测",
    href: "/detect",
    muted: true,
  },
  {
    name: "基础版",
    price: "299",
    period: "/月",
    features: ["每月 50 次检测", "5 个关键词监控", "月度 TCA 报告", "1 个竞品对比", "周报邮件"],
    action: "升级到基础版",
    href: "/api/billing/checkout?plan=basic",
  },
  {
    name: "专业版",
    price: "999",
    period: "/月",
    features: ["无限检测", "30 个关键词监控", "TCA 深度诊断", "异常预警", "90 天历史回溯"],
    action: "升级到专业版",
    href: "/api/billing/checkout?plan=pro",
  },
];

export default async function PricingPage() {
  const session = await getServerSession(authOptions);
  const currentUser = session?.user?.id ? await getUserById(session.user.id) : null;
  const quota = currentUser ? await getDetectQuotaStatus(currentUser.id) : null;
  const currentPlan = currentUser?.plan || "free";

  return (
    <SiteShell current="/pricing">
      <main style={styles.page}>
        <section style={styles.hero}>
          <span style={styles.badge}>服务方案</span>
          <h1 style={styles.title}>根据品牌阶段选择适合的 MGEO 服务方式</h1>
          <p style={styles.text}>
            从免费检测到持续监控，先用轻量方案验证，再进入更完整的品牌增长服务闭环。
          </p>
        </section>

        {currentUser ? (
          <PlanStatusCard
            initialData={{
              email: currentUser.email,
              plan: currentUser.plan,
              quota: quota
                ? {
                    limit: quota.limit,
                    used: quota.used,
                    remaining: quota.remaining,
                  }
                : null,
              updatedAt: currentUser.updatedAt,
            }}
          />
        ) : null}

        {currentUser ? (
          <section style={styles.manageEntry}>
            <div>
              <div style={styles.manageTitle}>需要统一查看套餐能力、额度和后续动作？</div>
              <div style={styles.manageText}>
                你可以进入订阅管理页，从账号、套餐、检测额度和下一步升级建议的角度统一查看当前状态。
              </div>
            </div>
            <Link href="/billing/manage" style={styles.manageButton}>
              进入订阅管理
            </Link>
          </section>
        ) : null}

        <section style={styles.grid}>
          {plans.map((plan) => (
            <article
              key={plan.name}
              style={{
                ...styles.card,
                ...(plan.muted ? styles.cardMuted : {}),
                ...(getPlanKey(plan.name) === currentPlan ? styles.cardCurrent : {}),
                ...(isRecommendedPlan(currentPlan, getPlanKey(plan.name)) ? styles.cardRecommended : {}),
              }}
            >
              <div style={styles.cardTop}>
                <div style={styles.planName}>{plan.name}</div>
                {getPlanKey(plan.name) === currentPlan ? (
                  <span style={styles.currentBadge}>当前方案</span>
                ) : isRecommendedPlan(currentPlan, getPlanKey(plan.name)) ? (
                  <span style={styles.recommendedBadge}>推荐升级</span>
                ) : null}
              </div>
              <div style={styles.priceRow}>
                <span style={styles.priceSymbol}>¥</span>
                <span style={styles.priceValue}>{plan.price}</span>
                <span style={styles.pricePeriod}>{plan.period}</span>
              </div>
              <ul style={styles.featureList}>
                {plan.features.map((feature) => (
                  <li key={feature} style={styles.featureItem}>
                    {feature}
                  </li>
                ))}
              </ul>
              <div style={styles.planFooter}>
                <Link
                  href={plan.href}
                  aria-disabled={isLockedPlan(currentPlan, getPlanKey(plan.name))}
                  style={{
                    ...styles.button,
                    ...(getPlanKey(plan.name) === currentPlan ? styles.buttonMuted : {}),
                    ...(isLockedPlan(currentPlan, getPlanKey(plan.name)) ? styles.buttonDisabled : {}),
                  }}
                >
                  {getPlanButtonText(currentPlan, getPlanKey(plan.name), plan.action)}
                </Link>
                <div style={styles.planHint}>
                  {getPlanHint(currentPlan, getPlanKey(plan.name))}
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </SiteShell>
  );
}

function getPlanKey(name: string) {
  if (name === "免费版") return "free";
  if (name === "基础版") return "basic";
  if (name === "专业版") return "pro";
  return "free";
}

function isRecommendedPlan(currentPlan: string, targetPlan: string) {
  return (currentPlan === "free" && targetPlan === "basic") || (currentPlan === "basic" && targetPlan === "pro");
}

function isLockedPlan(currentPlan: string, targetPlan: string) {
  return (currentPlan === "basic" && targetPlan === "free") || (currentPlan === "pro" && (targetPlan === "free" || targetPlan === "basic"));
}

function getPlanButtonText(currentPlan: string, targetPlan: string, fallback: string) {
  if (currentPlan === targetPlan) return "当前方案";
  if (isLockedPlan(currentPlan, targetPlan)) return "当前页不支持降级";
  return fallback;
}

function getPlanHint(currentPlan: string, targetPlan: string) {
  if (currentPlan === targetPlan) {
    return "你当前正在使用这一档套餐，可以先看上方状态卡中的额度与能力。";
  }
  if (isLockedPlan(currentPlan, targetPlan)) {
    return "如果需要降级或切换套餐，建议后续补一个订阅管理页统一处理。";
  }
  if (isRecommendedPlan(currentPlan, targetPlan)) {
    return "这是你当前阶段最适合的下一步升级方向，能直接解锁更多检测与监控能力。";
  }
  return "如果你的品牌已经进入长期优化阶段，可以直接从这一档开始。";
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1240,
    margin: "0 auto",
    padding: "64px 24px 0",
  },
  hero: {
    display: "grid",
    gap: 16,
    justifyItems: "center",
    textAlign: "center",
    marginBottom: 36,
  },
  badge: {
    display: "inline-flex",
    height: 34,
    padding: "0 14px",
    alignItems: "center",
    borderRadius: 999,
    background: "#edf8f6",
    color: "#0f8b7f",
    fontSize: 14,
    fontWeight: 700,
  },
  title: {
    margin: 0,
    fontSize: 48,
    lineHeight: 1.12,
    letterSpacing: "-0.04em",
  },
  text: {
    margin: 0,
    maxWidth: 860,
    color: "#667085",
    fontSize: 18,
    lineHeight: 1.8,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 20,
  },
  manageEntry: {
    marginBottom: 24,
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 22,
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
    alignItems: "center",
    flexWrap: "wrap",
  },
  manageTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: "#111827",
  },
  manageText: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 1.8,
    color: "#667085",
    maxWidth: 760,
  },
  manageButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    padding: "0 18px",
    borderRadius: 14,
    background: "#111827",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 28,
    padding: 28,
    display: "grid",
    alignContent: "start",
    gap: 18,
  },
  cardMuted: {
    background: "#fafbfd",
  },
  cardCurrent: {
    border: "1px solid rgba(15, 139, 127, 0.24)",
    boxShadow: "0 10px 30px rgba(15, 139, 127, 0.08)",
  },
  cardRecommended: {
    border: "1px solid rgba(17, 24, 39, 0.16)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  planName: {
    fontSize: 28,
    fontWeight: 800,
  },
  currentBadge: {
    display: "inline-flex",
    alignItems: "center",
    height: 30,
    padding: "0 10px",
    borderRadius: 999,
    background: "#edf8f6",
    color: "#0f8b7f",
    fontSize: 12,
    fontWeight: 800,
  },
  recommendedBadge: {
    display: "inline-flex",
    alignItems: "center",
    height: 30,
    padding: "0 10px",
    borderRadius: 999,
    background: "#111827",
    color: "#fff",
    fontSize: 12,
    fontWeight: 800,
  },
  priceRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 4,
  },
  priceSymbol: {
    fontSize: 20,
    marginBottom: 10,
  },
  priceValue: {
    fontSize: 58,
    lineHeight: 1,
    fontWeight: 800,
    letterSpacing: "-0.04em",
  },
  pricePeriod: {
    fontSize: 18,
    marginBottom: 10,
    color: "#667085",
  },
  featureList: {
    margin: 0,
    paddingLeft: 20,
    display: "grid",
    gap: 12,
    color: "#475467",
    fontSize: 16,
    lineHeight: 1.8,
  },
  featureItem: {},
  planFooter: {
    display: "grid",
    gap: 10,
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 14,
    background: "#111827",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 700,
  },
  buttonMuted: {
    background: "#98a2b3",
  },
  buttonDisabled: {
    background: "#eaecf0",
    color: "#98a2b3",
    pointerEvents: "none",
  },
  planHint: {
    minHeight: 52,
    fontSize: 14,
    lineHeight: 1.75,
    color: "#667085",
  },
};
