import type { Metadata } from "next";
import Link from "next/link";

import { SiteShell } from "@/components/marketing/SiteShell";

export const metadata: Metadata = {
  title: "MGEO标准白皮书 - 董逻辑MGEO",
  description: "查看 MGEO 标准白皮书的完整目录、TCA 模型、实施标准、行业案例与附录内容。",
};

const toc = [
  { id: "ch1", title: "第一章：前言与背景" },
  { id: "ch2", title: "第二章：MGEO基础理论" },
  { id: "ch3", title: "第三章：MGEO三支柱模型（TCA Model）" },
  { id: "ch4", title: "第四章：MGEO技术架构" },
  { id: "ch5", title: "第五章：MGEO实施标准" },
  { id: "ch6", title: "第六章：MGEO评估体系" },
  { id: "ch7", title: "第七章：行业案例分析" },
  { id: "ch8", title: "第八章：MGEO工具与生态" },
  { id: "ch9", title: "第九章：未来展望" },
  { id: "appendix", title: "附录" },
];

const previewPoints = [
  "9 章主体内容 + 附录，覆盖理论、架构、实施、评估、案例与生态。",
  "第三章完整补齐 Consistency / Coverage / Authority 的关键指标与优化策略。",
  "补全成熟度等级、KPIs、行业案例、模型对照表和实施检查清单。",
];

const comparisonHeaders = ["维度", "SEO", "GEO", "MGEO"];
const comparisonRows = [
  ["优化对象", "搜索引擎", "单一AI模型", "多模型+融合机制"],
  ["核心指标", "排名", "提及率", "一致性+覆盖度+权威性"],
  ["技术复杂度", "中", "中高", "高"],
  ["适用场景", "传统搜索", "AI搜索初期", "AI融合时代"],
];

const maturityHeaders = ["等级", "名称", "TCA评分", "特征"];
const maturityRows = [
  ["L0", "初始级", "<30", "仅1-2个平台有提及，描述混乱"],
  ["L1", "基础级", "30-50", "主流平台有覆盖，但一致性差"],
  ["L2", "进阶级", "50-70", "覆盖较全，一致性良好"],
  ["L3", "优化级", "70-85", "全平台覆盖，高一致性，高权威"],
  ["L4", "领先级", "85-100", "融合场景下的推荐优先品牌"],
];

const kpiHeaders = ["指标", "目标值", "说明"];
const kpiRows = [
  ["品牌提及一致性率", ">90%", "跨平台描述统一度"],
  ["多平台覆盖指数", ">80%", "主流模型可见性"],
  ["融合场景可见性", "Top 3", "模型融合推荐排名"],
  ["负面信息控制率", "<5%", "负面信息占比"],
];

const reportHeaders = ["报告类型", "频率", "内容要点"];
const reportRows = [
  ["日报", "每日", "异常波动预警"],
  ["周报", "每周", "TCA趋势分析"],
  ["月报", "每月", "竞品对比与策略调整"],
  ["季报", "每季", "MGEO成熟度等级评估"],
];

const caseHeaders = ["项目", "内容"];
const caseRows = {
  crossBorder: [
    ["背景", "出海品牌，多语言多平台"],
    ["挑战", "海外AI模型（GPT/Claude）与国产模型认知差异"],
    ["策略", "跨文化内容适配+多语言信源建设"],
    ["成果", "MGEO Score从42提升至78"],
  ],
  localService: [
    ["背景", "连锁餐饮，强地域属性"],
    ["挑战", "本地AI搜索（地图/生活服务平台）优化"],
    ["策略", "POI数据统一+UGC内容管理"],
    ["成果", "“附近火锅推荐”融合结果Top 1"],
  ],
  b2b: [
    ["背景", "工业设备，专业性强"],
    ["挑战", "专业术语在多模型中的理解差异"],
    ["策略", "技术白皮书分发+行业媒体背书"],
    ["成果", "专业场景咨询量提升300%"],
  ],
};

const toolsHeaders = ["工具名称", "功能描述"];
const toolsRows = [
  ["mgeo-router", "多模型一致性监测"],
  ["mgeo-analyzer", "TCA评分与分析"],
  ["mgeo-optimizer", "自动化优化建议"],
];

