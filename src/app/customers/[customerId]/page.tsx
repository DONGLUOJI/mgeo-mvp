import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

import { authOptions } from "@/lib/auth/auth-options";
import { MODEL_META } from "@/lib/detect/model-meta";
import { getCustomerDetail } from "@/lib/db/repository";

function formatDateTime(value: string | null) {
  if (!value) return "暂无";

  const date = new Date(value);
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getModeLabel(mode: string) {
  if (mode === "real") return "真实调用";
  if (mode === "hybrid") return "混合模式";
  return "Mock 模式";
}

function getTrendSummary(scores: number[]) {
  if (scores.length <= 1) {
    return {
      delta: 0,
      label: "样本不足",
      text: "当前只有 1 次检测，先继续沉淀更多样本再判断趋势。",
    };
  }

  const latest = scores[0];
  const earliest = scores[scores.length - 1];
  const delta = latest - earliest;

  if (delta > 0) {
    return {
      delta,
      label: "上升",
      text: `相比最早一次检测，当前总分提升 ${delta} 分，说明品牌在模型理解和可见性上整体向好。`,
    };
  }

  if (delta < 0) {
    return {
      delta,
      label: "回落",
      text: `相比最早一次检测，当前总分下降 ${Math.abs(delta)} 分，建议回看最近一轮内容和平台反馈。`,
    };
  }

  return {
    delta,
    label: "持平",
    text: "最近几次检测整体波动不大，可以重点提升覆盖场景和权威支撑。",
  };
}

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ customerId: string }>;
  searchParams?: Promise<{ from?: string; to?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    notFound();
  }

  const { customerId } = await params;
  const filters = searchParams ? await searchParams : {};
  const from = filters?.from?.trim() || "";
  const to = filters?.to?.trim() || "";
  const customer = await getCustomerDetail(customerId, session.user.id);

  if (!customer) {
    notFound();
  }

  const filteredReports = customer.reports.filter((item) => {
    const reportTime = new Date(item.createdAt).getTime();
    const fromTime = from ? new Date(`${from}T00:00:00`).getTime() : null;
    const toTime = to ? new Date(`${to}T23:59:59`).getTime() : null;
    const matchesFrom = fromTime === null || reportTime >= fromTime;
    const matchesTo = toTime === null || reportTime <= toTime;

    return matchesFrom && matchesTo;
  });

  const latestReport = filteredReports[0] || customer.reports[0];
  const scoreSeries = filteredReports.map((item) => item.report.score.total);
  const trendSummary = getTrendSummary(scoreSeries);

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.badge}>客户详情</div>
          <h1 style={styles.title}>{customer.brandName}</h1>
          <p style={styles.text}>{customer.businessSummary}</p>

          <div style={styles.summaryGrid}>
            <div style={styles.summaryCard}>
              <span style={styles.summaryLabel}>行业</span>
              <strong style={styles.summaryValue}>{customer.industry}</strong>
            </div>
            <div style={styles.summaryCard}>
              <span style={styles.summaryLabel}>检测次数</span>
              <strong style={styles.summaryValue}>{customer.taskCount}</strong>
            </div>
            <div style={styles.summaryCard}>
              <span style={styles.summaryLabel}>首次进入</span>
              <strong style={styles.summaryValue}>{formatDateTime(customer.createdAt)}</strong>
            </div>
            <div style={styles.summaryCard}>
              <span style={styles.summaryLabel}>最近检测</span>
              <strong style={styles.summaryValue}>{formatDateTime(customer.latestTaskAt)}</strong>
            </div>
          </div>

          <div style={styles.actions}>
            <Link href="/detect" style={styles.primaryButton}>
              新建检测
            </Link>
            <Link href="/customers" style={styles.secondaryButton}>
              返回客户列表
            </Link>
            <Link href="/tasks" style={styles.secondaryButton}>
              查看全部任务
            </Link>
          </div>
        </section>

        {latestReport ? (
          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <div style={styles.panelMeta}>最近一次检测概览</div>
                <h2 style={styles.panelTitle}>当前品牌 MGEO 检测摘要</h2>
              </div>
              <div style={styles.scoreCard}>
                <div style={styles.scoreValue}>{latestReport.report.score.total}</div>
                <div style={styles.scoreLabel}>{latestReport.report.score.level}</div>
              </div>
            </div>

            <div style={styles.metrics}>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Consistency</span>
                <strong style={styles.metricValue}>{latestReport.report.score.consistency}</strong>
              </div>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Coverage</span>
                <strong style={styles.metricValue}>{latestReport.report.score.coverage}</strong>
              </div>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Authority</span>
                <strong style={styles.metricValue}>{latestReport.report.score.authority}</strong>
              </div>
            </div>

            <p style={styles.panelText}>{latestReport.report.summary}</p>
            <Link href={`/report/${latestReport.taskId}`} style={styles.primaryButton}>
              查看最近一次报告
            </Link>
          </section>
        ) : null}

        {customer.reports.length > 0 ? (
          <section style={styles.panel}>
            <div style={styles.panelHeaderSimple}>
              <div>
                <div style={styles.panelMeta}>检测趋势</div>
                <h2 style={styles.panelTitle}>按客户维度查看分数变化</h2>
              </div>
            </div>

            <form action={`/customers/${customer.customerId}`} style={styles.filterBar}>
              <input type="date" name="from" defaultValue={from} style={styles.dateInput} />
              <input type="date" name="to" defaultValue={to} style={styles.dateInput} />
              <button type="submit" style={styles.filterButton}>
                查看区间趋势
              </button>
              {(from || to) && (
                <Link href={`/customers/${customer.customerId}`} style={styles.secondaryButton}>
                  清除筛选
                </Link>
              )}
            </form>

            {filteredReports.length === 0 ? (
              <p style={styles.panelText}>当前时间区间内没有检测记录，你可以调整开始或结束日期再看。</p>
            ) : (
              <>
                <div style={styles.trendTop}>
              <div style={styles.trendCard}>
                <span style={styles.summaryLabel}>趋势判断</span>
                <strong
                  style={{
                    ...styles.trendValue,
                    color:
                      trendSummary.label === "上升"
                        ? "#0f8b7f"
                        : trendSummary.label === "回落"
                        ? "#b42318"
                        : "#111827",
                  }}
                >
                  {trendSummary.label}
                </strong>
              </div>
              <div style={styles.trendCard}>
                <span style={styles.summaryLabel}>最新总分</span>
                <strong style={styles.trendValue}>{scoreSeries[0]}</strong>
              </div>
              <div style={styles.trendCard}>
                <span style={styles.summaryLabel}>最早总分</span>
                <strong style={styles.trendValue}>{scoreSeries[scoreSeries.length - 1]}</strong>
              </div>
              <div style={styles.trendCard}>
                <span style={styles.summaryLabel}>变化值</span>
                <strong style={styles.trendValue}>
                  {trendSummary.delta > 0 ? "+" : ""}
                  {trendSummary.delta}
                </strong>
              </div>
            </div>

            <p style={styles.panelText}>{trendSummary.text}</p>

            <div style={styles.timeline}>
              {filteredReports.map((item) => (
                <article key={item.taskId} style={styles.timelineItem}>
                  <div style={styles.timelineScore}>{item.report.score.total}</div>
                  <div style={styles.timelineBody}>
                    <div style={styles.timelineMeta}>
                      {formatDateTime(item.createdAt)} · {item.report.score.level}
                    </div>
                    <div style={styles.timelineText}>{item.report.summary}</div>
                  </div>
                  <Link href={`/report/${item.taskId}`} style={styles.secondaryButton}>
                    查看报告
                  </Link>
                </article>
              ))}
            </div>
              </>
            )}
          </section>
        ) : null}

        <section style={styles.panel}>
          <div style={styles.panelHeaderSimple}>
            <div>
              <div style={styles.panelMeta}>任务轨迹</div>
              <h2 style={styles.panelTitle}>这个客户的全部检测任务</h2>
            </div>
          </div>

          {customer.tasks.length === 0 ? (
            <p style={styles.panelText}>当前还没有关联任务，先为这个品牌创建第一次检测。</p>
          ) : (
            <div style={styles.taskList}>
              {customer.tasks.map((task) => (
                <article key={task.taskId} style={styles.taskCard}>
                  <div style={styles.taskTop}>
                    <div>
                      <div style={styles.taskMeta}>任务 #{task.taskId}</div>
                      <h3 style={styles.taskTitle}>{task.query}</h3>
                    </div>
                    <span style={styles.modeTag}>{getModeLabel(task.executionMode)}</span>
                  </div>

                  <div style={styles.providerRow}>
                    {task.selectedModels.map((model) => (
                      <span key={model} style={styles.providerTag}>
                        {MODEL_META[model as keyof typeof MODEL_META]?.label || model}
                      </span>
                    ))}
                  </div>

                  <div style={styles.taskFooter}>
                    <span style={styles.taskTime}>{formatDateTime(task.createdAt)}</span>
                    <div style={styles.actions}>
                      <Link href={`/report/${task.taskId}`} style={styles.primaryButton}>
                        查看报告
                      </Link>
                      <Link href={`/tasks?brand=${encodeURIComponent(task.brandName)}`} style={styles.secondaryButton}>
                        查看同品牌任务
                      </Link>
                      <Link
                        href={`/detect?brandName=${encodeURIComponent(task.brandName)}&industry=${encodeURIComponent(
                          task.industry
                        )}&businessSummary=${encodeURIComponent(customer.businessSummary)}&query=${encodeURIComponent(
                          task.query
                        )}&models=${encodeURIComponent(task.selectedModels.join(","))}`}
                        style={styles.secondaryButton}
                      >
                        重新检测
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
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
    display: "grid",
    gap: 20,
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
    fontSize: 46,
    lineHeight: 1.1,
    color: "#111827",
  },
  text: {
    margin: 0,
    color: "#667085",
    fontSize: 18,
    lineHeight: 1.8,
    maxWidth: 860,
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 14,
  },
  filterBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
  },
  dateInput: {
    height: 46,
    borderRadius: 14,
    border: "1px solid #d8dee6",
    padding: "0 14px",
    fontSize: 15,
    background: "#ffffff",
    color: "#111827",
  },
  filterButton: {
    height: 46,
    border: "none",
    borderRadius: 14,
    background: "#0f8b7f",
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 700,
    padding: "0 18px",
    cursor: "pointer",
  },
  summaryCard: {
    border: "1px solid #edf0f4",
    borderRadius: 18,
    padding: 18,
    display: "grid",
    gap: 8,
    background: "#fbfcfd",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#667085",
  },
  summaryValue: {
    fontSize: 18,
    color: "#111827",
    lineHeight: 1.5,
  },
  panel: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 28,
    padding: 28,
    display: "grid",
    gap: 20,
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
  },
  panelHeaderSimple: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
  },
  panelMeta: {
    color: "#0f8b7f",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 8,
  },
  panelTitle: {
    margin: 0,
    fontSize: 30,
    color: "#111827",
  },
  panelText: {
    margin: 0,
    fontSize: 16,
    color: "#667085",
    lineHeight: 1.75,
  },
  scoreCard: {
    minWidth: 120,
    borderRadius: 22,
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
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 14,
  },
  trendTop: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 14,
  },
  trendCard: {
    border: "1px solid #edf0f4",
    borderRadius: 18,
    padding: 18,
    display: "grid",
    gap: 8,
    background: "#fbfcfd",
  },
  trendValue: {
    fontSize: 28,
    color: "#111827",
    lineHeight: 1.2,
  },
  metric: {
    border: "1px solid #edf0f4",
    borderRadius: 18,
    padding: 18,
    display: "grid",
    gap: 6,
  },
  metricLabel: {
    fontSize: 14,
    color: "#667085",
  },
  metricValue: {
    fontSize: 30,
    color: "#111827",
  },
  taskList: {
    display: "grid",
    gap: 16,
  },
  timeline: {
    display: "grid",
    gap: 14,
  },
  timelineItem: {
    border: "1px solid #edf0f4",
    borderRadius: 20,
    padding: 18,
    display: "grid",
    gridTemplateColumns: "84px minmax(0, 1fr) auto",
    gap: 16,
    alignItems: "center",
    background: "#fbfcfd",
  },
  timelineScore: {
    width: 84,
    height: 84,
    borderRadius: 20,
    background: "#111827",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    fontWeight: 800,
  },
  timelineBody: {
    display: "grid",
    gap: 8,
  },
  timelineMeta: {
    fontSize: 13,
    color: "#0f8b7f",
    fontWeight: 700,
  },
  timelineText: {
    fontSize: 15,
    color: "#667085",
    lineHeight: 1.7,
  },
  taskCard: {
    border: "1px solid #edf0f4",
    borderRadius: 22,
    padding: 20,
    display: "grid",
    gap: 16,
    background: "#fbfcfd",
  },
  taskTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "flex-start",
  },
  taskMeta: {
    color: "#0f8b7f",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 8,
  },
  taskTitle: {
    margin: 0,
    fontSize: 22,
    lineHeight: 1.5,
    color: "#111827",
  },
  modeTag: {
    display: "inline-flex",
    alignItems: "center",
    height: 34,
    padding: "0 12px",
    borderRadius: 999,
    background: "#111827",
    color: "#ffffff",
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  providerRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },
  providerTag: {
    display: "inline-flex",
    alignItems: "center",
    height: 34,
    padding: "0 12px",
    borderRadius: 999,
    background: "#f2f4f7",
    color: "#344054",
    fontSize: 14,
    fontWeight: 600,
  },
  taskFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    flexWrap: "wrap",
  },
  taskTime: {
    color: "#667085",
    fontSize: 14,
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
};
