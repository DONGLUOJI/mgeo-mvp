import Link from "next/link";
import { DetectForm } from "@/components/detect/DetectForm";
import { SiteShell } from "@/components/marketing/SiteShell";

const platformList = ["豆包", "DeepSeek", "阿里千问", "Kimi", "腾讯元宝", "文心一言"];

const featureCards = [
  {
    title: "多平台统一检测",
    text: "统一输入品牌问题，快速查看不同 AI 平台是否提及、如何理解以及是否具备推荐信号。",
  },
  {
    title: "TCA 三支柱诊断",
    text: "围绕 Consistency、Coverage、Authority 三个维度输出可执行的品牌可见性诊断结果。",
  },
  {
    title: "30 天闭环优化",
    text: "从检测、诊断、执行到复盘，形成品牌在 AI 搜索场景中的持续增长闭环。",
  },
  {
    title: "竞品对标分析",
    text: "结合行业场景和平台回答差异，辅助判断品牌当前的相对位置与优化优先级。",
  },
];

const pillars = [
  {
    title: "Consistency",
    text: "统一品牌定位与业务叙事，减少不同模型对同一品牌的偏差理解。",
  },
  {
    title: "Coverage",
    text: "提升品牌在更多问答、推荐和搜索场景中的稳定出现率。",
  },
  {
    title: "Authority",
    text: "补强可信内容与外部支撑，让模型更愿意引用并推荐品牌。",
  },
];