const glossaryHeaders = ["术语", "英文全称", "定义"];
const glossaryRows = [
  ["模型融合", "Model Fusion", "多个AI模型协同输出结果的机制"],
  ["TCA模型", "Three-Pillar Model", "MGEO的三支柱评估框架"],
  ["一致性评分", "Consistency Score", "品牌信息跨平台统一度量化指标"],
];

const modelHeaders = ["模型", "内容偏好", "更新周期", "信源权重", "优化建议"];
const modelRows = [
  ["DeepSeek", "知乎/公众号", "3-7天", "高", "长文深度内容"],
  ["豆包", "抖音/头条", "1-3天", "中", "短视频+图文"],
  ["Kimi", "长文档/论文", "3-5天", "高", "结构化长内容"],
  ["元宝", "腾讯生态", "2-4天", "中", "微信公众号内容"],
  ["智谱", "学术/专业", "5-7天", "高", "权威学术来源"],
];

const checklistGroups = [
  {
    title: "技术准备项",
    items: ["多模型API接入配置", "数据采集与存储方案", "监测系统部署"],
  },
  {
    title: "内容准备项",
    items: ["品牌叙事框架统一", "多平台内容矩阵梳理", "权威信源清单建立"],
  },
  {
    title: "执行与监测项",
    items: ["TCA基准测试", "周/月报模板配置", "异常波动响应机制"],
  },
];

