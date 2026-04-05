"use client";

import { useEffect, useMemo, useState } from "react";

type ChecklistGroup = {
  group: string;
  items: Array<{
    title: string;
    verify: string;
  }>;
};

type ChecklistManagerProps = {
  items: ChecklistGroup[];
};

const STORAGE_KEY = "mgeo-deployment-checklist";

export function ChecklistManager({ items }: ChecklistManagerProps) {
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setCheckedMap(JSON.parse(raw) as Record<string, boolean>);
      }
    } catch {
      setCheckedMap({});
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedMap));
  }, [checkedMap]);

  const total = useMemo(
    () => items.reduce((sum, group) => sum + group.items.length, 0),
    [items]
  );
  const checked = useMemo(
    () => Object.values(checkedMap).filter(Boolean).length,
    [checkedMap]
  );

  function buildKey(group: string, title: string) {
    return `${group}::${title}`;
  }

  function toggle(key: string) {
    setCheckedMap((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function resetAll() {
    setCheckedMap({});
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <>
      <section style={styles.summaryBar}>
        <div style={styles.summaryMain}>
          <div style={styles.summaryLabel}>当前联调进度</div>
          <div style={styles.summaryValue}>
            {checked}/{total}
          </div>
          <div style={styles.summaryText}>
            已勾选的内容会保存在当前浏览器中，刷新页面不会丢。
          </div>
        </div>
        <button type="button" onClick={resetAll} style={styles.resetButton}>
          清空勾选
        </button>
      </section>

      <section style={styles.groupWrap}>
        {items.map((group) => (
          <article key={group.group} style={styles.groupCard}>
            <h2 style={styles.groupTitle}>{group.group}</h2>
            <div style={styles.rows}>
              {group.items.map((item, index) => {
                const key = buildKey(group.group, item.title);
                const done = Boolean(checkedMap[key]);

                return (
                  <label key={item.title} style={styles.row}>
                    <div
                      style={{
                        ...styles.index,
                        ...(done ? styles.indexDone : {}),
                      }}
                    >
                      {done ? "✓" : index + 1}
                    </div>
                    <div style={styles.content}>
                      <div style={styles.checkboxLine}>
                        <input
                          type="checkbox"
                          checked={done}
                          onChange={() => toggle(key)}
                          style={styles.checkbox}
                        />
                        <div style={styles.itemTitle}>{item.title}</div>
                      </div>
                      <div style={styles.itemText}>验证方式：{item.verify}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  summaryBar: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
    flexWrap: "wrap",
  },
  summaryMain: {
    display: "grid",
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#667085",
    fontWeight: 700,
  },
  summaryValue: {
    fontSize: 34,
    lineHeight: 1.1,
    fontWeight: 800,
    color: "#111827",
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 1.8,
    color: "#667085",
  },
  resetButton: {
    height: 44,
    padding: "0 16px",
    borderRadius: 12,
    border: "1px solid #d0d5dd",
    background: "#fff",
    color: "#111827",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
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
    gap: 18,
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
    display: "grid",
    gridTemplateColumns: "44px minmax(0, 1fr)",
    gap: 16,
    alignItems: "start",
    cursor: "pointer",
  },
  index: {
    width: 44,
    height: 44,
    borderRadius: 999,
    background: "#111827",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 16,
  },
  indexDone: {
    background: "#0f8b7f",
  },
  content: {
    display: "grid",
    gap: 8,
    paddingTop: 4,
  },
  checkboxLine: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    accentColor: "#0f8b7f",
    cursor: "pointer",
    flex: "0 0 auto",
  },
  itemTitle: {
    fontSize: 18,
    lineHeight: 1.5,
    fontWeight: 700,
    color: "#111827",
  },
  itemText: {
    fontSize: 15,
    lineHeight: 1.85,
    color: "#667085",
  },
};
