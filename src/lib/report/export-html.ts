import { MODEL_META } from "@/lib/detect/model-meta";
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
    .grid-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
    .metric{border:1px solid #edf0f4;border-radius:18px;padding:20px;background:#fff}
    .metric-name{color:#0f8b7f;font-size:15px;font-weight:700}
    .metric-value{margin-top:12px;font-size:40px;font-weight:800}
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
          <div class="contact-line">商务邮箱：19925969089@163.com</div>
        </div>
      </div>
    </section>

    <section class="panel hero">
      <div>
        <div class="brand">董逻辑MGEO</div>
        <h1>${escapeHtml(report.input.brandName)} 的 MGEO 检测报告</h1>
        <p class="summary">${escapeHtml(report.summary)}</p>
        <div class="tag-row">
          <span class="tag">任务编号：${escapeHtml(taskId)}</span>
          <span class="tag">行业：${escapeHtml(report.input.industry)}</span>
          <span class="tag">提及模型：${mentionedCount} / ${report.results.length}</span>
          <span class="tag">等级：${escapeHtml(report.score.level)} ${getLevelText(report.score.level)}</span>
        </div>
      </div>
      <div class="score-card">
        <div class="score-value">${report.score.total}</div>
        <div class="score-label">MGEO Score</div>
        <div class="score-level">${report.score.level} · ${getLevelText(report.score.level)}</div>
      </div>
    </section>

    <section class="panel">
      <h2 class="section-title">TCA 评分</h2>
      <div class="grid-three">
        <div class="metric">
          <div class="metric-name">Consistency</div>
          <div class="metric-value">${report.score.consistency}</div>
          <div class="metric-desc">品牌定位与描述一致性</div>
        </div>
        <div class="metric">
          <div class="metric-name">Coverage</div>
          <div class="metric-value">${report.score.coverage}</div>
          <div class="metric-desc">模型提及覆盖度</div>
        </div>
        <div class="metric">
          <div class="metric-name">Authority</div>
          <div class="metric-value">${report.score.authority}</div>
          <div class="metric-desc">品牌权威支撑表现</div>
        </div>
      </div>
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
        <ul class="cta-list">
          <li>解读 TCA 三项评分的真实业务含义</li>
          <li>判断当前更适合先补覆盖、先调一致性还是先做权威支撑</li>
          <li>匹配适合您的 MGEO 服务方案与执行节奏</li>
        </ul>
      </div>
      <div class="cta-card">
        <h3 class="cta-card-title">继续服务沟通</h3>
        <div class="cta-card-line">建议操作：预约解读 / 获取服务方案 / 进入一轮优化</div>
        <div class="cta-card-line">微信：19925969089</div>
        <div class="cta-card-line">小红书：董逻辑</div>
        <div class="cta-card-line">邮箱：19925969089@163.com</div>
      </div>
    </section>

    <div class="foot">董逻辑MGEO · 品牌在 AI 搜索中的可见性检测报告</div>
  </div>
</body>
</html>`;
}
