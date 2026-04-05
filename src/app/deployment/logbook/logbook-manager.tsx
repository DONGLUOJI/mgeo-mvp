"use client";

import { useMemo, useState } from "react";

type EntryStatus = "草稿" | "已发布" | "需回退";

type Entry = {
  id: string;
  createdAt: string;
  version: string;
  status: EntryStatus;
  summary: string;
  changeScope: string;
  rollbackPlan: string;
  operator: string;
};

const STORAGE_KEY = "mgeo-deployment-logbook";

const STATUS_OPTIONS: EntryStatus[] = ["草稿", "已发布", "需回退"];

function readEntries(): Entry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Entry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeEntries(entries: Entry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function makeId() {
  return `release_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function LogbookManager({
  defaultSummary,
  defaultOperator,
}: {
  defaultSummary: string;
  defaultOperator: string;
}) {
  const [entries, setEntries] = useState<Entry[]>(() => readEntries());
  const [version, setVersion] = useState("");
  const [status, setStatus] = useState<EntryStatus>("草稿");
  const [summary, setSummary] = useState(defaultSummary);
  const [changeScope, setChangeScope] = useState("");
  const [rollbackPlan, setRollbackPlan] = useState("若上线后 10 分钟内出现核心链路异常，先停止支付引导，再回退到上一个稳定版本。");
  const [operator, setOperator] = useState(defaultOperator);

  const stats = useMemo(() => {
    const published = entries.filter((item) => item.status === "已发布").length;
    const rollback = entries.filter((item) => item.status === "需回退").length;
    return {
      total: entries.length,
      published,
      rollback,
    };
  }, [entries]);

  function handleSave() {
    if (!version.trim()) return;

    const entry: Entry = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      version: version.trim(),
      status,
      summary: summary.trim(),
      changeScope: changeScope.trim(),
      rollbackPlan: rollbackPlan.trim(),
      operator: operator.trim(),
    };

    const next = [entry, ...entries];
    setEntries(next);
    writeEntries(next);

    setVersion("");
    setStatus("草稿");
    setChangeScope("");
  }

  function handleDelete(id: string) {
    const next = entries.filter((item) => item.id !== id);
    setEntries(next);
    writeEntries(next);
  }

  function handleClear() {
    setEntries([]);
    writeEntries([]);
  }

  return (
    <div style={styles.wrap}>
      <section style={styles.summaryGrid}>
        <article style={styles.summaryCard}>
          <div style={styles.summaryLabel}>记录总数</div>
          <div style={styles.summaryValue}>{stats.total}</div>
        </article>
        <article style={styles.summaryCard}>
          <div style={styles.summaryLabel}>已发布</div>
          <div style={styles.summaryValue}>{stats.published}</div>
        </article>
        <article style={styles.summaryCard}>
          <div style={styles.summaryLabel}>需回退</div>
          <div style={styles.summaryValue}>{stats.rollback}</div>
        </article>
      </section>

      <section style={styles.formCard}>
        <div style={styles.cardTitle}>新增发布记录</div>
        <div style={styles.formGrid}>
          <label style={styles.field}>
            <span style={styles.label}>版本号 / 标记</span>
            <input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="例如：2026-04-05-beta.1"
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>发布状态</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as EntryStatus)} style={styles.input}>
              {STATUS_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label style={{ ...styles.field, gridColumn: "1 / -1" }}>
            <span style={styles.label}>发布结论</span>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} style={styles.textarea} />
          </label>

          <label style={{ ...styles.field, gridColumn: "1 / -1" }}>
            <span style={styles.label}>本次变更范围</span>
            <textarea
              value={changeScope}
              onChange={(e) => setChangeScope(e.target.value)}
              placeholder="例如：支付回跳、健康检查、Dashboard 概览、运维入口"
              style={styles.textarea}
            />
          </label>

          <label style={{ ...styles.field, gridColumn: "1 / -1" }}>
            <span style={styles.label}>回退预案</span>
            <textarea value={rollbackPlan} onChange={(e) => setRollbackPlan(e.target.value)} style={styles.textarea} />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>操作人</span>
            <input value={operator} onChange={(e) => setOperator(e.target.value)} style={styles.input} />
          </label>
        </div>

        <div style={styles.actions}>
          <button type="button" onClick={handleSave} style={styles.primaryButton}>
            保存发布记录
          </button>
          <button type="button" onClick={handleClear} style={styles.secondaryButton}>
            清空本地记录
          </button>
        </div>
      </section>

      <section style={styles.listCard}>
        <div style={styles.cardTitle}>历史发布记录</div>
        {entries.length === 0 ? (
          <div style={styles.empty}>当前还没有发布记录。建议每次试运营或正式发布后都在这里留一条结论。</div>
        ) : (
          <div style={styles.entryList}>
            {entries.map((item) => (
              <article key={item.id} style={styles.entryCard}>
                <div style={styles.entryHeader}>
                  <div>
                    <div style={styles.entryVersion}>{item.version}</div>
                    <div style={styles.entryMeta}>
                      {formatDateTime(item.createdAt)} · {item.operator || "未填写操作人"}
                    </div>
                  </div>
                  <div style={styles.entryActions}>
                    <span style={statusStyles[item.status]}>{item.status}</span>
                    <button type="button" onClick={() => handleDelete(item.id)} style={styles.deleteButton}>
                      删除
                    </button>
                  </div>
                </div>
                <div style={styles.entryBlock}>
                  <div style={styles.entryLabel}>发布结论</div>
                  <div style={styles.entryText}>{item.summary}</div>
                </div>
                {item.changeScope ? (
                  <div style={styles.entryBlock}>
                    <div style={styles.entryLabel}>变更范围</div>
                    <div style={styles.entryText}>{item.changeScope}</div>
                  </div>
                ) : null}
                {item.rollbackPlan ? (
                  <div style={styles.entryBlock}>
                    <div style={styles.entryLabel}>回退预案</div>
                    <div style={styles.entryText}>{item.rollbackPlan}</div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    display: "grid",
    gap: 20,
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 16,
  },
  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 20,
    padding: 20,
    display: "grid",
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#667085",
    fontWeight: 700,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 800,
    color: "#111827",
  },
  formCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 18,
  },
  listCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 18,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#111827",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },
  field: {
    display: "grid",
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: "#344054",
    fontWeight: 700,
  },
  input: {
    height: 48,
    borderRadius: 14,
    border: "1px solid #d8dee6",
    padding: "0 14px",
    fontSize: 15,
    color: "#111827",
    background: "#fff",
  },
  textarea: {
    minHeight: 110,
    borderRadius: 16,
    border: "1px solid #d8dee6",
    padding: 14,
    fontSize: 15,
    lineHeight: 1.7,
    color: "#111827",
    background: "#fff",
    resize: "vertical",
  },
  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  primaryButton: {
    height: 46,
    borderRadius: 14,
    border: "none",
    padding: "0 16px",
    background: "#111827",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryButton: {
    height: 46,
    borderRadius: 14,
    border: "1px solid #d8dee6",
    padding: "0 16px",
    background: "#fff",
    color: "#111827",
    fontWeight: 700,
    cursor: "pointer",
  },
  empty: {
    fontSize: 15,
    lineHeight: 1.8,
    color: "#667085",
  },
  entryList: {
    display: "grid",
    gap: 16,
  },
  entryCard: {
    border: "1px solid #e7ebf0",
    borderRadius: 20,
    padding: 18,
    display: "grid",
    gap: 14,
    background: "#fafbfc",
  },
  entryHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
  },
  entryVersion: {
    fontSize: 18,
    fontWeight: 800,
    color: "#111827",
  },
  entryMeta: {
    marginTop: 4,
    fontSize: 13,
    color: "#667085",
  },
  entryActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  deleteButton: {
    border: "none",
    background: "transparent",
    color: "#b42318",
    fontWeight: 700,
    cursor: "pointer",
  },
  entryBlock: {
    display: "grid",
    gap: 6,
  },
  entryLabel: {
    fontSize: 13,
    color: "#667085",
    fontWeight: 700,
  },
  entryText: {
    fontSize: 15,
    lineHeight: 1.8,
    color: "#344054",
    whiteSpace: "pre-wrap",
  },
};

const statusStyles: Record<EntryStatus, React.CSSProperties> = {
  草稿: {
    display: "inline-flex",
    alignItems: "center",
    height: 30,
    padding: "0 10px",
    borderRadius: 999,
    background: "#f2f4f7",
    color: "#667085",
    fontSize: 13,
    fontWeight: 700,
  },
  已发布: {
    display: "inline-flex",
    alignItems: "center",
    height: 30,
    padding: "0 10px",
    borderRadius: 999,
    background: "#edf8f6",
    color: "#0f8b7f",
    fontSize: 13,
    fontWeight: 700,
  },
  需回退: {
    display: "inline-flex",
    alignItems: "center",
    height: 30,
    padding: "0 10px",
    borderRadius: 999,
    background: "#fef3f2",
    color: "#b42318",
    fontSize: 13,
    fontWeight: 700,
  },
};
