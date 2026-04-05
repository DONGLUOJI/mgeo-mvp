import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/auth-options";
import { getRuntimeHealthSummary } from "@/lib/system/runtime-health";

export default async function DeploymentHealthPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const health = await getRuntimeHealthSummary();

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.badge}>系统健康检查</div>
          <h1 style={styles.title}>在真正部署之前，先确认系统关键部位是不是已经准备好</h1>
          <p style={styles.text}>
            这页会直接检查数据库、鉴权、支付、cron 和真实模型 Provider 的当前状态。它不是监控平台，但足够作为上线前的健康快照。
          </p>
          <div style={styles.actions}>
            <Link href="/deployment" style={styles.secondaryButton}>
              返回部署准备
            </Link>
            <Link href="/deployment/env" style={styles.secondaryButton}>
              环境变量检查
            </Link>
            <Link href="/deployment/checklist" style={styles.primaryButton}>
              联调检查表
            </Link>
          </div>
        </section>

        <section style={styles.summaryGrid}>
          <article style={styles.summaryCard}>
            <div style={styles.summaryLabel}>整体状态</div>
            <div style={{ ...styles.summaryValue, color: colorMap[health.overallStatus] }}>
              {statusText[health.overallStatus]}
            </div>
            <div style={styles.summaryHint}>生成时间：{formatDateTime(health.generatedAt)}</div>
          </article>
          <article style={styles.summaryCard}>
            <div style={styles.summaryLabel}>数据库模式</div>
            <div style={styles.summaryValue}>{health.database.mode === "postgres" ? "Postgres" : "SQLite"}</div>
            <div style={styles.summaryHint}>{health.database.detail}</div>
          </article>
          <article style={styles.summaryCard}>
            <div style={styles.summaryLabel}>真实 Provider</div>
            <div style={styles.summaryValue}>{health.providers.configured.length}</div>
            <div style={styles.summaryHint}>建议至少配置 2 个真实模型 Provider</div>
          </article>
        </section>

        {health.blockers.length ? (
          <section style={styles.blockerCard}>
            <div style={styles.blockerTitle}>当前上线阻塞项</div>
            <div style={styles.listWrap}>
              {health.blockers.map((item) => (
                <div key={item} style={styles.blockerItem}>
                  {item}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {health.warnings.length ? (
          <section style={styles.warningCard}>
            <div style={styles.warningTitle}>建议优先补齐的待完善项</div>
            <div style={styles.listWrap}>
              {health.warnings.map((item) => (
                <div key={item} style={styles.warningItem}>
                  {item}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section style={styles.copyCard}>
          <div style={styles.copyHeader}>
            <div>
              <div style={styles.copyTitle}>可复制的上线结论摘要</div>
              <div style={styles.copyText}>适合直接发给技术同事、运营同事或记录到飞书文档里。</div>
            </div>
          </div>
          <textarea
            readOnly
            value={buildConclusionSummary(health)}
            style={styles.copyTextarea}
          />
        </section>

        <section style={styles.healthGrid}>
          <HealthCard title="数据库" status={health.database.status} detail={health.database.detail} />
          <HealthCard title="登录鉴权" status={health.auth.status} detail={health.auth.detail} />
          <HealthCard title="支付系统" status={health.payment.status} detail={health.payment.detail} />
          <HealthCard title="定时监控" status={health.cron.status} detail={health.cron.detail} />
          <article style={styles.detailCard}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>模型 Provider</div>
              <div style={{ ...styles.pill, color: colorMap[health.providers.status], borderColor: colorMap[health.providers.status] }}>
                {statusText[health.providers.status]}
              </div>
            </div>
            <div style={styles.cardText}>{health.providers.detail}</div>
            <div style={styles.metaWrap}>
              <div style={styles.metaBlock}>
                <div style={styles.metaLabel}>已配置</div>
                <div style={styles.metaText}>
                  {health.providers.configured.length ? health.providers.configured.join("、") : "暂无"}
                </div>
              </div>
              <div style={styles.metaBlock}>
                <div style={styles.metaLabel}>未配置</div>
                <div style={styles.metaText}>
                  {health.providers.missing.length ? health.providers.missing.join("、") : "无"}
                </div>
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

function HealthCard({
  title,
  status,
  detail,
}: {
  title: string;
  status: keyof typeof statusText;
  detail: string;
}) {
  return (
    <article style={styles.detailCard}>
      <div style={styles.cardHeader}>
        <div style={styles.cardTitle}>{title}</div>
        <div style={{ ...styles.pill, color: colorMap[status], borderColor: colorMap[status] }}>
          {statusText[status]}
        </div>
      </div>
      <div style={styles.cardText}>{detail}</div>
    </article>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function buildConclusionSummary(health: Awaited<ReturnType<typeof getRuntimeHealthSummary>>) {
  return [
    `MGEO 当前整体健康状态：${statusText[health.overallStatus]}`,
    `数据库：${health.database.mode === "postgres" ? "Postgres" : "SQLite"}，${health.database.detail}`,
    `登录鉴权：${health.auth.detail}`,
    `支付系统：${health.payment.detail}`,
    `定时监控：${health.cron.detail}`,
    `真实 Provider：${health.providers.detail}`,
    `建议下一步：${health.overallStatus === "healthy" ? "可以进入正式联调和试运营上线。" : health.overallStatus === "warning" ? "可进入试运营前联调，但建议先补齐待完善项。" : "当前仍有阻塞项，建议先完成关键配置再上线。"}`,
  ].join("\n");
}

const statusText = {
  healthy: "健康",
  warning: "待完善",
  missing: "阻塞",
} as const;

const colorMap = {
  healthy: "#0f8b7f",
  warning: "#b54708",
  missing: "#b42318",
} as const;

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
  blockerCard: {
    background: "rgba(180, 35, 24, 0.06)",
    border: "1px solid rgba(180, 35, 24, 0.14)",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 12,
  },
  blockerTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#b42318",
  },
  warningCard: {
    background: "rgba(181, 71, 8, 0.06)",
    border: "1px solid rgba(181, 71, 8, 0.14)",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 12,
  },
  warningTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#b54708",
  },
  listWrap: {
    display: "grid",
    gap: 10,
  },
  blockerItem: {
    fontSize: 15,
    lineHeight: 1.8,
    color: "#7a271a",
  },
  warningItem: {
    fontSize: 15,
    lineHeight: 1.8,
    color: "#7a2e0e",
  },
  healthGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 18,
  },
  copyCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 14,
  },
  copyHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  copyTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#111827",
  },
  copyText: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 1.8,
    color: "#667085",
  },
  copyTextarea: {
    width: "100%",
    minHeight: 180,
    borderRadius: 18,
    border: "1px solid #d0d5dd",
    padding: 16,
    fontSize: 14,
    lineHeight: 1.8,
    color: "#111827",
    background: "#fafbfd",
    resize: "vertical",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace",
  },
  detailCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 14,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#111827",
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    height: 34,
    padding: "0 12px",
    borderRadius: 999,
    border: "1px solid",
    background: "#fff",
    fontWeight: 700,
    fontSize: 13,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 1.85,
    color: "#667085",
  },
  metaWrap: {
    display: "grid",
    gap: 12,
  },
  metaBlock: {
    display: "grid",
    gap: 6,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: 800,
    color: "#98a2b3",
  },
  metaText: {
    fontSize: 14,
    lineHeight: 1.7,
    color: "#111827",
  },
};
