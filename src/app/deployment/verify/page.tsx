import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/auth-options";

const publicLinks = [
  { label: "首页", href: "/" },
  { label: "免费检测页", href: "/detect" },
  { label: "定价页", href: "/pricing" },
  { label: "案例页", href: "/cases" },
  { label: "排名页", href: "/ranking" },
];

const protectedLinks = [
  { label: "登录页", href: "/login" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "关键词管理", href: "/dashboard/keywords" },
  { label: "客户列表", href: "/customers" },
  { label: "任务列表", href: "/tasks" },
  { label: "历史记录", href: "/history" },
  { label: "运维入口", href: "/ops" },
];

const deploymentLinks = [
  { label: "部署准备", href: "/deployment" },
  { label: "环境变量检查", href: "/deployment/env" },
  { label: "联调检查表", href: "/deployment/checklist" },
  { label: "系统健康检查", href: "/deployment/health" },
  { label: "运行手册", href: "/deployment/runbook" },
];

const billingLinks = [
  { label: "支付成功回跳页", href: "/billing/success" },
  { label: "支付取消回跳页", href: "/billing/cancel" },
  { label: "订阅管理页", href: "/billing/manage" },
];

const apiChecks = [
  { label: "系统健康检查 API", method: "GET", href: "/api/system/health" },
  { label: "上线结论 API", method: "GET", href: "/api/system/release" },
  { label: "客户列表 API", method: "GET", href: "/api/customers?limit=5" },
  { label: "任务列表 API", method: "GET", href: "/api/tasks?limit=5" },
  { label: "关键词列表 API", method: "GET", href: "/api/keywords" },
];

const reportChecks = [
  { label: "示例报告", href: "/report/scan_001" },
  { label: "检测后历史入口", href: "/history" },
];

function getBaseUrl() {
  return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export default async function DeploymentVerifyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const baseUrl = getBaseUrl();

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.badge}>验证入口</div>
          <h1 style={styles.title}>把发布当天要点开的页面、接口和回跳地址集中到一个地方</h1>
          <p style={styles.text}>
            发布当天不需要再来回找地址。先点公开页面，再点后台页，最后验证 API、报告和支付回跳，能更快确认站点是否真的可用。
          </p>
          <div style={styles.metaWrap}>
            <div style={styles.metaCard}>
              <div style={styles.metaLabel}>当前基础地址</div>
              <div style={styles.metaValue}>{baseUrl}</div>
            </div>
            <div style={styles.metaCard}>
              <div style={styles.metaLabel}>当前登录账号</div>
              <div style={styles.metaValue}>{session.user.email || "未知账号"}</div>
            </div>
          </div>
          <div style={styles.actions}>
            <Link href="/ops" style={styles.secondaryButton}>
              返回运维入口
            </Link>
            <Link href="/deployment/checklist" style={styles.primaryButton}>
              打开联调检查表
            </Link>
          </div>
        </section>

        <section style={styles.grid}>
          <LinkGroup title="公开页面" items={publicLinks} />
          <LinkGroup title="后台页面" items={protectedLinks} />
          <LinkGroup title="部署页入口" items={deploymentLinks} />
          <LinkGroup title="支付与订阅" items={billingLinks} />
        </section>

        <section style={styles.grid}>
          <ApiGroup title="接口验证" items={apiChecks} baseUrl={baseUrl} />
          <LinkGroup title="报告与历史" items={reportChecks} />
        </section>

        <section style={styles.commandCard}>
          <div style={styles.commandTitle}>常用验证命令模板</div>
          <div style={styles.commandText}>把下面命令里的占位符替换掉，就可以在本地终端或上线后快速验证关键接口。</div>
          <textarea
            readOnly
            style={styles.commandTextarea}
            value={[
              `curl -H "Cookie: <你的登录态 Cookie>" ${baseUrl}/api/system/health`,
              `curl -H "Cookie: <你的登录态 Cookie>" ${baseUrl}/api/system/release`,
              `curl -H "Authorization: Bearer <CRON_SECRET>" ${baseUrl}/api/cron/daily-monitor`,
              `curl -H "Cookie: <你的登录态 Cookie>" ${baseUrl}/api/customers?limit=5`,
              `curl -H "Cookie: <你的登录态 Cookie>" ${baseUrl}/api/tasks?limit=5`,
            ].join("\n")}
          />
        </section>
      </div>
    </main>
  );
}

function LinkGroup({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; href: string }>;
}) {
  return (
    <article style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.linkList}>
        {items.map((item) => (
          <Link key={item.href} href={item.href} style={styles.linkItem}>
            <span>{item.label}</span>
            <span style={styles.linkHref}>{item.href}</span>
          </Link>
        ))}
      </div>
    </article>
  );
}

function ApiGroup({
  title,
  items,
  baseUrl,
}: {
  title: string;
  items: Array<{ label: string; method: string; href: string }>;
  baseUrl: string;
}) {
  return (
    <article style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.linkList}>
        {items.map((item) => (
          <a key={item.href} href={item.href} style={styles.linkItem}>
            <span>{item.label}</span>
            <span style={styles.linkHref}>{item.method} {baseUrl.replace(/\/$/, "")}{item.href}</span>
          </a>
        ))}
      </div>
    </article>
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
    maxWidth: 940,
  },
  metaWrap: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },
  metaCard: {
    background: "#f8fafc",
    border: "1px solid #e7ebf0",
    borderRadius: 20,
    padding: 18,
    display: "grid",
    gap: 8,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#667085",
  },
  metaValue: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
    wordBreak: "break-all",
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
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 18,
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#111827",
  },
  linkList: {
    display: "grid",
    gap: 12,
  },
  linkItem: {
    display: "grid",
    gap: 6,
    padding: 16,
    borderRadius: 16,
    border: "1px solid #e7ebf0",
    textDecoration: "none",
    color: "#111827",
    background: "#fafbfc",
  },
  linkHref: {
    fontSize: 13,
    color: "#667085",
    wordBreak: "break-all",
  },
  commandCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 12,
  },
  commandTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#111827",
  },
  commandText: {
    fontSize: 15,
    lineHeight: 1.8,
    color: "#667085",
  },
  commandTextarea: {
    width: "100%",
    minHeight: 150,
    borderRadius: 16,
    border: "1px solid #d8dee6",
    background: "#0f172a",
    color: "#e5e7eb",
    padding: 18,
    fontSize: 13,
    lineHeight: 1.7,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    resize: "vertical",
  },
};
