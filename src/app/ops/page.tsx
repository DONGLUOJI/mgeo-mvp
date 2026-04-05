import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/auth-options";
import { getEnvCheckSummary } from "@/lib/system/env-check";
import { getReleaseReadinessSummary } from "@/lib/system/release-readiness";
import { getRuntimeHealthSummary } from "@/lib/system/runtime-health";

export default async function OpsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [env, health, release] = await Promise.all([
    Promise.resolve(getEnvCheckSummary()),
    getRuntimeHealthSummary(),
    getReleaseReadinessSummary(),
  ]);

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.badge}>运维入口</div>
          <h1 style={styles.title}>把部署准备、健康检查和联调清单集中到一个总入口里</h1>
          <p style={styles.text}>
            这页适合在上线前每天打开一次。先看整体状态，再决定今天要补环境变量、联调支付、验证 cron，还是直接做最终部署。
          </p>
          <div style={styles.actions}>
            <Link href="/deployment" style={styles.primaryButton}>
              查看部署准备
            </Link>
            <Link href="/dashboard" style={styles.secondaryButton}>
              返回 Dashboard
            </Link>
            <Link href="/api/system/release" style={styles.secondaryButton}>
              查看上线结论 API
            </Link>
          </div>
        </section>

        <section style={styles.summaryGrid}>
          <article style={styles.summaryCard}>
            <div style={styles.summaryLabel}>整体上线状态</div>
            <div style={{ ...styles.summaryValue, color: statusColor[health.overallStatus] }}>
              {statusLabel[health.overallStatus]}
            </div>
            <div style={styles.summaryHint}>
              {health.blockers.length
                ? `当前仍有 ${health.blockers.length} 个阻塞项`
                : health.warnings.length
                  ? `当前有 ${health.warnings.length} 个待完善项`
                  : "当前可进入正式联调或试运营上线"}
            </div>
          </article>
          <article style={styles.summaryCard}>
            <div style={styles.summaryLabel}>必填环境变量</div>
            <div style={styles.summaryValue}>
              {env.readyRequiredCount}/{env.requiredCount}
            </div>
            <div style={styles.summaryHint}>
              {env.allRequiredReady ? "关键变量已配齐" : "建议先补齐再做支付和 cron 联调"}
            </div>
          </article>
          <article style={styles.summaryCard}>
            <div style={styles.summaryLabel}>真实模型 Provider</div>
            <div style={styles.summaryValue}>{health.providers.configured.length}</div>
            <div style={styles.summaryHint}>
              {health.providers.configured.length >= 2 ? "已达到首轮试运营建议值" : "建议至少配置 2 个真实 Provider"}
            </div>
          </article>
          <article style={styles.summaryCard}>
            <div style={styles.summaryLabel}>数据库模式</div>
            <div style={styles.summaryValue}>{health.database.mode === "postgres" ? "Postgres" : "SQLite"}</div>
            <div style={styles.summaryHint}>
              {health.database.mode === "postgres" ? "已接近正式上线配置" : "开发演示正常，正式上线建议切 Postgres"}
            </div>
          </article>
        </section>

        <section style={styles.commandDeck}>
          <article style={styles.commandCard}>
            <div style={styles.commandLabel}>当前上线结论</div>
            <div style={{ ...styles.commandValue, color: releaseDecisionColor[release.decision] }}>
              {releaseDecisionText[release.decision]}
            </div>
            <div style={styles.commandText}>{release.summary}</div>
          </article>
          <article style={styles.commandCard}>
            <div style={styles.commandLabel}>今天优先做什么</div>
            <div style={styles.commandList}>
              {release.nextActions.slice(0, 3).map((item) => (
                <div key={item} style={styles.commandItem}>
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section style={styles.healthGrid}>
          <HealthCard title="数据库" status={health.database.status} detail={health.database.detail} />
          <HealthCard title="登录鉴权" status={health.auth.status} detail={health.auth.detail} />
          <HealthCard title="支付系统" status={health.payment.status} detail={health.payment.detail} />
          <HealthCard title="定时监控" status={health.cron.status} detail={health.cron.detail} />
          <HealthCard title="模型 Provider" status={health.providers.status} detail={health.providers.detail} />
        </section>

        <section style={styles.linkGrid}>
          <OpsCard
            title="上线结论"
            description="直接给出当前是否适合上线、为什么以及下一步最该先做什么。"
            href="/deployment/release"
            cta="查看上线结论"
          />
          <OpsCard
            title="发布记录"
            description="记录每次试运营或正式发布的结论、变更范围和回退预案。"
            href="/deployment/logbook"
            cta="记录发布结果"
          />
          <OpsCard
            title="部署准备"
            description="查看按步骤拆好的域名、数据库、支付、cron 与上线验收清单。"
            href="/deployment"
            cta="进入部署准备"
          />
          <OpsCard
            title="环境变量检查"
            description="查看所有关键变量是否已配置，并直接看线上建议值说明。"
            href="/deployment/env"
            cta="查看环境变量"
          />
          <OpsCard
            title="系统健康检查"
            description="直接看数据库、鉴权、支付、cron 和 Provider 当前是否处于可上线状态。"
            href="/deployment/health"
            cta="查看健康状态"
          />
          <OpsCard
            title="联调检查表"
            description="逐项勾选登录、检测、支付、cron 和生产环境验收动作，并在本机保留进度。"
            href="/deployment/checklist"
            cta="开始联调"
          />
          <OpsCard
            title="运行手册"
            description="把上线前 30 分钟、发布后 10 分钟和常见故障排查动作收成一份值班手册。"
            href="/deployment/runbook"
            cta="查看运行手册"
          />
          <OpsCard
            title="验证入口"
            description="把公开页面、后台页面、关键 API 和支付回跳入口整理成一页可直接点击的验证面板。"
            href="/deployment/verify"
            cta="开始验证"
          />
        </section>

        {health.blockers.length ? (
          <section style={styles.blockerCard}>
            <div style={styles.blockerTitle}>优先处理这些阻塞项</div>
            <div style={styles.blockerList}>
              {health.blockers.map((item) => (
                <div key={item} style={styles.blockerItem}>
                  {item}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {health.warnings.length ? (
          <section style={styles.warningCard}>
            <div style={styles.warningTitle}>做完阻塞项后，建议继续补这些</div>
            <div style={styles.warningList}>
              {health.warnings.map((item) => (
                <div key={item} style={styles.warningItem}>
                  {item}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function HealthCard({
  title,
  status,
  detail,
}: {
  title: string;
  status: keyof typeof statusLabel;
  detail: string;
}) {
  return (
    <article style={styles.healthCard}>
      <div style={styles.healthHead}>
        <div style={styles.healthTitle}>{title}</div>
        <div style={{ ...styles.healthStatus, color: statusColor[status] }}>{statusLabel[status]}</div>
      </div>
      <div style={styles.healthText}>{detail}</div>
    </article>
  );
}

function OpsCard({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <article style={styles.linkCard}>
      <div style={styles.linkTitle}>{title}</div>
      <div style={styles.linkText}>{description}</div>
      <Link href={href} style={styles.linkButton}>
        {cta}
      </Link>
    </article>
  );
}

const statusLabel = {
  healthy: "可上线",
  warning: "待联调",
  missing: "未就绪",
} as const;

const statusColor = {
  healthy: "#0f8b7f",
  warning: "#b54708",
  missing: "#b42318",
} as const;

const releaseDecisionText = {
  blocked: "暂不建议上线",
  trial: "可试运营",
  ready: "可上线",
} as const;

const releaseDecisionColor = {
  blocked: "#b42318",
  trial: "#b54708",
  ready: "#0f8b7f",
} as const;

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
    display: "grid",
    gap: 16,
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
    margin: 0,
    fontSize: 40,
    lineHeight: 1.12,
    color: "#111827",
  },
  text: {
    margin: 0,
    color: "#667085",
    fontSize: 17,
    lineHeight: 1.85,
    maxWidth: 920,
  },
  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
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
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 18,
  },
  commandDeck: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: 18,
  },
  commandCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 12,
  },
  commandLabel: {
    fontSize: 14,
    color: "#667085",
    fontWeight: 700,
  },
  commandValue: {
    fontSize: 30,
    lineHeight: 1.12,
    fontWeight: 800,
  },
  commandText: {
    fontSize: 16,
    lineHeight: 1.8,
    color: "#475467",
  },
  commandList: {
    display: "grid",
    gap: 10,
  },
  commandItem: {
    padding: "12px 14px",
    borderRadius: 14,
    background: "#f8fafc",
    border: "1px solid #e7ebf0",
    color: "#344054",
    fontSize: 15,
    lineHeight: 1.7,
  },
  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#667085",
    fontWeight: 700,
  },
  summaryValue: {
    fontSize: 32,
    lineHeight: 1.1,
    fontWeight: 800,
    color: "#101828",
  },
  summaryHint: {
    fontSize: 14,
    lineHeight: 1.7,
    color: "#98a2b3",
  },
  healthGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 16,
  },
  healthCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 20,
    padding: 18,
    display: "grid",
    gap: 12,
  },
  healthHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  healthTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: "#111827",
  },
  healthStatus: {
    fontSize: 13,
    fontWeight: 800,
  },
  healthText: {
    fontSize: 14,
    lineHeight: 1.75,
    color: "#667085",
  },
  linkGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 18,
  },
  linkCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 14,
  },
  linkTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: "#111827",
  },
  linkText: {
    fontSize: 15,
    lineHeight: 1.85,
    color: "#667085",
  },
  linkButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "fit-content",
    height: 44,
    padding: "0 16px",
    borderRadius: 12,
    background: "#111827",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
  },
  blockerCard: {
    background: "rgba(180, 35, 24, 0.06)",
    border: "1px solid rgba(180, 35, 24, 0.14)",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 12,
  },
  blockerTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#b42318",
  },
  blockerList: {
    display: "grid",
    gap: 10,
  },
  blockerItem: {
    fontSize: 15,
    lineHeight: 1.8,
    color: "#7a271a",
  },
  warningCard: {
    background: "rgba(181, 71, 8, 0.06)",
    border: "1px solid rgba(181, 71, 8, 0.14)",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 12,
  },
  warningTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#b54708",
  },
  warningList: {
    display: "grid",
    gap: 10,
  },
  warningItem: {
    fontSize: 15,
    lineHeight: 1.8,
    color: "#7a2e0e",
  },
};
