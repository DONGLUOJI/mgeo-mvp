"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { MODEL_META } from "@/lib/detect/model-meta";
import { generateReportHtml } from "@/lib/report/export-html";
import type { DetectReport, ResultItem, Score } from "@/lib/detect/types";

const SHOW_DEBUG_PANEL = process.env.NODE_ENV !== "production";

function getScoreLabel(score: number) {
  if (score < 40) return "偏弱";
  if (score < 60) return "待优化";
  if (score < 80) return "较稳定";
  return "表现良好";
}

function getLevelText(level: Score["level"]) {
  if (level === "L1") return "基础级";
  if (level === "L2") return "优化级";
  if (level === "L3") return "稳定级";
  return "增长级";
}

function getMentionCount(results: ResultItem[]) {
  return results.filter((item) => item.mentioned).length;
}

function getRecommendationSummary(signal: ResultItem["recommendationSignal"]) {
  if (signal === "high") return "推荐信号强";
  if (signal === "medium") return "有一定推荐倾向";
  if (signal === "low") return "仅基础提及";
  return "暂无推荐信号";
}

function getModelLabel(model: string) {
  return MODEL_META[model as keyof typeof MODEL_META]?.label || model;
}

function getDebugModeLabel(mode: "real" | "mock" | "hybrid") {
  if (mode === "real") return "真实调用";
  if (mode === "hybrid") return "混合模式";
  return "Mock 模式";
}

