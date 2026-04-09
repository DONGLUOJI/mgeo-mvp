"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { generateReportHtml } from "@/lib/report/export-html";
import { getScoreStyle } from "@/lib/report/score-colors";
import type { DetectReport, ResultItem, Score } from "@/lib/detect/types";

function getLevelText(level: Score["level"]) {
  if (level === "L1") return "基础级";
  if (level === "L2") return "优化级";
  if (level === "L3") return "稳定级";
  return "增长级";
}

function getMentionCount(results: ResultItem[]) {
  return results.filter((item) => item.mentioned).length;
}

function getConfidenceLabel(level?: DetectReport["confidence"]["level"]) {
  if (level === "high") return "高";
  if (level === "medium") return "中";
  return "低";
}

function formatReportTime(value?: string | null) {
  const parsed = value ? new Date(value) : new Date();
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function formatEvidenceDate(value?: string) {
  if (!value) return "未提取到";
  return formatReportTime(value).slice(0, 10);
}

const INDUSTRY_AVERAGES: Record<string, number> = {
  新茶饮: 68,
  餐饮连锁: 72,
  教培: 60,
  家政服务: 48,
  美妆护肤: 65,
  企业服务: 63,
};

export default function ReportDetailPage() {
  const params = useParams<{ taskId: string }>();
  const [report, setReport] = useState<DetectReport | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
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

    const fileName = `${report.input.brandName || "fakecheck-report"}-${params.taskId}.html`;
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

        setReport(data.data.report);
        setCreatedAt(data.data.meta?.createdAt || null);
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
  const effectiveScores = report ? report.scores || report.score : null;
  const effectiveLevel = report ? report.score.level : null;
  const effectiveSummary = report ? report.structuredSummary?.headline || report.summary : "";
  const effectiveNextAction = report?.structuredSummary?.nextAction || "";
  const effectiveExecutedAt = report?.meta?.executedAt || createdAt;
  const industryAverage = report ? INDUSTRY_AVERAGES[report.input.industry] ?? 64 : 64;
  const averageDiff = report && effectiveScores ? effectiveScores.total - industryAverage : 0;
  const scoreCards = report
    ? [
        { key: "Consistency", label: "资料一致性", value: effectiveScores?.consistency || 0, desc: "昵称、定位、资料叙事是否前后一致" },
        { key: "Coverage", label: "图源复用度", value: effectiveScores?.coverage || 0, desc: "相似图、撞图和搬运线索覆盖度" },
        { key: "Authority", label: "证据强度", value: effectiveScores?.authority || 0, desc: "命中来源是否可复核、可追溯" },
      ]
    : [];

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div style={styles.statusCard}>核验报告加载中...</div>
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
                重新核验
              </Link>
              <Link href="/" style={styles.secondaryButton}>
                返回首页
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
            <div style={styles.heroMeta}>检测时间：{formatReportTime(effectiveExecutedAt)}</div>
            <h1 style={styles.heroTitle}>
              {report.input.brandName} 的交友资料核验报告
            </h1>
            <p style={styles.heroText}>{effectiveSummary}</p>
            <div style={styles.heroTags}>
              <span style={styles.tag}>场景：{report.input.industry}</span>
              <span style={styles.tag}>命中引擎：{mentionCount} / {report.results.length}</span>
              <span style={styles.tag}>等级：{effectiveLevel || report.score.level} {getLevelText(effectiveLevel || report.score.level)}</span>
              <span style={styles.tag}>置信度：{getConfidenceLabel(report.confidence?.level)}</span>
              {report.meta?.provider ? <span style={styles.tag}>Provider：{report.meta.provider}</span> : null}
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
            <div style={styles.scoreValue}>{effectiveScores?.total || report.score.total}</div>
            <div style={styles.scoreLabel}>资料可信度评分</div>
            <div style={styles.scoreLevel}>
              {(effectiveLevel || report.score.level)} · {getLevelText(effectiveLevel || report.score.level)}
            </div>
            <div style={styles.scoreBenchmark}>
              <div style={styles.scoreBenchmarkLine}>场景均分：{industryAverage}</div>
              <div
                style={{
                  ...styles.scoreBenchmarkDiff,
                  color: averageDiff >= 0 ? "#86efac" : "#fca5a5",
                }}
              >
                {averageDiff >= 0 ? `高于场景均分 ${averageDiff} 分` : `低于场景均分 ${Math.abs(averageDiff)} 分`}
              </div>
            </div>
          </div>
        </section>

        <section style={styles.gridThree}>
          {scoreCards.map((item) => {
            const scoreStyle = getScoreStyle(item.value);
            return (
              <article
                key={item.key}
                style={{
                  ...styles.metricCard,
                  borderLeft: `4px solid ${scoreStyle.barColor}`,
                }}
              >
                <div style={{ ...styles.metricName, color: scoreStyle.color }}>{item.key}</div>
                <div style={styles.metricSub}>{item.label}</div>
                <div style={{ ...styles.metricValue, color: scoreStyle.color }}>{item.value}</div>
                <span
                  style={{
                    ...styles.metricPill,
                    background: scoreStyle.bgColor,
                    color: scoreStyle.textColor,
                  }}
                >
                  {scoreStyle.level}
                </span>
                <div style={styles.metricDesc}>{item.desc}</div>
              </article>
            );
          })}
        </section>

        <section style={styles.noticePanel}>
          <div style={styles.noticeTitle}>结果摘要</div>
          <div style={styles.noticeText}>
            {report.disclaimer || "本次评分为启发式评分，不代表平台官方排名或官方权威判断。"}
          </div>
          {effectiveNextAction ? (
            <div style={styles.noticeNextAction}>下一步建议：{effectiveNextAction}</div>
          ) : null}
          {report.confidence?.reasons?.length ? (
            <div style={styles.noticeReasons}>
              {report.confidence.reasons.map((reason, index) => (
                <span key={index} style={styles.noticeReason}>
                  {reason}
                </span>
              ))}
            </div>
          ) : null}
        </section>

        {report.evidence ? (
          <section style={styles.panel}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>图源证据面板</h2>
            </div>

            <div style={styles.evidenceSummaryCard}>
              <div style={styles.evidenceSummaryTitle}>{report.evidence.summary}</div>
              {report.evidence.riskSignals.length ? (
                <div style={styles.noticeReasons}>
                  {report.evidence.riskSignals.map((reason, index) => (
                    <span key={index} style={styles.noticeReason}>
                      {reason}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div style={styles.snapshotGrid}>
              <article style={styles.snapshotCard}>
                <div style={styles.snapshotLabel}>命中页面</div>
                <div style={styles.snapshotValue}>{report.evidence.matchedPageCount}</div>
                <div style={styles.snapshotText}>公开网页里找到的相似图来源数量。</div>
              </article>
              <article style={styles.snapshotCard}>
                <div style={styles.snapshotLabel}>最早发布时间</div>
                <div style={styles.snapshotValue}>{report.evidence.datedPageCount}</div>
                <div style={styles.snapshotText}>
                  {formatEvidenceDate(report.evidence.earliestPublishedAt)}
                </div>
              </article>
              <article style={styles.snapshotCard}>
                <div style={styles.snapshotLabel}>低风险域名</div>
                <div style={styles.snapshotValue}>{report.evidence.lowRiskPageCount}</div>
                <div style={styles.snapshotText}>低风险来源越多，证据越稳定。</div>
              </article>
            </div>

            {(report.evidence.bestGuessLabels.length || report.evidence.webEntities.length) ? (
              <div style={styles.evidenceTagWrap}>
                {report.evidence.bestGuessLabels.map((item) => (
                  <span key={item} style={styles.evidenceTag}>
                    标签：{item}
                  </span>
                ))}
                {report.evidence.webEntities.map((item) => (
                  <span key={item} style={styles.evidenceTagMuted}>
                    实体：{item}
                  </span>
                ))}
              </div>
            ) : null}

            {report.evidence.extractedText ? (
              <div style={styles.evidenceTextBox}>
                <div style={styles.rawLabel}>OCR 文本</div>
                <div style={styles.rawBox}>{report.evidence.extractedText}</div>
              </div>
            ) : null}

            {report.evidence.matchingPages.length ? (
              <div style={styles.evidencePageList}>
                {report.evidence.matchingPages.map((page) => (
                  <article key={page.url} style={styles.evidencePageCard}>
                    <div style={styles.evidencePageHead}>
                      <div style={styles.evidencePageDomain}>{page.domain || page.url}</div>
                      <span
                        style={
                          page.riskTier === "low"
                            ? styles.evidenceRiskLow
                            : page.riskTier === "medium"
                              ? styles.evidenceRiskMedium
                              : styles.evidenceRiskHigh
                        }
                      >
                        {page.riskLabel}
                      </span>
                    </div>
                    <a href={page.url} target="_blank" rel="noreferrer" style={styles.evidencePageLink}>
                      {page.title || page.url}
                    </a>
                    <div style={styles.evidencePageMeta}>
                      完整匹配 {page.fullMatchCount} · 局部匹配 {page.partialMatchCount}
                      {page.publishedAt ? ` · 发布时间 ${formatEvidenceDate(page.publishedAt)}` : ""}
                    </div>
                    <div style={styles.evidencePageReason}>{page.riskReason}</div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        <section style={styles.panel}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>本次输入</h2>
          </div>
          <div style={styles.infoList}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>对方昵称</span>
              <span style={styles.infoValue}>{report.input.brandName}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>内容场景</span>
              <span style={styles.infoValue}>{report.input.industry}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>样本描述</span>
              <span style={styles.infoValue}>
                {report.input.brandNarrative?.oneLiner || report.input.businessSummary}
              </span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>关注问题</span>
              <span style={styles.infoValue}>{report.input.query}</span>
            </div>
          </div>
        </section>

        <section style={styles.advicePanel}>
          <div style={styles.adviceCtaArea}>
            <p style={styles.adviceCtaTitle}>需要更多证据的话，可以补充样本再跑一轮。</p>
            <div style={styles.buttonRow}>
              <Link href="/detect" style={styles.ctaPrimaryButton}>
                再做一次核验
              </Link>
              <Link href="/" style={styles.secondaryButton}>
                返回首页
              </Link>
              <Link href="/#contact" style={styles.ghostButton}>
                提交企业接入需求
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "var(--bg)",
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
    background: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: 24,
    padding: 32,
    display: "grid",
    gridTemplateColumns: "1.8fr 0.8fr",
    gap: 24,
    alignItems: "start",
  },
  heroMeta: {
    color: "var(--muted-2)",
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  heroTitle: {
    margin: 0,
    fontSize: 42,
    lineHeight: 1.16,
    color: "var(--text)",
    fontFamily: "var(--font-serif)",
    fontWeight: 500,
  },
  heroText: {
    margin: "18px 0 0",
    fontSize: 18,
    lineHeight: 1.75,
    color: "var(--muted)",
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
    background: "var(--surface-warm)",
    color: "var(--text-soft)",
    fontSize: 13,
    fontWeight: 600,
  },
  scoreCard: {
    background: "var(--dark)",
    color: "var(--surface)",
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
    fontFamily: "var(--font-serif)",
    fontWeight: 500,
  },
  scoreLevel: {
    marginTop: 8,
    fontSize: 15,
    opacity: 0.75,
  },
  scoreBenchmark: {
    marginTop: 18,
    paddingTop: 16,
    borderTop: "1px solid rgba(255,255,255,0.12)",
    width: "100%",
  },
  scoreBenchmarkLine: {
    fontSize: 12,
    opacity: 0.72,
  },
  scoreBenchmarkDiff: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: 700,
  },
  gridThree: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 20,
  },
  metricCard: {
    background: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: 20,
    padding: "26px 26px 26px 22px",
  },
  metricName: {
    fontSize: 16,
    fontWeight: 700,
  },
  metricSub: {
    marginTop: 4,
    color: "#98a2b3",
    fontSize: 12,
  },
  metricValue: {
    marginTop: 14,
    fontSize: 44,
    lineHeight: 1,
    fontWeight: 800,
  },
  metricPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    padding: "4px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },
  metricDesc: {
    marginTop: 10,
    fontSize: 16,
    color: "var(--muted)",
  },
  snapshotGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 18,
  },
  snapshotCard: {
    background: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: 20,
    padding: 22,
    boxShadow: "var(--shadow-ring)",
  },
  snapshotLabel: {
    color: "var(--muted-2)",
    fontSize: 12,
    fontWeight: 500,
  },
  snapshotValue: {
    marginTop: 12,
    fontSize: 30,
    lineHeight: 1.1,
    color: "var(--text)",
    fontFamily: "var(--font-serif)",
    fontWeight: 500,
  },
  snapshotText: {
    marginTop: 10,
    color: "var(--muted)",
    fontSize: 14,
    lineHeight: 1.8,
  },
  noticePanel: {
    background: "#faf3eb",
    border: "1px solid #eadccf",
    borderRadius: 20,
    padding: 20,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#8a4b08",
  },
  noticeText: {
    marginTop: 8,
    color: "var(--text-soft)",
    fontSize: 14,
    lineHeight: 1.7,
  },
  noticeNextAction: {
    marginTop: 12,
    color: "var(--brand)",
    fontSize: 14,
    lineHeight: 1.7,
    fontWeight: 700,
  },
  noticeReasons: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  noticeReason: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    background: "var(--surface-warm)",
    color: "var(--text-soft)",
    fontSize: 12,
    fontWeight: 600,
  },
  evidenceSummaryCard: {
    padding: "18px 20px",
    borderRadius: 20,
    background: "#faf3eb",
    border: "1px solid #eadccf",
    marginBottom: 18,
  },
  evidenceSummaryTitle: {
    color: "var(--text-soft)",
    fontSize: 16,
    lineHeight: 1.8,
    fontWeight: 500,
    fontFamily: "var(--font-serif)",
  },
  evidenceTagWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },
  evidenceTag: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: 999,
    background: "var(--brand-soft)",
    color: "var(--text-soft)",
    fontSize: 13,
    fontWeight: 700,
  },
  evidenceTagMuted: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: 999,
    background: "var(--surface-warm)",
    color: "var(--muted)",
    fontSize: 13,
    fontWeight: 600,
  },
  evidenceTextBox: {
    marginTop: 18,
  },
  evidencePageList: {
    display: "grid",
    gap: 14,
    marginTop: 18,
  },
  evidencePageCard: {
    padding: "16px 18px",
    borderRadius: 18,
    border: "1px solid var(--line)",
    background: "var(--surface-strong)",
  },
  evidencePageHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  evidencePageDomain: {
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--brand)",
  },
  evidenceRiskLow: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#e8f7ef",
    color: "#156b43",
    fontSize: 12,
    fontWeight: 700,
  },
  evidenceRiskMedium: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#fff2df",
    color: "#8a4b08",
    fontSize: 12,
    fontWeight: 700,
  },
  evidenceRiskHigh: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    background: "#fde8e8",
    color: "#9b1c1c",
    fontSize: 12,
    fontWeight: 700,
  },
  evidencePageLink: {
    display: "inline-block",
    marginTop: 8,
    color: "var(--text)",
    fontSize: 16,
    lineHeight: 1.7,
    fontWeight: 700,
    textDecoration: "none",
  },
  evidencePageMeta: {
    marginTop: 8,
    color: "var(--muted)",
    fontSize: 14,
  },
  evidencePageReason: {
    marginTop: 8,
    color: "var(--muted)",
    fontSize: 14,
    lineHeight: 1.7,
  },
  panel: {
    background: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: 24,
    padding: 28,
  },
  sectionHeader: {
    marginBottom: 18,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 28,
    color: "var(--text)",
    fontFamily: "var(--font-serif)",
    fontWeight: 500,
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
    borderBottom: "1px solid var(--line)",
  },
  infoLabel: {
    color: "var(--muted-2)",
    fontSize: 15,
  },
  infoValue: {
    color: "var(--text)",
    fontSize: 16,
    lineHeight: 1.7,
  },
  resultList: {
    display: "grid",
    gap: 18,
  },
  resultCard: {
    border: "1px solid var(--line)",
    borderRadius: 20,
    padding: "22px 22px 22px 20px",
    background: "var(--surface-strong)",
  },
  resultTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  resultTitleWrap: {
    display: "grid",
    gap: 8,
  },
  resultModel: {
    margin: 0,
    fontSize: 22,
    color: "var(--text)",
    fontFamily: "var(--font-serif)",
    fontWeight: 500,
  },
  resultSummary: {
    margin: 0,
    color: "var(--muted)",
    fontSize: 14,
    lineHeight: 1.7,
  },
  resultToneBadge: {
    borderRadius: 999,
    padding: "6px 12px",
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  resultBody: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.35fr) minmax(260px, 0.65fr)",
    gap: 18,
    alignItems: "start",
  },
  goodBadge: {
    borderRadius: 999,
    padding: "6px 12px",
    background: "#efe7d8",
    color: "var(--text-soft)",
    fontSize: 13,
    fontWeight: 700,
  },
  weakBadge: {
    borderRadius: 999,
    padding: "6px 12px",
    background: "var(--surface-warm)",
    color: "var(--muted)",
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
    background: "#efe7d8",
    color: "var(--text-soft)",
    fontSize: 13,
    fontWeight: 600,
  },
  flagNeutral: {
    borderRadius: 999,
    padding: "6px 12px",
    background: "var(--surface-warm)",
    color: "var(--muted)",
    fontSize: 13,
    fontWeight: 600,
  },
  rawBox: {
    padding: 16,
    borderRadius: 16,
    background: "var(--surface-strong)",
    color: "var(--text-soft)",
    fontSize: 15,
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
  },
  rawLabel: {
    marginBottom: 10,
    color: "var(--muted-2)",
    fontSize: 13,
    fontWeight: 700,
  },
  resultInsightBox: {
    borderRadius: 16,
    border: "1px solid var(--line)",
    padding: 16,
    display: "grid",
    gap: 12,
  },
  resultInsightTitle: {
    fontSize: 14,
    color: "var(--text)",
    fontFamily: "var(--font-serif)",
    fontWeight: 500,
  },
  resultInsightLine: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    color: "var(--muted)",
    fontSize: 13,
    paddingTop: 10,
    borderTop: "1px solid var(--line)",
  },
  notes: {
    display: "grid",
    gap: 8,
    marginTop: 14,
  },
  noteItem: {
    color: "#b53333",
    fontSize: 14,
  },
  advicePanel: {
    background: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: 24,
    padding: 28,
    display: "grid",
    gap: 22,
  },
  adviceHead: {
    display: "grid",
    gap: 10,
  },
  adviceList: {
    display: "grid",
    gap: 16,
  },
  adviceItem: {
    background: "var(--surface-strong)",
    border: "1px solid var(--line)",
    borderRadius: 18,
    padding: "18px 18px 18px 20px",
  },
  adviceTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
  },
  adviceTitle: {
    fontSize: 16,
    fontWeight: 500,
    fontFamily: "var(--font-serif)",
  },
  adviceMeta: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },
  adviceScore: {
    fontSize: 12,
    fontWeight: 700,
  },
  advicePill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
  },
  priorityPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    color: "#791F1F",
    background: "#FCEBEB",
  },
  adviceText: {
    marginTop: 10,
    color: "var(--muted)",
    fontSize: 14,
    lineHeight: 1.8,
  },
  adviceDivider: {
    height: 1,
    background: "var(--line)",
  },
  adviceCtaArea: {
    display: "grid",
    justifyItems: "center",
    gap: 16,
    textAlign: "center",
  },
  adviceCtaTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 500,
    fontFamily: "var(--font-serif)",
  },
  ctaText: {
    margin: 0,
    color: "var(--muted)",
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
    borderRadius: 12,
    background: "var(--brand)",
    color: "var(--surface)",
    fontSize: 15,
    fontWeight: 700,
    textDecoration: "none",
  },
  ctaPrimaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    padding: "0 22px",
    borderRadius: 12,
    background: "var(--dark)",
    color: "var(--surface)",
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
    borderRadius: 12,
    background: "var(--surface-strong)",
    border: "1px solid var(--line-strong)",
    color: "var(--text)",
    fontSize: 15,
    fontWeight: 700,
    textDecoration: "none",
  },
  ghostButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    padding: "0 22px",
    borderRadius: 12,
    background: "var(--surface-strong)",
    border: "1px solid var(--line)",
    color: "var(--muted)",
    fontSize: 15,
    fontWeight: 600,
    textDecoration: "none",
  },
  secondaryActionButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    padding: "0 22px",
    borderRadius: 12,
    background: "var(--surface-strong)",
    border: "1px solid var(--line-strong)",
    color: "var(--text)",
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
