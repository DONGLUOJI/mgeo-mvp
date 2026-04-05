import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/auth-options";
import { getDetectQuotaStatus, listMonitoredKeywords } from "@/lib/db/repository";
import { KeywordsManager } from "./keywords-manager";

export default async function DashboardKeywordsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [keywords, quota] = await Promise.all([
    listMonitoredKeywords(session.user.id),
    getDetectQuotaStatus(session.user.id),
  ]);

  const canCreate = (quota?.plan === "basic" || quota?.plan === "pro" || quota?.plan === "enterprise") ?? false;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.badge}>关键词管理</div>
          <h1 style={styles.title}>持续监控品牌关键词与模型表现</h1>
          <p style={styles.text}>
            当前账号套餐：{quota?.plan || "free"}。基础版最多 5 个关键词，专业版最多 30 个关键词。
          </p>
          <div style={styles.actions}>
            <Link href="/dashboard" style={styles.primaryButton}>
              返回 Dashboard
            </Link>
            <Link href="/pricing" style={styles.secondaryButton}>
              查看升级方案
            </Link>
          </div>
        </section>

        <KeywordsManager items={keywords} canCreate={canCreate} />
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
    margin: "18px 0 0",
    fontSize: 42,
    lineHeight: 1.1,
    color: "#111827",
  },
  text: {
    margin: "16px 0 0",
    fontSize: 17,
    lineHeight: 1.8,
    color: "#667085",
  },
  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 22,
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

