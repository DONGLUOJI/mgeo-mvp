export type PlanName = "free" | "basic" | "pro" | "enterprise";

export type PlanConfig = {
  name: string;
  monthlyDetectLimit: number;
  maxKeywords: number;
  features: string[];
};

export const PLAN_CONFIG: Record<PlanName, PlanConfig> = {
  free: {
    name: "免费版",
    monthlyDetectLimit: 3,
    maxKeywords: 0,
    features: ["每周 3 次检测", "TCA 基础评分", "HTML / PDF 报告导出"],
  },
  basic: {
    name: "基础版",
    monthlyDetectLimit: 50,
    maxKeywords: 5,
    features: ["每月 50 次检测", "5 个关键词监控", "月度 TCA 报告", "1 个竞品对比", "周报邮件"],
  },
  pro: {
    name: "专业版",
    monthlyDetectLimit: 999999,
    maxKeywords: 30,
    features: ["无限检测", "30 个关键词监控", "TCA 深度诊断", "异常预警", "90 天历史回溯"],
  },
  enterprise: {
    name: "企业版",
    monthlyDetectLimit: 999999,
    maxKeywords: 999999,
    features: ["实时监控", "无限竞品对比", "TCA 深度诊断", "优化建议引擎", "异常预警", "90 天历史回溯"],
  },
};

export function getPlanConfig(plan?: string) {
  return PLAN_CONFIG[(plan as PlanName) || "free"] || PLAN_CONFIG.free;
}
