import { MODEL_META } from "@/lib/detect/model-meta";
import { generateAdvice } from "@/lib/report/generate-advice";
import { getScoreStyle } from "@/lib/report/score-colors";
import type { DetectReport } from "@/lib/detect/types";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getLevelText(level: DetectReport["score"]["level"]) {
  if (level === "L1") return "基础级";
  if (level === "L2") return "优化级";
  if (level === "L3") return "稳定级";
  return "增长级";
}

function getRecommendationSummary(signal: DetectReport["results"][number]["recommendationSignal"]) {
  if (signal === "high") return "推荐信号强";
  if (signal === "medium") return "有一定推荐倾向";
  if (signal === "low") return "仅基础提及";
  return "暂无推荐信号";
}

export function generateReportHtml(report: DetectReport, taskId: string) {
  const mentionedCount = report.results.filter((item) => item.mentioned).length;
  const adviceItems = generateAdvice(report.score);
  const industryAverageMap: Record<string, number> = {
    新茶饮: 68,
    餐饮连锁: 72,
    教培: 60,
    家政服务: 48,
    美妆护肤: 65,
    企业服务: 63,
  };
  const benchmark = industryAverageMap[report.input.industry] ?? 64;
  const benchmarkDiff = report.score.total - benchmark;
  const scoreCards = [
    { key: "Consistency", label: "一致性", value: report.score.consistency, desc: "品牌定位与描述一致性" },
    { key: "Coverage", label: "覆盖度", value: report.score.coverage, desc: "模型提及覆盖度" },
    { key: "Authority", label: "权威性", value: report.score.authority, desc: "品牌权威支撑表现" },
  ]
    .map((item) => {
      const style = getScoreStyle(item.value);
      return `
        <div class="metric metric-colored" style="border-left:4px solid ${style.barColor}">
          <div class="metric-name" style="color:${style.color}">${item.key}</div>
          <div class="metric-sub">${item.label}</div>
          <div class="metric-value" style="color:${style.color}">${item.value}</div>
          <span class="metric-pill" style="background:${style.bgColor};color:${style.textColor}">${style.level}</span>
          <div class="metric-desc">${item.desc}</div>
        </div>
      `;
    })
    .join("");
  const rows = report.results
    .map((item) => {
      const label = MODEL_META[item.model as keyof typeof MODEL_META]?.label || item.model;

      return `
        <div class="result-card">
          <div class="result-head">
            <h3>${escapeHtml(label)}</h3>
            <span class="badge ${item.mentioned ? "ok" : "weak"}">${item.mentioned ? "已提及" : "未提及"}</span>
          </div>
          <div class="badge-row">
            <span class="sub-badge">${item.positioningMatch ? "定位匹配" : "定位偏差"}</span>
            <span class="sub-badge">${item.descriptionConsistent ? "描述一致" : "描述不稳"}</span>
            <span class="sub-badge">${item.authoritySignal ? "权威性较好" : "权威性偏弱"}</span>
            <span class="sub-badge">${getRecommendationSummary(item.recommendationSignal)}</span>
          </div>
          <div class="raw-box">${escapeHtml(item.rawText || "暂无返回内容")}</div>
        </div>
      `;
    })
    .join("");
  const adviceHtml = adviceItems
    .map((advice, index) => {
      const style = getScoreStyle(advice.score);
      return `
        <div class="advice-item" style="border-left:4px solid ${style.barColor}">
          <div class="advice-head">
            <div class="advice-title" style="color:${style.color}">${advice.dimensionLabel}（${advice.dimension}）</div>
            <div class="advice-meta">
              <span class="advice-score" style="color:${style.color}">当前 ${advice.score} 分</span>
              <span class="advice-pill" style="background:${style.bgColor};color:${style.textColor}">${advice.level}</span>
              ${index === 0 ? '<span class="advice-pill advice-priority">最优先</span>' : ""}
            </div>
          </div>
          <div class="advice-text">${escapeHtml(advice.suggestion)}</div>
        </div>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(report.input.brandName)}-MGEO检测报告</title>
  <style>
    body{margin:0;background:#f6f8fb;color:#111827;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .page{max-width:1080px;margin:0 auto;padding:36px 20px 60px}
    .panel{background:#fff;border:1px solid #e7ebf0;border-radius:24px;padding:28px;margin-bottom:20px}
    .brand{display:inline-flex;padding:8px 14px;border-radius:999px;background:#edf8f6;color:#0f8b7f;font-size:14px;font-weight:700}
    .topbar{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:18px}
    .logo-wrap{display:flex;flex-direction:column;gap:8px}
    .logo-mark{font-size:13px;letter-spacing:.08em;color:#0f8b7f;font-weight:800}
    .logo-name{font-size:28px;font-weight:800;color:#111827}
    .logo-sub{font-size:13px;color:#667085}
    .contact-box{padding:14px 16px;border-radius:18px;background:#f8fafc;border:1px solid #edf0f4;min-width:260px}
    .contact-title{font-size:13px;color:#667085;margin-bottom:8px}
    .contact-line{font-size:14px;line-height:1.8;color:#111827}
    h1{margin:18px 0 0;font-size:42px;line-height:1.12}
    p{margin:0}
    .hero{display:grid;grid-template-columns:1.7fr .8fr;gap:24px;align-items:start}
    .summary{margin-top:18px;color:#606978;font-size:18px;line-height:1.75}
    .tag-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
    .tag{padding:8px 12px;border-radius:999px;background:#f4f6f8;color:#596273;font-size:13px;font-weight:600}
    .score-card{background:#111827;color:#fff;border-radius:24px;padding:28px;text-align:center}
    .score-value{font-size:68px;line-height:1;font-weight:800}
    .score-label{margin-top:10px;font-size:18px;opacity:.85}
    .score-level{margin-top:8px;font-size:14px;opacity:.75}
    .score-benchmark{margin-top:18px;padding-top:16px;border-top:1px solid rgba(255,255,255,.12)}
    .score-benchmark-line{font-size:12px;opacity:.72}
    .score-benchmark-diff{margin-top:6px;font-size:12px;font-weight:700}
    .score-benchmark-diff.up{color:#86efac}
    .score-benchmark-diff.down{color:#fca5a5}
    .grid-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
    .metric{border:1px solid #edf0f4;border-radius:18px;padding:20px;background:#fff}
    .metric-colored{position:relative;padding-left:22px}
    .metric-name{font-size:15px;font-weight:700}
    .metric-sub{margin-top:4px;color:#98a2b3;font-size:12px}
    .metric-value{margin-top:12px;font-size:40px;font-weight:800}
    .metric-pill{display:inline-flex;margin-top:12px;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700}
    .metric-desc{margin-top:8px;color:#667085;font-size:15px}
    .info-list{display:grid;gap:14px}
    .info-item{display:grid;grid-template-columns:140px 1fr;gap:14px;padding-bottom:14px;border-bottom:1px solid #edf0f4}
    .info-label{color:#667085;font-size:14px}
    .info-value{color:#111827;font-size:15px;line-height:1.7}
    .section-title{margin:0 0 18px;font-size:26px}
    .result-card{border:1px solid #edf0f4;border-radius:18px;padding:18px;margin-bottom:14px}
    .result-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}
    .result-head h3{margin:0;font-size:22px}
    .badge-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
    .badge,.sub-badge{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;font-size:13px;font-weight:700}
    .badge{padding:6px 12px}
    .badge.ok{background:#edf8f6;color:#0f8b7f}
    .badge.weak{background:#f5f5f5;color:#707784}
    .sub-badge{padding:6px 12px;background:#f4f6f8;color:#596273}
    .raw-box{padding:14px;border-radius:14px;background:#f8fafc;color:#2c3440;font-size:14px;line-height:1.8;white-space:pre-wrap}
    .cta-panel{display:grid;grid-template-columns:1.3fr .7fr;gap:20px;align-items:center}
    .cta-title{margin:0;font-size:28px;color:#111827}
    .cta-text{margin-top:14px;color:#667085;font-size:16px;line-height:1.8}
    .cta-list{margin:0;padding-left:18px;color:#475467;font-size:15px;line-height:1.9}
    .cta-card{border:1px solid #edf0f4;border-radius:20px;padding:20px;background:#f8fafc}
    .cta-card-title{margin:0 0 12px;font-size:18px;color:#111827}
    .cta-card-line{font-size:14px;line-height:1.8;color:#475467}
    .advice-wrap{display:grid;gap:16px}
    .advice-item{background:#fff;border:1px solid #edf0f4;border-radius:18px;padding:18px 18px 18px 20px}
    .advice-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap}
    .advice-title{font-size:16px;font-weight:700}
    .advice-meta{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    .advice-score{font-size:12px;font-weight:700}
    .advice-pill{display:inline-flex;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700}
    .advice-priority{background:#FCEBEB;color:#791F1F}
    .advice-text{margin-top:10px;color:#596273;font-size:14px;line-height:1.8}
    .foot{margin-top:22px;color:#667085;font-size:13px;text-align:center}
    @media print{body{background:#fff}.page{padding:0}.panel{break-inside:avoid}}
    @media (max-width:900px){.topbar,.hero,.grid-three,.cta-panel{grid-template-columns:1fr;display:grid}.topbar{display:grid}.info-item{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <div class="page">
    <section class="panel">
      <div class="topbar">
        <div class="logo-wrap">
          <div class="logo-mark">MGEO REPORT</div>
          <div class="logo-name">董逻辑MGEO</div>
          <div class="logo-sub">品牌在 AI 搜索中的检测、诊断与增长系统</div>
        </div>
        <div class="contact-box">
          <div class="contact-title">服务联系信息</div>
          <div class="contact-line">微信咨询：19925969089</div>
          <div class="contact-line">小红书：董逻辑</div>
          <div class="contact-line">商务邮箱：dongluoji2026@163.com</div>
        </div>
      </div>
    </section>

    <section class="panel hero">
      <div>
        <div class="brand">董逻辑MGEO</div>
        <h1>${escapeHtml(report.input.brandName)} 的 MGEO 检测报告</h1>
        <p class="summary">${escapeHtml(report.summary)}</p>
        <div class="tag-row">
          <span class="tag">检测报告</span>
          <span class="tag">行业：${escapeHtml(report.input.industry)}</span>
          <span class="tag">提及模型：${mentionedCount} / ${report.results.length}</span>
          <span class="tag">等级：${escapeHtml(report.score.level)} ${getLevelText(report.score.level)}</span>
        </div>
      </div>
      <div class="score-card">
        <div class="score-value">${report.score.total}</div>
        <div class="score-label">MGEO Score</div>
        <div class="score-level">${report.score.level} · ${getLevelText(report.score.level)}</div>
        <div class="score-benchmark">
          <div class="score-benchmark-line">行业均分：${benchmark}</div>
          <div class="score-benchmark-diff ${benchmarkDiff >= 0 ? "up" : "down"}">
            ${benchmarkDiff >= 0 ? `高于行业均分 ${benchmarkDiff} 分` : `低于行业均分 ${Math.abs(benchmarkDiff)} 分`}
          </div>
        </div>
      </div>
    </section>

    <section class="panel">
      <h2 class="section-title">TCA 评分</h2>
      <div class="grid-three">${scoreCards}</div>
    </section>

    <section class="panel">
      <h2 class="section-title">检测输入</h2>
      <div class="info-list">
        <div class="info-item"><span class="info-label">品牌名</span><span class="info-value">${escapeHtml(report.input.brandName)}</span></div>
        <div class="info-item"><span class="info-label">核心业务</span><span class="info-value">${escapeHtml(report.input.businessSummary)}</span></div>
        <div class="info-item"><span class="info-label">检测问题</span><span class="info-value">${escapeHtml(report.input.query)}</span></div>
      </div>
    </section>

    <section class="panel">
      <h2 class="section-title">模型结果明细</h2>
      ${rows}
    </section>

    <section class="panel cta-panel">
      <div>
        <h2 class="cta-title">下一步建议</h2>
        <p class="cta-text">
          如果您希望进一步理解这份报告，或希望把检测结果转成具体服务动作，建议进入服务沟通环节。我们会根据品牌当前阶段，为您提供对应的增长建议。
        </p>
        <div class="advice-wrap">${adviceHtml}</div>
      </div>
      <div class="cta-card">
        <h3 class="cta-card-title">继续服务沟通</h3>
        <div class="cta-card-line">建议操作：预约解读 / 获取服务方案 / 进入一轮优化</div>
        <div class="cta-card-line">微信：19925969089</div>
        <div class="cta-card-line">小红书：董逻辑</div>
        <div class="cta-card-line">邮箱：dongluoji2026@163.com</div>
        <div class="cta-card-line" style="margin-top:10px;font-weight:700;color:#111827">官网：www.dongluoji.com</div>
      </div>
    </section>

    <div class="foot">董逻辑MGEO · 品牌在 AI 搜索中的可见性检测报告</div>
  </div>
</body>
</html>`;
}
