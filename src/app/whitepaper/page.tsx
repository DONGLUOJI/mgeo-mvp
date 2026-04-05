import Link from "next/link";
import { SiteShell } from "@/components/marketing/SiteShell";

const WHITEPAPER_NAV_ITEMS = [
  { href: "/#detector", label: "免费检测" },
  { href: "/ranking", label: "排名" },
  { href: "/pricing", label: "服务方案" },
  { href: "/cases", label: "案例成果" },
  { href: "/#contact", label: "联系我们" },
  { href: "/whitepaper", label: "MGEO白皮书" },
];

const toc = [
  "1. 为什么品牌需要关注 AI 搜索中的可见性",
  "2. MGEO 的核心判断框架：TCA",
  "3. 多平台检测如何转化为服务决策",
  "4. 30 天交付闭环如何落地",
  "5. 品牌负责人如何使用这份方法论",
];

const chapters = [
  {
    title: "为什么品牌需要关注 AI 搜索中的可见性",
    paragraphs: [
      "传统搜索正在被生成式回答、推荐摘要和融合式检索重新定义。品牌不只是争夺关键词排名，而是在争夺是否会被模型稳定提及、是否会被正确理解、是否会被推荐。",
      "如果品牌在多个模型中的叙事不一致，或者缺乏可信信源支撑，即使已有内容资产，也很难在 AI 搜索结果里获得稳定露出。",
    ],
  },
  {
    title: "MGEO 的核心判断框架：TCA",
    paragraphs: [
      "MGEO 将品牌在 AI 搜索中的表现拆成三个维度：Consistency、Coverage、Authority。Consistency 看品牌定位是否统一，Coverage 看关键平台和场景是否被覆盖，Authority 看外部信源是否足够可信。",
      "这三个维度结合后，可以避免只看“有没有提到”这种单点判断，而是把品牌真正能不能被理解、被引用、被推荐一起看清楚。",
    ],
  },
  {
    title: "多平台检测如何转化为服务决策",
    paragraphs: [
      "检测的意义不是生成一份漂亮报告，而是帮助品牌判断当前最应该优先补什么。如果一致性最差，就先统一叙事；如果覆盖度最低，就先补关键问答与场景入口；如果权威性不足，就先补可信内容与引用支撑。",
      "因此，检测页、报告页和服务方案页应该是同一条链路，而不是彼此割裂的静态页面。",
    ],
  },
  {
    title: "30 天交付闭环如何落地",
    paragraphs: [
      "在 MGEO 体系下，第一阶段完成品牌审计与评分，第二阶段完成内容适配与平台发布，第三阶段完成持续监测与复盘迭代。每个阶段都有明确输入、动作和产出。",
      "这也是为什么首页里的检测入口、流程说明、报告预览和联系咨询需要保持连续，因为它们共同承担了从认知到转化的完整路径。",
    ],
  },
  {
    title: "品牌负责人如何使用这份方法论",
    paragraphs: [
      "如果你是品牌负责人，这份白皮书最重要的作用不是教你记住概念，而是帮助你建立一个判断顺序：先看有没有被提及，再看是否被正确理解，最后看是否具备稳定推荐条件。",
      "有了这个顺序，检测结果才会真正指导后续预算、内容与执行优先级。",
    ],
  },
];

export default function WhitepaperPage() {
  return (
    <SiteShell current="/whitepaper" navItems={WHITEPAPER_NAV_ITEMS} ctaHref="/register" ctaLabel="注册" hideFooter>
      <main style={styles.page}>
        <section style={styles.hero}>
          <h1 style={styles.heroTitle}>MGEO白皮书</h1>
          <p style={styles.heroSubtitle}>一份帮助品牌理解 AI 搜索可见性、检测逻辑与交付路径的说明文档。</p>
          <div style={styles.heroMeta}>
            <span>董逻辑MGEO 出品</span>
            <span>版本 2026.04</span>
            <span>适合品牌负责人 / 市场负责人 / 增长负责人</span>
          </div>
        </section>

        <section style={styles.mainContent}>
          <section style={styles.tocCard}>
            <h2 style={styles.tocTitle}>目录</h2>
            <ul style={styles.tocList}>
              {toc.map((item) => (
                <li key={item} style={styles.tocItem}>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {chapters.map((chapter) => (
            <section key={chapter.title} style={styles.chapter}>
              <h2 style={styles.chapterTitle}>{chapter.title}</h2>
              {chapter.paragraphs.map((paragraph) => (
                <p key={paragraph} style={styles.paragraph}>
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <section style={styles.ctaPanel}>
            <div>
              <h2 style={styles.ctaTitle}>看完白皮书，下一步更适合直接做一次检测</h2>
              <p style={styles.ctaText}>先用真实品牌问题生成一份检测报告，再判断你当前更适合补一致性、覆盖度还是权威性。</p>
            </div>
            <div style={styles.ctaActions}>
              <Link href="/#detector" style={styles.primaryButton}>
                回到免费检测
              </Link>
              <Link href="/pricing" style={styles.secondaryButton}>
                查看服务方案
              </Link>
            </div>
          </section>
        </section>
      </main>
    </SiteShell>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: "#ffffff",
    minHeight: "100vh",
  },
  hero: {
    background: "linear-gradient(180deg, #1a1f2e 0%, #2d3748 100%)",
    padding: "120px 40px 80px",
    textAlign: "center",
    marginTop: 52,
  },
  heroTitle: {
    margin: 0,
    fontSize: 48,
    fontWeight: 700,
    color: "#f5f5f7",
  },
  heroSubtitle: {
    fontSize: 21,
    color: "#a1a1a6",
    maxWidth: 800,
    margin: "16px auto 40px",
  },
  heroMeta: {
    display: "flex",
    justifyContent: "center",
    gap: 40,
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    flexWrap: "wrap",
  },
  mainContent: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "60px 40px",
  },
  tocCard: {
    background: "#f5f5f7",
    borderRadius: 16,
    padding: 32,
    marginBottom: 60,
  },
  tocTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 600,
    color: "#1d1d1f",
  },
  tocList: {
    listStyle: "none",
    margin: "24px 0 0",
    padding: 0,
  },
  tocItem: {
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
    fontSize: 16,
    color: "#1d1d1f",
  },
  chapter: {
    marginBottom: 80,
  },
  chapterTitle: {
    margin: 0,
    fontSize: 32,
    fontWeight: 700,
    color: "#1d1d1f",
    paddingBottom: 16,
    borderBottom: "2px solid #1d1d1f",
  },
  paragraph: {
    fontSize: 17,
    lineHeight: 1.8,
    color: "#4b5563",
    margin: "20px 0 0",
  },
  ctaPanel: {
    background: "linear-gradient(135deg, #0d1117 0%, #132f27 100%)",
    color: "#ffffff",
    borderRadius: 30,
    padding: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 28,
    flexWrap: "wrap",
  },
  ctaTitle: {
    margin: 0,
    fontSize: 34,
  },
  ctaText: {
    margin: "10px 0 0",
    color: "rgba(255,255,255,0.78)",
    fontSize: 18,
    lineHeight: 1.55,
    maxWidth: 620,
  },
  ctaActions: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "16px 22px",
    borderRadius: 14,
    background: "#ffffff",
    color: "#111827",
    textDecoration: "none",
    fontWeight: 700,
  },
  secondaryButton: {
    padding: "16px 22px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 600,
    background: "rgba(255,255,255,0.04)",
  },
};
