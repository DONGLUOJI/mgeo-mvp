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
  initialBrandName?: string;
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
  initialBrandName = "",
  quota = null,
}: DetectFormProps) {
  const router = useRouter();

  const [brandName, setBrandName] = useState(initialBrandName);
  const [industry, setIndustry] = useState("");
  const [businessSummary, setBusinessSummary] = useState("");
  const [query, setQuery] = useState("");
  const [selectedModels, setSelectedModels] = useState<ModelName[]>([...DEFAULT_MODELS]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const INDUSTRY_OPTIONS = [
    "生活服务",
    "企业服务",
    "营销咨询",
    "本地生活",
    "SaaS",
    "教育培训",
    "医疗健康",
    "消费品牌",
    "其他",
  ];

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
    const finalBusinessSummary =
      businessSummary.trim() || `${brandName.trim() || "该品牌"}在 ${industry.trim() || "所属行业"} 中提供相关服务。`;

    if (!brandName.trim()) return setError("请输入品牌名");
    if (!industry.trim()) return setError("请输入所属行业");
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
          businessSummary: finalBusinessSummary,
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
      {embedded ? (
        <form onSubmit={handleSubmit} style={styles.embeddedForm}>
          <div style={styles.stepBlock}>
            <div style={styles.stepHead}>
              <span style={styles.stepNumber}>1</span>
              <span style={styles.stepTitle}>输入需要检测的搜索问题</span>
            </div>
            <label style={styles.field}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="例如：性价比最高的GEO优化工具推荐"
                style={styles.compactInput}
                maxLength={30}
              />
            </label>
          </div>

          <div style={styles.stepBlock}>
            <div style={styles.stepHeadRow}>
              <div style={styles.stepHead}>
                <span style={styles.stepNumber}>2</span>
                <span style={styles.stepTitle}>输入目标品牌或公司名称</span>
              </div>
              <a href="/pricing" style={styles.helperLink}>
                查看服务方案
              </a>
            </div>
            <label style={styles.field}>
              <input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="例如：董逻辑MGEO"
                style={styles.compactInput}
              />
            </label>
          </div>

          <div style={styles.stepBlock}>
            <div style={styles.stepHead}>
              <span style={styles.stepNumber}>3</span>
              <span style={styles.stepTitle}>选择所属行业</span>
            </div>
            <label style={styles.field}>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                style={styles.select}
              >
                <option value="">请选择行业</option>
                {INDUSTRY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div style={styles.stepBlock}>
            <div style={styles.stepHead}>
              <span style={styles.stepNumber}>4</span>
              <span style={styles.stepTitle}>选择检测平台（可多选）</span>
            </div>
            <div style={styles.compactModelWrap}>
              {ALL_MODELS.map((model) => {
                const active = selectedModels.includes(model.id);
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => toggleModel(model.id)}
                    style={{
                      ...styles.compactModelButton,
                      ...(active ? styles.compactModelButtonActive : {}),
                    }}
                  >
                    {model.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error ? <div style={styles.error}>{error}</div> : null}

          <button
            type="submit"
            disabled={submitting}
            style={{
              ...styles.compactSubmitButton,
              ...(submitting ? styles.submitButtonDisabled : {}),
            }}
          >
            {submitting ? "检测中..." : "开始免费检测"}
          </button>
        </form>
      ) : (
        <>
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
        </>
      )}
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
    borderRadius: 30,
    padding: "30px 36px 38px",
    boxShadow: "0 36px 72px rgba(15, 23, 42, 0.14)",
  },
  embeddedForm: {
    display: "grid",
    gap: 26,
  },
  stepBlock: {
    display: "grid",
    gap: 16,
  },
  stepHead: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  stepHeadRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  stepNumber: {
    width: 38,
    height: 38,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#202226",
    color: "#ffffff",
    fontSize: 21,
    fontWeight: 700,
    flexShrink: 0,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#1d1f24",
  },
  helperLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 38,
    padding: "0 16px",
    borderRadius: 999,
    background: "#f3f4f7",
    color: "#636977",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  compactInput: {
    height: 58,
    borderRadius: 18,
    border: "1px solid #d9dde5",
    padding: "0 18px",
    fontSize: 16,
    color: "#111827",
    outline: "none",
    width: "100%",
  },
  select: {
    height: 54,
    borderRadius: 18,
    border: "1px solid #d9dde5",
    padding: "0 18px",
    fontSize: 16,
    color: "#111827",
    outline: "none",
    width: "100%",
    background: "#ffffff",
  },
  compactModelWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 14,
  },
  compactModelButton: {
    height: 56,
    minWidth: 122,
    padding: "0 20px",
    borderRadius: 999,
    border: "1px solid #d9dde5",
    background: "#ffffff",
    color: "#202226",
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 500,
  },
  compactModelButtonActive: {
    background: "#202022",
    border: "1px solid #202022",
    color: "#ffffff",
  },
  compactSubmitButton: {
    height: 66,
    border: "none",
    borderRadius: 18,
    background: "#202022",
    color: "#ffffff",
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 6,
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
