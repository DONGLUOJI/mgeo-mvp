import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/auth-options";

const sections = [
  {
    title: "上线前 30 分钟",
    items: [
      "打开 /deployment/env，确认必填环境变量全部显示为“已配置”。",
      "打开 /deployment/health，确认不存在阻塞项；若有待完善项，判断是否影响本次发布。",
      "在 /deployment/checklist 里完成登录、检测、报告导出、支付回跳和 cron 基础联调。",
      "确认 DATABASE_URL 已指向线上 Postgres，而不是本地 SQLite。",
      "确认至少 2 个真实模型 Provider 已配置，用于首轮试运营。",
    ],
  },
  {
    title: "发布后 10 分钟",
    items: [
      "访问首页、/pricing、/ranking、/cases，确认公开页面无 500 与样式错乱。",
      "用测试邮箱登录 /login，确认能进入 /dashboard。",
      "在 /detect 发起一次检测，确认生成 taskId 并能打开 /report/[taskId]。",
      "进入 /history，确认新报告已落库并可查看、重跑与删除。",
      "进入 /deployment/health，再看一次数据库、鉴权、支付、cron 是否都正常。",
    ],
  },
  {
    title: "支付联调排查",
    items: [
      "如果 /pricing 发起升级无反应，先检查 LemonSqueezy checkout url 和 variant id 是否正确。",
      "如果支付成功但套餐没变，先查 /api/webhooks/lemonsqueezy 是否能收到回调，再核对 webhook secret。",
      "如果成功页回来了但状态没更新，先点击 /pricing 页的“刷新套餐状态”。",
      "如果 dashboard 仍显示免费版，检查 users 表里 plan 是否已被 webhook 更新。",
    ],
  },
  {
    title: "定时监控排查",
    items: [
      "先在 /dashboard/keywords 确认已有启用中的关键词。",
      "手动请求 /api/cron/daily-monitor，确认 monitor_results 是否新增记录。",
      "如果 cron 无结果，先检查 CRON_SECRET 和 vercel.json 中的计划任务配置。",
      "如果写入成功但 Dashboard 无趋势，检查 monitor_results 的日期范围是否落在当前筛选周期内。",
    ],
  },
  {
    title: "数据库与数据安全",
    items: [
      "正式环境一律使用 Postgres，SQLite 只保留给本地开发与演示。",
      "上线当天至少导出一份关键表快照：users、customers、scan_tasks、scan_reports。",
      "任何批量删除、重置或迁移前，都先确认当前 DATABASE_URL 指向的是预期环境。",
      "如果用户反馈历史记录缺失，先检查 scan_reports 与 scan_tasks 的 user_id 是否匹配。",
    ],
  },
  {
    title: "回退策略",
    items: [
      "若支付或 cron 出现异常，但核心检测链路正常，可先维持试运营并临时关闭升级引导。",
      "若真实模型 Provider 大面积不可用，可暂时回退到混合模式，保证 demo 与基础试用不阻塞。",
      "若数据库连接异常，优先恢复 Postgres 连接，不要直接切回线上 SQLite。",
      "任何需要紧急回退的情况，都先记录时间点、问题现象、影响范围和已执行动作。",
    ],
  },
];

export default async function DeploymentRunbookPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.badge}>运行手册</div>
          <h1 style={styles.title}>把上线动作、值班检查和故障排查整理成一份可直接照着做的手册</h1>
          <p style={styles.text}>
            这页适合发布当天和试运营早期反复使用。先按时间顺序处理上线动作，再按模块排查支付、cron、数据库和 Provider 的问题。
          </p>
          <div style={styles.actions}>
            <Link href="/ops" style={styles.secondaryButton}>
              返回运维入口
            </Link>
            <Link href="/deployment/checklist" style={styles.secondaryButton}>
              查看联调检查表
            </Link>
            <Link href="/deployment/health" style={styles.primaryButton}>
              查看健康检查
            </Link>
          </div>
        </section>

        <section style={styles.tipGrid}>
          <article style={styles.tipCard}>
            <div style={styles.tipLabel}>发布前建议</div>
            <div style={styles.tipValue}>先环境变量，后支付与 cron</div>
            <div style={styles.tipText}>先把阻塞项清掉，再做支付回跳与定时监控联调，避免把问题叠在一起排查。</div>
          </article>
          <article style={styles.tipCard}>
            <div style={styles.tipLabel}>发布后建议</div>
            <div style={styles.tipValue}>先跑一轮真实检测</div>
            <div style={styles.tipText}>用真实流程验证首页、登录、检测、报告和历史页，确保不是只通过了构建。</div>
          </article>
          <article style={styles.tipCard}>
            <div style={styles.tipLabel}>试运营建议</div>
            <div style={styles.tipValue}>保留混合模式兜底</div>
            <div style={styles.tipText}>真实 Provider 不稳定时，先让混合模式撑住可用性，再逐步把真实模型补齐。</div>
          </article>
        </section>

        <section style={styles.listWrap}>
          {sections.map((section) => (
            <article key={section.title} style={styles.sectionCard}>
              <h2 style={styles.sectionTitle}>{section.title}</h2>
              <ul style={styles.sectionList}>
                {section.items.map((item) => (
                  <li key={item} style={styles.sectionItem}>
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
  tipGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 18,
  },
  tipCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 10,
  },
  tipLabel: {
    fontSize: 14,
    color: "#667085",
    fontWeight: 700,
  },
  tipValue: {
    fontSize: 26,
    lineHeight: 1.2,
    fontWeight: 800,
    color: "#111827",
  },
  tipText: {
    fontSize: 15,
    lineHeight: 1.8,
    color: "#667085",
  },
  listWrap: {
    display: "grid",
    gap: 18,
  },
  sectionCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 28,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 24,
    color: "#111827",
  },
  sectionList: {
    margin: "16px 0 0",
    paddingLeft: 22,
    display: "grid",
    gap: 10,
    color: "#475467",
    fontSize: 16,
    lineHeight: 1.85,
  },
  sectionItem: {},
};
