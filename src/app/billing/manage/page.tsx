import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/auth-options";
import { getPlanConfig } from "@/lib/auth/plans";
import { getDetectQuotaStatus, getUserById } from "@/lib/db/repository";

const UPGRADE_TARGET: Record<string, { label: string; href: string } | null> = {
  free: { label: "升级到基础版", href: "/api/billing/checkout?plan=basic" },
  basic: { label: "升级到专业版", href: "/api/billing/checkout?plan=pro" },
  pro: null,
  enterprise: null,
};

export default async function BillingManagePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user, quota] = await Promise.all([
    getUserById(session.user.id),
    getDetectQuotaStatus(session.user.id),
  ]);

  if (!user) {
    redirect("/login");
  }

  const planConfig = getPlanConfig(user.plan);
  const nextUpgrade = UPGRADE_TARGET[user.plan] || null;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.badge}>订阅管理</div>
          <h1 style={styles.title}>统一查看当前套餐、额度与后续升级动作</h1>
          <p style={styles.text}>
            这里先提供 MVP 版订阅管理入口：你可以确认当前套餐、检测额度、监控能力和升级方向。降级、取消订阅与账单明细后续再补成完整管理台。
          </p>
          <div style={styles.actions}>
            <Link href="/pricing" style={styles.primaryButton}>
              返回定价页
            </Link>
            <Link href="/dashboard" style={styles.secondaryButton}>
              返回 Dashboard
            </Link>
          </div>
        </section>

        <section style={styles.grid}>
          <article style={styles.card}>
            <div style={styles.label}>当前账号</div>
            <div style={styles.value}>{user.email}</div>
            <div style={styles.hint}>可用来核对 webhook 回调和套餐状态是否已同步到正确账号。</div>
          </article>

          <article style={styles.card}>
            <div style={styles.label}>当前套餐</div>
            <div style={styles.value}>{planConfig.name}</div>
            <div style={styles.hint}>
              {quota
                ? `本月已使用 ${quota.used}/${quota.limit} 次检测，剩余 ${quota.remaining} 次。`
                : "当前未拿到额度信息。"}
            </div>
          </article>

          <article style={styles.card}>
            <div style={styles.label}>当前监控能力</div>
            <div style={styles.value}>
              {planConfig.maxKeywords >= 999999 ? "不限关键词" : `${planConfig.maxKeywords} 个关键词`}
            </div>
            <div style={styles.hint}>用于判断当前套餐能否支撑持续监控和趋势分析。</div>
          </article>
        </section>

        <section style={styles.detailGrid}>
          <article style={styles.detailCard}>
            <div style={styles.sectionTitle}>当前套餐包含的能力</div>
            <ul style={styles.featureList}>
              {planConfig.features.map((feature) => (
                <li key={feature} style={styles.featureItem}>
                  {feature}
                </li>
              ))}
            </ul>
          </article>

          <article style={styles.detailCard}>
            <div style={styles.sectionTitle}>下一步建议</div>
            <div style={styles.recommendText}>
              {nextUpgrade
                ? "如果你已经开始需要持续监控、更多额度或更长周期趋势，建议直接升级到下一档套餐。"
                : "你当前已经在最高公开套餐，可继续使用现有能力，或后续补企业版定制方案与账单管理。"}
            </div>
            <div style={styles.recommendActions}>
              {nextUpgrade ? (
                <Link href={nextUpgrade.href} style={styles.primaryButton}>
                  {nextUpgrade.label}
                </Link>
              ) : (
                <Link href="/pricing" style={styles.primaryButton}>
                  查看当前套餐详情
                </Link>
              )}
              <Link href="/pricing" style={styles.secondaryButton}>
                刷新套餐状态
              </Link>
            </div>
            <div style={styles.subtleNote}>
              当前版本暂不支持在线降级、取消订阅、账单明细查询。这些能力建议作为下一阶段的订阅管理补全项。
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f6f8fb",
    padding: "40px 20px 80px",
  },
  container: {
    maxWidth: 1180,
    margin: "0 auto",
    display: "grid",
    gap: 24,
  },
  hero: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 28,
    padding: 32,
    display: "grid",
    gap: 16,
  },
  badge: {
    display: "inline-flex",
    width: "fit-content",
    padding: "8px 14px",
    borderRadius: 999,
    background: "#edf8f6",
    color: "#0f8b7f",
    fontWeight: 700,
    fontSize: 14,
  },
  title: {
    margin: 0,
    fontSize: 40,
    lineHeight: 1.12,
    color: "#111827",
  },
  text: {
    margin: 0,
    color: "#667085",
    fontSize: 17,
    lineHeight: 1.85,
    maxWidth: 920,
  },
  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    padding: "0 18px",
    borderRadius: 14,
    background: "#111827",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    padding: "0 18px",
    borderRadius: 14,
    border: "1px solid #d8dee6",
    background: "#fff",
    color: "#111827",
    textDecoration: "none",
    fontWeight: 700,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 18,
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 10,
  },
  label: {
    fontSize: 14,
    color: "#667085",
    fontWeight: 700,
  },
  value: {
    fontSize: 28,
    lineHeight: 1.15,
    fontWeight: 800,
    color: "#111827",
    wordBreak: "break-word",
  },
  hint: {
    fontSize: 14,
    lineHeight: 1.8,
    color: "#667085",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18,
  },
  detailCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 14,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: "#111827",
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
  recommendText: {
    fontSize: 16,
    lineHeight: 1.85,
    color: "#475467",
  },
  recommendActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  subtleNote: {
    fontSize: 14,
    lineHeight: 1.8,
    color: "#98a2b3",
  },
};
