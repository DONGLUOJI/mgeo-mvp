"use client";

import { useEffect, useRef, useState } from "react";
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

type DetectOutcome = "mentioned_high" | "mentioned_low" | "mentioned_biased" | "not_mentioned";
type ProgressStatus = "waiting" | "detecting" | "done";
type DetectPanelPhase = "detecting" | "generating";

type PlatformProgressItem = {
  id: ModelName;
  label: string;
  status: ProgressStatus;
  phaseText: string;
  message: string;
  outcome?: DetectOutcome;
  position?: number;
};

const DETECT_PHASES = [
  { getText: (platform: string) => `正在向 ${platform} 发送检测请求...`, duration: 700 },
  { getText: (platform: string) => `正在等待 ${platform} 返回结果...`, duration: 1100 },
  { getText: (platform: string) => `正在分析 ${platform} 的回答内容...`, duration: 900 },
] as const;

const RESULT_MESSAGES: Record<DetectOutcome, string[]> = {
  mentioned_high: [
    "检测到品牌提及，推荐位第 {position} 位",
    "品牌被优先推荐，位于回答前段",
    "检测到正面品牌提及",
  ],
  mentioned_low: [
    "检测到品牌提及，但位置靠后（第 {position} 位）",
    "品牌被提及，但未进入推荐前列",
  ],
  mentioned_biased: [
    "检测到品牌提及，但描述存在偏差",
    "品牌被提及，但定位描述不够准确",
    "有提及但品牌信息不完整",
  ],
  not_mentioned: [
    "未检测到品牌提及",
    "当前平台回答中未出现品牌信息",
    "品牌尚未进入该平台的推荐范围",
  ],
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSeedValue(...parts: string[]) {
  return parts.join("|").split("").reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
}

function getJitter(base: number, seed: number) {
  return base + (seed % 501) - 250;
}

function resolveProgressPreview(modelId: ModelName, brandName: string, query: string, index: number) {
  const seed = getSeedValue(modelId, brandName, query, String(index));
  const outcomePool: DetectOutcome[] = ["mentioned_high", "mentioned_low", "mentioned_biased", "not_mentioned"];
  const outcome = outcomePool[seed % outcomePool.length];
  const position = (seed % 5) + 1;
  const templates = RESULT_MESSAGES[outcome];
  const template = templates[seed % templates.length];

  return {
    outcome,
    position,
    message: template.replace("{position}", String(position)),
  };
}

export function DetectForm({
  embedded = false,
  title = "输入品牌信息，生成一份 MGEO 检测报告",
  description = "系统会根据您填写的品牌信息与检测问题，并发调用多个模型，快速生成一份围绕 Consistency、Coverage、Authority 的检测结果。",
  initialBrandName = "",
  quota = null,
}: DetectFormProps) {
  const router = useRouter();
  const activeRunId = useRef(0);
  const isMountedRef = useRef(true);

  const [brandName, setBrandName] = useState(initialBrandName);
  const [industry, setIndustry] = useState("");
  const [businessSummary, setBusinessSummary] = useState("");
  const [query, setQuery] = useState("");
  const [selectedModels, setSelectedModels] = useState<ModelName[]>([...DEFAULT_MODELS]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [progressItems, setProgressItems] = useState<PlatformProgressItem[]>([]);
  const [panelPhase, setPanelPhase] = useState<DetectPanelPhase>("detecting");
  const [typedStatusText, setTypedStatusText] = useState("");
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

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      activeRunId.current += 1;
    };
  }, []);

  const activeDetectingItem = progressItems.find((item) => item.status === "detecting");

  useEffect(() => {
    if (!activeDetectingItem?.phaseText) {
      setTypedStatusText("");
      return;
    }

    let index = 0;
    setTypedStatusText("");

    const timer = window.setInterval(() => {
      index += 1;
      setTypedStatusText(activeDetectingItem.phaseText.slice(0, index));
      if (index >= activeDetectingItem.phaseText.length) {
        window.clearInterval(timer);
      }
    }, 26);

    return () => window.clearInterval(timer);
  }, [activeDetectingItem?.id, activeDetectingItem?.phaseText]);

  function toggleModel(modelId: ModelName) {
    setSelectedModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((item) => item !== modelId)
        : [...prev, modelId]
    );
  }

  async function runProgressAnimation(runId: number, models: ModelName[], targetBrandName: string, targetQuery: string) {
    const initialItems = models.map((model) => ({
      id: model,
      label: MODEL_META[model].label,
      status: "waiting" as const,
      phaseText: "",
      message: "等待中",
    }));

    setPanelPhase("detecting");
    setProgressItems(initialItems);

    for (let modelIndex = 0; modelIndex < models.length; modelIndex += 1) {
      const model = models[modelIndex];
      const label = MODEL_META[model].label;

      for (let phaseIndex = 0; phaseIndex < DETECT_PHASES.length; phaseIndex += 1) {
        if (!isMountedRef.current || activeRunId.current !== runId) {
          return false;
        }

        const phase = DETECT_PHASES[phaseIndex];
        const phaseText = phase.getText(label);
        setProgressItems((prev) =>
          prev.map((item) =>
            item.id === model
              ? {
                  ...item,
                  status: "detecting",
                  phaseText,
                  message: phaseText,
                }
              : item
          )
        );

        await sleep(getJitter(phase.duration, getSeedValue(model, targetBrandName, targetQuery, String(phaseIndex))));
      }

      if (!isMountedRef.current || activeRunId.current !== runId) {
        return false;
      }

      const preview = resolveProgressPreview(model, targetBrandName, targetQuery, modelIndex);
      setProgressItems((prev) =>
        prev.map((item) =>
          item.id === model
            ? {
                ...item,
                status: "done",
                phaseText: "",
                message: preview.message,
                outcome: preview.outcome,
                position: preview.position,
              }
            : item
        )
      );
    }

    if (!isMountedRef.current || activeRunId.current !== runId) {
      return false;
    }

    setPanelPhase("generating");
    await sleep(1400);
    return true;
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

    const currentRunId = activeRunId.current + 1;
    activeRunId.current = currentRunId;
    setSubmitting(true);
    setPanelPhase("detecting");

    try {
      const resultPromise = fetch("/api/detect", {
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
      }).then(async (res) => {
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "检测失败，请稍后再试");
        }

        return data;
      });

      const animationFinished = runProgressAnimation(currentRunId, selectedModels, brandName.trim(), query.trim());
      const [data, animationReady] = await Promise.all([resultPromise, animationFinished]);

      if (!animationReady) {
        return;
      }

      const taskId = data.data?.taskId;

      if (!taskId) {
        throw new Error("未生成检测任务，请稍后再试");
      }

      if (!isMountedRef.current || activeRunId.current !== currentRunId) {
        return;
      }

      router.push(`/report/${taskId}`);
    } catch (err) {
      activeRunId.current += 1;
      setError(err instanceof Error ? err.message : "检测失败，请稍后再试");
      setProgressItems([]);
    } finally {
      setSubmitting(false);
    }
  }

  const totalPlatforms = progressItems.length;
  const completedPlatforms = progressItems.filter((item) => item.status === "done").length;
  const progressPercent = totalPlatforms ? Math.round((completedPlatforms / totalPlatforms) * 100) : 0;
  const panelTitle = brandName.trim() || initialBrandName || "当前品牌";

  function renderStatusIcon(item: PlatformProgressItem) {
    if (item.status === "detecting") {
      return <span style={styles.detectingSpinner} />;
    }

    if (item.status === "waiting") {
      return <span style={styles.waitingDot} />;
    }

    if (item.outcome === "mentioned_high" || item.outcome === "mentioned_low") {
      return <span style={styles.successIcon}>✓</span>;
    }

    if (item.outcome === "mentioned_biased") {
      return <span style={styles.warningIcon}>!</span>;
    }

    return <span style={styles.failIcon}>×</span>;
  }

  function renderStatusText(item: PlatformProgressItem) {
    if (item.status === "detecting") {
      return typedStatusText || item.phaseText;
    }

    return item.message;
  }

  function renderProgressPanel() {
    return (
      <div style={embedded ? styles.progressShellEmbedded : styles.progressShellStandalone}>
        <style>{`
          @keyframes detectSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes detectPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(15, 188, 140, 0.14); }
            50% { box-shadow: 0 0 0 10px rgba(15, 188, 140, 0.04); }
          }
          @keyframes detectBounce {
            0% { transform: scale(0.94); }
            55% { transform: scale(1.06); }
            100% { transform: scale(1); }
          }
        `}</style>

        <div style={styles.progressHeadingRow}>
          <div>
            <div style={styles.progressEyebrow}>检测进度</div>
            <h2 style={styles.progressTitle}>正在检测「{panelTitle}」在 AI 平台的可见性...</h2>
          </div>
          <div style={styles.progressCount}>{completedPlatforms}/{totalPlatforms || selectedModels.length} 平台</div>
        </div>

        <div style={styles.progressQuestion}>检测问题：“{query.trim()}”</div>

        <div style={styles.progressList}>
          {progressItems.map((item) => {
            const isDetecting = item.status === "detecting";
            const isWaiting = item.status === "waiting";
            const isSuccess = item.outcome === "mentioned_high" || item.outcome === "mentioned_low";
            const isWarning = item.outcome === "mentioned_biased";

            return (
              <div
                key={item.id}
                style={{
                  ...styles.progressRow,
                  ...(isWaiting ? styles.progressRowWaiting : {}),
                  ...(isDetecting ? styles.progressRowDetecting : {}),
                  ...(item.status === "done" ? styles.progressRowDone : {}),
                }}
              >
                <div style={styles.progressPlatform}>
                  <span
                    style={{
                      ...styles.progressIconWrap,
                      ...(isDetecting ? styles.progressIconWrapActive : {}),
                      ...(item.status === "done" ? styles.progressIconWrapDone : {}),
                    }}
                  >
                    {renderStatusIcon(item)}
                  </span>
                  <span style={styles.progressPlatformName}>{item.label}</span>
                </div>
                <div
                  style={{
                    ...styles.progressMessage,
                    ...(isSuccess ? styles.progressMessageSuccess : {}),
                    ...(isWarning ? styles.progressMessageWarning : {}),
                    ...(item.outcome === "not_mentioned" ? styles.progressMessageMuted : {}),
                  }}
                >
                  {renderStatusText(item)}
                </div>
              </div>
            );
          })}
        </div>

        <div style={styles.progressBarBlock}>
          <div style={styles.progressBarTrack}>
            <div style={{ ...styles.progressBarFill, width: `${progressPercent}%` }} />
          </div>
          <div style={styles.progressBarText}>{completedPlatforms}/{totalPlatforms || selectedModels.length} 平台已完成</div>
        </div>

        <div style={styles.progressHint}>
          <span style={styles.progressHintEmoji}>💡</span>
          <span>
            {panelPhase === "generating"
              ? "平台检测已完成，正在生成 TCA 报告并整理品牌一致性、覆盖度与权威性结果。"
              : "检测过程中，AI 正在向各平台发送您的搜索问题，并分析回答内容中是否提及您的品牌。"}
          </span>
        </div>

        {panelPhase === "generating" ? <div style={styles.generatingText}>正在生成 TCA 报告...</div> : null}
      </div>
    );
  }

  return (
    <section style={embedded ? styles.embeddedCard : styles.card}>
      {embedded ? (
        submitting ? (
          renderProgressPanel()
        ) : (
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
          <div style={styles.compactTip}>约 30 秒出结果 · 无需注册 · 获取 TCA 评分与平台覆盖报告</div>
        </form>
        )
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

          {submitting ? renderProgressPanel() : (
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
                约 30 秒出结果 · 注册后可保存历史记录与后续监测数据
              </p>
            </div>
          </form>
          )}
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
  progressShellEmbedded: {
    display: "grid",
    gap: 22,
  },
  progressShellStandalone: {
    display: "grid",
    gap: 22,
    marginTop: 28,
  },
  progressHeadingRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 18,
    flexWrap: "wrap",
  },
  progressEyebrow: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0f8b7f",
  },
  progressTitle: {
    margin: "10px 0 0",
    fontSize: 30,
    lineHeight: 1.2,
    color: "#111827",
    letterSpacing: "-0.03em",
  },
  progressCount: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 38,
    padding: "0 16px",
    borderRadius: 999,
    background: "#edf8f6",
    color: "#0f8b7f",
    fontSize: 13,
    fontWeight: 700,
  },
  progressQuestion: {
    padding: "14px 18px",
    borderRadius: 16,
    background: "#f8fafc",
    border: "1px solid #e4e9f0",
    color: "#4b5563",
    fontSize: 15,
    lineHeight: 1.7,
  },
  progressList: {
    display: "grid",
    gap: 12,
    paddingTop: 6,
  },
  progressRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 230px) minmax(0, 1fr)",
    gap: 16,
    alignItems: "center",
    borderRadius: 18,
    padding: "14px 16px",
    background: "#ffffff",
    border: "1px solid #e9edf3",
    transition: "all 0.25s ease",
  },
  progressRowWaiting: {
    opacity: 0.52,
    background: "#fbfcfd",
  },
  progressRowDetecting: {
    border: "1px solid rgba(15, 188, 140, 0.3)",
    background: "#f7fffc",
    animation: "detectPulse 1.8s ease-in-out infinite",
  },
  progressRowDone: {
    animation: "detectBounce 0.3s ease-out",
  },
  progressPlatform: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  progressIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    flexShrink: 0,
  },
  progressIconWrapActive: {
    border: "1px solid rgba(15, 188, 140, 0.22)",
    background: "#ecfdf6",
  },
  progressIconWrapDone: {
    border: "1px solid transparent",
  },
  waitingDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "#c9d0d8",
  },
  detectingSpinner: {
    width: 12,
    height: 12,
    borderRadius: 999,
    border: "2px solid rgba(15, 188, 140, 0.22)",
    borderTopColor: "#0fbc8c",
    animation: "detectSpin 0.8s linear infinite",
  },
  successIcon: {
    color: "#0fbc8c",
    fontSize: 14,
    fontWeight: 800,
  },
  warningIcon: {
    color: "#EF9F27",
    fontSize: 14,
    fontWeight: 800,
  },
  failIcon: {
    color: "#EF9F27",
    fontSize: 14,
    fontWeight: 800,
  },
  progressPlatformName: {
    color: "#111827",
    fontSize: 16,
    fontWeight: 700,
  },
  progressMessage: {
    color: "#667085",
    fontSize: 15,
    lineHeight: 1.7,
  },
  progressMessageSuccess: {
    color: "#0f8b7f",
    fontWeight: 600,
  },
  progressMessageWarning: {
    color: "#EF9F27",
    fontWeight: 600,
  },
  progressMessageMuted: {
    color: "#c17c15",
    fontWeight: 600,
  },
  progressBarBlock: {
    display: "grid",
    gap: 10,
  },
  progressBarTrack: {
    width: "100%",
    height: 6,
    borderRadius: 999,
    background: "#eef1f4",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 999,
    background: "#0fbc8c",
    transition: "width 0.5s ease",
  },
  progressBarText: {
    color: "#98a2b3",
    fontSize: 13,
    textAlign: "right",
  },
  progressHint: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    padding: "16px 18px",
    borderRadius: 16,
    background: "#f8fafc",
    color: "#667085",
    fontSize: 14,
    lineHeight: 1.75,
    border: "1px solid #e7ebf0",
  },
  progressHintEmoji: {
    flexShrink: 0,
  },
  generatingText: {
    color: "#0f8b7f",
    fontSize: 16,
    fontWeight: 700,
    textAlign: "center",
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
  compactTip: {
    marginTop: -8,
    fontSize: 12,
    color: "#999999",
    textAlign: "center",
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
