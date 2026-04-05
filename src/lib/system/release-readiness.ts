import { getEnvCheckSummary } from "@/lib/system/env-check";
import { getRuntimeHealthSummary } from "@/lib/system/runtime-health";

export type ReleaseDecision = "blocked" | "trial" | "ready";

export type ReleaseReadinessSummary = {
  generatedAt: string;
  decision: ReleaseDecision;
  title: string;
  summary: string;
  reasons: string[];
  nextActions: string[];
  envReadyText: string;
  providerText: string;
  databaseText: string;
};

export async function getReleaseReadinessSummary(): Promise<ReleaseReadinessSummary> {
  const env = getEnvCheckSummary();
  const health = await getRuntimeHealthSummary();

  if (health.overallStatus === "missing") {
    return {
      generatedAt: new Date().toISOString(),
      decision: "blocked",
      title: "当前不建议上线",
      summary: "系统仍有阻塞项，当前阶段更适合继续补关键配置，而不是直接进入对外试运营。",
      reasons: health.blockers,
      nextActions: [
        "先处理环境变量、数据库连接或真实 Provider 相关阻塞项。",
        "处理完成后重新查看 /deployment/health，确认整体状态已不再是阻塞。",
        "再回到 /deployment/checklist 重新跑一轮登录、检测、支付和 cron 联调。",
      ],
      envReadyText: `${env.readyRequiredCount}/${env.requiredCount} 个必填环境变量已配置`,
      providerText: `${health.providers.configured.length} 个真实 Provider 已配置`,
      databaseText: health.database.mode === "postgres" ? "当前数据库为 Postgres" : "当前数据库仍为 SQLite",
    };
  }

  if (health.overallStatus === "warning") {
    return {
      generatedAt: new Date().toISOString(),
      decision: "trial",
      title: "可以进入试运营，但建议先补齐待完善项",
      summary: "系统已经具备基础可用性，可以开始小范围试运营或内部联调，但还不适合直接放量。",
      reasons: health.warnings,
      nextActions: [
        "优先补齐支付配置、cron 配置或第二个真实 Provider。",
        "如果当前数据库仍是 SQLite，尽快切到 Postgres。",
        "在 /deployment/verify 和 /deployment/runbook 中完成发布前后两轮真实验证。",
      ],
      envReadyText: `${env.readyRequiredCount}/${env.requiredCount} 个必填环境变量已配置`,
      providerText: `${health.providers.configured.length} 个真实 Provider 已配置`,
      databaseText: health.database.mode === "postgres" ? "当前数据库为 Postgres" : "当前数据库仍为 SQLite",
    };
  }

  return {
    generatedAt: new Date().toISOString(),
    decision: "ready",
    title: "当前已具备上线条件",
    summary: "关键配置、数据库、支付、cron 和真实 Provider 均已达到上线要求，可以进入正式联调或试运营发布。",
    reasons: [
      "必填环境变量已配齐",
      "数据库连接正常",
      "鉴权链路可用",
      "支付与 cron 已达到可联调状态",
      "真实 Provider 数量达到建议值",
    ],
    nextActions: [
      "按 /deployment/runbook 再跑一轮上线前 30 分钟检查。",
      "发布后 10 分钟内完成公开页面、登录、检测、报告和历史页验收。",
      "保留 /deployment/health 作为发布当天的健康快照页面。",
    ],
    envReadyText: `${env.readyRequiredCount}/${env.requiredCount} 个必填环境变量已配置`,
    providerText: `${health.providers.configured.length} 个真实 Provider 已配置`,
    databaseText: health.database.mode === "postgres" ? "当前数据库为 Postgres" : "当前数据库仍为 SQLite",
  };
}