export default function ReportDetailPage() {
  const params = useParams<{ taskId: string }>();
  const [report, setReport] = useState<DetectReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function handleExportPdf() {
    if (!report) return;

    const reportHtml = generateReportHtml(report, params.taskId);
    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1200,height=900");

    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(reportHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  function handleDownloadReport() {
    if (!report) return;

    const fileName = `${report.input.brandName || "mgeo-report"}-${params.taskId}.html`;
    const blob = new Blob([generateReportHtml(report, params.taskId)], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/report/${params.taskId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "报告加载失败");
        }

        setReport(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "报告加载失败");
      } finally {
        setLoading(false);
      }
    }

    if (params?.taskId) {
      void loadReport();
    }
  }, [params?.taskId]);

  const mentionCount = useMemo(() => {
    if (!report) return 0;
    return getMentionCount(report.results);
  }, [report]);

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div style={styles.statusCard}>检测报告加载中...</div>
        </div>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div style={styles.statusCard}>
            <h1 style={styles.statusTitle}>暂时无法读取报告</h1>
            <p style={styles.statusText}>{error || "请稍后重试。"}</p>
            <div style={styles.buttonRow}>
              <Link href="/detect" style={styles.primaryButton}>
                重新检测
              </Link>
              <Link href="/pricing" style={styles.secondaryButton}>
                查看服务方案
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div>
            <div style={styles.heroMeta}>检测任务 #{params.taskId}</div>
            <h1 style={styles.heroTitle}>
              {report.input.brandName} 的 MGEO 检测结果
            </h1>
            <p style={styles.heroText}>{report.summary}</p>
            <div style={styles.heroTags}>
              <span style={styles.tag}>行业：{report.input.industry}</span>
              <span style={styles.tag}>提及模型：{mentionCount} / {report.results.length}</span>
              <span style={styles.tag}>等级：{report.score.level} {getLevelText(report.score.level)}</span>
            </div>
            <div style={styles.exportRow} className="no-print">
              <button type="button" onClick={handleExportPdf} style={styles.primaryButton}>
                导出 PDF
              </button>
              <button
                type="button"
                onClick={handleDownloadReport}
                style={styles.secondaryActionButton}
              >
                下载 HTML 报告
              </button>
            </div>
          </div>

          <div style={styles.scoreCard}>
            <div style={styles.scoreValue}>{report.score.total}</div>
            <div style={styles.scoreLabel}>MGEO Score</div>
            <div style={styles.scoreLevel}>
              {report.score.level} · {getLevelText(report.score.level)}
            </div>
          </div>
        </section>

        <section style={styles.gridThree}>
          <article style={styles.metricCard}>
            <div style={styles.metricName}>Consistency</div>
            <div style={styles.metricValue}>{report.score.consistency}</div>
            <div style={styles.metricDesc}>{getScoreLabel(report.score.consistency)}</div>
          </article>

          <article style={styles.metricCard}>
            <div style={styles.metricName}>Coverage</div>
            <div style={styles.metricValue}>{report.score.coverage}</div>
            <div style={styles.metricDesc}>{getScoreLabel(report.score.coverage)}</div>
          </article>

          <article style={styles.metricCard}>
            <div style={styles.metricName}>Authority</div>
            <div style={styles.metricValue}>{report.score.authority}</div>
            <div style={styles.metricDesc}>{getScoreLabel(report.score.authority)}</div>
          </article>
        </section>

        <section style={styles.panel}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>检测输入</h2>
          </div>
          <div style={styles.infoList}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>品牌名</span>
              <span style={styles.infoValue}>{report.input.brandName}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>核心业务</span>
              <span style={styles.infoValue}>{report.input.businessSummary}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>检测问题</span>
              <span style={styles.infoValue}>{report.input.query}</span>
            </div>
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>模型结果明细</h2>
          </div>

          <div style={styles.resultList}>
            {report.results.map((item) => (
              <article key={item.model} style={styles.resultCard}>
                <div style={styles.resultTop}>
                  <h3 style={styles.resultModel}>{getModelLabel(item.model)}</h3>
                  <span style={item.mentioned ? styles.goodBadge : styles.weakBadge}>
                    {item.mentioned ? "已提及" : "未提及"}
                  </span>
                </div>

                <div style={styles.resultFlags}>
                  <span style={item.positioningMatch ? styles.flagGood : styles.flagNeutral}>
                    定位{item.positioningMatch ? "匹配" : "偏差"}
                  </span>
                  <span
                    style={item.descriptionConsistent ? styles.flagGood : styles.flagNeutral}
                  >
                    描述{item.descriptionConsistent ? "一致" : "不稳"}
                  </span>
                  <span style={item.authoritySignal ? styles.flagGood : styles.flagNeutral}>
                    权威性{item.authoritySignal ? "较好" : "偏弱"}
                  </span>
                  <span style={styles.flagNeutral}>
                    {getRecommendationSummary(item.recommendationSignal)}
                  </span>
                </div>

                <div style={styles.rawBox}>{item.rawText || "暂无返回内容"}</div>

                {item.notes?.length ? (
                  <div style={styles.notes}>
                    {item.notes.map((note, index) => (
                      <div key={index} style={styles.noteItem}>
                        {note}
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        {SHOW_DEBUG_PANEL && report.debug ? (
          <section style={styles.panel}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>调试面板</h2>
            </div>
            <div style={styles.debugMeta}>
              当前运行方式：{getDebugModeLabel(report.debug.mode)}
            </div>
            <div style={styles.debugList}>
              {report.debug.providers.map((item) => (
                <div key={item.model} style={styles.debugItem}>
                  <div style={styles.debugHead}>
                    <strong>{getModelLabel(item.model)}</strong>
                    <span style={item.source === "real" ? styles.flagGood : styles.flagNeutral}>
                      {item.source === "real" ? "真实 API" : "Mock 回退"}
                    </span>
                  </div>
                  <div style={styles.debugText}>{item.note}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section style={styles.ctaPanel}>
          <div>
            <h2 style={styles.sectionTitle}>下一步建议</h2>
            <p style={styles.ctaText}>
              如果您希望进一步解读这份报告，或希望我们基于结果提供服务方案，可以直接进入下一步沟通。
            </p>
          </div>

          <div style={styles.buttonRow}>
            <Link href="/pricing" style={styles.primaryButton}>
              查看服务方案
            </Link>
            <Link href="/#contact" style={styles.secondaryButton}>
              联系我们
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "#f6f8fb",
    minHeight: "100vh",
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
    gridTemplateColumns: "1.8fr 0.8fr",
    gap: 24,
    alignItems: "start",
  },
  heroMeta: {
    color: "#0f8b7f",
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 12,
  },
  heroTitle: {
    margin: 0,
    fontSize: 42,
    lineHeight: 1.12,
    color: "#111827",
  },
  heroText: {
    margin: "18px 0 0",
    fontSize: 18,
    lineHeight: 1.75,
    color: "#606978",
    maxWidth: 760,
  },
  heroTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 22,
  },
  exportRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 22,
  },
  tag: {
    padding: "8px 14px",
    borderRadius: 999,
    background: "#edf8f6",
    color: "#0f8b7f",
    fontSize: 14,
    fontWeight: 600,
  },
  scoreCard: {
    background: "#111827",
    color: "#ffffff",
    borderRadius: 24,
    padding: 28,
    minHeight: 220,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  scoreValue: {
    fontSize: 72,
    lineHeight: 1,
    fontWeight: 800,
  },
  scoreLabel: {
    marginTop: 14,
    fontSize: 18,
    opacity: 0.88,
  },
  scoreLevel: {
    marginTop: 8,
    fontSize: 15,
    opacity: 0.75,
  },
  gridThree: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 20,
  },
  metricCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 26,
  },
  metricName: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0f8b7f",
  },
  metricValue: {
    marginTop: 14,
    fontSize: 44,
    lineHeight: 1,
    fontWeight: 800,
    color: "#111827",
  },
  metricDesc: {
    marginTop: 10,
    fontSize: 16,
    color: "#6b7280",
  },
  panel: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 28,
  },
  sectionHeader: {
    marginBottom: 18,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 28,
    color: "#111827",
  },
  infoList: {
    display: "grid",
    gap: 14,
  },
  infoItem: {
    display: "grid",
    gridTemplateColumns: "140px 1fr",
    gap: 16,
    paddingBottom: 14,
    borderBottom: "1px solid #edf0f4",
  },
  infoLabel: {
    color: "#6b7280",
    fontSize: 15,
  },
  infoValue: {
    color: "#111827",
    fontSize: 16,
    lineHeight: 1.7,
  },
  resultList: {
    display: "grid",
    gap: 18,
  },
  resultCard: {
    border: "1px solid #edf0f4",
    borderRadius: 20,
    padding: 22,
  },
  resultTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  resultModel: {
    margin: 0,
    fontSize: 22,
    color: "#111827",
  },
  goodBadge: {
    borderRadius: 999,
    padding: "6px 12px",
    background: "#edf8f6",
    color: "#0f8b7f",
    fontSize: 13,
    fontWeight: 700,
  },
  weakBadge: {
    borderRadius: 999,
    padding: "6px 12px",
    background: "#f5f5f5",
    color: "#707784",
    fontSize: 13,
    fontWeight: 700,
  },
  resultFlags: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  flagGood: {
    borderRadius: 999,
    padding: "6px 12px",
    background: "#edf8f6",
    color: "#0f8b7f",
    fontSize: 13,
    fontWeight: 600,
  },
  flagNeutral: {
    borderRadius: 999,
    padding: "6px 12px",
    background: "#f4f6f8",
    color: "#596273",
    fontSize: 13,
    fontWeight: 600,
  },
  rawBox: {
    padding: 16,
    borderRadius: 16,
    background: "#f8fafc",
    color: "#2c3440",
    fontSize: 15,
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
  },
  notes: {
    display: "grid",
    gap: 8,
    marginTop: 14,
  },
  noteItem: {
    color: "#b42318",
    fontSize: 14,
  },
  debugMeta: {
    marginBottom: 16,
    color: "#596273",
    fontSize: 15,
  },
  debugList: {
    display: "grid",
    gap: 12,
  },
  debugItem: {
    border: "1px solid #edf0f4",
    borderRadius: 16,
    padding: 16,
  },
  debugHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  debugText: {
    color: "#667085",
    fontSize: 14,
    lineHeight: 1.7,
  },
  ctaPanel: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 28,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
  },
  ctaText: {
    margin: "14px 0 0",
    color: "#667085",
    fontSize: 17,
    lineHeight: 1.75,
    maxWidth: 720,
  },
  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 14,
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    padding: "0 22px",
    borderRadius: 14,
    background: "#111827",
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 700,
    textDecoration: "none",
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    padding: "0 22px",
    borderRadius: 14,
    background: "#ffffff",
    border: "1px solid #d8dee6",
    color: "#111827",
    fontSize: 15,
    fontWeight: 700,
    textDecoration: "none",
  },
  secondaryActionButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    padding: "0 22px",
    borderRadius: 14,
    background: "#ffffff",
    border: "1px solid #d8dee6",
    color: "#111827",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  statusCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 32,
    textAlign: "center",
  },
  statusTitle: {
    margin: 0,
    fontSize: 30,
    color: "#111827",
  },
  statusText: {
    margin: "12px 0 0",
    fontSize: 16,
    color: "#667085",
    lineHeight: 1.7,
  },
};
