import type { Metadata } from "next";
import Link from "next/link";

import { DetectForm } from "@/components/detect/DetectForm";
import { SiteShell } from "@/components/marketing/SiteShell";

export const metadata: Metadata = {
  title: "董逻辑MGEO - 帮助品牌在AI搜索中被看见",
  description: "多模式生成式引擎优化，覆盖豆包、DeepSeek、Kimi、通义千问等 6 大 AI 平台，基于 TCA 三支柱模型做品牌可见性诊断。",
};

const workflowCards = [
  {
    id: "01",
    title: "免费检测",
    desc: "快速获取品牌 AI 可见性基准",
  },
  {
    id: "02",
    title: "TCA 诊断",
    desc: "一致性、覆盖度、权威性三维评估",
  },
  {
    id: "03",
    title: "服务转化",
    desc: "明确当前最需要优先处理的问题",
  },
  {
    id: "04",
    title: "交付执行",
    desc: "按平台特征生产并分发内容",
  },
  {
    id: "05",
    title: "效果监测",
    desc: "跟踪 6 平台排名与推荐变化",
  },
  {
    id: "06",
    title: "复盘迭代",
    desc: "每周输出数据，每月策略复盘",
  },
];

const diagnosisCards = [
  {
    tag: "RED FLAG",
    title: "Consistency 一致性差",
    text: "6 个平台对品牌的描述并不统一，信息冲突率达到 35%，说明品牌叙事仍需进一步标准化。",
  },
  {
    tag: "RED FLAG",
    title: "Coverage 覆盖度低",
    text: "目前仅有 3 个平台可以稳定提及品牌，说明仍有大量关键问答与推荐场景尚未覆盖。",
  },
  {
    tag: "RED FLAG",
    title: "Authority 权威性弱",
    text: "当前被引用的外部信源质量偏弱，品牌在搜索与模型抓取中的可信支撑仍需补强。",
  },
];

const reportRows = [
  ["DeepSeek", "positive", "描述偏差", "已有提及，但推荐位置不稳定"],
  ["字节豆包", "positive", "定位混乱", "被识别，但品牌定位仍然混乱"],
  ["通义千问", "positive", "表述偏泛", "已有基础提及，但品牌特征仍不清晰"],
  ["Kimi", "negative", "-", "尚未形成稳定提及"],
  ["腾讯元宝", "negative", "-", "仍需补足品牌信息覆盖"],
  ["百度文心", "negative", "-", "品牌内容仍未进入稳定推荐场景"],
];

const coveredIndustries = ["新茶饮", "餐饮连锁", "教育培训", "家政服务", "美妆护肤", "企业服务"];

const legalLinks = ["隐私政策", "用户协议", "退款政策", "网站地图"];