export default function MarketingHomePage() {
  return (
    <SiteShell current="/">
      <main>
        <section style={styles.hero}>
          <div style={styles.heroInner}>
            <div style={styles.heroBadge}>多模式生成式引擎</div>
            <h1 style={styles.heroTitle}>让品牌在 AI 搜索中被看见</h1>
            <p style={styles.heroText}>
              覆盖豆包、DeepSeek、Kimi 等多个 AI 平台，以 TCA 三支柱诊断体系为基础，帮助品牌在 30
              天内完成从检测到优化的闭环增长。
            </p>

            <div style={styles.heroActions}>
              <Link href="/detect" style={styles.primaryButton}>
                立即免费检测
              </Link>
              <Link href="/pricing" style={styles.secondaryButton}>
                查看服务方案
              </Link>
            </div>

            <div style={styles.metricRow}>
              <div style={styles.metricItem}>
                <strong style={styles.metricValue}>6 大</strong>
                <span style={styles.metricLabel}>AI 平台覆盖</span>
              </div>
              <div style={styles.metricDivider} />
              <div style={styles.metricItem}>
                <strong style={styles.metricValue}>TCA</strong>
                <span style={styles.metricLabel}>三支柱诊断体系</span>
              </div>
              <div style={styles.metricDivider} />
              <div style={styles.metricItem}>
                <strong style={styles.metricValue}>30 天</strong>
                <span style={styles.metricLabel}>闭环见效周期</span>
              </div>
              <div style={styles.metricDivider} />
              <div style={styles.metricItem}>
                <strong style={styles.metricValue}>500+</strong>
                <span style={styles.metricLabel}>品牌已接入</span>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.detectSection}>
          <div style={styles.sectionInner}>
            <DetectForm
              embedded
              title="先做一次免费检测，再决定是否进入服务"
              description="用真实检测结果作为服务沟通起点。填写品牌名、行业、业务描述与检测问题，即可快速生成一份 MGEO 检测报告。"
            />
          </div>
        </section>

        <section style={styles.platformSection}>
          <div style={styles.sectionInner}>
            <div style={styles.sectionIntro}>
              <span style={styles.sectionBadge}>平台覆盖</span>
              <h2 style={styles.sectionTitle}>一次输入，统一查看多模型结果</h2>
            </div>
            <div style={styles.platformWrap}>
              {platformList.map((item) => (
                <div key={item} style={styles.platformPill}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.featureSection}>
          <div style={styles.sectionInner}>
            <div style={styles.sectionIntro}>
              <span style={styles.sectionBadge}>核心能力</span>
              <h2 style={styles.sectionTitle}>从检测入口到交付闭环的完整产品壳</h2>
            </div>
            <div style={styles.featureGrid}>
              {featureCards.map((item) => (
                <article key={item.title} style={styles.featureCard}>
                  <h3 style={styles.featureTitle}>{item.title}</h3>
                  <p style={styles.featureText}>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.opsSection}>
          <div style={styles.sectionInner}>
            <div style={styles.opsCard}>
              <div style={styles.sectionIntro}>
                <span style={styles.sectionBadge}>内部运维</span>
                <h2 style={styles.sectionTitle}>部署准备、环境变量、联调检查与健康状态已经整合成统一入口</h2>
                <p style={styles.opsText}>
                  站点进入试运营前后，可以直接从运维入口查看上线阻塞项、支付联调状态、cron 配置和系统健康结果，减少来回切页的成本。
                </p>
              </div>
              <div style={styles.opsActions}>
                <Link href="/ops" style={styles.primaryButton}>
                  进入运维入口
                </Link>
                <Link href="/deployment/health" style={styles.secondaryButton}>
                  查看健康检查
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section style={styles.pillarSection}>
          <div style={styles.sectionInner}>
            <div style={styles.sectionIntro}>
              <span style={styles.sectionBadge}>TCA 方法论</span>
              <h2 style={styles.sectionTitle}>围绕品牌一致性、覆盖度与权威性持续优化</h2>
            </div>
            <div style={styles.pillarGrid}>
              {pillars.map((item) => (
                <article key={item.title} style={styles.pillarCard}>
                  <div style={styles.pillarName}>{item.title}</div>
                  <p style={styles.pillarText}>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

      </main>
    </SiteShell>
  );
}

const styles: Record<string, React.CSSProperties> = {
  hero: {
    background:
      "radial-gradient(circle at top, rgba(15,139,127,0.18), transparent 32%), linear-gradient(180deg, #0b1020 0%, #0d121e 55%, #111827 100%)",
    color: "#fff",
    padding: "56px 24px 92px",
  },
  heroInner: {
    maxWidth: 1240,
    margin: "0 auto",
    display: "grid",
    justifyItems: "center",
    textAlign: "center",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    padding: "0 18px",
    borderRadius: 999,
    background: "rgba(16, 185, 129, 0.14)",
    border: "1px solid rgba(16, 185, 129, 0.45)",
    color: "#2dd4bf",
    fontSize: 15,
    fontWeight: 700,
  },
  heroTitle: {
    margin: "22px 0 0",
    fontSize: 64,
    lineHeight: 1.08,
    letterSpacing: "-0.04em",
    maxWidth: 980,
  },
  heroText: {
    margin: "20px 0 0",
    fontSize: 22,
    lineHeight: 1.8,
    color: "rgba(255,255,255,0.72)",
    maxWidth: 980,
  },
  heroActions: {
    display: "flex",
    gap: 16,
    marginTop: 32,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 180,
    height: 54,
    padding: "0 24px",
    borderRadius: 999,
    background: "#ffffff",
    color: "#111827",
    textDecoration: "none",
    fontSize: 16,
    fontWeight: 800,
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 180,
    height: 54,
    padding: "0 24px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.06)",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: 16,
    fontWeight: 800,
  },
  metricRow: {
    width: "100%",
    maxWidth: 1100,
    display: "grid",
    gridTemplateColumns: "repeat(7, auto)",
    justifyContent: "center",
    alignItems: "center",
    gap: 28,
    marginTop: 46,
  },
  metricItem: {
    display: "grid",
    gap: 8,
    justifyItems: "center",
    minWidth: 150,
  },
  metricValue: {
    fontSize: 38,
    lineHeight: 1,
    fontWeight: 800,
    color: "#ffffff",
  },
  metricLabel: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
  },
  metricDivider: {
    width: 1,
    height: 64,
    background: "rgba(255,255,255,0.16)",
  },
  platformSection: {
    padding: "62px 24px 0",
  },
  featureSection: {
    padding: "62px 24px 0",
  },
  opsSection: {
    padding: "24px 24px 0",
  },
  pillarSection: {
    padding: "62px 24px 0",
  },
  detectSection: {
    padding: "28px 24px 0",
  },
  sectionInner: {
    maxWidth: 1240,
    margin: "0 auto",
  },
  sectionIntro: {
    display: "grid",
    gap: 16,
    justifyItems: "center",
    textAlign: "center",
    marginBottom: 28,
  },
  sectionBadge: {
    display: "inline-flex",
    height: 34,
    padding: "0 14px",
    alignItems: "center",
    borderRadius: 999,
    background: "#edf8f6",
    color: "#0f8b7f",
    fontSize: 14,
    fontWeight: 700,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 42,
    lineHeight: 1.15,
    letterSpacing: "-0.03em",
    color: "#101828",
    maxWidth: 880,
  },
  platformWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 14,
    justifyContent: "center",
  },
  platformPill: {
    height: 50,
    padding: "0 18px",
    borderRadius: 999,
    background: "#ffffff",
    border: "1px solid #dbe3eb",
    display: "inline-flex",
    alignItems: "center",
    fontSize: 16,
    fontWeight: 700,
    color: "#344054",
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 20,
  },
  opsCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 28,
    display: "grid",
    gap: 18,
  },
  opsText: {
    margin: 0,
    fontSize: 16,
    lineHeight: 1.85,
    color: "#667085",
    maxWidth: 860,
  },
  opsActions: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  featureCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 28,
    minHeight: 180,
  },
  featureTitle: {
    margin: 0,
    fontSize: 28,
    lineHeight: 1.2,
    color: "#101828",
  },
  featureText: {
    margin: "14px 0 0",
    fontSize: 17,
    lineHeight: 1.9,
    color: "#667085",
  },
  pillarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 20,
  },
  pillarCard: {
    background: "#0f172a",
    borderRadius: 24,
    padding: 28,
    minHeight: 210,
  },
  pillarName: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: 800,
    letterSpacing: "-0.03em",
  },
  pillarText: {
    margin: "14px 0 0",
    color: "rgba(255,255,255,0.72)",
    fontSize: 17,
    lineHeight: 1.9,
  },
};