const references = [
  "生成式AI推荐算法研究论文",
  "品牌一致性管理理论文献",
  "多源验证模型与信息一致性研究资料",
  "AI搜索与模型融合场景公开行业报告",
];

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <table style={styles.table}>
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header} style={styles.th}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.join("-")}>
            {row.map((cell) => (
              <td key={cell} style={styles.td}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={styles.list}>
      {items.map((item) => (
        <li key={item} style={styles.listItem}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function WhitepaperPage() {
  return (
    <SiteShell current="/whitepaper" hideFooter>
      <main style={styles.page}>
        <section style={styles.hero}>
          <h1 style={styles.heroTitle}>MGEO标准白皮书</h1>
          <p style={styles.heroSubtitle}>Multi-model Generative Engine Optimization Standard White Paper</p>
          <div style={styles.heroMeta}>
            <span>提出者：董逻辑</span>
          </div>
        </section>

        <div style={styles.mainContent}>
          <section style={styles.toc}>
            <div style={styles.tocHead}>
              <div>
                <h2 style={styles.tocTitle}>目录</h2>
                <p style={styles.tocText}>当前页已同步为完整版本，帮助你系统理解 MGEO 的理论框架、实施标准与行业案例。</p>
              </div>
              <span style={styles.previewBadge}>完整同步</span>
            </div>
            <ul style={styles.tocList}>
              {toc.map((item) => (
                <li key={item.id} style={styles.tocItem}>
                  <a href={`#${item.id}`} style={styles.tocLink}>
                    <span style={styles.tocTitleRow}>
                      <span>{item.title}</span>
                      <span style={styles.summaryPill}>完整</span>
                    </span>
                    <span>→</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section style={styles.previewPanel}>
            <div style={styles.previewCopy}>
              <div style={styles.previewEyebrow}>阅读建议</div>
              <h2 style={styles.previewTitle}>先理解完整方法论，再回到检测页验证自己的品牌问题</h2>
              <p style={styles.previewText}>
                白皮书页当前已经同步为完整内容。你可以先系统看完理论、架构、标准与案例，再结合真实检测结果判断品牌当前最该优先补的一项。
              </p>
            </div>
            <div style={styles.previewMeta}>
              {previewPoints.map((point) => (
                <div key={point} style={styles.previewItem}>
                  {point}
                </div>
              ))}
              <div style={styles.previewActions}>
                <Link href="/#detector" style={styles.previewPrimary}>
                  回到免费检测
                </Link>
                <Link href="/pricing" style={styles.previewSecondary}>
                  查看服务方案
                </Link>
              </div>
            </div>
          </section>

          <section id="ch1" style={styles.chapter}>
            <h2 style={styles.chapterTitle}>
              第一章：前言与背景
              <span style={styles.chapterBadge}>完整</span>
            </h2>
            <h3 style={styles.chapterSubtitle}>1.1 生成式AI的范式转移</h3>
            <BulletList
              items={[
                "从搜索引擎到生成式引擎",
                "单一模型到模型融合的演进",
                "品牌可见性面临的全新挑战",
              ]}
            />
            <h3 style={styles.chapterSubtitle}>1.2 为什么需要MGEO？</h3>
            <BulletList items={["传统SEO/GEO的局限性", '模型融合时代的"民主投票"机制', "品牌一致性的商业价值"]} />
            <h3 style={styles.chapterSubtitle}>1.3 MGEO的诞生</h3>
            <BulletList items={["概念提出背景", "与传统GEO的本质区别", "行业价值与应用前景"]} />
          </section>

          <section id="ch2" style={styles.chapter}>
            <h2 style={styles.chapterTitle}>
              第二章：MGEO基础理论
              <span style={styles.chapterBadge}>完整</span>
            </h2>
            <h3 style={styles.chapterSubtitle}>2.1 核心定义</h3>
            <div style={styles.quoteBox}>
              <p style={styles.quoteText}>
                MGEO（Multi-model Generative Engine Optimization）：通过系统性优化品牌信息在多个生成式AI模型中的一致性（Consistency）、覆盖度（Coverage）和权威性（Authority），确保在模型融合（Model
                Fusion）场景下获得最大曝光权重与推荐优先级的策略体系。
              </p>
            </div>
            <h3 style={styles.chapterSubtitle}>2.2 理论基础</h3>
            <BulletList items={["信息一致性理论（Information Consistency Theory）", "多源验证模型（Multi-source Validation Model）", "生成式引擎的推荐算法机制解析"]} />
            <h3 style={styles.chapterSubtitle}>2.3 MGEO vs GEO vs SEO</h3>
            <DataTable headers={comparisonHeaders} rows={comparisonRows} />
          </section>

          <section id="ch3" style={styles.chapter}>
            <h2 style={styles.chapterTitle}>
              第三章：MGEO三支柱模型（TCA Model）
              <span style={styles.chapterBadge}>完整</span>
            </h2>
            <h3 style={styles.chapterSubtitle}>3.1 Consistency（一致性）</h3>
            <p style={styles.paragraph}>定义：品牌信息在不同AI模型中的描述统一度。</p>
            <h4 style={styles.subsectionLabel}>关键指标</h4>
            <BulletList items={["DCC（Description Consistency Coefficient）：描述一致性系数", "ICR（Information Conflict Rate）：信息冲突率", "BPD（Brand Position Deviation）：品牌定位偏差度"]} />
            <h4 style={styles.subsectionLabel}>优化策略</h4>
            <BulletList items={["统一品牌叙事框架（Brand Narrative Framework）", "跨平台内容校准机制", "实时一致性监测与修正"]} />

            <h3 style={styles.chapterSubtitle}>3.2 Coverage（覆盖度）</h3>
            <p style={styles.paragraph}>定义：品牌在主流AI模型中的可见性覆盖范围。</p>
            <h4 style={styles.subsectionLabel}>关键指标</h4>
            <BulletList items={["PCR（Platform Coverage Rate）：平台覆盖率", "KCB（Keyword Coverage Breadth）：关键词覆盖广度", "LSP（Long-tail Scenario Penetration）：长尾场景渗透率"]} />
            <h4 style={styles.subsectionLabel}>优化策略</h4>
            <BulletList items={["多平台内容分发矩阵", "模型偏好适配（DeepSeek爱知乎，豆包爱抖音）", "盲区识别与填补机制"]} />

            <h3 style={styles.chapterSubtitle}>3.3 Authority（权威性）</h3>
            <p style={styles.paragraph}>定义：品牌信息被AI模型采信的程度。</p>
            <h4 style={styles.subsectionLabel}>关键指标</h4>
            <BulletList items={["SQS（Source Quality Score）：信源质量评分", "CVI（Cross-Validation Index）：交叉验证指数", "QD（Quotation Depth）：引用深度"]} />
            <h4 style={styles.subsectionLabel}>优化策略</h4>
            <BulletList items={["权威信源建设（官网/百科/行业媒体）", "UGC与PGC协同验证", "专业度与可信度内容强化"]} />
          </section>

          <section id="ch4" style={styles.chapter}>
            <h2 style={styles.chapterTitle}>
              第四章：MGEO技术架构
              <span style={styles.chapterBadge}>完整</span>
            </h2>
            <h3 style={styles.chapterSubtitle}>4.1 多模型监测体系</h3>
            <BulletList items={["主流模型API接入（DeepSeek/豆包/Kimi/元宝/智谱）", "实时查询与结果抓取", "结构化数据存储与分析"]} />
            <h3 style={styles.chapterSubtitle}>4.2 一致性分析引擎</h3>
            <BulletList items={["NLP语义相似度计算", "实体识别与对齐（Entity Alignment）", "冲突检测与预警算法"]} />
            <h3 style={styles.chapterSubtitle}>4.3 融合风险评估模型</h3>
            <BulletList items={["Model Fusion Simulator：融合模拟器", "可见性预测算法", "风险等级评估（HIGH/MEDIUM/LOW）"]} />
            <h3 style={styles.chapterSubtitle}>4.4 优化建议生成器</h3>
            <BulletList items={["基于TCA评分的诊断报告", "自动化优化策略推荐", "A/B测试与效果追踪"]} />
          </section>

          <section id="ch5" style={styles.chapter}>
            <h2 style={styles.chapterTitle}>
              第五章：MGEO实施标准
              <span style={styles.chapterBadge}>完整</span>
            </h2>
            <h3 style={styles.chapterSubtitle}>5.1 MGEO成熟度等级</h3>
            <DataTable headers={maturityHeaders} rows={maturityRows} />
            <h3 style={styles.chapterSubtitle}>5.2 实施流程（5步法）</h3>
            <div style={styles.formula}>Audit（审计）→ Strategy（策略）→ Content（内容）→ Monitor（监测）→ Optimize（优化）</div>
            <BulletList
              items={[
                "Audit：现状评估与TCA基准测试",
                "Strategy：基于等级的定制化优化方案",
                "Content：多平台适配的内容矩阵建设",
                "Monitor：7×24小时TCA指标追踪",
                "Optimize：数据驱动的持续迭代",
              ]}
            />
            <h3 style={styles.chapterSubtitle}>5.3 行业适配标准</h3>
            <BulletList items={["B2B企业MGEO标准", "消费品牌MGEO标准", "本地服务MGEO标准", "跨境电商MGEO标准"]} />
          </section>

          <section id="ch6" style={styles.chapter}>
            <h2 style={styles.chapterTitle}>
              第六章：MGEO评估体系
              <span style={styles.chapterBadge}>完整</span>
            </h2>
            <h3 style={styles.chapterSubtitle}>6.1 MGEO Score（综合评分）</h3>
            <div style={styles.formula}>MGEO Score = (Consistency × 0.4) + (Coverage × 0.3) + (Authority × 0.3)</div>
            <p style={styles.paragraph}>满分100分，合格线60分，优秀线80分。</p>
            <h3 style={styles.chapterSubtitle}>6.2 关键绩效指标（KPIs）</h3>
            <DataTable headers={kpiHeaders} rows={kpiRows} />
            <h3 style={styles.chapterSubtitle}>6.3 监测与报告规范</h3>
            <DataTable headers={reportHeaders} rows={reportRows} />
          </section>

          <section id="ch7" style={styles.chapter}>
            <h2 style={styles.chapterTitle}>
              第七章：行业案例分析
              <span style={styles.chapterBadge}>完整</span>
            </h2>
            <h3 style={styles.chapterSubtitle}>7.1 案例一：跨境电商品牌（Anker模式）</h3>
            <DataTable headers={caseHeaders} rows={caseRows.crossBorder} />
            <h3 style={styles.chapterSubtitle}>7.2 案例二：本地服务企业（海底捞模式）</h3>
            <DataTable headers={caseHeaders} rows={caseRows.localService} />
            <h3 style={styles.chapterSubtitle}>7.3 案例三：B2B制造企业（隐形冠军模式）</h3>
            <DataTable headers={caseHeaders} rows={caseRows.b2b} />
          </section>

          <section id="ch8" style={styles.chapter}>
            <h2 style={styles.chapterTitle}>
              第八章：MGEO工具与生态
              <span style={styles.chapterBadge}>完整</span>
            </h2>
            <h3 style={styles.chapterSubtitle}>8.1 开源工具</h3>
            <DataTable headers={toolsHeaders} rows={toolsRows} />
            <h3 style={styles.chapterSubtitle}>8.2 商业解决方案</h3>
            <BulletList items={["MGEO SaaS平台", "企业私有化部署", "MGEO认证咨询服务"]} />
            <h3 style={styles.chapterSubtitle}>8.3 生态合作</h3>
            <BulletList items={["与AI模型厂商的合作标准", "与内容平台的对接规范", "与营销服务商的协作流程"]} />
          </section>

          <section id="ch9" style={styles.chapter}>
            <h2 style={styles.chapterTitle}>
              第九章：未来展望
              <span style={styles.chapterBadge}>完整</span>
            </h2>
            <h3 style={styles.chapterSubtitle}>9.1 技术趋势</h3>
            <BulletList items={["实时MGEO（Real-time MGEO）", "预测性MGEO（Predictive MGEO）", "自动化MGEO（Auto-MGEO）"]} />
            <h3 style={styles.chapterSubtitle}>9.2 行业演进</h3>
            <BulletList items={["MGEO标准化进程", "MGEO认证体系建立", "MGEO行业协会筹建"]} />
            <h3 style={styles.chapterSubtitle}>9.3 挑战与应对</h3>
            <BulletList items={["模型黑盒化加剧", "数据隐私与合规", "跨国MGEO的复杂性"]} />
          </section>

          <section id="appendix" style={styles.chapter}>
            <h2 style={styles.chapterTitle}>
              附录
              <span style={styles.chapterBadge}>完整</span>
            </h2>
            <h3 style={styles.chapterSubtitle}>附录A：术语表</h3>
            <DataTable headers={glossaryHeaders} rows={glossaryRows} />
            <h3 style={styles.chapterSubtitle}>附录B：主流AI模型特性对照表</h3>
            <DataTable headers={modelHeaders} rows={modelRows} />
            <h3 style={styles.chapterSubtitle}>附录C：MGEO实施检查清单</h3>
            {checklistGroups.map((group) => (
              <div key={group.title} style={styles.appendixGroup}>
                <h4 style={styles.subsectionLabel}>{group.title}</h4>
                <BulletList items={group.items} />
              </div>
            ))}
            <h3 style={styles.chapterSubtitle}>附录D：参考文献</h3>
            <BulletList items={references} />
          </section>

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
        </div>

        <footer style={styles.footer}>
          <div style={styles.footerCopyright}>Copyright © 2026 董逻辑MGEO. 保留所有权利。</div>
        </footer>
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
    fontSize: 16,
    fontWeight: 500,
    flexWrap: "wrap",
  },
  mainContent: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "60px 40px",
  },
  toc: {
    background: "#f5f5f7",
    borderRadius: 16,
    padding: 32,
    marginBottom: 60,
  },
  tocHead: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 18,
    flexWrap: "wrap",
  },
  tocTitle: {
    fontSize: 24,
    fontWeight: 600,
    margin: 0,
    color: "#1d1d1f",
  },
  tocText: {
    margin: "10px 0 0",
    maxWidth: 560,
    color: "#667085",
    fontSize: 15,
    lineHeight: 1.7,
  },
  previewBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 34,
    padding: "0 14px",
    borderRadius: 999,
    background: "#e9f7f3",
    color: "#0a7c66",
    fontWeight: 700,
    fontSize: 13,
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
  },
  tocLink: {
    color: "#1d1d1f",
    textDecoration: "none",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  tocTitleRow: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  summaryPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 24,
    padding: "0 10px",
    borderRadius: 999,
    background: "#ffffff",
    border: "1px solid #d7dde5",
    color: "#667085",
    fontSize: 12,
    fontWeight: 700,
  },
  previewPanel: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: 22,
    padding: "30px 32px",
    borderRadius: 24,
    background: "#f8f8f6",
    border: "1px solid #ece8df",
    marginBottom: 60,
  },
  previewCopy: {
    display: "grid",
    alignContent: "start",
    gap: 14,
  },
  previewEyebrow: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0a7c66",
  },
  previewTitle: {
    margin: 0,
    fontSize: 34,
    lineHeight: 1.18,
    color: "#1d1d1f",
    letterSpacing: "-0.03em",
  },
  previewText: {
    margin: 0,
    fontSize: 16,
    lineHeight: 1.8,
    color: "#667085",
  },
  previewMeta: {
    display: "grid",
    gap: 12,
    alignContent: "start",
  },
  previewItem: {
    padding: "14px 16px",
    borderRadius: 16,
    background: "#ffffff",
    border: "1px solid #e7e2d9",
    color: "#3f4652",
    fontSize: 14,
    lineHeight: 1.7,
  },
  previewActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 8,
  },
  previewPrimary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    padding: "0 18px",
    borderRadius: 14,
    background: "#0fbc8c",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 700,
  },
  previewSecondary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    padding: "0 18px",
    borderRadius: 14,
    background: "#ffffff",
    color: "#111827",
    textDecoration: "none",
    fontWeight: 700,
    border: "1px solid #d7dde5",
  },
  chapter: {
    marginBottom: 80,
  },
  chapterTitle: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    fontSize: 32,
    fontWeight: 700,
    color: "#1d1d1f",
    margin: 0,
    paddingBottom: 16,
    borderBottom: "2px solid #1d1d1f",
  },
  chapterBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 28,
    padding: "0 12px",
    borderRadius: 999,
    background: "#eef3f8",
    color: "#455468",
    fontSize: 12,
    fontWeight: 700,
  },
  chapterSubtitle: {
    fontSize: 24,
    fontWeight: 600,
    color: "#1d1d1f",
    margin: "40px 0 20px",
  },
  subsectionLabel: {
    margin: "20px 0 12px",
    fontSize: 16,
    fontWeight: 700,
    color: "#1d1d1f",
  },
  paragraph: {
    fontSize: 17,
    lineHeight: 1.8,
    color: "#4b5563",
    margin: "0 0 20px",
  },
  list: {
    margin: "20px 0",
    paddingLeft: 28,
  },
  listItem: {
    fontSize: 17,
    lineHeight: 1.8,
    color: "#4b5563",
    marginBottom: 12,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    margin: "32px 0",
    fontSize: 15,
  },
  th: {
    background: "#1d1d1f",
    color: "#ffffff",
    padding: 16,
    textAlign: "left",
    fontWeight: 600,
  },
  td: {
    padding: 16,
    borderBottom: "1px solid #e5e7eb",
    color: "#4b5563",
    verticalAlign: "top",
  },
  quoteBox: {
    background: "#f5f5f7",
    borderLeft: "4px solid #1d1d1f",
    padding: 24,
    margin: "32px 0",
    borderRadius: "0 12px 12px 0",
  },
  quoteText: {
    margin: 0,
    fontSize: 18,
    fontWeight: 500,
    color: "#1d1d1f",
    lineHeight: 1.8,
  },
  formula: {
    background: "#f5f5f7",
    padding: 24,
    borderRadius: 12,
    textAlign: "center",
    margin: "32px 0",
    fontSize: 20,
    fontWeight: 600,
    color: "#1d1d1f",
  },
  appendixGroup: {
    marginBottom: 10,
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
  footer: {
    padding: "18px 24px 22px",
    borderTop: "1px solid #e4e8ef",
    textAlign: "center",
    background: "#1f1f22",
  },
  footerCopyright: {
    color: "#8d93a0",
    fontSize: 14,
  },
};
