"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_MODELS, MODEL_META } from "@/lib/detect/model-meta";
import type { ModelName } from "@/lib/detect/types";

const ALL_MODELS = DEFAULT_MODELS.map((id) => ({
  id,
  label: MODEL_META[id].label,
}));

type DetectFormProps = {
  embedded?: boolean;
  title?: string;
  description?: string;
  quota?: {
    used: number;
    limit: number;
    remaining: number;
    plan: string;
    allowed: boolean;
  } | null;
};

export function DetectForm({
  embedded = false,
  title = "输入品牌信息，生成一份 MGEO 检测报告",
  description = "系统会根据您填写的品牌信息与检测问题，并发调用多个模型，快速生成一份围绕 Consistency、Coverage、Authority 的检测结果。",
  quota = null,
}: DetectFormProps) {
  const router = useRouter();

  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [businessSummary, setBusinessSummary] = useState("");
  const [query, setQuery] = useState("");
  const [selectedModels, setSelectedModels] = useState<ModelName[]>([...DEFAULT_MODELS]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function toggleModel(modelId: ModelName) {
    setSelectedModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((item) => item !== modelId)
        : [...prev, modelId]
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!brandName.trim()) return setError("请输入品牌名");
    if (!industry.trim()) return setError("请输入所属行业");
    if (!businessSummary.trim()) return setError("请输入核心业务描述");
    if (!query.trim()) return setError("请输入检测问题");
    if (!selectedModels.length) return setError("请至少选择一个模型");

    setSubmitting(true);

    try {
      const res = await fetch("/api/detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brandName,
          industry,
          businessSummary,
          query,
          selectedModels,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "检测失败，请稍后再试");
      }

      const taskId = data.data?.taskId;

      if (!taskId) {
        throw new Error("未生成检测任务，请稍后再试");
      }

      router.push(`/report/${taskId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "检测失败，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section style={embedded ? styles.embeddedCard : styles.card}>
      <div style={styles.heroBadge}>免费检测</div>
      <h1 style={embedded ? styles.embeddedTitle : styles.heroTitle}>{title}</h1>
      <p style={styles.heroText}>{description}</p>

      {quota ? (
        <div style={styles.quotaBar}>
          当前套餐：{quota.plan}，本月已用 {quota.used}/{quota.limit} 次，剩余 {quota.remaining} 次
          {!quota.allowed ? "。当前额度已用完，请先升级套餐。" : ""}
        </div>
      ) : (
        <div style={styles.quotaBarMuted}>登录后可查看剩余额度并保存你的客户、任务和历史记录。</div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.gridTwo}>
          <label style={styles.field}>
            <span style={styles.label}>品牌名</span>
            <input
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="请输入品牌名"
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>所属行业</span>
            <input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="例如：营销咨询 / 本地生活 / SaaS"
              style={styles.input}
            />
          </label>
        </div>

        <label style={styles.field}>
          <span style={styles.label}>核心业务描述</span>
          <textarea
            value={businessSummary}
            onChange={(e) => setBusinessSummary(e.target.value)}
            placeholder="一句话说明品牌主要做什么"
            rows={4}
            style={styles.textarea}
          />
        </label>

        <label style={styles.field}>
          <span style={styles.label}>检测问题</span>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例如：董逻辑MGEO是什么？是否适合做品牌在AI搜索中的增长？"
            rows={5}
            style={styles.textarea}
          />
        </label>

        <div style={styles.field}>
          <span style={styles.label}>检测模型</span>
          <div style={styles.modelWrap}>
            {ALL_MODELS.map((model) => {
              const active = selectedModels.includes(model.id);
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => toggleModel(model.id)}
                  style={{
                    ...styles.modelButton,
                    ...(active ? styles.modelButtonActive : {}),
                  }}
                >
                  {model.label}
                </button>
              );
            })}
          </div>
        </div>

        {error ? <div style={styles.error}>{error}</div> : null}

        <div style={styles.submitRow}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              ...styles.submitButton,
              ...(submitting ? styles.submitButtonDisabled : {}),
            }}
          >
            {submitting ? "检测中..." : "开始检测"}
          </button>
          <p style={styles.submitTip}>
            当前默认流程不含 OpenAI，可先优先接入 DeepSeek、Kimi、豆包、文心等模型验证链路。
          </p>
        </div>
      </form>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 28,
    padding: 32,
  },
  embeddedCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 32,
    padding: 36,
    boxShadow: "0 30px 80px rgba(15, 23, 42, 0.08)",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    height: 34,
    padding: "0 14px",
    borderRadius: 999,
    background: "#edf8f6",
    color: "#0f8b7f",
    fontSize: 14,
    fontWeight: 700,
  },
  heroTitle: {
    margin: "18px 0 0",
    fontSize: 42,
    lineHeight: 1.14,
    color: "#111827",
  },
  embeddedTitle: {
    margin: "18px 0 0",
    fontSize: 36,
    lineHeight: 1.16,
    color: "#111827",
  },
  heroText: {
    margin: "18px 0 0",
    maxWidth: 860,
    fontSize: 18,
    lineHeight: 1.8,
    color: "#606978",
  },
  form: {
    display: "grid",
    gap: 22,
    marginTop: 28,
  },
  quotaBar: {
    marginTop: 18,
    padding: "12px 16px",
    borderRadius: 14,
    background: "#edf8f6",
    color: "#0f8b7f",
    fontSize: 14,
    lineHeight: 1.7,
    fontWeight: 700,
  },
  quotaBarMuted: {
    marginTop: 18,
    padding: "12px 16px",
    borderRadius: 14,
    background: "#f8fafc",
    color: "#667085",
    fontSize: 14,
    lineHeight: 1.7,
  },
  gridTwo: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 18,
  },
  field: {
    display: "grid",
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 700,
    color: "#111827",
  },
  input: {
    height: 56,
    borderRadius: 16,
    border: "1px solid #d8dee6",
    padding: "0 16px",
    fontSize: 16,
    color: "#111827",
    outline: "none",
  },
  textarea: {
    borderRadius: 16,
    border: "1px solid #d8dee6",
    padding: "14px 16px",
    fontSize: 16,
    lineHeight: 1.7,
    color: "#111827",
    outline: "none",
    resize: "vertical",
  },
  modelWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
  },
  modelButton: {
    height: 42,
    padding: "0 16px",
    borderRadius: 999,
    border: "1px solid #d8dee6",
    background: "#ffffff",
    color: "#111827",
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
  },
  modelButtonActive: {
    background: "#0f8b7f",
    border: "1px solid #0f8b7f",
    color: "#ffffff",
  },
  error: {
    color: "#b42318",
    fontSize: 14,
  },
  submitRow: {
    display: "grid",
    gap: 12,
    marginTop: 6,
  },
  submitButton: {
    height: 56,
    border: "none",
    borderRadius: 16,
    background: "#111827",
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  },
  submitButtonDisabled: {
    background: "#98a2b3",
    cursor: "not-allowed",
  },
  submitTip: {
    margin: 0,
    fontSize: 14,
    color: "#667085",
    lineHeight: 1.7,
  },
};
