import Link from "next/link";
import { SiteShell } from "@/components/marketing/SiteShell";

const cases = [
  {
    tag: "企业服务",
    title: "品牌定位混乱的咨询公司",
    summary: "30 天内品牌理解一致性明显提升，稳定提及平台增加 3 个。",
    detail: "通过统一品牌叙事、补齐关键内容支撑和诊断报告解读，让多模型对品牌的理解从泛化服务商收敛到明确的 AI 搜索增长服务。",
  },
  {
    tag: "本地生活",
    title: "区域门店业务的 AI 覆盖不足",
    summary: "重点问题场景覆盖提升 48%，区域推荐出现率进入 Top 3。",
    detail: "围绕本地场景、用户决策问题和门店关键词补齐内容入口，缩短从被识别到被推荐的距离。",
  },
  {
    tag: "品牌增长",
    title: "已有内容基础但信源偏弱的品牌",
    summary: "权威性评分提升 2.1 分，高质量引用入口增加 4 个。",
    detail: "通过补强外部支撑内容和可信引用结构，让模型对品牌给出更稳定、更可信的表达与推荐。",
  },
];

export default function CasesPage() {
  return (
    <SiteShell current="/cases">
      <main style={styles.page}>
        <section style={styles.hero}>
          <span style={styles.badge}>案例成果</span>
          <h1 style={styles.title}>用结构化案例说明品牌在 AI 搜索中的变化路径</h1>
          <p style={styles.text}>
            从问题识别、执行动作到结果变化，案例页用于展示 MGEO 服务的实际交付方式与增长结果。
          </p>
        </section>

        <section style={styles.grid}>
          {cases.map((item) => (
            <article key={item.title} style={styles.card}>
              <span style={styles.tag}>{item.tag}</span>
              <h2 style={styles.cardTitle}>{item.title}</h2>
              <p style={styles.summary}>{item.summary}</p>
              <p style={styles.detail}>{item.detail}</p>
              <Link href="/detect" style={styles.link}>
                先检测我的品牌
              </Link>
            </article>
          ))}
        </section>
      </main>
    </SiteShell>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1240,
    margin: "0 auto",
    padding: "64px 24px 0",
  },
  hero: {
    display: "grid",
    gap: 16,
    justifyItems: "center",
    textAlign: "center",
    marginBottom: 36,
  },
  badge: {
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
  title: {
    margin: 0,
    fontSize: 48,
    lineHeight: 1.12,
    letterSpacing: "-0.04em",
  },
  text: {
    margin: 0,
    maxWidth: 860,
    color: "#667085",
    fontSize: 18,
    lineHeight: 1.8,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 20,
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 28,
    padding: 28,
    display: "grid",
    gap: 16,
  },
  tag: {
    display: "inline-flex",
    width: "fit-content",
    height: 34,
    padding: "0 14px",
    borderRadius: 999,
    background: "#edf8f6",
    color: "#0f8b7f",
    alignItems: "center",
    fontWeight: 700,
  },
  cardTitle: {
    margin: 0,
    fontSize: 34,
    lineHeight: 1.2,
    letterSpacing: "-0.03em",
  },
  summary: {
    margin: 0,
    fontSize: 24,
    lineHeight: 1.5,
    color: "#0f8b7f",
    fontWeight: 700,
  },
  detail: {
    margin: 0,
    fontSize: 17,
    lineHeight: 1.9,
    color: "#475467",
  },
  link: {
    color: "#111827",
    fontWeight: 700,
    textDecoration: "none",
  },
};