export default function MarketingHomePage() {
  return (
    <SiteShell current="/#detector" hideFooter>
      <main style={styles.page}>
        <style>{`
          @keyframes heroBadgePulse {
            0%, 100% {
              opacity: 0.6;
              transform: scale(0.92);
              box-shadow: 0 0 0 4px rgba(16, 202, 168, 0.08);
            }
            50% {
              transform: scale(1);
              opacity: 1;
              box-shadow: 0 0 0 8px rgba(16, 202, 168, 0.18);
            }
          }
        `}</style>
        <section style={styles.hero}>
          <div style={styles.heroInner}>
            <div style={styles.heroBadge}>
              <span style={styles.heroBadgeDotWrap}>
                <span style={styles.heroBadgePulse} />
                <span style={styles.heroBadgeDot} />
              </span>
              <span>多模式生成式引擎</span>
            </div>
            <h1 style={styles.heroTitle}>帮助品牌在AI搜索中被看见</h1>
            <div style={styles.metricRow}>
              <div style={{ ...styles.metricItem, borderLeft: "none" }}>
                <strong style={styles.metricValue}>6大</strong>
                <span style={styles.metricLabel}>AI 平台覆盖</span>
              </div>
              <div style={styles.metricItem}>
                <strong style={styles.metricValue}>TCA</strong>
                <span style={styles.metricLabel}>三支柱诊断体系</span>
              </div>
              <div style={styles.metricItem}>
                <strong style={styles.metricValue}>30天</strong>
                <span style={styles.metricLabel}>闭环见效周期</span>
              </div>
              <div style={styles.metricItem}>
                <strong style={styles.metricValue}>60+</strong>
                <span style={styles.metricLabel}>行业品牌已收录</span>
              </div>
            </div>
          </div>
        </section>

        <section id="detector" style={styles.detectSection}>
          <div style={styles.detectShell}>
            <DetectForm embedded />
          </div>
        </section>

        <section style={styles.coveredIndustriesSection}>
          <div style={styles.coveredIndustriesLabel}>已覆盖行业</div>
          <div style={styles.coveredIndustriesWrap}>
            {coveredIndustries.map((item) => (
              <span key={item} style={styles.coveredIndustryTag}>
                {item}
              </span>
            ))}
          </div>
        </section>

        <section style={styles.reportSection}>
          <div style={styles.sectionHead}>
            <div style={styles.sectionAccent}>检测之后，核心输出是一份清晰的品牌诊断报告</div>
            <p style={styles.sectionTextWide}>
              报告聚焦品牌在多模型环境中的真实问题，帮助客户快速理解风险、判断优先级，并进入下一步优化流程。
            </p>
          </div>

          <div style={styles.reportCard}>
            <div style={styles.reportTop}>
              <div>
                <h2 style={styles.reportTitle}>您的品牌 MGEO 健康度：42 分</h2>
                <p style={styles.reportSummary}>
                  L1 基础级。当前品牌在多模型场景中的描述一致性不足，影响推荐稳定性与可见性表现。
                </p>
              </div>
              <div style={styles.scoreCard}>
                <div style={styles.scoreValue}>42</div>
                <div style={styles.scoreLabel}>MGEO Score / L1</div>
              </div>
            </div>

            <div style={styles.diagnosisGrid}>
              {diagnosisCards.map((item) => (
                <article key={item.title} style={styles.diagnosisCard}>
                  <div style={styles.redFlag}>{item.tag}</div>
                  <h3 style={styles.diagnosisTitle}>{item.title}</h3>
                  <p style={styles.diagnosisText}>{item.text}</p>
                </article>
              ))}
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>模型</th>
                    <th style={styles.th}>是否提及</th>
                    <th style={styles.th}>描述一致性</th>
                    <th style={styles.th}>当前状态</th>
                  </tr>
                </thead>
                <tbody>
                  {reportRows.map(([model, mentioned, consistency, status]) => (
                    <tr key={model}>
                      <td style={styles.td}>{model}</td>
                      <td style={styles.td}>
                        {mentioned === "positive" ? (
                          <span style={styles.positiveStatus}>✅ 有</span>
                        ) : (
                          <span style={styles.negativeStatus}>❌ 无</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {consistency === "-" ? "-" : <span style={styles.warningStatus}>❌ {consistency}</span>}
                      </td>
                      <td style={styles.td}>{status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section style={styles.workflowSection}>
          <div style={styles.sectionHead}>
            <h2 style={styles.sectionTitle}>从一次检测到持续增长的 6 步路径</h2>
            <div style={styles.sectionAccent}>保留流程，但不再重复讲同一件事</div>
            <p style={styles.sectionText}>
              先检测，再诊断，再执行。每一步都服务于品牌在 AI 场景中的长期可见性增长。
            </p>
          </div>
          <div style={styles.workflowGrid}>
            {workflowCards.map((item) => (
              <article key={item.id} style={styles.workflowCard}>
                <div style={styles.workflowId}>{item.id}</div>
                <h3 style={styles.workflowTitle}>{item.title}</h3>
                <p style={styles.workflowLine}>{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="whitepaper" style={styles.ctaSection}>
          <div style={styles.ctaCard}>
            <h2 style={styles.ctaTitle}>从一次检测开始，建立品牌在 AI 场景中的长期增长能力</h2>
            <p style={styles.ctaText}>
              董逻辑 MGEO 以清晰的检测入口建立认知，以标准化交付完成优化，以持续监测与复盘推动长期增长，让每一步都可理解、可执行、可追踪。
            </p>
            <div style={styles.ctaActions}>
              <Link href="/detect" style={styles.ctaPrimary}>
                立即开始检测
              </Link>
              <Link href="/pricing" style={styles.ctaSecondary}>
                查看服务方案
              </Link>
            </div>
          </div>
        </section>

        <section id="contact" style={styles.contactSection}>
          <div style={styles.sectionHead}>
            <h2 style={styles.contactHeading}>联系我们</h2>
            <div style={styles.sectionAccent}>
              如果您是品牌负责人，希望系统学习董逻辑MGEO增长方法，欢迎联系我们；如果您希望由我们协助运营、制定方案并推进执行，也欢迎直接沟通。
            </div>
            <p style={styles.sectionTextWide}>
              您可以通过产品咨询、服务沟通或合作洽谈与我们取得联系，我们会根据品牌当前阶段，为您提供相应建议。
            </p>
          </div>

          <div style={styles.contactGrid}>
            <article style={styles.contactCard}>
              <h3 style={styles.contactCardTitle}>直接沟通</h3>
              <p style={styles.contactIntro}>
                如果您已经有明确需求，建议直接留下联系方式或通过微信、电话、邮箱与我们联系，我们会尽快安排沟通。
              </p>

              <div style={styles.contactLineBlock}>
                <div style={styles.contactLabel}>微信咨询</div>
                <div style={styles.contactValue}>19925969089</div>
              </div>
              <div style={styles.contactLineBlock}>
                <div style={styles.contactLabel}>联系电话</div>
                <div style={styles.contactValue}>199 2596 9089</div>
              </div>
              <div style={styles.contactLineBlock}>
                <div style={styles.contactLabel}>小红书</div>
                <div style={styles.contactValue}>董逻辑</div>
              </div>
              <div style={styles.contactLineBlockLast}>
                <div style={styles.contactLabel}>商务邮箱</div>
                <div style={styles.contactValue}>19925969089@163.com</div>
              </div>
            </article>

            <article style={styles.contactCard}>
              <h3 style={styles.contactCardTitle}>提交咨询</h3>
              <p style={styles.contactIntro}>
                留下您的品牌信息与当前需求，我们会根据业务阶段给出相应建议。
              </p>

              <form style={styles.consultForm}>
                <div style={styles.consultRow}>
                  <label style={styles.consultField}>
                    <span style={styles.consultLabel}>姓名</span>
                    <input style={styles.consultInput} placeholder="请输入您的姓名" />
                  </label>
                  <label style={styles.consultField}>
                    <span style={styles.consultLabel}>公司 / 品牌</span>
                    <input style={styles.consultInput} placeholder="请输入公司或品牌名称" />
                  </label>
                </div>
                <div style={styles.consultRow}>
                  <label style={styles.consultField}>
                    <span style={styles.consultLabel}>联系电话</span>
                    <input style={styles.consultInput} placeholder="请输入手机号或微信号" />
                  </label>
                  <label style={styles.consultField}>
                    <span style={styles.consultLabel}>所属行业</span>
                    <input style={styles.consultInput} placeholder="例如：企业服务 / 本地生活" />
                  </label>
                </div>
                <label style={styles.consultField}>
                  <span style={styles.consultLabel}>需求描述</span>
                  <textarea
                    style={styles.consultTextarea}
                    placeholder="请简单描述当前遇到的问题、目标或者希望了解的服务内容"
                    rows={5}
                  />
                </label>
                <button type="button" style={styles.consultButton}>
                  提交咨询
                </button>
              </form>
            </article>
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerLinks}>
          {legalLinks.map((item) => (
            <span key={item} style={styles.footerLink}>
              {item}
            </span>
          ))}
        </div>
        <div style={styles.footerCopyright}>Copyright © 2026 董逻辑MGEO. 保留所有权利。</div>
      </footer>
    </SiteShell>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "#f5f5f7",
  },
  hero: {
    background:
      "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.3), transparent), linear-gradient(180deg, #000000 0%, #1d1d1f 100%)",
    padding: "120px 24px 180px",
    color: "#ffffff",
    position: "relative",
    overflow: "hidden",
  },
  heroInner: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "grid",
    justifyItems: "center",
    textAlign: "center",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    height: 58,
    padding: "0 28px",
    margin: "-8px auto 22px",
    borderRadius: 999,
    border: "1px solid rgba(9, 140, 116, 0.42)",
    background: "rgba(9, 140, 116, 0.12)",
    color: "#0f9b84",
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: "-0.01em",
    lineHeight: 1,
  },
  heroBadgeDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    background: "#10caa8",
    position: "relative",
    zIndex: 2,
  },
  heroBadgeDotWrap: {
    width: 20,
    height: 20,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    flexShrink: 0,
  },
  heroBadgePulse: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 999,
    background: "#10caa8",
    boxShadow: "0 0 0 4px rgba(16, 202, 168, 0.12)",
    animation: "heroBadgePulse 1.8s ease-in-out infinite",
  },
  heroTitle: {
    margin: 0,
    fontSize: 42,
    lineHeight: 1.3,
    letterSpacing: "-0.03em",
    fontWeight: 800,
    color: "#f5f5f7",
  },
  metricRow: {
    width: "min(920px, 100%)",
    margin: "24px auto 0",
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    alignItems: "center",
  },
  metricItem: {
    display: "grid",
    justifyItems: "center",
    gap: 8,
    padding: "0 18px",
    textAlign: "center",
    borderLeft: "1px solid rgba(255,255,255,0.12)",
  },
  metricValue: {
    fontSize: 32,
    lineHeight: 1,
    fontWeight: 700,
    color: "#ffffff",
    letterSpacing: "-0.03em",
  },
  metricLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.68)",
    lineHeight: 1.5,
  },
  metricDivider: {
    display: "none",
  },
  detectSection: {
    marginTop: -100,
    padding: "0 24px",
    position: "relative",
    zIndex: 2,
  },
  detectShell: {
    maxWidth: 1000,
    margin: "0 auto",
  },
  coveredIndustriesSection: {
    maxWidth: 1180,
    margin: "60px auto 0",
    padding: "0 24px",
    display: "grid",
    justifyItems: "center",
    gap: 18,
  },
  coveredIndustriesLabel: {
    fontSize: 14,
    color: "#8a909d",
    fontWeight: 700,
    textAlign: "center",
  },
  coveredIndustriesWrap: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  coveredIndustryTag: {
    padding: "6px 16px",
    borderRadius: 20,
    background: "#F5F5F3",
    color: "#666666",
    fontSize: 13,
    lineHeight: 1.4,
  },
  workflowSection: {
    maxWidth: 1180,
    margin: "60px auto 0",
    padding: "0 24px",
  },
  sectionHead: {
    display: "grid",
    justifyItems: "center",
    textAlign: "center",
    gap: 18,
  },
  sectionTitle: {
    margin: 0,
    color: "#202226",
    fontSize: 48,
    lineHeight: 1.2,
    letterSpacing: "-0.04em",
    fontWeight: 800,
  },
  sectionAccent: {
    color: "#0f8b7f",
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.7,
    maxWidth: 1240,
  },
  sectionText: {
    margin: 0,
    maxWidth: 980,
    color: "#787d89",
    fontSize: 18,
    lineHeight: 1.8,
  },
  sectionTextWide: {
    margin: 0,
    maxWidth: 1040,
    color: "#787d89",
    fontSize: 18,
    lineHeight: 1.8,
  },
  workflowGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 22,
    marginTop: 46,
  },
  workflowCard: {
    background: "#ffffff",
    border: "1px solid #dfe4ec",
    borderRadius: 28,
    padding: 30,
    minHeight: 220,
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.05)",
  },
  workflowId: {
    width: 48,
    height: 48,
    borderRadius: 16,
    background: "#0f8b7f",
    color: "#ffffff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    fontWeight: 800,
  },
  workflowTitle: {
    margin: "24px 0 0",
    fontSize: 34,
    lineHeight: 1.2,
    color: "#202226",
    fontWeight: 800,
  },
  workflowLine: {
    margin: "18px 0 0",
    fontSize: 16,
    lineHeight: 1.8,
    color: "#4f5562",
    paddingTop: 18,
    borderTop: "1px solid #edf0f4",
  },
  reportSection: {
    maxWidth: 1180,
    margin: "94px auto 0",
    padding: "0 24px",
  },
  reportCard: {
    marginTop: 34,
    background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
    border: "1px solid #e1e6ed",
    borderRadius: 34,
    padding: "30px 30px 28px",
    boxShadow: "0 26px 60px rgba(15, 23, 42, 0.06)",
  },
  reportTop: {
    display: "grid",
    gridTemplateColumns: "1.6fr 0.7fr",
    gap: 24,
    alignItems: "start",
  },
  reportTitle: {
    margin: "8px 0 0",
    fontSize: 36,
    lineHeight: 1.14,
    color: "#202226",
    letterSpacing: "-0.04em",
  },
  reportSummary: {
    margin: "18px 0 0",
    color: "#6e7380",
    fontSize: 14,
    lineHeight: 1.8,
  },
  scoreCard: {
    justifySelf: "end",
    width: 170,
    height: 126,
    borderRadius: 22,
    background: "#121212",
    color: "#ffffff",
    display: "grid",
    justifyItems: "center",
    alignContent: "center",
  },
  scoreValue: {
    fontSize: 56,
    lineHeight: 1,
    fontWeight: 800,
  },
  scoreLabel: {
    marginTop: 10,
    fontSize: 14,
    opacity: 0.9,
  },
  diagnosisGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 18,
    marginTop: 26,
  },
  diagnosisCard: {
    background: "#ffffff",
    border: "1px solid #e5e8ee",
    borderRadius: 24,
    padding: 26,
  },
  redFlag: {
    color: "#ff3b30",
    fontSize: 14,
    fontWeight: 800,
  },
  diagnosisTitle: {
    margin: "18px 0 0",
    fontSize: 26,
    lineHeight: 1.35,
    color: "#202226",
    fontWeight: 800,
  },
  diagnosisText: {
    margin: "16px 0 0",
    color: "#6a6f7b",
    fontSize: 16,
    lineHeight: 1.8,
  },
  tableWrap: {
    overflowX: "auto",
    marginTop: 24,
    borderRadius: 24,
    border: "1px solid #edf0f4",
    background: "#ffffff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "16px 18px",
    fontSize: 16,
    color: "#6c7280",
    background: "#f7f8fb",
  },
  td: {
    padding: "16px 18px",
    fontSize: 15,
    color: "#202226",
    borderTop: "1px solid #edf0f4",
  },
  positiveStatus: {
    color: "#202226",
    fontWeight: 500,
  },
  negativeStatus: {
    color: "#202226",
    fontWeight: 500,
  },
  warningStatus: {
    color: "#202226",
    fontWeight: 500,
  },
  ctaSection: {
    maxWidth: 1180,
    margin: "96px auto 0",
    padding: "0 24px",
  },
  ctaCard: {
    borderRadius: 34,
    padding: "56px 48px 50px",
    background: "linear-gradient(135deg, #0f1217 0%, #111a1e 42%, #0f4a38 100%)",
    color: "#ffffff",
  },
  ctaTitle: {
    margin: 0,
    fontSize: 54,
    lineHeight: 1.16,
    letterSpacing: "-0.04em",
    maxWidth: 960,
  },
  ctaText: {
    margin: "22px 0 0",
    maxWidth: 980,
    color: "rgba(255,255,255,0.72)",
    fontSize: 17,
    lineHeight: 1.85,
  },
  ctaActions: {
    display: "flex",
    gap: 16,
    marginTop: 34,
    flexWrap: "wrap",
  },
  ctaPrimary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 68,
    padding: "0 28px",
    borderRadius: 16,
    background: "#231f1f",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: 18,
    fontWeight: 700,
  },
  ctaSecondary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 68,
    padding: "0 28px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.28)",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: 18,
    fontWeight: 700,
  },
  contactSection: {
    maxWidth: 1180,
    margin: "88px auto 0",
    padding: "0 24px 28px",
  },
  contactHeading: {
    margin: 0,
    color: "#202226",
    fontSize: 56,
    lineHeight: 1.18,
    fontWeight: 800,
  },
  contactGrid: {
    display: "grid",
    gridTemplateColumns: "0.9fr 1.1fr",
    gap: 26,
    marginTop: 34,
  },
  contactCard: {
    background: "#ffffff",
    border: "1px solid #dfe4ec",
    borderRadius: 30,
    padding: 34,
  },
  contactCardTitle: {
    margin: 0,
    fontSize: 34,
    lineHeight: 1.2,
    color: "#202226",
    fontWeight: 800,
  },
  contactIntro: {
    margin: "22px 0 0",
    color: "#6f7582",
    fontSize: 16,
    lineHeight: 1.9,
  },
  contactLineBlock: {
    padding: "24px 0",
    borderBottom: "1px solid #edf0f4",
  },
  contactLineBlockLast: {
    padding: "24px 0 0",
  },
  contactLabel: {
    color: "#8a909d",
    fontSize: 15,
    marginBottom: 10,
  },
  contactValue: {
    color: "#202226",
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1.4,
  },
  consultForm: {
    display: "grid",
    gap: 20,
    marginTop: 24,
  },
  consultRow: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },
  consultField: {
    display: "grid",
    gap: 10,
  },
  consultLabel: {
    color: "#202226",
    fontSize: 16,
    fontWeight: 700,
  },
  consultInput: {
    height: 54,
    borderRadius: 18,
    border: "1px solid #d7dde7",
    padding: "0 18px",
    fontSize: 16,
    outline: "none",
  },
  consultTextarea: {
    borderRadius: 18,
    border: "1px solid #d7dde7",
    padding: "16px 18px",
    fontSize: 16,
    lineHeight: 1.75,
    outline: "none",
    resize: "vertical",
  },
  consultButton: {
    width: 256,
    height: 68,
    borderRadius: 18,
    border: "none",
    background: "#232123",
    color: "#ffffff",
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 10,
  },
  footer: {
    padding: "18px 24px 22px",
    borderTop: "1px solid #e4e8ef",
    textAlign: "center",
  },
  footerLinks: {
    display: "flex",
    justifyContent: "center",
    gap: 28,
    flexWrap: "wrap",
    color: "#6d7380",
    fontSize: 14,
  },
  footerLink: {
    color: "#6d7380",
  },
  footerCopyright: {
    marginTop: 18,
    color: "#8d93a0",
    fontSize: 14,
  },
};
