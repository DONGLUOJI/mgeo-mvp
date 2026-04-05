import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/auth-options";
import { getReleaseReadinessSummary } from "@/lib/system/release-readiness";

const decisionColor = {
  blocked: "#b42318",
  trial: "#b54708",
  ready: "#0f8b7f",
} as const;

const decisionText = {
  blocked: "暂不建议上线",
  trial: "可试运营",
  ready: "可上线",
} as const;

function buildReleaseExport(
  release: Awaited<ReturnType<typeof getReleaseReadinessSummary>>,
) {
  return JSON.stringify(
    {
      generatedAt: release.generatedAt,
      decision: release.decision,
      title: release.title,
      summary: release.summary,
      reasons: release.reasons,
      nextActions: release.nextActions,
      envReadyText: release.envReadyText,
      providerText: release.providerText,
      databaseText: release.databaseText,
    },
    null,
    2,
  );
}

export default async function DeploymentReleasePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const release = await getReleaseReadinessSummary();
  const releaseExport = buildReleaseExport(release);
  const releaseText = [
    `MGEO 当前发布结论：${decisionText[release.decision]}`,
    `结论说明：${release.summary}`,
    `环境变量：${release.envReadyText}`,
    `真实 Provider：${release.providerText}`,
    `数据库：${release.databaseText}`,
    "下一步建议：",
    ...release.nextActions.map((item, index) => `${index + 1}. ${item}`),
  ].join("\n");
  const downloadHref = `data:application/json;charset=utf-8,${encodeURIComponent(releaseExport)}`;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.badge}>上线结论</div>
          <h1 style={styles.title}>把环境变量、健康检查和阻塞项汇总成一句真正可执行的发布判断</h1>
          <p style={styles.text}>
            这页不再只是罗列状态，而是直接告诉你：当前是否适合上线、为什么，以及下一步最该先做什么。
          </p>
          <div style={styles.actions}>
            <Link href="/ops" style={styles.secondaryButton}>
              返回运维入口
            </Link>
            <Link href="/deployment/health" style={styles.secondaryButton}>
              查看健康检查
            </Link>
            <Link href="/deployment/logbook" style={styles.secondaryButton}>
              记录到发布日志
            </Link>
            <Link href="/deployment/checklist" style={styles.primaryButton}>
              查看联调检查表
            </Link>
          </div>
        </section>

        <section style={styles.decisionCard}>
          <div style={styles.decisionLabel}>当前发布结论</div>
          <div style={{ ...styles.decisionValue, color: decisionColor[release.decision] }}>
            {decisionText[release.decision]}
          </div>
          <div style={styles.decisionTitle}>{release.title}</div>
          <div style={styles.decisionSummary}>{release.summary}</div>
        </section>

        <section style={styles.summaryGrid}>
          <article style={styles.summaryCard}>
            <div style={styles.summaryLabel}>环境变量</div>
            <div style={styles.summaryValue}>{release.envReadyText}</div>
          </article>
          <article style={styles.summaryCard}>
            <div style={styles.summaryLabel}>真实 Provider</div>
            <div style={styles.summaryValue}>{release.providerText}</div>
          </article>
          <article style={styles.summaryCard}>
            <div style={styles.summaryLabel}>数据库</div>
            <div style={styles.summaryValue}>{release.databaseText}</div>
          </article>
        </section>

        <section style={styles.grid}>
          <article style={styles.card}>
            <div style={styles.cardTitle}>做出这个结论的原因</div>
            <ul style={styles.list}>
              {release.reasons.map((item) => (
                <li key={item} style={styles.listItem}>
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article style={styles.card}>
            <div style={styles.cardTitle}>现在最该做的动作</div>
            <ul style={styles.list}>
              {release.nextActions.map((item) => (
                <li key={item} style={styles.listItem}>
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section style={styles.copyCard}>
          <div style={styles.copyHeader}>
            <div style={styles.cardTitle}>可复制的发布结论</div>
            <div style={styles.copyActions}>
              <a
                href={downloadHref}
                download={`mgeo-release-summary-${release.decision}.json`}
                style={styles.downloadButton}
              >
                下载 JSON 摘要
              </a>
              <Link href="/api/system/release" style={styles.secondaryInlineButton}>
                查看结论 API
              </Link>
            </div>
          </div>
          <textarea
            readOnly
            style={styles.copyTextarea}
            value={releaseText}
          />
        </section>

        <section style={styles.copyCard}>
          <div style={styles.cardTitle}>机器可读的发布摘要</div>
          <div style={styles.exportHint}>
            这份 JSON 适合直接发给技术同事、留在发布群里，或者复制到内部运维面板做快照记录。
          </div>
          <textarea readOnly style={styles.exportTextarea} value={releaseExport} />
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
    maxWidth: 940,
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
  decisionCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 28,
    padding: 28,
    display: "grid",
    gap: 10,
  },
  decisionLabel: {
    fontSize: 14,
    color: "#667085",
    fontWeight: 700,
  },
  decisionValue: {
    fontSize: 42,
    lineHeight: 1.05,
    fontWeight: 800,
  },
  decisionTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: "#111827",
  },
  decisionSummary: {
    fontSize: 16,
    lineHeight: 1.8,
    color: "#667085",
    maxWidth: 920,
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 18,
  },
  copyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  copyActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  downloadButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 42,
    padding: "0 16px",
    borderRadius: 12,
    background: "#111827",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 700,
  },
  secondaryInlineButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 42,
    padding: "0 16px",
    borderRadius: 12,
    border: "1px solid #d8dee6",
    background: "#ffffff",
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
  summaryLabel: {
    fontSize: 14,
    color: "#667085",
    fontWeight: 700,
  },
  summaryValue: {
    fontSize: 22,
    lineHeight: 1.45,
    fontWeight: 800,
    color: "#111827",
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
    gap: 14,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#111827",
  },
  list: {
    margin: 0,
    paddingLeft: 20,
    display: "grid",
    gap: 10,
    color: "#475467",
    fontSize: 16,
    lineHeight: 1.85,
  },
  listItem: {},
  copyCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 14,
  },
  copyTextarea: {
    width: "100%",
    minHeight: 180,
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
  exportHint: {
    margin: 0,
    color: "#667085",
    fontSize: 15,
    lineHeight: 1.75,
  },
  exportTextarea: {
    width: "100%",
    minHeight: 260,
    borderRadius: 16,
    border: "1px solid #d8dee6",
    background: "#f8fafc",
    color: "#111827",
    padding: 18,
    fontSize: 13,
    lineHeight: 1.7,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    resize: "vertical",
  },
};
