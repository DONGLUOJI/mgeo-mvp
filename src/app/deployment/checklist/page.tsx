import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { ChecklistManager } from "@/app/deployment/checklist/checklist-manager";
import { authOptions } from "@/lib/auth/auth-options";
import { getEnvCheckSummary } from "@/lib/system/env-check";

const checklist = [
  {
    group: "基础访问",
    items: [
      {
        title: "站点首页可访问",
        verify: "打开 /、/pricing、/ranking、/cases，确认无 500 和样式错乱。",
      },
      {
        title: "登录链路可用",
        verify: "访问 /login，用测试邮箱登录后能进入 /dashboard。",
      },
    ],
  },
  {
    group: "检测与报告",
    items: [
      {
        title: "免费检测可提交",
        verify: "从 /detect 发起一次检测，确认返回 taskId 并跳到 /report/[taskId]。",
      },
      {
        title: "报告可导出",
        verify: "在报告页测试 HTML 下载和浏览器打印导出 PDF。",
      },
      {
        title: "历史记录可复查",
        verify: "访问 /history，确认记录可以查看、重跑和删除。",
      },
    ],
  },
  {
    group: "支付联调",
    items: [
      {
        title: "结账链接跳转正常",
        verify: "在 /pricing 里点击基础版和专业版按钮，确认能跳到 LemonSqueezy。",
      },
      {
        title: "Webhook 能升级套餐",
        verify: "完成一笔测试支付后，确认 /api/webhooks/lemonsqueezy 能把用户 plan 从 free 更新到 basic / pro。",
      },
      {
        title: "状态回跳与刷新正常",
        verify: "支付后能回到 /billing/success，再返回 /pricing?billing=success 并刷新套餐状态。",
      },
    ],
  },
  {
    group: "定时监控",
    items: [
      {
        title: "关键词可新增",
        verify: "在 /dashboard/keywords 新增一个关键词，确认数据库有 monitored_keywords 记录。",
      },
      {
        title: "cron 能写入监控结果",
        verify: "手动调用 /api/cron/daily-monitor，确认 monitor_results 有新数据。",
      },
      {
        title: "Dashboard 趋势图更新",
        verify: "打开 /dashboard，切换 7/30/90 天，确认趋势图能显示真实时间序列。",
      },
    ],
  },
  {
    group: "生产环境",
    items: [
      {
        title: "Vercel 环境变量完整",
        verify: "对照 /deployment/env，把必填环境变量全部配齐。",
      },
      {
        title: "数据库切到 Postgres",
        verify: "生产环境配置 DATABASE_URL，确认不再依赖本地 SQLite。",
      },
      {
        title: "cron 和 webhook 都能在生产触发",
        verify: "Vercel cron 每日触发一次，LemonSqueezy webhook 能访问生产域名。",
      },
    ],
  },
];

export default async function DeploymentChecklistPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const env = getEnvCheckSummary();

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.badge}>上线前联调检查表</div>
          <h1 style={styles.title}>按这张表逐项验证，就能更稳地进入试运营</h1>
          <p style={styles.text}>
            这页不是自动测试报告，而是一张人工验收清单。建议每完成一项就实际点一次、跑一次、看一次数据库，再继续下一项。
          </p>
          <div style={styles.actions}>
            <Link href="/deployment" style={styles.secondaryButton}>
              返回部署准备
            </Link>
            <Link href="/deployment/env" style={styles.primaryButton}>
              查看环境变量检查
            </Link>
          </div>
        </section>

        <section style={styles.summaryCard}>
          <div style={styles.summaryTitle}>前置条件</div>
          <div style={styles.summaryText}>
            当前必填环境变量已完成 {env.readyRequiredCount}/{env.requiredCount} 项。
            {env.allRequiredReady
              ? " 可以进入完整联调。"
              : " 还建议先把必填环境变量配齐，再开始支付和 cron 联调。"}
          </div>
        </section>

        <ChecklistManager items={checklist} />
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
  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "#101828",
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 1.85,
    color: "#667085",
  },
};
