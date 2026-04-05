import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/auth-options";

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<{ plan?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = (await searchParams) || {};
  const plan = params.plan || "套餐";

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.badge}>支付完成</div>
        <h1 style={styles.title}>你的 {plan} 支付已经提交</h1>
        <p style={styles.text}>
          套餐状态通常会在回调完成后自动更新。如果你刚完成支付，建议回到定价页点击一次“刷新套餐状态”，即可看到最新结果。
        </p>
        <div style={styles.actions}>
          <Link href="/pricing?billing=success" style={styles.primaryButton}>
            返回定价页并刷新状态
          </Link>
          <Link href="/dashboard?billing=success" style={styles.secondaryButton}>
            进入 Dashboard
          </Link>
          <Link href="/billing/manage" style={styles.secondaryButton}>
            管理订阅
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
    background: "#edf8f6",
    color: "#0f8b7f",
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
