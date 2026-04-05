import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/auth-options";

export default async function BillingCancelPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.badge}>支付已取消</div>
        <h1 style={styles.title}>本次升级还没有完成</h1>
        <p style={styles.text}>
          你可以返回定价页重新发起升级，也可以先继续使用当前套餐。系统不会因为本次取消而影响你现有的账号数据。
        </p>
        <div style={styles.actions}>
          <Link href="/pricing?billing=cancel" style={styles.primaryButton}>
            返回定价页
          </Link>
          <Link href="/dashboard?billing=cancel" style={styles.secondaryButton}>
            返回 Dashboard
          </Link>
          <Link href="/billing/manage" style={styles.secondaryButton}>
            查看订阅状态
          </Link>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "40px 20px",
    background: "#f6f8fb",
  },
  card: {
    maxWidth: 760,
    width: "100%",
    background: "#fff",
    border: "1px solid #e7ebf0",
    borderRadius: 28,
    padding: 36,
    display: "grid",
    gap: 18,
  },
  badge: {
    display: "inline-flex",
    width: "fit-content",
    padding: "8px 14px",
    borderRadius: 999,
    background: "#fff4ed",
    color: "#b54708",
    fontWeight: 700,
    fontSize: 14,
  },
  title: {
    margin: 0,
    fontSize: 38,
    lineHeight: 1.15,
    color: "#111827",
  },
  text: {
    margin: 0,
    color: "#667085",
    fontSize: 17,
    lineHeight: 1.9,
  },
  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 6,
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
