import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { KeywordTable } from "@/components/dashboard/keyword-table";
import { ScoreCard } from "@/components/dashboard/score-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { authOptions } from "@/lib/auth/auth-options";
import { getDashboardSummary } from "@/lib/db/repository";

const TREND_RANGES = [7, 30, 90] as const;

export default async function DashboardEntryPage({
  searchParams,
}: {
  searchParams?: Promise<{ days?: string; billing?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = (await searchParams) || {};
  const requestedDays = Number(params.days || 30);
  const billingState = params.billing || "";
  const trendDays = TREND_RANGES.includes(requestedDays as (typeof TREND_RANGES)[number])
    ? requestedDays
    : 30;

  const summary = await getDashboardSummary(session.user.id, trendDays);
  const points = summary.trend.map((item) => ({
    date: item.date,
    tcaTotal: item.tcaTotal,
  }));

  const isFree = (summary.user?.plan || "free") === "free";

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.badge}>用户 Dashboard</div>
          <h1 style={styles.title}>查看关键词监控、TCA 变化与当前检测额度</h1>
          <p style={styles.text}>
            当前账号：{summary.user?.email || session.user.email}。这里聚合了你的关键词监控状态、最近趋势和账户检测配额。
          </p>
          <div style={styles.actions}>
            <Link href="/detect" style={styles.primaryButton}>
              继续免费检测
            </Link>
            <Link href="/dashboard/keywords" style={styles.secondaryButton}>
              管理关键词
            </Link>
            <Link href="/ops" style={styles.secondaryButton}>
              运维入口
            </Link>
            <Link href="/deployment" style={styles.secondaryButton}>
              部署准备
            </Link>
            <Link href="/deployment/health" style={styles.secondaryButton}>
              健康检查
            </Link>
            <Link href="/pricing" style={styles.secondaryButton}>
              查看套餐
            </Link>
          </div>
        </section>

        {billingState === "success" ? (
          <section style={styles.billingBannerSuccess}>
            <div style={styles.billingBannerTitle}>支付完成，欢迎继续在 Dashboard 查看最新套餐状态</div>
            <div style={styles.billingBannerText}>
              如果套餐还没即时变化，可以去定价页点击“刷新套餐状态”，或直接查看下方额度与监控能力是否已经更新。
            </div>
          </section>
        ) : null}

        {billingState === "cancel" ? (
          <section style={styles.billingBannerCancel}>
            <div style={styles.billingBannerTitle}>本次升级已取消，你仍可继续使用当前套餐</div>
            <div style={styles.billingBannerText}>
              当前数据和检测历史不会受影响。你可以稍后重新升级，或先继续使用现有额度与功能。
            </div>
          </section>
        ) : null}

        <section style={styles.planWrap}>
          <div style={styles.sectionEyebrow}>套餐状态联动</div>
          <div style={styles.planGrid}>
            <article style={styles.planCard}>
              <div style={styles.planLabel}>当前套餐</div>
              <div style={styles.planValue}>{planLabelMap[summary.user?.plan || "free"] || "免费版"}</div>
              <div style={styles.planHint}>
                {summary.quota
                  ? `${summary.quota.periodLabel}已使用 ${summary.quota.used}/${summary.quota.limit} 次检测，剩余 ${summary.quota.remaining} 次。`
                  : "当前账号暂无额度信息。"}
              </div>
            </article>
            <article style={styles.planCard}>
              <div style={styles.planLabel}>当前可用能力</div>
              <div style={styles.planValueSmall}>
                {isFree
                  ? "单次检测 + 报告导出"
                  : summary.user?.plan === "basic"
                    ? "检测 + 5 个关键词监控"
                    : summary.user?.plan === "pro"
                      ? "无限检测 + 30 个关键词监控"
                      : "定制检测与监控能力"}
              </div>
              <div style={styles.planHint}>
                {isFree
                  ? "如果你准备开始长期监控，建议先升级基础版。"
                  : "可以继续查看关键词管理、趋势图和定价页，确认当前套餐是否需要继续升级。"}
              </div>
            </article>
            <article style={styles.planCard}>
              <div style={styles.planLabel}>下一步建议</div>
              <div style={styles.planActions}>
                {isFree ? (
                  <Link href="/pricing" style={styles.primaryButton}>
                    去升级套餐
                  </Link>
                ) : (
                  <Link href="/billing/manage" style={styles.primaryButton}>
                    管理当前订阅
                  </Link>
                )}
                <Link href="/pricing" style={styles.secondaryButton}>
                  查看套餐详情
                </Link>
              </div>
            </article>
          </div>
        </section>

        {isFree ? (
          <section style={styles.upgrade}>
            <div>
              <div style={styles.upgradeTitle}>当前为免费版，暂不支持关键词持续监控</div>
              <div style={styles.upgradeText}>
                升级到基础版后即可开启 5 个关键词的每日监控，专业版可扩展到 30 个关键词并查看长期趋势。
              </div>
            </div>
            <Link href="/pricing" style={styles.primaryButton}>
              升级套餐
            </Link>
          </section>
        ) : null}

        <section style={styles.overviewWrap}>
          <div style={styles.overviewHeader}>
            <div style={styles.sectionEyebrow}>运营驾驶舱</div>
            <div style={styles.sectionTitle}>从客户、任务、报告到监控结果，一眼查看当前运营状态</div>
            <div style={styles.sectionText}>
              这一区块用于快速判断站点是否已经进入稳定运行状态，方便每天先看整体，再进入客户、任务和关键词明细。
            </div>
          </div>
          <section style={styles.overviewGrid}>
            <ScoreCard
              label="客户总数"
              value={summary.customerCount}
              hint="已沉淀到系统中的品牌客户数量"
              accent="#0f8b7f"
            />
            <ScoreCard
              label="检测任务数"
              value={summary.taskCount}
              hint="已提交并进入系统的检测任务总量"
            />
            <ScoreCard
              label="报告总数"
              value={summary.reportCount}
              hint={summary.latestReportAt ? `最近报告：${formatDate(summary.latestReportAt)}` : "暂无检测报告"}
            />
            <ScoreCard
              label="活跃监控关键词"
              value={summary.activeKeywordCount}
              hint={summary.latestMonitorAt ? `最近监控：${summary.latestMonitorAt}` : "尚未写入监控结果"}
            />
          </section>
        </section>

        <section style={styles.grid}>
          <ScoreCard
            label="监控关键词数"
            value={`${summary.monitoredKeywords.length}/${summary.quota?.plan === "basic" ? 5 : summary.quota?.plan === "pro" ? 30 : 999}`}
            hint="按当前套餐可配置的关键词数量计算"
            accent="#0f8b7f"
          />
          <ScoreCard
            label="平均 TCA 分"
            value={summary.averageScore}
            hint="基于近 30 条报告的平均结果"
          />
          <ScoreCard
            label="本周变化"
            value={`${summary.weeklyDelta > 0 ? "+" : ""}${summary.weeklyDelta}%`}
            hint="对比最近一周可用报告的变化幅度"
            accent={summary.weeklyDelta >= 0 ? "#0f8b7f" : "#b42318"}
          />
          <ScoreCard
            label={`${summary.quota?.periodLabel || "本月"}检测次数`}
            value={`${summary.quota?.used ?? 0}/${summary.quota?.limit ?? 0}`}
            hint={`剩余 ${summary.quota?.remaining ?? 0} 次`}
          />
        </section>

        <section style={styles.trendWrap}>
          <div style={styles.trendHeader}>
            <div>
              <div style={styles.trendTitle}>最近 {trendDays} 天监控关键词的 TCA 走势</div>
              <div style={styles.trendText}>按真实 monitor_results 时间序列聚合，方便查看短期波动和长期趋势。</div>
            </div>
            <div style={styles.rangeTabs}>
              {TREND_RANGES.map((days) => {
                const active = trendDays === days;
                return (
                  <Link
                    key={days}
                    href={`/dashboard?days=${days}`}
                    style={{
                      ...styles.rangeTab,
                      ...(active ? styles.rangeTabActive : {}),
                    }}
                  >
                    {days}天
                  </Link>
                );
              })}
            </div>
          </div>
          <TrendChart points={points} title="" />
        </section>

        <KeywordTable items={summary.monitoredKeywords} showManage />
      </div>
    </main>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f6f8fb",
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
  },
  badge: {
    display: "inline-flex",
    width: "fit-content",
    padding: "8px 14px",
    borderRadius: 999,
    background: "#edf8f6",
    color: "#0f8b7f",
    fontWeight: 700,
    fontSize: 14,
  },
  title: {
    margin: "18px 0 0",
    fontSize: 42,
    lineHeight: 1.12,
    color: "#111827",
  },
  text: {
    margin: "16px 0 0",
    color: "#667085",
    fontSize: 18,
    lineHeight: 1.8,
    maxWidth: 860,
  },
  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 22,
  },
  billingBannerSuccess: {
    background: "rgba(15, 139, 127, 0.08)",
    border: "1px solid rgba(15, 139, 127, 0.16)",
    borderRadius: 22,
    padding: 22,
    display: "grid",
    gap: 8,
  },
  billingBannerCancel: {
    background: "rgba(181, 71, 8, 0.08)",
    border: "1px solid rgba(181, 71, 8, 0.16)",
    borderRadius: 22,
    padding: 22,
    display: "grid",
    gap: 8,
  },
  billingBannerTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "#111827",
  },
  billingBannerText: {
    fontSize: 15,
    lineHeight: 1.8,
    color: "#667085",
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    padding: "0 18px",
    borderRadius: 14,
    background: "#111827",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    padding: "0 18px",
    borderRadius: 14,
    border: "1px solid #d8dee6",
    background: "#fff",
    color: "#111827",
    textDecoration: "none",
    fontWeight: 700,
  },
  upgrade: {
    background: "linear-gradient(135deg, rgba(15,139,127,0.08), rgba(17,24,39,0.04))",
    border: "1px solid rgba(15,139,127,0.18)",
    borderRadius: 28,
    padding: 28,
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "center",
    flexWrap: "wrap",
  },
  upgradeTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: "#111827",
  },
  upgradeText: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 1.8,
    color: "#667085",
    maxWidth: 760,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 18,
  },
  overviewWrap: {
    display: "grid",
    gap: 18,
  },
  planWrap: {
    display: "grid",
    gap: 14,
  },
  planGrid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1.2fr 1fr",
    gap: 18,
  },
  planCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 22,
    display: "grid",
    gap: 10,
    alignContent: "start",
  },
  planLabel: {
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: "0.06em",
    color: "#98a2b3",
  },
  planValue: {
    fontSize: 28,
    lineHeight: 1.15,
    fontWeight: 800,
    color: "#111827",
  },
  planValueSmall: {
    fontSize: 22,
    lineHeight: 1.35,
    fontWeight: 800,
    color: "#111827",
  },
  planHint: {
    fontSize: 14,
    lineHeight: 1.8,
    color: "#667085",
  },
  planActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 4,
  },
  overviewHeader: {
    display: "grid",
    gap: 8,
  },
  sectionEyebrow: {
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: "0.08em",
    color: "#0f8b7f",
  },
  sectionTitle: {
    fontSize: 28,
    lineHeight: 1.2,
    fontWeight: 800,
    color: "#111827",
  },
  sectionText: {
    maxWidth: 860,
    fontSize: 15,
    lineHeight: 1.8,
    color: "#667085",
  },
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 18,
  },
  trendWrap: {
    display: "grid",
    gap: 14,
  },
  trendHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
    alignItems: "flex-end",
    flexWrap: "wrap",
  },
  trendTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: "#111827",
  },
  trendText: {
    marginTop: 8,
    color: "#667085",
    fontSize: 15,
    lineHeight: 1.8,
  },
  rangeTabs: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  rangeTab: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 64,
    height: 38,
    padding: "0 14px",
    borderRadius: 999,
    border: "1px solid #d8dee6",
    background: "#fff",
    color: "#475467",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 14,
  },
  rangeTabActive: {
    background: "#111827",
    border: "1px solid #111827",
    color: "#fff",
  },
};

const planLabelMap: Record<string, string> = {
  free: "免费版",
  basic: "基础版",
  pro: "专业版",
  enterprise: "企业版",
};
