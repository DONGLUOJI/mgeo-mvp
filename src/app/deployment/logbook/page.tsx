import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { LogbookManager } from "@/app/deployment/logbook/logbook-manager";
import { authOptions } from "@/lib/auth/auth-options";
import { getReleaseReadinessSummary } from "@/lib/system/release-readiness";

export default async function DeploymentLogbookPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const release = await getReleaseReadinessSummary();

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.badge}>发布记录</div>
          <h1 style={styles.title}>把每次试运营和正式发布的结论、变更范围与回退预案记录下来</h1>
          <p style={styles.text}>
            这页不是系统日志，而是发布当天的人类记录页。适合把本次版本结论、上线动作和回退策略记下来，方便后续复盘。
          </p>
          <div style={styles.actions}>
            <Link href="/ops" style={styles.secondaryButton}>
              返回运维入口
            </Link>
            <Link href="/deployment/release" style={styles.secondaryButton}>
              查看上线结论
            </Link>
            <Link href="/deployment/runbook" style={styles.primaryButton}>
              查看运行手册
            </Link>
          </div>
        </section>

        <LogbookManager
          defaultSummary={`当前发布判断：${release.title}。${release.summary}`}
          defaultOperator={session.user.email || ""}
        />
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
};
