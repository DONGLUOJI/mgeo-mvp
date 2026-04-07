"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type BillingStatusData = {
  email: string;
  plan: string;
  quota: {
    limit: number;
    used: number;
    remaining: number;
    periodLabel: "本周" | "本月";
  } | null;
  updatedAt: string;
};

const PLAN_LABEL: Record<string, string> = {
  free: "免费版",
  basic: "基础版",
  pro: "专业版",
  enterprise: "企业版",
};

export function PlanStatusCard({
  initialData,
}: {
  initialData: BillingStatusData;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(() => {
    const billing = searchParams.get("billing");
    if (billing === "success") return "支付完成后，可点击下方按钮刷新套餐状态。";
    if (billing === "cancel") return "你已取消本次支付，可以稍后重新发起升级。";
    return "";
  });

  async function refreshStatus() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/billing/status", {
        method: "GET",
        cache: "no-store",
      });
      const payload = await res.json();

      if (!res.ok || !payload.success) {
        throw new Error(payload.message || "刷新失败，请稍后再试");
      }

      setData(payload.data);
      setMessage("套餐状态已刷新到最新。");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "刷新失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={styles.card}>
      <div style={styles.header}>
        <div>
          <div style={styles.badge}>套餐状态</div>
          <h2 style={styles.title}>当前账号已开通 {PLAN_LABEL[data.plan] || data.plan}</h2>
          <p style={styles.text}>
            账号：{data.email}
            {data.quota ? `，${data.quota.periodLabel}已使用 ${data.quota.used}/${data.quota.limit} 次检测，剩余 ${data.quota.remaining} 次。` : "。"}
          </p>
        </div>
        <button type="button" onClick={refreshStatus} disabled={loading} style={styles.button}>
          {loading ? "刷新中..." : "刷新套餐状态"}
        </button>
      </div>

      <div style={styles.meta}>
        <span>最近同步：{new Date(data.updatedAt).toLocaleString("zh-CN", { hour12: false })}</span>
        {message ? <span style={styles.message}>{message}</span> : null}
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "#ffffff",
    border: "1px solid rgba(15, 139, 127, 0.18)",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    display: "grid",
    gap: 14,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "center",
    flexWrap: "wrap",
  },
  badge: {
    display: "inline-flex",
    padding: "6px 12px",
    borderRadius: 999,
    background: "#edf8f6",
    color: "#0f8b7f",
    fontWeight: 700,
    fontSize: 13,
  },
  title: {
    margin: "12px 0 0",
    fontSize: 24,
    lineHeight: 1.2,
    color: "#101828",
  },
  text: {
    margin: "10px 0 0",
    fontSize: 15,
    lineHeight: 1.8,
    color: "#667085",
  },
  button: {
    height: 44,
    padding: "0 16px",
    borderRadius: 12,
    border: "1px solid #d8dee6",
    background: "#fff",
    color: "#111827",
    fontWeight: 700,
    cursor: "pointer",
  },
  meta: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    color: "#98a2b3",
    fontSize: 13,
  },
  message: {
    color: "#0f8b7f",
    fontWeight: 600,
  },
};
