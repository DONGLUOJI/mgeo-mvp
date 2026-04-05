import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/auth-options";
import { MODEL_META } from "@/lib/detect/model-meta";
import { listScanTasks } from "@/lib/db/repository";

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

function getModeLabel(mode: string) {
  if (mode === "real") return "真实调用";
  if (mode === "hybrid") return "混合模式";
  return "Mock 模式";
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; brand?: string; mode?: string; from?: string; to?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = searchParams ? await searchParams : {};
  const q = params?.q?.trim() || "";
  const brand = params?.brand?.trim() || "";
  const mode = params?.mode?.trim() || "";
  const from = params?.from?.trim() || "";
  const to = params?.to?.trim() || "";

  const tasks = await listScanTasks(100, session.user.id);
  const filteredTasks = tasks.filter((task) => {
    const matchesQ =
      !q ||
      normalize(task.brandName).includes(normalize(q)) ||
      normalize(task.query).includes(normalize(q)) ||
      normalize(task.customerId).includes(normalize(q));

    const matchesBrand = !brand || task.brandName === brand;
    const matchesMode = !mode || task.executionMode === mode;
    const taskTime = new Date(task.createdAt).getTime();
    const fromTime = from ? new Date(`${from}T00:00:00`).getTime() : null;
    const toTime = to ? new Date(`${to}T23:59:59`).getTime() : null;
    const matchesFrom = fromTime === null || taskTime >= fromTime;
    const matchesTo = toTime === null || taskTime <= toTime;

    return matchesQ && matchesBrand && matchesMode && matchesFrom && matchesTo;
  });

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.badge}>任务列表</div>
          <h1 style={styles.title}>查看全部检测任务与运行状态</h1>
          <p style={styles.text}>
            这里按任务视角展示每一次提交的检测。你可以快速查看品牌、问题、所选模型、执行模式，并继续进入报告或重新检测。
          </p>
          <form action="/tasks" style={styles.filterBar}>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="搜索品牌、问题或客户ID"
              style={styles.searchInput}
            />
            <input type="hidden" name="brand" value={brand} />
            <input type="date" name="from" defaultValue={from} style={styles.select} />
            <input type="date" name="to" defaultValue={to} style={styles.select} />
            <select name="mode" defaultValue={mode} style={styles.select}>
              <option value="">全部模式</option>
              <option value="real">真实调用</option>
              <option value="hybrid">混合模式</option>
              <option value="mock">Mock 模式</option>
            </select>
            <button type="submit" style={styles.filterButton}>
              筛选任务
            </button>
          </form>
          <div style={styles.actions}>
            <Link href="/detect" style={styles.primaryButton}>
              新建检测
            </Link>
            <Link href="/customers" style={styles.secondaryButton}>
              查看客户列表
            </Link>
          </div>
        </section>

        {filteredTasks.length === 0 ? (
          <section style={styles.emptyCard}>
            <h2 style={styles.emptyTitle}>还没有任务记录</h2>
            <p style={styles.emptyText}>
              {tasks.length === 0
                ? "先去提交一次检测，系统会自动建立任务记录。"
                : "当前筛选条件下没有匹配任务，你可以换个关键词、模式或时间范围再看。"}
            </p>
          </section>
        ) : (
          <section style={styles.list}>
            {filteredTasks.map((task) => (
              <article key={task.taskId} style={styles.card}>
                <div style={styles.cardTop}>
                  <div>
                    <div style={styles.cardMeta}>任务 #{task.taskId}</div>
                    <h2 style={styles.cardTitle}>{task.brandName}</h2>
                    <p style={styles.cardText}>{task.query}</p>
                  </div>
                  <div style={styles.modeCard}>
                    <div style={styles.modeValue}>{getModeLabel(task.executionMode)}</div>
                    <div style={styles.modeLabel}>运行方式</div>
                  </div>
                </div>

                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>客户ID</span>
                    <span style={styles.infoValue}>{task.customerId}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>行业</span>
                    <span style={styles.infoValue}>{task.industry}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>提交时间</span>
                    <span style={styles.infoValue}>{formatDateTime(task.createdAt)}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>模型数量</span>
                    <span style={styles.infoValue}>{task.selectedModels.length} 个</span>
                  </div>
                </div>

                <div style={styles.providerRow}>
                  {task.selectedModels.map((model) => (
                    <span key={model} style={styles.providerTag}>
                      {MODEL_META[model as keyof typeof MODEL_META]?.label || model}
                    </span>
                  ))}
                </div>

                <div style={styles.actions}>
                  <Link href={`/report/${task.taskId}`} style={styles.primaryButton}>
                    查看报告
                  </Link>
                  <Link href={`/customers/${task.customerId}`} style={styles.secondaryButton}>
                    查看客户
                  </Link>
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
    gridTemplateColumns: "minmax(0, 1.6fr) 160px 160px 180px 140px",
    gap: 12,
    alignItems: "center",
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
  card: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 18,
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "flex-start",
  },
  cardMeta: {
    color: "#0f8b7f",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 8,
  },
  cardTitle: {
    margin: 0,
    fontSize: 28,
    color: "#111827",
  },
  cardText: {
    margin: "12px 0 0",
    fontSize: 16,
    color: "#667085",
    lineHeight: 1.75,
    maxWidth: 760,
  },
  modeCard: {
    minWidth: 140,
    borderRadius: 20,
    background: "#111827",
    color: "#ffffff",
    padding: "18px 20px",
    textAlign: "center",
  },
  modeValue: {
    fontSize: 20,
    lineHeight: 1.2,
    fontWeight: 800,
  },
  modeLabel: {
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
    wordBreak: "break-word",
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
    borderRadius: 28,
    padding: 36,
    textAlign: "center",
  },
  emptyTitle: {
    margin: 0,
    fontSize: 28,
    color: "#111827",
  },
  emptyText: {
    margin: "14px 0 0",
    color: "#667085",
    fontSize: 16,
    lineHeight: 1.75,
  },
};
