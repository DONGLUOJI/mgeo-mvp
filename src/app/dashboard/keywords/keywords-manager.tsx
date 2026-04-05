"use client";

import { useState } from "react";
import { DEFAULT_MODELS, MODEL_META } from "@/lib/detect/model-meta";
import type { ModelName } from "@/lib/detect/types";

type KeywordItem = {
  id: string;
  brandName: string;
  keyword: string;
  industry: string | null;
  businessSummary: string;
  selectedModels: string[];
  isActive: boolean;
  createdAt: string;
};

export function KeywordsManager({
  items,
  canCreate,
}: {
  items: KeywordItem[];
  canCreate: boolean;
}) {
  const [brandName, setBrandName] = useState("");
  const [keyword, setKeyword] = useState("");
  const [industry, setIndustry] = useState("");
  const [businessSummary, setBusinessSummary] = useState("");
  const [selectedModels, setSelectedModels] = useState<ModelName[]>([...DEFAULT_MODELS]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleModel(model: ModelName) {
    setSelectedModels((prev) => (prev.includes(model) ? prev.filter((item) => item !== model) : [...prev, model]));
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!canCreate) return;
    setError("");
    setLoading(true);

    const res = await fetch("/api/keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandName,
        keyword,
        industry,
        businessSummary,
        selectedModels,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok || !data.success) {
      setError(data.message || "添加关键词失败");
      return;
    }
    window.location.reload();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/keywords/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.message || "删除关键词失败");
      return;
    }
    window.location.reload();
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <section style={styles.card}>
        <div style={styles.title}>添加监控关键词</div>
        {!canCreate ? (
          <p style={styles.notice}>当前套餐暂不支持关键词监控，请升级到基础版或专业版后继续添加。</p>
        ) : null}
        <form onSubmit={handleCreate} style={styles.form}>
          <input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="品牌名"
            style={styles.input}
            disabled={!canCreate}
          />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="监控关键词"
            style={styles.input}
            disabled={!canCreate}
          />
          <input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="行业（可选）"
            style={styles.input}
            disabled={!canCreate}
          />
          <textarea
            value={businessSummary}
            onChange={(e) => setBusinessSummary(e.target.value)}
            placeholder="核心业务描述（可选）"
            style={{ ...styles.input, minHeight: 96, paddingTop: 14 }}
            disabled={!canCreate}
          />

          <div style={styles.modelWrap}>
            {DEFAULT_MODELS.map((model) => {
              const active = selectedModels.includes(model);
              return (
                <button
                  key={model}
                  type="button"
                  onClick={() => toggleModel(model)}
                  style={{
                    ...styles.modelButton,
                    ...(active ? styles.modelButtonActive : {}),
                  }}
                  disabled={!canCreate}
                >
                  {MODEL_META[model].label}
                </button>
              );
            })}
          </div>

          {error ? <div style={styles.error}>{error}</div> : null}
          <button type="submit" disabled={loading || !canCreate} style={styles.submit}>
            {loading ? "添加中..." : "添加关键词"}
          </button>
        </form>
      </section>

      <section style={styles.card}>
        <div style={styles.title}>已添加关键词</div>
        {items.length === 0 ? (
          <p style={styles.notice}>当前还没有监控关键词。</p>
        ) : (
          <div style={styles.list}>
            {items.map((item) => (
              <div key={item.id} style={styles.row}>
                <div>
                  <div style={styles.keyword}>{item.keyword}</div>
                  <div style={styles.meta}>
                    {item.brandName}
                    {item.industry ? ` · ${item.industry}` : ""}
                  </div>
                </div>
                <button type="button" onClick={() => handleDelete(item.id)} style={styles.delete}>
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "#fff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    color: "#111827",
  },
  notice: {
    margin: 0,
    fontSize: 15,
    color: "#667085",
    lineHeight: 1.8,
  },
  form: {
    display: "grid",
    gap: 14,
  },
  input: {
    height: 52,
    borderRadius: 14,
    border: "1px solid #d8dee6",
    padding: "0 14px",
    fontSize: 15,
    outline: "none",
  },
  modelWrap: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  modelButton: {
    height: 40,
    padding: "0 14px",
    borderRadius: 999,
    border: "1px solid #d8dee6",
    background: "#fff",
    color: "#111827",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  modelButtonActive: {
    background: "#0f8b7f",
    borderColor: "#0f8b7f",
    color: "#fff",
  },
  error: {
    fontSize: 14,
    color: "#b42318",
  },
  submit: {
    height: 48,
    borderRadius: 14,
    border: "none",
    background: "#111827",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  list: {
    display: "grid",
    gap: 12,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    border: "1px solid #eef2f7",
    borderRadius: 16,
    padding: "14px 16px",
  },
  keyword: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
  },
  meta: {
    marginTop: 6,
    fontSize: 14,
    color: "#667085",
  },
  delete: {
    height: 40,
    padding: "0 14px",
    borderRadius: 12,
    border: "1px solid #e4e7ec",
    background: "#fff",
    color: "#111827",
    cursor: "pointer",
    fontWeight: 700,
  },
};

