import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/auth-options";
import { getEnvCheckSummary } from "@/lib/system/env-check";

export default async function DeploymentEnvPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const summary = getEnvCheckSummary();

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.badge}>环境变量检查</div>
          <h1 style={styles.title}>上线前先确认这些关键变量已经配好</h1>
          <p style={styles.text}>
            这里只显示“是否已配置”，不会展示具体密钥内容。优先把必填项补齐，再继续联调支付、数据库和 cron。
          </p>
          <div style={styles.actions}>
            <Link href="/deployment" style={styles.secondaryButton}>
              返回部署清单
            </Link>
            <Link href="/pricing" style={styles.primaryButton}>
              去联调支付
            </Link>
          </div>
        </section>

        <section style={styles.statusCard}>
          <div style={styles.statusTitle}>必填项进度</div>
          <div style={styles.statusValue}>
            {summary.readyRequiredCount}/{summary.requiredCount}
          </div>
          <div style={{ ...styles.statusHint, color: summary.allRequiredReady ? "#0f8b7f" : "#b42318" }}>
            {summary.allRequiredReady ? "所有必填环境变量都已配置，可以进入上线联调。" : "还有关键变量未配置，暂不建议直接上线。"}
          </div>
        </section>

        <section style={styles.guideCard}>
          <div style={styles.guideTitle}>线上环境建议值说明</div>
          <p style={styles.guideText}>
            下面这部分是“怎么填更合适”的建议，不是检查结果。你可以把它当成正式环境变量配置参考，避免把本地值直接带到生产环境。
          </p>
        </section>

        <section style={styles.groupWrap}>
          {summary.groups.map((group) => (
            <article key={group.name} style={styles.groupCard}>
              <h2 style={styles.groupTitle}>{group.name}</h2>
              <div style={styles.rows}>
                {group.items.map((item) => (
                  <div key={item.key} style={styles.row}>
                    <div style={styles.rowMain}>
                      <div style={styles.key}>{item.key}</div>
                      {item.note ? <div style={styles.note}>{item.note}</div> : null}
                      {item.suggested ? <div style={styles.suggested}>建议：{item.suggested}</div> : null}
                      {item.example ? <div style={styles.example}>示例：{item.example}</div> : null}
                    </div>
                    <div
                      style={{
                        ...styles.badgeStatus,
                        ...(item.configured ? styles.badgeSuccess : styles.badgeDanger),
                      }}
                    >
                      {item.configured ? "已配置" : item.required ? "未配置" : "可选"}
                    </div>
                  </div>
                ))}
              </div>
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
  statusCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 10,
  },
  statusTitle: {
    fontSize: 15,
    color: "#667085",
    fontWeight: 700,
  },
  statusValue: {
    fontSize: 36,
    lineHeight: 1.1,
    fontWeight: 800,
    color: "#101828",
  },
  statusHint: {
    fontSize: 15,
    lineHeight: 1.8,
    fontWeight: 600,
  },
  guideCard: {
    background: "#fff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 10,
  },
  guideTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: "#111827",
  },
  guideText: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.85,
    color: "#667085",
    maxWidth: 920,
  },
  groupWrap: {
    display: "grid",
    gap: 18,
  },
  groupCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 16,
  },
  groupTitle: {
    margin: 0,
    fontSize: 24,
    color: "#111827",
  },
  rows: {
    display: "grid",
    gap: 14,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
    paddingBottom: 14,
    borderBottom: "1px solid #f0f2f5",
  },
  rowMain: {
    display: "grid",
    gap: 8,
    maxWidth: 860,
  },
  key: {
    fontSize: 16,
    fontWeight: 700,
    color: "#101828",
  },
  note: {
    fontSize: 14,
    lineHeight: 1.75,
    color: "#667085",
  },
  suggested: {
    fontSize: 14,
    lineHeight: 1.75,
    color: "#344054",
  },
  example: {
    fontSize: 13,
    lineHeight: 1.7,
    color: "#98a2b3",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  },
  badgeStatus: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 72,
    height: 32,
    padding: "0 12px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  badgeSuccess: {
    background: "#edf8f6",
    color: "#0f8b7f",
  },
  badgeDanger: {
    background: "#fff1f3",
    color: "#b42318",
  },
};
