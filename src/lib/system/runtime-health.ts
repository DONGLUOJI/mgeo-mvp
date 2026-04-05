import { pingPostgres } from "@/lib/db/postgres";
import { pingSqlite } from "@/lib/db/sqlite";
import { getEnvCheckSummary } from "@/lib/system/env-check";

type HealthStatus = "healthy" | "warning" | "missing";

export type RuntimeHealthSummary = {
  generatedAt: string;
  overallStatus: HealthStatus;
  blockers: string[];
  warnings: string[];
  database: {
    status: HealthStatus;
    mode: "sqlite" | "postgres";
    detail: string;
  };
  auth: {
    status: HealthStatus;
    detail: string;
  };
  payment: {
    status: HealthStatus;
    detail: string;
  };
  cron: {
    status: HealthStatus;
    detail: string;
  };
  providers: {
    status: HealthStatus;
    configured: string[];
    missing: string[];
    detail: string;
  };
};

function pickOverallStatus(items: HealthStatus[]): HealthStatus {
  if (items.includes("missing")) return "missing";
  if (items.includes("warning")) return "warning";
  return "healthy";
}

export async function getRuntimeHealthSummary(): Promise<RuntimeHealthSummary> {
  const env = getEnvCheckSummary();
  const items = env.groups.flatMap((group) => group.items);

  const requiredMissing = items.filter((item) => item.required && !item.configured);
  const paymentRequiredKeys = items.filter(
    (item) => item.group === "支付" && item.required
  );
  const paymentReady = paymentRequiredKeys.every((item) => item.configured);
  const cronReady = items.some((item) => item.key === "CRON_SECRET" && item.configured);
  const authReady =
    items.some((item) => item.key === "NEXTAUTH_URL" && item.configured) &&
    items.some((item) => item.key === "NEXTAUTH_SECRET" && item.configured);

  const providerItems = items.filter((item) => item.group === "模型 Provider");
  const configuredProviders = providerItems.filter((item) => item.configured).map((item) => item.key);
  const missingProviders = providerItems.filter((item) => !item.configured).map((item) => item.key);
  const blockers: string[] = [];
  const warnings: string[] = [];

  let database: RuntimeHealthSummary["database"];

  try {
    if (process.env.DATABASE_URL) {
      const result = await pingPostgres();
      database = {
        status: "healthy",
        mode: result.mode,
        detail: `Postgres 连接正常，最近响应时间基于服务端实时探测。`,
      };
    } else {
      const result = pingSqlite();
      database = {
        status: "warning",
        mode: result.mode,
        detail: `当前仍在使用本地 SQLite：${result.path}。适合开发演示，不建议直接用于正式上线。`,
      };
      warnings.push("当前数据库仍为 SQLite，正式上线前建议切换到 Postgres。");
    }
  } catch (error) {
    database = {
      status: "missing",
      mode: process.env.DATABASE_URL ? "postgres" : "sqlite",
      detail: error instanceof Error ? error.message : "数据库连接失败",
    };
    blockers.push("数据库连接失败，当前无法进入正式上线联调。");
  }

  const auth: RuntimeHealthSummary["auth"] = {
    status: authReady ? "healthy" : "missing",
    detail: authReady
      ? "NEXTAUTH_URL 和 NEXTAUTH_SECRET 已配置，可以支持正式域名登录。"
      : "NEXTAUTH_URL 或 NEXTAUTH_SECRET 缺失，正式环境登录链路还不完整。",
  };
  if (!authReady) {
    blockers.push("登录鉴权关键变量未配齐，请先补 NEXTAUTH_URL 和 NEXTAUTH_SECRET。");
  }

  const payment: RuntimeHealthSummary["payment"] = {
    status: paymentReady ? "healthy" : "warning",
    detail: paymentReady
      ? "LemonSqueezy 结账、variant 和 webhook 关键变量已就绪。"
      : `支付配置仍缺 ${paymentRequiredKeys.filter((item) => !item.configured).length} 项，结账前建议先补齐。`,
  };
  if (!paymentReady) {
    warnings.push("支付配置还未完全就绪，正式收费前建议先跑通 webhook 和套餐刷新。");
  }

  const cron: RuntimeHealthSummary["cron"] = {
    status: cronReady ? "healthy" : "warning",
    detail: cronReady
      ? "CRON_SECRET 已配置，接下来只需在 Vercel 验证每日触发。"
      : "CRON_SECRET 未配置，定时监控还不能安全上线。",
  };
  if (!cronReady) {
    warnings.push("定时监控授权未配置，关键词每日监控还不能安全上线。");
  }

  const providers: RuntimeHealthSummary["providers"] = {
    status:
      configuredProviders.length >= 2
        ? "healthy"
        : configuredProviders.length === 1
          ? "warning"
          : "missing",
    configured: configuredProviders,
    missing: missingProviders,
    detail:
      configuredProviders.length >= 2
        ? `当前已配置 ${configuredProviders.length} 个真实模型 Provider，可以支撑对外演示和首轮试运营。`
        : configuredProviders.length === 1
          ? `当前仅配置 ${configuredProviders[0]}，系统可以运行，但建议至少补到 2 个真实 Provider。`
          : "尚未配置任何真实模型 Provider，当前仍主要依赖 mock 回退。",
  };
  if (configuredProviders.length === 0) {
    blockers.push("尚未配置任何真实模型 Provider，当前检测主要依赖 mock 回退。");
  } else if (configuredProviders.length === 1) {
    warnings.push("当前只配置了 1 个真实模型 Provider，建议至少补到 2 个。");
  }

  if (requiredMissing.length) {
    blockers.push(`仍有 ${requiredMissing.length} 个必填环境变量未配置。`);
  }

  const overallStatus = pickOverallStatus([
    requiredMissing.length ? "missing" : "healthy",
    database.status,
    auth.status,
    payment.status,
    cron.status,
    providers.status,
  ]);

  return {
    generatedAt: new Date().toISOString(),
    overallStatus,
    blockers,
    warnings,
    database,
    auth,
    payment,
    cron,
    providers,
  };
}
