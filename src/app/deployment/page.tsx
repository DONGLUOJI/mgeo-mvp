import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/auth-options";
import { getEnvCheckSummary } from "@/lib/system/env-check";

const steps = [
  {
    title: "1. 域名与 Vercel 项目",
    items: [
      "确认项目已连接到 Vercel，主分支能正常构建。",
      "绑定正式域名，并将 NEXTAUTH_URL 改成正式 https 域名。",
      "确认 vercel.json 中的 cron 配置已生效。",
    ],
  },
  {
    title: "2. 数据库切到 Postgres",
    items: [
      "在生产环境配置 DATABASE_URL。",
      "首次部署后确认 users、customers、scan_tasks、scan_reports、monitored_keywords、monitor_results 已自动建表。",
      "手动跑一轮检测，确认数据不是继续写本地 SQLite。",
    ],
  },
  {
    title: "3. 支付回调联调",
    items: [
      "把 webhook 地址配置到 LemonSqueezy。",
      "确认 basic / pro 结账链接、variant id、webhook secret 都已填入环境变量。",
      "完成一笔测试支付，确认 plan 能从 free 升级到 basic / pro。",
    ],
  },
  {
    title: "4. 定时监控联调",
    items: [
      "给至少一个基础版或专业版账号添加关键词。",
      "手动调用 /api/cron/daily-monitor 验证 monitor_results 是否落库。",
      "确认 Dashboard 趋势图能看到真实时间序列。",
    ],
  },
  {
    title: "5. 上线验收",
    items: [
      "首页、排名页、案例页、定价页都能正常打开。",
      "登录、检测、报告、导出、历史、Dashboard 全链路可用。",
      "支付成功后能回到 /billing/success，并能在 /pricing 刷新套餐状态。",
    ],
  },
];

export default async function DeploymentPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const env = getEnvCheckSummary();

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.badge}>部署上线准备</div>
          <h1 style={styles.title}>把当前 MGEO MVP 推到可对外试运营的最后一段</h1>
          <p style={styles.text}>
            这页不是功能页，而是上线前的施工清单。先把环境变量、数据库、支付回调和 cron 路由全部打通，再考虑继续堆新功能。
          </p>
          <div style={styles.actions}>
            <Link href="/ops" style={styles.secondaryButton}>
              查看运维入口
            </Link>
            <Link href="/deployment/release" style={styles.secondaryButton}>
              查看上线结论
            </Link>
            <Link href="/deployment/logbook" style={styles.secondaryButton}>
              查看发布记录
            </Link>
            <Link href="/deployment/runbook" style={styles.secondaryButton}>
              查看运行手册
            </Link>
            <Link href="/deployment/verify" style={styles.secondaryButton}>
              查看验证入口
            </Link>
            <Link href="/deployment/env" style={styles.primaryButton}>
              查看环境变量检查
            </Link>
            <Link href="/deployment/health" style={styles.secondaryButton}>
              查看系统健康检查
            </Link>
            <Link href="/deployment/checklist" style={styles.secondaryButton}>
              查看联调检查表
            </Link>
            <Link href="/dashboard" style={styles.secondaryButton}>
              返回 Dashboard
            </Link>
          </div>
        </section>

        <section style={styles.summaryGrid}>
          <article style={styles.summaryCard}>
            <div style={styles.summaryLabel}>必填环境变量</div>
            <div style={styles.summaryValue}>
              {env.readyRequiredCount}/{env.requiredCount}
            </div>
            <div style={styles.summaryHint}>{env.allRequiredReady ? "已达到上线基础要求" : "仍有关键项未配置"}</div>
          </article>
          <article style={styles.summaryCard}>
            <div style={styles.summaryLabel}>当前数据库模式</div>
            <div style={styles.summaryValue}>{process.env.DATABASE_URL ? "Postgres" : "SQLite"}</div>
            <div style={styles.summaryHint}>正式上线建议切换到 Postgres</div>
          </article>
          <article style={styles.summaryCard}>
            <div style={styles.summaryLabel}>cron 配置</div>
            <div style={styles.summaryValue}>{process.env.CRON_SECRET ? "已配置" : "未配置"}</div>
            <div style={styles.summaryHint}>需要配合 Vercel cron 和授权头一起验证</div>
          </article>
          <article style={styles.summaryCard}>
            <div style={styles.summaryLabel}>系统健康检查</div>
            <div style={styles.summaryValue}>已接入</div>
            <div style={styles.summaryHint}>可直接查看数据库、支付、cron 和 Provider 当前状态</div>
          </article>
        </section>

        <section style={styles.listWrap}>
          {steps.map((step) => (
            <article key={step.title} style={styles.stepCard}>
              <h2 style={styles.stepTitle}>{step.title}</h2>
              <ul style={styles.stepList}>
                {step.items.map((item) => (
                  <li key={item} style={styles.stepItem}>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
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
    fontSize: 42,
    lineHeight: 1.12,
    color: "#111827",
  },
  text: {
    margin: 0,
    color: "#667085",
    fontSize: 18,
    lineHeight: 1.8,
    maxWidth: 900,
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
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 18,
  },
  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#667085",
    fontWeight: 700,
  },
  summaryValue: {
    fontSize: 32,
    lineHeight: 1.1,
    fontWeight: 800,
    color: "#101828",
  },
  summaryHint: {
    fontSize: 14,
    lineHeight: 1.7,
    color: "#98a2b3",
  },
  listWrap: {
    display: "grid",
    gap: 18,
  },
  stepCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 28,
  },
  stepTitle: {
    margin: 0,
    fontSize: 24,
    color: "#111827",
  },
  stepList: {
    margin: "16px 0 0",
    paddingLeft: 22,
    display: "grid",
    gap: 10,
    color: "#475467",
    fontSize: 16,
    lineHeight: 1.85,
  },
  stepItem: {},
};
