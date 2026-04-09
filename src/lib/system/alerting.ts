import { getMonitoringHealthSnapshot } from "@/lib/db/repository";
import { getRuntimeHealthSummary, type RuntimeHealthSummary } from "@/lib/system/runtime-health";

export type EvaluatedSystemAlert = {
  alertKey: string;
  severity: "warning" | "critical";
  title: string;
  message: string;
  detail?: string;
  renotifyAfterHours?: number;
};

export type SystemAlertEvaluation = {
  generatedAt: string;
  runtimeHealth: RuntimeHealthSummary;
  monitoring: {
    activeKeywordCount: number;
    latestCheckedAt: string | null;
    staleHours: number | null;
  };
  alerts: EvaluatedSystemAlert[];
};

function diffHours(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  return Math.max(0, diffMs / (1000 * 60 * 60));
}

export async function evaluateSystemAlerts(): Promise<SystemAlertEvaluation> {
  const [runtimeHealth, monitoringSnapshot] = await Promise.all([
    getRuntimeHealthSummary(),
    getMonitoringHealthSnapshot(),
  ]);

  const alerts: EvaluatedSystemAlert[] = [];
  const staleHours = monitoringSnapshot.latestCheckedAt
    ? diffHours(monitoringSnapshot.latestCheckedAt)
    : null;

  if (runtimeHealth.database.status === "missing") {
    alerts.push({
      alertKey: "database-unavailable",
      severity: "critical",
      title: "数据库连接失败",
      message: "数据库当前不可用，检测、排名和线索写入都可能受影响。",
      detail: runtimeHealth.database.detail,
      renotifyAfterHours: 2,
    });
  }

  if (runtimeHealth.auth.status === "missing") {
    alerts.push({
      alertKey: "auth-not-ready",
      severity: "critical",
      title: "登录鉴权未就绪",
      message: "NEXTAUTH 关键变量缺失，登录和后台受保护页面无法稳定使用。",
      detail: runtimeHealth.auth.detail,
      renotifyAfterHours: 6,
    });
  }

  if (runtimeHealth.providers.status === "missing") {
    alerts.push({
      alertKey: "providers-none-configured",
      severity: "critical",
      title: "未配置真实模型 Provider",
      message: "当前没有可用的真实模型 Provider，检测会大量回退到 mock。",
      detail: runtimeHealth.providers.detail,
      renotifyAfterHours: 4,
    });
  } else if (runtimeHealth.providers.status === "warning") {
    alerts.push({
      alertKey: "providers-capacity-low",
      severity: "warning",
      title: "真实模型 Provider 数量偏少",
      message: `当前仅有 ${runtimeHealth.providers.configured.length} 个真实 Provider，建议至少维持 2 个以上保证稳定性。`,
      detail: runtimeHealth.providers.detail,
      renotifyAfterHours: 12,
    });
  }

  if (runtimeHealth.cron.status !== "healthy") {
    alerts.push({
      alertKey: "cron-not-ready",
      severity: "warning",
      title: "定时监控未完全就绪",
      message: "CRON_SECRET 未配置或定时监控还未达到安全上线状态。",
      detail: runtimeHealth.cron.detail,
      renotifyAfterHours: 12,
    });
  }

  if (monitoringSnapshot.activeKeywordCount > 0) {
    if (!monitoringSnapshot.latestCheckedAt) {
      alerts.push({
        alertKey: "monitor-results-missing",
        severity: "critical",
        title: "监控任务尚未产出结果",
        message: `当前已有 ${monitoringSnapshot.activeKeywordCount} 个活跃监控词，但还没有任何监控结果入库。`,
        detail: "建议检查 /api/cron/daily-monitor 是否已成功执行，以及 CRON_SECRET 是否已正确配置。",
        renotifyAfterHours: 4,
      });
    } else if (staleHours !== null && staleHours >= 48) {
      alerts.push({
        alertKey: "monitor-results-stale",
        severity: "critical",
        title: "监控结果已严重过期",
        message: `监控结果距离上次更新已超过 ${Math.floor(staleHours)} 小时，关键词监控可能已经中断。`,
        detail: `最近一次监控时间：${monitoringSnapshot.latestCheckedAt}`,
        renotifyAfterHours: 4,
      });
    } else if (staleHours !== null && staleHours >= 36) {
      alerts.push({
        alertKey: "monitor-results-stale",
        severity: "warning",
        title: "监控结果更新偏慢",
        message: `监控结果距离上次更新已超过 ${Math.floor(staleHours)} 小时，建议检查 cron 是否正常运行。`,
        detail: `最近一次监控时间：${monitoringSnapshot.latestCheckedAt}`,
        renotifyAfterHours: 12,
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    runtimeHealth,
    monitoring: {
      activeKeywordCount: monitoringSnapshot.activeKeywordCount,
      latestCheckedAt: monitoringSnapshot.latestCheckedAt,
      staleHours: staleHours === null ? null : Number(staleHours.toFixed(1)),
    },
    alerts,
  };
}
