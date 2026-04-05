import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { DeleteReportButton } from "@/app/history/delete-report-button";
import { authOptions } from "@/lib/auth/auth-options";
import { MODEL_META } from "@/lib/detect/model-meta";
import { listReports } from "@/lib/db/repository";

function formatDateTime(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getModeLabel(mode?: "real" | "mock" | "hybrid") {
  if (mode === "real") return "真实调用";
  if (mode === "hybrid") return "混合模式";
  return "Mock 模式";
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

type HistoryReportItem = Awaited<ReturnType<typeof listReports>>[number];

function buildDetectHref(item: HistoryReportItem) {
  const params = new URLSearchParams({
    brandName: item.report.input.brandName,
    industry: item.report.input.industry,
    businessSummary: item.report.input.businessSummary,
    query: item.report.input.query,
    models: item.report.input.selectedModels.join(","),
  });

  return `/detect?${params.toString()}`;
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; mode?: string; from?: string; to?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = searchParams ? await searchParams : {};
  const q = params?.q?.trim() || "";
  const mode = params?.mode?.trim() || "";
  const from = params?.from?.trim() || "";
  const to = params?.to?.trim() || "";
  const reports = await listReports(50, session.user.id);
  const filteredReports = reports.filter((item) => {
    const matchesQ =
      !q ||
      normalize(item.brandName).includes(normalize(q)) ||
      normalize(item.taskId).includes(normalize(q)) ||
      normalize(item.report.input.query).includes(normalize(q));
    const matchesMode = !mode || (item.report.debug?.mode || "mock") === mode;
    const reportTime = new Date(item.createdAt).getTime();
    const fromTime = from ? new Date(`${from}T00:00:00`).getTime() : null;
    const toTime = to ? new Date(`${to}T23:59:59`).getTime() : null;
    const matchesFrom = fromTime === null || reportTime >= fromTime;
    const matchesTo = toTime === null || reportTime <= toTime;

    return matchesQ && matchesMode && matchesFrom && matchesTo;
  });

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.badge}>检测历史</div>
          <h1 style={styles.title}>查看已保存的 MGEO 检测任务</h1>
          <p style={styles.text}>
            这里会展示已经存入数据库的检测结果。你每提交一次检测，都会沉淀为一条可回看的历史记录。
          </p>

          <form action="/history" style={styles.filterBar}>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="搜索品牌名、任务ID或检测问题"
              style={styles.searchInput}
            />
            <input type="date" name="from" defaultValue={from} style={styles.select} />
            <input type="date" name="to" defaultValue={to} style={styles.select} />
            <select name="mode" defaultValue={mode} style={styles.select}>
              <option value="">全部模式</option>
              <option value="real">真实调用</option>
              <option value="hybrid">混合模式</option>
              <option value="mock">Mock 模式</option>
            </select>
            <button type="submit" style={styles.filterButton}>
              筛选历史
            </button>
          </form>

          <div style={styles.actions}>
            <Link href="/detect" style={styles.primaryButton}>
              新建检测
            </Link>
            <Link href="/" style={styles.secondaryButton}>
              返回首页
            </Link>
          </div>
        </section>

        {filteredReports.length === 0 ? (
          <section style={styles.emptyCard}>
            <h2 style={styles.emptyTitle}>还没有历史记录</h2>
            <p style={styles.emptyText}>
              {reports.length === 0
                ? "先去提交一次检测，结果保存后这里就会出现。"
                : "当前筛选条件下没有匹配记录，你可以换个关键词、模式或时间范围再看。"}
            </p>
          </section>
        ) : (
          <section style={styles.list}>
            {filteredReports.map((item) => (
              <article key={item.taskId} style={styles.reportCard}>
                <div style={styles.reportTop}>
                  <div>
                    <div style={styles.reportMeta}>任务 #{item.taskId}</div>
                    <h2 style={styles.reportTitle}>{item.brandName}</h2>
                    <p style={styles.reportText}>{item.report.summary}</p>
                  </div>
                  <div style={styles.scoreCard}>
                    <div style={styles.scoreValue}>{item.report.score.total}</div>
                    <div style={styles.scoreLabel}>{item.report.score.level}</div>
                  </div>
                </div>

                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>检测时间</span>
                    <span style={styles.infoValue}>{formatDateTime(item.createdAt)}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>运行方式</span>
                    <span style={styles.infoValue}>{getModeLabel(item.report.debug?.mode)}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>行业</span>
                    <span style={styles.infoValue}>{item.report.input.industry}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>提及模型</span>
                    <span style={styles.infoValue}>
                      {item.report.results.filter((result) => result.mentioned).length} /{" "}
                      {item.report.results.length}
                    </span>
                  </div>
                </div>

                <div style={styles.metrics}>
                  <div style={styles.metric}>
                    <strong>Consistency</strong>
                    <span>{item.report.score.consistency}</span>
                  </div>
                  <div style={styles.metric}>
                    <strong>Coverage</strong>
                    <span>{item.report.score.coverage}</span>
                  </div>
                  <div style={styles.metric}>
                    <strong>Authority</strong>
                    <span>{item.report.score.authority}</span>
                  </div>
                </div>

                <div style={styles.providerRow}>
                  {item.report.results.map((result) => (
                    <span key={result.model} style={styles.providerTag}>
                      {MODEL_META[result.model as keyof typeof MODEL_META]?.label || result.model}
                      {" · "}
                      {result.source === "real" ? "真实" : "mock"}
                    </span>
                  ))}
                </div>

                <div style={styles.actions}>
                  <Link href={`/report/${item.taskId}`} style={styles.primaryButton}>
                    查看报告
                  </Link>
                  <Link href={buildDetectHref(item)} style={styles.secondaryButton}>
                    重新检测
                  </Link>
                  <DeleteReportButton taskId={item.taskId} />
                </div>
              </article>
            ))}
          </section>
        )}
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
    maxWidth: 1120,
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
    lineHeight: 1.12,
    color: "#111827",
  },
  text: {
    margin: "16px 0 0",
    color: "#667085",
    fontSize: 18,
    lineHeight: 1.8,
    maxWidth: 820,
  },
  filterBar: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.8fr) 160px 160px 180px 140px",
    gap: 12,
    alignItems: "center",
    marginTop: 20,
  },
  searchInput: {
    height: 48,
    borderRadius: 14,
    border: "1px solid #d8dee6",
    padding: "0 16px",
    fontSize: 15,
    outline: "none",
    background: "#ffffff",
  },
  select: {
    height: 48,
    borderRadius: 14,
    border: "1px solid #d8dee6",
    padding: "0 14px",
    fontSize: 15,
    background: "#ffffff",
    color: "#111827",
  },
  filterButton: {
    height: 48,
    border: "none",
    borderRadius: 14,
    background: "#0f8b7f",
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  list: {
    display: "grid",
    gap: 20,
  },
  reportCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 20,
  },
  reportTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "flex-start",
  },
  reportMeta: {
    color: "#0f8b7f",
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 8,
  },
  reportTitle: {
    margin: 0,
    fontSize: 28,
    color: "#111827",
  },
  reportText: {
    margin: "12px 0 0",
    fontSize: 16,
    color: "#667085",
    lineHeight: 1.75,
    maxWidth: 760,
  },
  scoreCard: {
    minWidth: 120,
    borderRadius: 20,
    background: "#111827",
    color: "#ffffff",
    padding: "18px 20px",
    textAlign: "center",
  },
  scoreValue: {
    fontSize: 40,
    lineHeight: 1,
    fontWeight: 800,
  },
  scoreLabel: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.8,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 14,
  },
  infoItem: {
    border: "1px solid #edf0f4",
    borderRadius: 16,
    padding: 14,
    display: "grid",
    gap: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: "#667085",
  },
  infoValue: {
    fontSize: 15,
    color: "#111827",
    lineHeight: 1.6,
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 12,
  },
  metric: {
    borderRadius: 16,
    background: "#f8fafc",
    border: "1px solid #edf0f4",
    padding: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  providerRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },
  providerTag: {
    padding: "6px 12px",
    borderRadius: 999,
    background: "#f4f6f8",
    color: "#596273",
    fontSize: 13,
    fontWeight: 600,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 14,
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    padding: "0 20px",
    borderRadius: 14,
    background: "#111827",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 700,
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    padding: "0 20px",
    borderRadius: 14,
    border: "1px solid #d8dee6",
    background: "#ffffff",
    color: "#111827",
    textDecoration: "none",
    fontWeight: 700,
  },
  emptyCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 32,
    textAlign: "center",
  },
  emptyTitle: {
    margin: 0,
    fontSize: 30,
    color: "#111827",
  },
  emptyText: {
    margin: "12px 0 0",
    color: "#667085",
    fontSize: 16,
  },
};
