import { createHash } from "node:crypto";
import type { DetectReport } from "@/lib/detect/types";
import { getPlanConfig } from "@/lib/auth/plans";
import { queryPostgres } from "@/lib/db/postgres";
import { getSqliteDb, sqliteHasColumn } from "@/lib/db/sqlite";
import { normalizeDetectReport } from "@/lib/detect/report-shape";
import type { PlatformDetail, PlatformKey } from "@/lib/ranking/shared";

type ScanReportRecord = {
  taskId: string;
  brandName: string;
  createdAt: string;
  userId: string | null;
  report: DetectReport;
};

type CustomerRecord = {
  customerId: string;
  brandName: string;
  industry: string;
  businessSummary: string;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  latestTaskAt: string | null;
};

type ScanTaskRecord = {
  taskId: string;
  customerId: string;
  brandName: string;
  industry: string;
  city: string;
  query: string;
  selectedModels: string[];
  executionMode: string;
  createdAt: string;
};

type CustomerDetailRecord = CustomerRecord & {
  reports: ScanReportRecord[];
  tasks: ScanTaskRecord[];
};

type RankingSnapshotRecord = {
  id: string;
  industry: string;
  city: string;
  brandName: string;
  tcaTotal: number;
  tcaConsistency: number;
  tcaCoverage: number;
  tcaAuthority: number;
  platformCoverage: number;
  delta7d: number;
  snapshotDate: string;
  createdAt: string;
  platformDetail?: Record<PlatformKey, PlatformDetail>;
  brandType?: "local" | "chain" | "national";
  cityScope?: string;
};

type RankingObservationSeed = {
  snapshotDate: string;
  city: string;
  industry: string;
  queryText: string;
  brandName: string;
  brandType?: "local" | "chain" | "national";
  cityScope?: string;
  model: PlatformKey;
  mentioned: boolean;
  mentionPosition?: number | null;
  sentiment?: "positive" | "neutral" | "negative" | null;
  sourceNames?: string[];
  answerText?: string | null;
};

type RankingObservationJoinedRow = {
  snapshotDate: string;
  city: string;
  industry: string;
  queryText: string;
  brandName: string;
  brandType: "local" | "chain" | "national";
  cityScope: string;
  model: PlatformKey;
  mentioned: boolean;
  mentionPosition: number | null;
  sentiment: "positive" | "neutral" | "negative" | null;
  sourceNames: string[];
  answerText: string;
  createdAt: string;
};

type RankingTrendingAggregate = {
  rank: number;
  queryText: string;
  industry: string;
  city: string;
  heatScore: number;
  brandCount: number;
  trendDirection: "up" | "down" | "stable";
  brandsMentioned: Array<{
    brand: string;
    platforms: PlatformKey[];
    avgPosition: number;
  }>;
};

type RankingSeed = {
  industry: string;
  city: string;
  brandName: string;
  tcaTotal: number;
  platformCoverage: number;
  delta7d: number;
};

type UserRecord = {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  monthlyDetectCount: number;
  monthlyDetectResetAt: string | null;
  createdAt: string;
  updatedAt: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
};

type MonitoredKeywordRecord = {
  id: string;
  userId: string;
  brandName: string;
  keyword: string;
  industry: string | null;
  businessSummary: string;
  selectedModels: string[];
  isActive: boolean;
  createdAt: string;
};

type MonitorResultRecord = {
  id: string;
  keywordId: string;
  userId: string;
  tcaTotal: number;
  tcaConsistency: number;
  tcaCoverage: number;
  tcaAuthority: number;
  tcaLevel: string;
  result: DetectReport;
  checkedAt: string;
};

type MonitorTrendPoint = {
  date: string;
  tcaTotal: number;
  consistency: number;
  coverage: number;
  authority: number;
};

type DetectQuotaRecord = {
  allowed: boolean;
  limit: number;
  used: number;
  remaining: number;
  plan: string;
  periodLabel: "本周" | "本月";
};

type DetectRequestEventStatus =
  | "allowed"
  | "reused"
  | "blocked_rate_limit"
  | "blocked_guest_limit"
  | "blocked_guest_cookie_limit";

export type DetectRateLimitRecord = {
  allowed: boolean;
  code: "IP_RATE_LIMITED" | "GUEST_IP_LIMIT_EXCEEDED" | null;
  message: string | null;
  retryAfterSeconds: number | null;
};

export type LeadRequestStatus = "new" | "contacted" | "in_progress" | "won" | "invalid";

export type LeadRequestType = "contact" | "city_request";

export type LeadRequestRecord = {
  id: string;
  type: LeadRequestType;
  source: string;
  status: LeadRequestStatus;
  owner: string | null;
  name: string | null;
  company: string | null;
  brand: string | null;
  phone: string | null;
  contact: string | null;
  industry: string | null;
  region: string | null;
  message: string | null;
  note: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
};

const rankingSeedCatalog = [
  {
    industry: "新茶饮",
    brands: ["喜茶", "霸王茶姬", "茶百道", "奈雪的茶", "蜜雪冰城", "古茗", "沪上阿姨", "益禾堂", "七分甜", "一点点"],
    scores: [92, 86, 80, 77, 72, 68, 63, 57, 47, 38],
    coverages: [6, 6, 5, 5, 5, 4, 3, 2, 2, 1],
    changes: [12.5, 5.6, 3.4, 1.8, 0.4, -0.2, -2.1, -3.4, -1.7, -7.2],
  },
  {
    industry: "餐饮连锁",
    brands: ["海底捞", "西贝", "巴奴火锅", "外婆家", "绿茶餐厅", "太二酸菜鱼", "九毛九", "和府捞面", "老乡鸡", "杨国福"],
    scores: [94, 87, 82, 78, 74, 71, 68, 61, 55, 50],
    coverages: [6, 6, 5, 5, 4, 4, 3, 3, 2, 2],
    changes: [9.3, 4.2, 2.8, 1.6, 0.3, -0.4, -2.5, -3.1, -1.8, 3.7],
  },
  {
    industry: "教培",
    brands: ["新东方", "学而思", "猿辅导", "火花思维", "高途", "作业帮", "VIPKID", "粉笔", "中公教育", "掌门教育"],
    scores: [91, 82, 74, 68, 62, 58, 53, 47, 40, 25],
    coverages: [6, 5, 4, 4, 3, 3, 2, 2, 1, 0],
    changes: [3.4, 2.2, 1.1, 0.5, -0.1, -1.6, -2.8, -4.2, 0, -8.3],
  },
  {
    industry: "家政服务",
    brands: ["天鹅到家", "好慷在家", "58到家", "轻喜到家", "阿姨来了", "无忧保姆", "洁妹子", "邻家家政", "悦享到家", "安馨家政"],
    scores: [76, 68, 60, 55, 49, 44, 38, 33, 29, 28],
    coverages: [4, 4, 3, 3, 2, 2, 1, 1, 0, 0],
    changes: [1.9, 0.2, -0.3, -1.2, -2.7, 3.2, -4.6, 0, 0, -0.1],
  },
  {
    industry: "美妆护肤",
    brands: ["珀莱雅", "薇诺娜", "花西子", "可复美", "橘朵", "HBN", "韩束", "自然堂", "完美日记", "毛戈平"],
    scores: [86, 80, 74, 70, 67, 63, 58, 54, 51, 47],
    coverages: [6, 5, 5, 4, 4, 3, 3, 2, 2, 1],
    changes: [4.4, 2.9, 1.5, 0.2, -0.4, -1.1, -2.2, 3.6, -0.2, -6.4],
  },
  {
    industry: "企业服务",
    brands: ["飞书", "钉钉", "销售易", "纷享销客", "金蝶云星空", "用友BIP", "北森", "石墨文档", "简道云", "伙伴云"],
    scores: [92, 83, 74, 68, 63, 59, 54, 49, 44, 44],
    coverages: [6, 5, 4, 4, 3, 3, 2, 2, 1, 1],
    changes: [4.8, 2.6, 1.3, 0.1, -0.5, -1.8, -3.3, 2.1, -0.1, -2.4],
  },
] as const;

const scorePatterns = [
  { consistency: 10, coverage: -8, authority: 4 },
  { consistency: -8, coverage: 12, authority: -2 },
  { consistency: 6, coverage: -10, authority: 9 },
  { consistency: -10, coverage: 7, authority: 11 },
  { consistency: 8, coverage: 3, authority: -6 },
  { consistency: -6, coverage: 9, authority: 5 },
  { consistency: 12, coverage: -5, authority: -8 },
  { consistency: -4, coverage: 5, authority: 10 },
] as const;

function clampScore(value: number) {
  return Math.max(18, Math.min(98, Math.round(value)));
}

function buildScoreBreakdown(seed: RankingSeed, index: number) {
  const pattern = scorePatterns[index % scorePatterns.length];
  const livingIndustry = seed.industry === "新茶饮" || seed.industry === "餐饮连锁" || seed.industry === "家政服务";
  const industryShift =
    seed.industry === "企业服务"
      ? { consistency: 2, coverage: -3, authority: 4 }
      : seed.industry === "教培"
        ? { consistency: 3, coverage: -2, authority: 2 }
        : seed.industry === "家政服务"
          ? { consistency: -1, coverage: -4, authority: 0 }
          : livingIndustry
            ? { consistency: 0, coverage: 2, authority: 1 }
            : { consistency: 1, coverage: 0, authority: 3 };

  return {
    tcaConsistency: clampScore(seed.tcaTotal + pattern.consistency + industryShift.consistency),
    tcaCoverage: clampScore(seed.tcaTotal + pattern.coverage + industryShift.coverage),
    tcaAuthority: clampScore(seed.tcaTotal + pattern.authority + industryShift.authority),
  };
}

const mockRankingSeeds: RankingSeed[] = rankingSeedCatalog.flatMap((group) =>
  group.brands.map((brandName, brandIndex) => ({
    industry: group.industry,
    city: "全国",
    brandName,
    tcaTotal: group.scores[brandIndex],
    platformCoverage: group.coverages[brandIndex],
    delta7d: group.changes[brandIndex],
  }))
);

const citySeedCatalog = [
  {
    city: "深圳",
    industry: "新茶饮",
    brands: ["喜茶", "奈雪的茶", "霸王茶姬", "茶理宜世", "百分茶", "阿嬷手作", "茉酸奶", "古茗", "KOI", "益禾堂"],
    scores: [78, 73, 69, 61, 57, 54, 49, 44, 37, 28],
    coverages: [5, 4, 4, 4, 3, 3, 2, 2, 1, 1],
    changes: [6.1, 1.7, 2.2, -0.8, 0.4, 3.3, -1.4, -2.1, -0.6, -3.8],
  },
  {
    city: "深圳",
    industry: "餐饮连锁",
    brands: ["海底捞", "木屋烧烤", "农耕记", "费大厨", "探鱼", "绿茶餐厅", "太二酸菜鱼", "八合里牛肉火锅", "乐凯撒", "巴奴火锅"],
    scores: [82, 74, 69, 65, 58, 55, 51, 47, 41, 36],
    coverages: [5, 4, 4, 4, 3, 3, 3, 2, 2, 1],
    changes: [4.5, 8.3, 2.8, 1.2, -1.7, -0.3, -2.4, 0.9, -1.1, -3.6],
  },
  {
    city: "深圳",
    industry: "家政服务",
    brands: ["轻喜到家", "天鹅到家", "好慷在家", "58到家", "深洁管家", "安心阿姨", "悦享到家", "到位家政", "无忧保姆", "邻家家政"],
    scores: [64, 58, 54, 49, 43, 39, 35, 31, 24, 20],
    coverages: [4, 4, 3, 3, 2, 2, 2, 1, 1, 0],
    changes: [2.9, 1.1, -0.7, -1.6, 3.7, 0.4, -2.2, -0.8, -4.1, -1.3],
  },
  {
    city: "杭州",
    industry: "新茶饮",
    brands: ["霸王茶姬", "茶百道", "古茗", "喜茶", "奈雪的茶", "茶话弄", "爷爷不泡茶", "茉莉奶白", "阿水大杯茶", "沪上阿姨"],
    scores: [74, 68, 66, 63, 58, 51, 47, 41, 34, 27],
    coverages: [4, 4, 4, 4, 3, 3, 2, 2, 1, 1],
    changes: [5.4, 2.1, 1.8, -0.2, -1.9, 0.7, -1.1, -2.7, -0.4, -3.5],
  },
  {
    city: "杭州",
    industry: "教培",
    brands: ["学而思", "新东方", "火花思维", "猿辅导", "编程猫", "核桃编程", "高途", "粉笔", "童程童美", "小码王"],
    scores: [71, 66, 59, 55, 51, 47, 42, 36, 29, 23],
    coverages: [4, 4, 3, 3, 3, 2, 2, 1, 1, 0],
    changes: [3.2, 0.8, 1.4, -1.1, -0.3, 2.2, -2.6, -3.8, -1.2, -4.5],
  },
  {
    city: "杭州",
    industry: "企业服务",
    brands: ["飞书", "钉钉", "有赞", "微盟", "销售易", "纷享销客", "北森", "简道云", "伙伴云", "石墨文档"],
    scores: [79, 73, 68, 64, 55, 49, 43, 38, 31, 24],
    coverages: [5, 5, 4, 4, 3, 3, 2, 2, 1, 1],
    changes: [2.6, 1.1, 4.8, 3.3, -0.9, -1.6, -2.8, 0.5, -1.1, -3.7],
  },
  {
    city: "成都",
    industry: "餐饮连锁",
    brands: ["海底捞", "大龙燚火锅", "蜀大侠", "钢管厂五区小郡肝", "马旺子", "费大厨", "巴奴火锅", "谭鸭血", "小龙坎", "冒椒火辣"],
    scores: [76, 71, 68, 63, 58, 52, 49, 43, 39, 32],
    coverages: [4, 4, 4, 3, 3, 3, 2, 2, 2, 1],
    changes: [2.8, 7.4, 4.1, 1.2, -0.5, -1.3, -2.1, -0.9, -3.3, -4.6],
  },
  {
    city: "成都",
    industry: "新茶饮",
    brands: ["茶百道", "书亦烧仙草", "霸王茶姬", "古茗", "喜茶", "霸王柠檬茶", "沪上阿姨", "爷爷不泡茶", "茶理宜世", "蜜雪冰城"],
    scores: [72, 67, 62, 58, 54, 49, 44, 39, 34, 26],
    coverages: [4, 4, 4, 3, 3, 3, 2, 2, 1, 1],
    changes: [4.1, 2.4, 1.8, -0.7, -1.3, 0.9, -2.6, -0.8, -1.5, -3.1],
  },
  {
    city: "成都",
    industry: "家政服务",
    brands: ["天鹅到家", "川妹子家政", "好慷在家", "轻喜到家", "蓉城阿姨", "无忧保姆", "乐家管家", "悦享到家", "邻家家政", "洁妹子"],
    scores: [61, 55, 51, 47, 42, 37, 33, 29, 24, 19],
    coverages: [4, 3, 3, 3, 2, 2, 2, 1, 1, 0],
    changes: [1.7, 5.9, 0.6, -1.4, 1.1, -2.2, -0.5, -1.8, -3.4, -4.2],
  },
] as const;

mockRankingSeeds.push(
  ...citySeedCatalog.flatMap((group) =>
    group.brands.map((brandName, brandIndex) => ({
      industry: group.industry,
      city: group.city,
      brandName,
      tcaTotal: group.scores[brandIndex],
      platformCoverage: group.coverages[brandIndex],
      delta7d: group.changes[brandIndex],
    })),
  ),
);

const mockRankingSnapshots: RankingSnapshotRecord[] = mockRankingSeeds.map((seed, index) => {
  const breakdown = buildScoreBreakdown(seed, index);

  return {
    id: `rank_${index + 1}`,
    industry: seed.industry,
    city: seed.city,
    brandName: seed.brandName,
    tcaTotal: seed.tcaTotal,
    tcaConsistency: breakdown.tcaConsistency,
    tcaCoverage: breakdown.tcaCoverage,
    tcaAuthority: breakdown.tcaAuthority,
    platformCoverage: seed.platformCoverage,
    delta7d: seed.delta7d,
    snapshotDate: "2026-04-06",
    createdAt: "2026-04-06T09:00:00.000Z",
  };
});

function buildCustomerId(brandName: string) {
  const normalized = brandName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `customer_${Buffer.from(normalized || brandName, "utf8").toString("hex").slice(0, 24)}`;
}

function buildUserId(email: string) {
  return `user_${Buffer.from(email.trim().toLowerCase(), "utf8").toString("hex").slice(0, 24)}`;
}

function usePostgres() {
  return Boolean(process.env.DATABASE_URL);
}

function sqlite() {
  return getSqliteDb();
}

function getMonthlyLimit(plan: string) {
  return getPlanConfig(plan).monthlyDetectLimit;
}

function getCurrentMonthAnchor() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

function getCurrentChinaWeekAnchor() {
  const chinaOffsetMs = 8 * 60 * 60 * 1000;
  const chinaNow = new Date(Date.now() + chinaOffsetMs);
  const weekDay = chinaNow.getUTCDay() || 7;
  chinaNow.setUTCDate(chinaNow.getUTCDate() - weekDay + 1);
  chinaNow.setUTCHours(0, 0, 0, 0);
  return new Date(chinaNow.getTime() - chinaOffsetMs).toISOString();
}

function getQuotaPolicy(plan: string) {
  if (plan === "free") {
    return {
      limit: 3,
      periodLabel: "本周" as const,
      anchor: getCurrentChinaWeekAnchor(),
    };
  }

  return {
    limit: getMonthlyLimit(plan),
    periodLabel: "本月" as const,
    anchor: getCurrentMonthAnchor(),
  };
}

function shouldResetUsage(resetAt: string | null, anchor: string) {
  if (!resetAt) return true;
  return new Date(resetAt).getTime() < new Date(anchor).getTime();
}

function normalizeDetectLookupValue(value: string) {
  return value.trim().toLowerCase();
}

function buildSlugId(prefix: string, ...parts: Array<string | null | undefined>) {
  const normalized = parts
    .filter(Boolean)
    .map((part) =>
      String(part)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
    )
    .join("|");

  const digest = createHash("sha1").update(normalized || prefix, "utf8").digest("hex").slice(0, 24);
  return `${prefix}_${digest}`;
}

function hashDetectIp(ipAddress?: string | null) {
  const normalized = (ipAddress || "unknown").trim().toLowerCase();
  return createHash("sha1").update(normalized, "utf8").digest("hex");
}

const DETECT_RATE_LIMIT_WINDOW_MINUTES = 10;
const DETECT_RATE_LIMIT_MAX_REQUESTS = 6;
const GUEST_DETECT_DAILY_LIMIT = 2;
const GUEST_DETECT_WINDOW_HOURS = 24;

function clampRankingScore(value: number) {
  return Math.max(18, Math.min(98, Math.round(value)));
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sentimentWeight(value: RankingObservationJoinedRow["sentiment"]) {
  switch (value) {
    case "positive":
      return 1;
    case "neutral":
      return 0.65;
    case "negative":
      return 0.2;
    default:
      return 0;
  }
}

function normalizeSerializedReport(reportJson: string, createdAt?: string | null) {
  const report = normalizeDetectReport(JSON.parse(reportJson) as DetectReport, {
    createdAt: createdAt || null,
  });
  const normalizedJson = JSON.stringify(report);

  return {
    report,
    normalizedJson,
    needsBackfill: normalizedJson !== reportJson,
  };
}

export async function recordDetectRequestEvent(input: {
  userId?: string | null;
  clientIp?: string | null;
  signature: string;
  status: DetectRequestEventStatus;
  taskId?: string | null;
}) {
  const id = buildSlugId(
    "dre",
    input.userId || "guest",
    input.clientIp || "unknown",
    input.signature,
    input.status,
    `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  );
  const createdAt = new Date().toISOString();
  const ipHash = hashDetectIp(input.clientIp);

  if (usePostgres()) {
    await queryPostgres(
      `
        INSERT INTO detect_request_events (
          id, user_id, ip_hash, detect_signature, status, task_id, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [id, input.userId || null, ipHash, input.signature, input.status, input.taskId || null, createdAt],
    );
    return;
  }

  sqlite()
    .prepare(
      `
        INSERT INTO detect_request_events (
          id, user_id, ip_hash, detect_signature, status, task_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .run(id, input.userId || null, ipHash, input.signature, input.status, input.taskId || null, createdAt);
}

async function countDetectRequestEvents(input: {
  clientIp?: string | null;
  since: string;
  guestOnly?: boolean;
  status?: DetectRequestEventStatus;
}) {
  const ipHash = hashDetectIp(input.clientIp);

  if (usePostgres()) {
    const clauses = ["ip_hash = $1", "created_at >= $2"];
    const values: unknown[] = [ipHash, input.since];

    if (input.guestOnly) {
      clauses.push("user_id IS NULL");
    }

    if (input.status) {
      values.push(input.status);
      clauses.push(`status = $${values.length}`);
    }

    const result = await queryPostgres<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM detect_request_events WHERE ${clauses.join(" AND ")}`,
      values,
    );
    return Number(result.rows[0]?.total || 0);
  }

  const clauses = ["ip_hash = ?", "datetime(created_at) >= datetime(?)"];
  const values: unknown[] = [ipHash, input.since];

  if (input.guestOnly) {
    clauses.push("user_id IS NULL");
  }

  if (input.status) {
    clauses.push("status = ?");
    values.push(input.status);
  }

  const row = sqlite()
    .prepare(`SELECT COUNT(*) AS total FROM detect_request_events WHERE ${clauses.join(" AND ")}`)
    .get(...values) as { total: number } | undefined;

  return Number(row?.total || 0);
}

export async function checkDetectRateLimits(input: {
  clientIp?: string | null;
  guest: boolean;
}): Promise<DetectRateLimitRecord> {
  const burstSince = new Date(
    Date.now() - DETECT_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  ).toISOString();
  const recentRequestCount = await countDetectRequestEvents({
    clientIp: input.clientIp,
    since: burstSince,
  });

  if (recentRequestCount >= DETECT_RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      code: "IP_RATE_LIMITED",
      message: "当前请求过于频繁，请 10 分钟后再试。",
      retryAfterSeconds: DETECT_RATE_LIMIT_WINDOW_MINUTES * 60,
    };
  }

  if (!input.guest) {
    return {
      allowed: true,
      code: null,
      message: null,
      retryAfterSeconds: null,
    };
  }

  const guestSince = new Date(Date.now() - GUEST_DETECT_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
  const guestCount = await countDetectRequestEvents({
    clientIp: input.clientIp,
    since: guestSince,
    guestOnly: true,
    status: "allowed",
  });

  if (guestCount >= GUEST_DETECT_DAILY_LIMIT) {
    return {
      allowed: false,
      code: "GUEST_IP_LIMIT_EXCEEDED",
      message: "当前网络今天的免费体验次数已用完，请登录后继续使用或提交企业接入需求。",
      retryAfterSeconds: GUEST_DETECT_WINDOW_HOURS * 60 * 60,
    };
  }

  return {
    allowed: true,
    code: null,
    message: null,
    retryAfterSeconds: null,
  };
}

async function backfillScanReportJson(taskId: string, reportJson: string, userId?: string | null) {
  if (usePostgres()) {
    await queryPostgres(
      `UPDATE scan_reports SET report_json = $2 WHERE task_id = $1 ${userId ? "AND user_id = $3" : ""}`,
      userId ? [taskId, reportJson, userId] : [taskId, reportJson]
    );
    return;
  }

  sqlite()
    .prepare(`UPDATE scan_reports SET report_json = ? WHERE task_id = ? ${userId ? "AND user_id = ?" : ""}`)
    .run(...(userId ? [reportJson, taskId, userId] : [reportJson, taskId]));
}

async function backfillMonitorResultJson(id: string, resultJson: string, userId?: string | null) {
  if (usePostgres()) {
    await queryPostgres(
      `UPDATE monitor_results SET result_json = $2 WHERE id = $1 ${userId ? "AND user_id = $3" : ""}`,
      userId ? [id, resultJson, userId] : [id, resultJson]
    );
    return;
  }

  sqlite()
    .prepare(`UPDATE monitor_results SET result_json = ? WHERE id = ? ${userId ? "AND user_id = ?" : ""}`)
    .run(...(userId ? [resultJson, id, userId] : [resultJson, id]));
}

function mapReportRow(row: {
  task_id: string;
  brand_name: string;
  report_json: string;
  user_id: string | null;
  created_at: string;
}): ScanReportRecord {
  const normalizedReport = normalizeSerializedReport(row.report_json, row.created_at).report;

  return {
    taskId: row.task_id,
    brandName: row.brand_name,
    createdAt: row.created_at,
    userId: row.user_id,
    report: normalizedReport,
  };
}

function mapTaskRow(row: {
  task_id: string;
  customer_id: string;
  brand_name: string;
  industry: string;
  city?: string | null;
  query: string;
  selected_models_json: string;
  execution_mode: string;
  created_at: string;
}): ScanTaskRecord {
  return {
    taskId: row.task_id,
    customerId: row.customer_id,
    brandName: row.brand_name,
    industry: row.industry,
    city: row.city || "全国",
    query: row.query,
    selectedModels: JSON.parse(row.selected_models_json) as string[],
    executionMode: row.execution_mode,
    createdAt: row.created_at,
  };
}

function mapCustomerRow(row: {
  customer_id: string;
  brand_name: string;
  industry: string;
  business_summary: string;
  created_at: string;
  updated_at: string;
  task_count: string | number;
  latest_task_at: string | null;
}): CustomerRecord {
  return {
    customerId: row.customer_id,
    brandName: row.brand_name,
    industry: row.industry,
    businessSummary: row.business_summary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    taskCount: Number(row.task_count || 0),
    latestTaskAt: row.latest_task_at,
  };
}

function mapUserRow(row: {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  monthly_detect_count: number;
  monthly_detect_reset_at: string | null;
  created_at: string;
  updated_at: string;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
}): UserRecord {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    plan: row.plan,
    monthlyDetectCount: Number(row.monthly_detect_count || 0),
    monthlyDetectResetAt: row.monthly_detect_reset_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    stripeCustomerId: row.stripe_customer_id || null,
    stripeSubscriptionId: row.stripe_subscription_id || null,
  };
}

function mapKeywordRow(row: {
  id: string;
  user_id: string;
  brand_name: string;
  keyword: string;
  industry: string | null;
  business_summary: string | null;
  selected_models_json: string;
  is_active: boolean | number;
  created_at: string;
}): MonitoredKeywordRecord {
  return {
    id: row.id,
    userId: row.user_id,
    brandName: row.brand_name,
    keyword: row.keyword,
    industry: row.industry,
    businessSummary: row.business_summary || "",
    selectedModels: JSON.parse(row.selected_models_json) as string[],
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
  };
}

function mapMonitorResultRow(row: {
  id: string;
  keyword_id: string;
  user_id: string;
  tca_total: string | number;
  tca_consistency: string | number;
  tca_coverage: string | number;
  tca_authority: string | number;
  tca_level: string;
  result_json: string;
  checked_at: string;
}): MonitorResultRecord {
  const normalizedResult = normalizeSerializedReport(row.result_json, row.checked_at).report;

  return {
    id: row.id,
    keywordId: row.keyword_id,
    userId: row.user_id,
    tcaTotal: Number(row.tca_total),
    tcaConsistency: Number(row.tca_consistency),
    tcaCoverage: Number(row.tca_coverage),
    tcaAuthority: Number(row.tca_authority),
    tcaLevel: row.tca_level,
    result: normalizedResult,
    checkedAt: row.checked_at,
  };
}

function mapLeadRequestRow(row: {
  id: string;
  type: string;
  source: string;
  status: string;
  owner: string | null;
  name: string | null;
  company: string | null;
  brand: string | null;
  phone: string | null;
  contact: string | null;
  industry: string | null;
  region: string | null;
  message: string | null;
  note: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}): LeadRequestRecord {
  return {
    id: row.id,
    type: row.type as LeadRequestType,
    source: row.source,
    status: row.status as LeadRequestStatus,
    owner: row.owner,
    name: row.name,
    company: row.company,
    brand: row.brand,
    phone: row.phone,
    contact: row.contact,
    industry: row.industry,
    region: row.region,
    message: row.message,
    note: row.note,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const normalizedEmail = email.trim().toLowerCase();

  if (usePostgres()) {
    const result = await queryPostgres<{
      id: string;
      email: string;
      name: string | null;
      plan: string;
      monthly_detect_count: number;
      monthly_detect_reset_at: string | null;
      created_at: string;
      updated_at: string;
      stripe_customer_id: string | null;
      stripe_subscription_id: string | null;
    }>(
      `SELECT id, email, name, plan, monthly_detect_count, monthly_detect_reset_at, created_at, updated_at, stripe_customer_id, stripe_subscription_id
       FROM users WHERE email = $1`,
      [normalizedEmail]
    );
    return result.rows[0] ? mapUserRow(result.rows[0]) : null;
  }

  const stmt = sqlite().prepare(`
    SELECT id, email, name, plan, monthly_detect_count, monthly_detect_reset_at, created_at, updated_at, stripe_customer_id, stripe_subscription_id
    FROM users WHERE email = ?
  `);
  const row = stmt.get(normalizedEmail) as
    | {
        id: string;
        email: string;
        name: string | null;
        plan: string;
        monthly_detect_count: number;
        monthly_detect_reset_at: string | null;
        created_at: string;
        updated_at: string;
        stripe_customer_id: string | null;
        stripe_subscription_id: string | null;
      }
    | undefined;

  return row ? mapUserRow(row) : null;
}

export async function getUserById(userId: string): Promise<UserRecord | null> {
  if (usePostgres()) {
    const result = await queryPostgres<{
      id: string;
      email: string;
      name: string | null;
      plan: string;
      monthly_detect_count: number;
      monthly_detect_reset_at: string | null;
      created_at: string;
      updated_at: string;
      stripe_customer_id: string | null;
      stripe_subscription_id: string | null;
    }>(
      `SELECT id, email, name, plan, monthly_detect_count, monthly_detect_reset_at, created_at, updated_at, stripe_customer_id, stripe_subscription_id
       FROM users WHERE id = $1`,
      [userId]
    );
    return result.rows[0] ? mapUserRow(result.rows[0]) : null;
  }

  const stmt = sqlite().prepare(`
    SELECT id, email, name, plan, monthly_detect_count, monthly_detect_reset_at, created_at, updated_at, stripe_customer_id, stripe_subscription_id
    FROM users WHERE id = ?
  `);
  const row = stmt.get(userId) as
    | {
        id: string;
        email: string;
        name: string | null;
        plan: string;
        monthly_detect_count: number;
        monthly_detect_reset_at: string | null;
        created_at: string;
        updated_at: string;
        stripe_customer_id: string | null;
        stripe_subscription_id: string | null;
      }
    | undefined;

  return row ? mapUserRow(row) : null;
}

export async function createUserIfMissing(email: string, name?: string | null): Promise<UserRecord> {
  const existing = await getUserByEmail(email);
  if (existing) return existing;

  const normalizedEmail = email.trim().toLowerCase();
  const userId = buildUserId(normalizedEmail);
  const now = new Date().toISOString();

  if (usePostgres()) {
    await queryPostgres(
      `
        INSERT INTO users (
          id, email, name, plan, monthly_detect_count, monthly_detect_reset_at, created_at, updated_at
        )
        VALUES ($1, $2, $3, 'free', 0, NULL, $4, $5)
        ON CONFLICT (email) DO NOTHING
      `,
      [userId, normalizedEmail, name || null, now, now]
    );
  } else {
    const stmt = sqlite().prepare(`
      INSERT OR IGNORE INTO users (
        id, email, name, plan, monthly_detect_count, monthly_detect_reset_at, created_at, updated_at
      ) VALUES (?, ?, ?, 'free', 0, NULL, ?, ?)
    `);
    stmt.run(userId, normalizedEmail, name || null, now, now);
  }

  return (await getUserByEmail(normalizedEmail)) as UserRecord;
}

export async function createLeadRequest(input: {
  type: LeadRequestType;
  source: string;
  status?: LeadRequestStatus;
  owner?: string | null;
  name?: string | null;
  company?: string | null;
  brand?: string | null;
  phone?: string | null;
  contact?: string | null;
  industry?: string | null;
  region?: string | null;
  message?: string | null;
  note?: string | null;
  userId?: string | null;
}): Promise<LeadRequestRecord> {
  const now = new Date().toISOString();
  const row = {
    id: buildSlugId(
      "lead",
      input.type,
      input.source,
      input.name,
      input.company,
      input.brand,
      input.phone,
      input.contact,
      input.industry,
      input.region,
      input.message,
      input.note,
      now
    ),
    type: input.type,
    source: input.source.trim(),
    status: input.status || "new",
    owner: input.owner?.trim() || null,
    name: input.name?.trim() || null,
    company: input.company?.trim() || null,
    brand: input.brand?.trim() || null,
    phone: input.phone?.trim() || null,
    contact: input.contact?.trim() || null,
    industry: input.industry?.trim() || null,
    region: input.region?.trim() || null,
    message: input.message?.trim() || null,
    note: input.note?.trim() || null,
    user_id: input.userId || null,
    created_at: now,
    updated_at: now,
  };

  if (usePostgres()) {
    await queryPostgres(
      `
        INSERT INTO lead_requests (
          id, type, source, status, owner, name, company, brand, phone, contact, industry, region, message, note, user_id, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        )
      `,
      [
        row.id,
        row.type,
        row.source,
        row.status,
        row.owner,
        row.name,
        row.company,
        row.brand,
        row.phone,
        row.contact,
        row.industry,
        row.region,
        row.message,
        row.note,
        row.user_id,
        row.created_at,
        row.updated_at,
      ]
    );
  } else {
    sqlite()
      .prepare(
        `
          INSERT INTO lead_requests (
            id, type, source, status, owner, name, company, brand, phone, contact, industry, region, message, note, user_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
      .run(
        row.id,
        row.type,
        row.source,
        row.status,
        row.owner,
        row.name,
        row.company,
        row.brand,
        row.phone,
        row.contact,
        row.industry,
        row.region,
        row.message,
        row.note,
        row.user_id,
        row.created_at,
        row.updated_at
      );
  }

  return mapLeadRequestRow(row);
}

export async function listLeadRequests(limit = 100): Promise<LeadRequestRecord[]> {
  if (usePostgres()) {
    const result = await queryPostgres<{
      id: string;
      type: string;
      source: string;
      status: string;
      owner: string | null;
      name: string | null;
      company: string | null;
      brand: string | null;
      phone: string | null;
      contact: string | null;
      industry: string | null;
      region: string | null;
      message: string | null;
      note: string | null;
      user_id: string | null;
      created_at: string;
      updated_at: string;
    }>(
      `
        SELECT id, type, source, status, owner, name, company, brand, phone, contact, industry, region, message, note, user_id, created_at, updated_at
        FROM lead_requests
        ORDER BY updated_at DESC
        LIMIT $1
      `,
      [limit]
    );
    return result.rows.map(mapLeadRequestRow);
  }

  const rows = sqlite()
    .prepare(
      `
        SELECT id, type, source, status, owner, name, company, brand, phone, contact, industry, region, message, note, user_id, created_at, updated_at
        FROM lead_requests
        ORDER BY datetime(updated_at) DESC
        LIMIT ?
      `
    )
    .all(limit) as Array<{
    id: string;
    type: string;
    source: string;
    status: string;
    owner: string | null;
    name: string | null;
    company: string | null;
    brand: string | null;
    phone: string | null;
    contact: string | null;
    industry: string | null;
    region: string | null;
    message: string | null;
    note: string | null;
    user_id: string | null;
    created_at: string;
    updated_at: string;
  }>;

  return rows.map(mapLeadRequestRow);
}

export async function updateLeadRequest(input: {
  id: string;
  status?: LeadRequestStatus;
  owner?: string | null;
  note?: string | null;
}) {
  const current = usePostgres()
    ? (
        await queryPostgres<{
          id: string;
          type: string;
          source: string;
          status: string;
          owner: string | null;
          name: string | null;
          company: string | null;
          brand: string | null;
          phone: string | null;
          contact: string | null;
          industry: string | null;
          region: string | null;
          message: string | null;
          note: string | null;
          user_id: string | null;
          created_at: string;
          updated_at: string;
        }>(
          `
            SELECT id, type, source, status, owner, name, company, brand, phone, contact, industry, region, message, note, user_id, created_at, updated_at
            FROM lead_requests
            WHERE id = $1
          `,
          [input.id]
        )
      ).rows[0]
    : (sqlite()
        .prepare(
          `
            SELECT id, type, source, status, owner, name, company, brand, phone, contact, industry, region, message, note, user_id, created_at, updated_at
            FROM lead_requests
            WHERE id = ?
          `
        )
        .get(input.id) as
        | {
            id: string;
            type: string;
            source: string;
            status: string;
            owner: string | null;
            name: string | null;
            company: string | null;
            brand: string | null;
            phone: string | null;
            contact: string | null;
            industry: string | null;
            region: string | null;
            message: string | null;
            note: string | null;
            user_id: string | null;
            created_at: string;
            updated_at: string;
          }
        | undefined);

  if (!current) {
    return null;
  }

  const updated = {
    ...current,
    status: input.status || current.status,
    owner: input.owner !== undefined ? input.owner?.trim() || null : current.owner,
    note: input.note !== undefined ? input.note?.trim() || null : current.note,
    updated_at: new Date().toISOString(),
  };

  if (usePostgres()) {
    await queryPostgres(
      `
        UPDATE lead_requests
        SET status = $2, owner = $3, note = $4, updated_at = $5
        WHERE id = $1
      `,
      [updated.id, updated.status, updated.owner, updated.note, updated.updated_at]
    );
  } else {
    sqlite()
      .prepare(
        `
          UPDATE lead_requests
          SET status = ?, owner = ?, note = ?, updated_at = ?
          WHERE id = ?
        `
      )
      .run(updated.status, updated.owner, updated.note, updated.updated_at, updated.id);
  }

  return mapLeadRequestRow(updated);
}

export async function consumeDetectQuota(userId: string): Promise<DetectQuotaRecord> {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("未找到当前用户");
  }

  const policy = getQuotaPolicy(user.plan);
  const shouldReset = shouldResetUsage(user.monthlyDetectResetAt, policy.anchor);
  const currentUsed = shouldReset ? 0 : user.monthlyDetectCount;

  if (currentUsed >= policy.limit) {
    return {
      allowed: false,
      limit: policy.limit,
      used: currentUsed,
      remaining: 0,
      plan: user.plan,
      periodLabel: policy.periodLabel,
    };
  }

  const nextUsed = currentUsed + 1;
  const now = new Date().toISOString();

  if (usePostgres()) {
    await queryPostgres(
      `
        UPDATE users
        SET monthly_detect_count = $2,
            monthly_detect_reset_at = $3,
            updated_at = $4
        WHERE id = $1
      `,
      [userId, nextUsed, policy.anchor, now]
    );
  } else {
    const stmt = sqlite().prepare(`
      UPDATE users
      SET monthly_detect_count = ?,
          monthly_detect_reset_at = ?,
          updated_at = ?
      WHERE id = ?
    `);
    stmt.run(nextUsed, policy.anchor, now, userId);
  }

  return {
    allowed: true,
    limit: policy.limit,
    used: nextUsed,
    remaining: Math.max(policy.limit - nextUsed, 0),
    plan: user.plan,
    periodLabel: policy.periodLabel,
  };
}

export async function getDetectQuotaStatus(userId: string): Promise<DetectQuotaRecord | null> {
  const user = await getUserById(userId);
  if (!user) return null;

  const policy = getQuotaPolicy(user.plan);
  const used = shouldResetUsage(user.monthlyDetectResetAt, policy.anchor) ? 0 : user.monthlyDetectCount;
  return {
    allowed: used < policy.limit,
    limit: policy.limit,
    used,
    remaining: Math.max(policy.limit - used, 0),
    plan: user.plan,
    periodLabel: policy.periodLabel,
  };
}

export async function findRecentDetectTask(input: {
  userId: string;
  brandName: string;
  query: string;
  hours?: number;
}): Promise<{ taskId: string; createdAt: string } | null> {
  const hours = input.hours ?? 24;
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const normalizedBrandName = normalizeDetectLookupValue(input.brandName);
  const normalizedQuery = normalizeDetectLookupValue(input.query);

  if (usePostgres()) {
    const result = await queryPostgres<{ task_id: string; created_at: string }>(
      `
        SELECT task_id, created_at
        FROM scan_tasks
        WHERE user_id = $1
          AND LOWER(TRIM(brand_name)) = $2
          AND LOWER(TRIM(query)) = $3
          AND created_at >= $4
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [input.userId, normalizedBrandName, normalizedQuery, since]
    );

    const row = result.rows[0];
    return row
      ? {
          taskId: row.task_id,
          createdAt: row.created_at,
        }
      : null;
  }

  const row = sqlite()
    .prepare(`
      SELECT task_id, created_at
      FROM scan_tasks
      WHERE user_id = ?
        AND lower(trim(brand_name)) = ?
        AND lower(trim(query)) = ?
        AND datetime(created_at) >= datetime(?)
      ORDER BY datetime(created_at) DESC
      LIMIT 1
    `)
    .get(input.userId, normalizedBrandName, normalizedQuery, since) as
    | { task_id: string; created_at: string }
    | undefined;

  return row
    ? {
        taskId: row.task_id,
        createdAt: row.created_at,
      }
    : null;
}

export async function updateUserPlan(
  userId: string,
  plan: string,
  options?: { stripeCustomerId?: string | null; stripeSubscriptionId?: string | null }
) {
  const now = new Date().toISOString();

  if (usePostgres()) {
    await queryPostgres(
      `
        UPDATE users
        SET plan = $2,
            stripe_customer_id = COALESCE($3, stripe_customer_id),
            stripe_subscription_id = $4,
            updated_at = $5
        WHERE id = $1
      `,
      [userId, plan, options?.stripeCustomerId || null, options?.stripeSubscriptionId || null, now]
    );
    return;
  }

  const stmt = sqlite().prepare(`
    UPDATE users
    SET plan = ?,
        stripe_customer_id = COALESCE(?, stripe_customer_id),
        stripe_subscription_id = ?,
        updated_at = ?
    WHERE id = ?
  `);
  stmt.run(plan, options?.stripeCustomerId || null, options?.stripeSubscriptionId || null, now, userId);
}

export async function addMonitoredKeyword(input: {
  userId: string;
  brandName: string;
  keyword: string;
  industry?: string | null;
  businessSummary?: string;
  selectedModels: string[];
}) {
  const user = await getUserById(input.userId);
  if (!user) {
    throw new Error("未找到当前用户");
  }

  const plan = getPlanConfig(user.plan);
  if (plan.maxKeywords <= 0) {
    throw new Error("当前套餐暂不支持关键词监控，请升级后继续使用。");
  }

  const existing = await listMonitoredKeywords(input.userId);
  if (existing.length >= plan.maxKeywords) {
    throw new Error(`当前套餐最多支持 ${plan.maxKeywords} 个监控关键词。`);
  }

  const id = `kw_${Math.random().toString(36).slice(2, 10)}`;
  const createdAt = new Date().toISOString();

  if (usePostgres()) {
    await queryPostgres(
      `
        INSERT INTO monitored_keywords (
          id, user_id, brand_name, keyword, industry, business_summary, selected_models_json, is_active, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, $8)
      `,
      [
        id,
        input.userId,
        input.brandName,
        input.keyword,
        input.industry || null,
        input.businessSummary || "",
        JSON.stringify(input.selectedModels),
        createdAt,
      ]
    );
  } else {
    sqlite().prepare(`
      INSERT INTO monitored_keywords (
        id, user_id, brand_name, keyword, industry, business_summary, selected_models_json, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      id,
      input.userId,
      input.brandName,
      input.keyword,
      input.industry || null,
      input.businessSummary || "",
      JSON.stringify(input.selectedModels),
      createdAt
    );
  }

  return id;
}

export async function listMonitoredKeywords(userId: string): Promise<MonitoredKeywordRecord[]> {
  if (usePostgres()) {
    const result = await queryPostgres<{
      id: string;
      user_id: string;
      brand_name: string;
      keyword: string;
      industry: string | null;
      business_summary: string | null;
      selected_models_json: string;
      is_active: boolean;
      created_at: string;
    }>(
      `
        SELECT id, user_id, brand_name, keyword, industry, business_summary, selected_models_json, is_active, created_at
        FROM monitored_keywords
        WHERE user_id = $1
        ORDER BY created_at DESC
      `,
      [userId]
    );
    return result.rows.map(mapKeywordRow);
  }

  const rows = sqlite()
    .prepare(`
      SELECT id, user_id, brand_name, keyword, industry, business_summary, selected_models_json, is_active, created_at
      FROM monitored_keywords
      WHERE user_id = ?
      ORDER BY datetime(created_at) DESC
    `)
    .all(userId) as Array<{
    id: string;
    user_id: string;
    brand_name: string;
    keyword: string;
    industry: string | null;
    business_summary: string | null;
    selected_models_json: string;
    is_active: number;
    created_at: string;
  }>;

  return rows.map(mapKeywordRow);
}

export async function deleteMonitoredKeyword(id: string, userId: string) {
  if (usePostgres()) {
    await queryPostgres(`DELETE FROM monitored_keywords WHERE id = $1 AND user_id = $2`, [id, userId]);
    return;
  }

  sqlite().prepare(`DELETE FROM monitored_keywords WHERE id = ? AND user_id = ?`).run(id, userId);
}

export async function saveMonitorResult(input: {
  keywordId: string;
  userId: string;
  report: DetectReport;
}) {
  const id = `mon_${Math.random().toString(36).slice(2, 10)}`;
  const checkedAt = new Date().toISOString();
  const report = normalizeDetectReport(input.report, { createdAt: checkedAt });

  if (usePostgres()) {
    await queryPostgres(
      `
        INSERT INTO monitor_results (
          id, keyword_id, user_id, tca_total, tca_consistency, tca_coverage, tca_authority, tca_level, result_json, checked_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
      [
        id,
        input.keywordId,
        input.userId,
        report.score.total,
        report.score.consistency,
        report.score.coverage,
        report.score.authority,
        report.score.level,
        JSON.stringify(report),
        checkedAt,
      ]
    );
    return id;
  }

  sqlite().prepare(`
    INSERT INTO monitor_results (
      id, keyword_id, user_id, tca_total, tca_consistency, tca_coverage, tca_authority, tca_level, result_json, checked_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.keywordId,
    input.userId,
    report.score.total,
    report.score.consistency,
    report.score.coverage,
    report.score.authority,
    report.score.level,
    JSON.stringify(report),
    checkedAt
  );
  return id;
}

export async function listMonitorResults(keywordId: string, userId: string): Promise<MonitorResultRecord[]> {
  if (usePostgres()) {
    const result = await queryPostgres<{
      id: string;
      keyword_id: string;
      user_id: string;
      tca_total: string;
      tca_consistency: string;
      tca_coverage: string;
      tca_authority: string;
      tca_level: string;
      result_json: string;
      checked_at: string;
    }>(
      `
        SELECT id, keyword_id, user_id, tca_total, tca_consistency, tca_coverage, tca_authority, tca_level, result_json, checked_at
        FROM monitor_results
        WHERE keyword_id = $1 AND user_id = $2
        ORDER BY checked_at DESC
      `,
      [keywordId, userId]
    );
    return Promise.all(
      result.rows.map(async (row) => {
        const normalized = normalizeSerializedReport(row.result_json, row.checked_at);
        if (normalized.needsBackfill) {
          await backfillMonitorResultJson(row.id, normalized.normalizedJson, row.user_id);
        }
        return mapMonitorResultRow({
          ...row,
          result_json: normalized.normalizedJson,
        });
      })
    );
  }

  const rows = sqlite()
    .prepare(`
      SELECT id, keyword_id, user_id, tca_total, tca_consistency, tca_coverage, tca_authority, tca_level, result_json, checked_at
      FROM monitor_results
      WHERE keyword_id = ? AND user_id = ?
      ORDER BY datetime(checked_at) DESC
    `)
    .all(keywordId, userId) as Array<{
    id: string;
    keyword_id: string;
    user_id: string;
    tca_total: number;
    tca_consistency: number;
    tca_coverage: number;
    tca_authority: number;
    tca_level: string;
    result_json: string;
    checked_at: string;
  }>;

  return Promise.all(
    rows.map(async (row) => {
      const normalized = normalizeSerializedReport(row.result_json, row.checked_at);
      if (normalized.needsBackfill) {
        await backfillMonitorResultJson(row.id, normalized.normalizedJson, row.user_id);
      }
      return mapMonitorResultRow({
        ...row,
        result_json: normalized.normalizedJson,
      });
    })
  );
}

export async function listMonitorTrend(userId: string, days = 30): Promise<MonitorTrendPoint[]> {
  if (usePostgres()) {
    const result = await queryPostgres<{
      date: string;
      tca_total: string | number;
      consistency: string | number;
      coverage: string | number;
      authority: string | number;
    }>(
      `
        SELECT
          TO_CHAR(DATE(checked_at), 'YYYY-MM-DD') AS date,
          ROUND(AVG(tca_total)::numeric, 1) AS tca_total,
          ROUND(AVG(tca_consistency)::numeric, 1) AS consistency,
          ROUND(AVG(tca_coverage)::numeric, 1) AS coverage,
          ROUND(AVG(tca_authority)::numeric, 1) AS authority
        FROM monitor_results
        WHERE user_id = $1
          AND checked_at >= NOW() - ($2 || ' days')::interval
        GROUP BY DATE(checked_at)
        ORDER BY DATE(checked_at) ASC
      `,
      [userId, String(days)]
    );

    return result.rows.map((row) => ({
      date: row.date,
      tcaTotal: Number(row.tca_total || 0),
      consistency: Number(row.consistency || 0),
      coverage: Number(row.coverage || 0),
      authority: Number(row.authority || 0),
    }));
  }

  const anchor = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const rows = sqlite()
    .prepare(`
      SELECT
        substr(checked_at, 1, 10) AS date,
        ROUND(AVG(tca_total), 1) AS tca_total,
        ROUND(AVG(tca_consistency), 1) AS consistency,
        ROUND(AVG(tca_coverage), 1) AS coverage,
        ROUND(AVG(tca_authority), 1) AS authority
      FROM monitor_results
      WHERE user_id = ?
        AND datetime(checked_at) >= datetime(?)
      GROUP BY substr(checked_at, 1, 10)
      ORDER BY substr(checked_at, 1, 10) ASC
    `)
    .all(userId, anchor) as Array<{
    date: string;
    tca_total: number;
    consistency: number;
    coverage: number;
    authority: number;
  }>;

  return rows.map((row) => ({
    date: row.date,
    tcaTotal: Number(row.tca_total || 0),
    consistency: Number(row.consistency || 0),
    coverage: Number(row.coverage || 0),
    authority: Number(row.authority || 0),
  }));
}

export async function listActiveMonitoredKeywords(): Promise<MonitoredKeywordRecord[]> {
  if (usePostgres()) {
    const result = await queryPostgres<{
      id: string;
      user_id: string;
      brand_name: string;
      keyword: string;
      industry: string | null;
      business_summary: string | null;
      selected_models_json: string;
      is_active: boolean;
      created_at: string;
    }>(
      `
        SELECT id, user_id, brand_name, keyword, industry, business_summary, selected_models_json, is_active, created_at
        FROM monitored_keywords
        WHERE is_active = TRUE
        ORDER BY created_at ASC
      `
    );
    return result.rows.map(mapKeywordRow);
  }

  const rows = sqlite()
    .prepare(`
      SELECT id, user_id, brand_name, keyword, industry, business_summary, selected_models_json, is_active, created_at
      FROM monitored_keywords
      WHERE is_active = 1
      ORDER BY datetime(created_at) ASC
    `)
    .all() as Array<{
    id: string;
    user_id: string;
    brand_name: string;
    keyword: string;
    industry: string | null;
    business_summary: string | null;
    selected_models_json: string;
    is_active: number;
    created_at: string;
  }>;
  return rows.map(mapKeywordRow);
}

export async function getDashboardSummary(userId: string, trendDays = 30) {
  const [user, keywords, reports, trend, customers, tasks] = await Promise.all([
    getUserById(userId),
    listMonitoredKeywords(userId),
    listReports(100, userId),
    listMonitorTrend(userId, trendDays),
    listCustomers(1000, userId),
    listScanTasks(1000, userId),
  ]);
  const quota = user ? await getDetectQuotaStatus(userId) : null;
  const latestSeven = reports.slice(0, 7);
  const latestThirty = reports.slice(0, 30);
  const averageScore = latestThirty.length
    ? Math.round(latestThirty.reduce((sum, item) => sum + item.report.score.total, 0) / latestThirty.length)
    : 0;
  const weeklyDelta =
    latestSeven.length >= 2
      ? Number(
          (
            ((latestSeven[0].report.score.total - latestSeven[latestSeven.length - 1].report.score.total) /
              Math.max(latestSeven[latestSeven.length - 1].report.score.total, 1)) *
            100
          ).toFixed(1)
        )
      : 0;

  const keywordMetrics = await Promise.all(
    keywords.map(async (keyword) => {
      const history = await listMonitorResults(keyword.id, userId);
      const latest = history[0] || null;
      const weekAgo = history[6] || history[history.length - 1] || null;
      const delta7d =
        latest && weekAgo ? Number((latest.tcaTotal - weekAgo.tcaTotal).toFixed(1)) : 0;
      return {
        ...keyword,
        latestScore: latest?.tcaTotal ?? null,
        latestLevel: latest?.tcaLevel ?? null,
        delta7d,
        platformCoverage: latest
          ? latest.result.results.filter((item) => item.mentioned).length
          : 0,
      };
    })
  );

  const latestReportAt = reports[0]?.createdAt || null;
  const latestMonitorAt = trend[trend.length - 1]?.date || null;

  return {
    user,
    quota,
    averageScore,
    weeklyDelta,
    trend,
    customerCount: customers.length,
    taskCount: tasks.length,
    reportCount: reports.length,
    activeKeywordCount: keywords.filter((item) => item.isActive).length,
    latestReportAt,
    latestMonitorAt,
    monitoredKeywords: keywordMetrics,
  };
}

export type { UserRecord, MonitoredKeywordRecord, MonitorResultRecord, DetectQuotaRecord };

export async function saveReport(taskId: string, report: DetectReport, userId?: string | null) {
  const createdAt = new Date().toISOString();
  const normalizedReport = normalizeDetectReport(report, { createdAt });
  const customerId = buildCustomerId(normalizedReport.input.brandName);
  const executionMode = normalizedReport.debug?.mode || "mock";

  if (usePostgres()) {
    await queryPostgres(
      `
        INSERT INTO customers (
          customer_id, brand_name, industry, business_summary, user_id, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (brand_name)
        DO UPDATE SET
          industry = EXCLUDED.industry,
          business_summary = EXCLUDED.business_summary,
          user_id = COALESCE(customers.user_id, EXCLUDED.user_id),
          updated_at = EXCLUDED.updated_at
      `,
      [
        customerId,
        normalizedReport.input.brandName,
        normalizedReport.input.industry,
        normalizedReport.input.businessSummary,
        userId || null,
        createdAt,
        createdAt,
      ]
    );

    await queryPostgres(
      `
        INSERT INTO scan_tasks (
          task_id, customer_id, brand_name, industry, city, query, selected_models_json, execution_mode, user_id, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (task_id)
        DO UPDATE SET
          customer_id = EXCLUDED.customer_id,
          brand_name = EXCLUDED.brand_name,
          industry = EXCLUDED.industry,
          city = EXCLUDED.city,
          query = EXCLUDED.query,
          selected_models_json = EXCLUDED.selected_models_json,
          execution_mode = EXCLUDED.execution_mode,
          user_id = EXCLUDED.user_id
      `,
      [
        taskId,
        customerId,
        normalizedReport.input.brandName,
        normalizedReport.input.industry,
        normalizedReport.input.locale || "全国",
        normalizedReport.input.query,
        JSON.stringify(normalizedReport.input.selectedModels),
        executionMode,
        userId || null,
        createdAt,
      ]
    );

    await queryPostgres(
      `
        INSERT INTO scan_reports (task_id, brand_name, report_json, user_id, created_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (task_id)
        DO UPDATE SET
          brand_name = EXCLUDED.brand_name,
          report_json = EXCLUDED.report_json,
          user_id = EXCLUDED.user_id,
          created_at = EXCLUDED.created_at
      `,
      [taskId, normalizedReport.input.brandName, JSON.stringify(normalizedReport), userId || null, createdAt]
    );
    return;
  }

  const upsertCustomerStmt = sqlite().prepare(`
    INSERT INTO customers (
      customer_id,
      brand_name,
      industry,
      business_summary,
      user_id,
      created_at,
      updated_at
    ) VALUES (
      @customer_id,
      @brand_name,
      @industry,
      @business_summary,
      @user_id,
      @created_at,
      @updated_at
    )
    ON CONFLICT(brand_name) DO UPDATE SET
      industry = excluded.industry,
      business_summary = excluded.business_summary,
      user_id = COALESCE(customers.user_id, excluded.user_id),
      updated_at = excluded.updated_at
  `);

  const upsertTaskStmt = sqlite().prepare(`
    INSERT OR REPLACE INTO scan_tasks (
      task_id,
      customer_id,
      brand_name,
      industry,
      city,
      query,
      selected_models_json,
      execution_mode,
      user_id,
      created_at
    ) VALUES (
      @task_id,
      @customer_id,
      @brand_name,
      @industry,
      @city,
      @query,
      @selected_models_json,
      @execution_mode,
      @user_id,
      @created_at
    )
  `);

  const upsertReportStmt = sqlite().prepare(`
    INSERT OR REPLACE INTO scan_reports (
      task_id,
      brand_name,
      report_json,
      user_id,
      created_at
    ) VALUES (
      @task_id,
      @brand_name,
      @report_json,
      @user_id,
      @created_at
    )
  `);

  upsertCustomerStmt.run({
    customer_id: customerId,
    brand_name: normalizedReport.input.brandName,
    industry: normalizedReport.input.industry,
    business_summary: normalizedReport.input.businessSummary,
    user_id: userId || null,
    created_at: createdAt,
    updated_at: createdAt,
  });

  upsertTaskStmt.run({
    task_id: taskId,
    customer_id: customerId,
    brand_name: normalizedReport.input.brandName,
    industry: normalizedReport.input.industry,
    city: normalizedReport.input.locale || "全国",
    query: normalizedReport.input.query,
    selected_models_json: JSON.stringify(normalizedReport.input.selectedModels),
    execution_mode: executionMode,
    user_id: userId || null,
    created_at: createdAt,
  });

  upsertReportStmt.run({
    task_id: taskId,
    brand_name: normalizedReport.input.brandName,
    report_json: JSON.stringify(normalizedReport),
    user_id: userId || null,
    created_at: createdAt,
  });
}

export async function getReport(taskId: string, userId?: string | null): Promise<DetectReport | null> {
  if (usePostgres()) {
    const result = await queryPostgres<{
      report_json: string;
      user_id: string | null;
    }>(`SELECT report_json, user_id FROM scan_reports WHERE task_id = $1`, [taskId]);
    const row = result.rows[0];
    if (!row) return null;
    if (row.user_id && row.user_id !== userId) return null;
    const normalized = normalizeSerializedReport(row.report_json);
    if (normalized.needsBackfill) {
      await backfillScanReportJson(taskId, normalized.normalizedJson, row.user_id);
    }
    return normalized.report;
  }

  const stmt = sqlite().prepare(`SELECT report_json, user_id FROM scan_reports WHERE task_id = ?`);
  const row = stmt.get(taskId) as { report_json: string; user_id: string | null } | undefined;
  if (!row) return null;
  if (row.user_id && row.user_id !== userId) return null;
  const normalized = normalizeSerializedReport(row.report_json);
  if (normalized.needsBackfill) {
    await backfillScanReportJson(taskId, normalized.normalizedJson, row.user_id);
  }
  return normalized.report;
}

export async function getReportWithMeta(
  taskId: string,
  userId?: string | null
): Promise<{ report: DetectReport; createdAt: string | null } | null> {
  if (usePostgres()) {
    const result = await queryPostgres<{
      report_json: string;
      user_id: string | null;
      created_at: string;
    }>(`SELECT report_json, user_id, created_at FROM scan_reports WHERE task_id = $1`, [taskId]);
    const row = result.rows[0];
    if (!row) return null;
    if (row.user_id && row.user_id !== userId) return null;
    const normalized = normalizeSerializedReport(row.report_json, row.created_at);
    if (normalized.needsBackfill) {
      await backfillScanReportJson(taskId, normalized.normalizedJson, row.user_id);
    }
    return {
      report: normalized.report,
      createdAt: row.created_at || null,
    };
  }

  const stmt = sqlite().prepare(`SELECT report_json, user_id, created_at FROM scan_reports WHERE task_id = ?`);
  const row = stmt.get(taskId) as { report_json: string; user_id: string | null; created_at: string } | undefined;
  if (!row) return null;
  if (row.user_id && row.user_id !== userId) return null;
  const normalized = normalizeSerializedReport(row.report_json, row.created_at);
  if (normalized.needsBackfill) {
    await backfillScanReportJson(taskId, normalized.normalizedJson, row.user_id);
  }
  return {
    report: normalized.report,
    createdAt: row.created_at || null,
  };
}

export async function listReports(limit = 20, userId?: string): Promise<ScanReportRecord[]> {
  if (usePostgres()) {
    const result = await queryPostgres<{
      task_id: string;
      brand_name: string;
      report_json: string;
      user_id: string | null;
      created_at: string;
    }>(
      `
        SELECT task_id, brand_name, report_json, user_id, created_at
        FROM scan_reports
        ${userId ? "WHERE user_id = $2" : ""}
        ORDER BY created_at DESC
        LIMIT $1
      `,
      userId ? [limit, userId] : [limit]
    );

    return Promise.all(
      result.rows.map(async (row) => {
        const normalized = normalizeSerializedReport(row.report_json, row.created_at);
        if (normalized.needsBackfill) {
          await backfillScanReportJson(row.task_id, normalized.normalizedJson, row.user_id);
        }
        return mapReportRow({
          ...row,
          report_json: normalized.normalizedJson,
        });
      })
    );
  }

  const stmt = sqlite().prepare(`
    SELECT task_id, brand_name, report_json, user_id, created_at
    FROM scan_reports
    ${userId ? "WHERE user_id = ?" : ""}
    ORDER BY datetime(created_at) DESC
    LIMIT ?
  `);

  const rows = stmt.all(...(userId ? [userId, limit] : [limit])) as Array<{
    task_id: string;
    brand_name: string;
    report_json: string;
    user_id: string | null;
    created_at: string;
  }>;

  return Promise.all(
    rows.map(async (row) => {
      const normalized = normalizeSerializedReport(row.report_json, row.created_at);
      if (normalized.needsBackfill) {
        await backfillScanReportJson(row.task_id, normalized.normalizedJson, row.user_id);
      }
      return mapReportRow({
        ...row,
        report_json: normalized.normalizedJson,
      });
    })
  );
}

export async function deleteReport(taskId: string, userId?: string) {
  if (usePostgres()) {
    await queryPostgres(
      `DELETE FROM scan_reports WHERE task_id = $1 ${userId ? "AND user_id = $2" : ""}`,
      userId ? [taskId, userId] : [taskId]
    );
    return;
  }

  const stmt = sqlite().prepare(
    `DELETE FROM scan_reports WHERE task_id = ? ${userId ? "AND user_id = ?" : ""}`
  );
  stmt.run(...(userId ? [taskId, userId] : [taskId]));
}

export async function listCustomers(limit = 50, userId?: string): Promise<CustomerRecord[]> {
  if (usePostgres()) {
    const result = await queryPostgres<{
      customer_id: string;
      brand_name: string;
      industry: string;
      business_summary: string;
      created_at: string;
      updated_at: string;
      task_count: string;
      latest_task_at: string | null;
    }>(
      `
        SELECT
          c.customer_id,
          c.brand_name,
          c.industry,
          c.business_summary,
          c.created_at,
          c.updated_at,
          COUNT(t.task_id) AS task_count,
          MAX(t.created_at) AS latest_task_at
        FROM customers c
        LEFT JOIN scan_tasks t ON t.customer_id = c.customer_id
        ${userId ? "WHERE c.user_id = $2" : ""}
        GROUP BY c.customer_id, c.brand_name, c.industry, c.business_summary, c.created_at, c.updated_at
        ORDER BY c.updated_at DESC
        LIMIT $1
      `,
      userId ? [limit, userId] : [limit]
    );
    return result.rows.map(mapCustomerRow);
  }

  const stmt = sqlite().prepare(`
    SELECT
      c.customer_id,
      c.brand_name,
      c.industry,
      c.business_summary,
      c.created_at,
      c.updated_at,
      COUNT(t.task_id) AS task_count,
      MAX(t.created_at) AS latest_task_at
    FROM customers c
    LEFT JOIN scan_tasks t ON t.customer_id = c.customer_id
    ${userId ? "WHERE c.user_id = ?" : ""}
    GROUP BY c.customer_id, c.brand_name, c.industry, c.business_summary, c.created_at, c.updated_at
    ORDER BY datetime(c.updated_at) DESC
    LIMIT ?
  `);

  const rows = stmt.all(...(userId ? [userId, limit] : [limit])) as Array<{
    customer_id: string;
    brand_name: string;
    industry: string;
    business_summary: string;
    created_at: string;
    updated_at: string;
    task_count: number;
    latest_task_at: string | null;
  }>;

  return rows.map(mapCustomerRow);
}

export async function listScanTasks(limit = 50, userId?: string): Promise<ScanTaskRecord[]> {
  if (usePostgres()) {
    const result = await queryPostgres<{
      task_id: string;
      customer_id: string;
      brand_name: string;
      industry: string;
      query: string;
      selected_models_json: string;
      execution_mode: string;
      created_at: string;
    }>(
      `
        SELECT task_id, customer_id, brand_name, industry, query, selected_models_json, execution_mode, created_at
        FROM scan_tasks
        ${userId ? "WHERE user_id = $2" : ""}
        ORDER BY created_at DESC
        LIMIT $1
      `,
      userId ? [limit, userId] : [limit]
    );

    return result.rows.map(mapTaskRow);
  }

  const stmt = sqlite().prepare(`
    SELECT task_id, customer_id, brand_name, industry, query, selected_models_json, execution_mode, created_at
    FROM scan_tasks
    ${userId ? "WHERE user_id = ?" : ""}
    ORDER BY datetime(created_at) DESC
    LIMIT ?
  `);

  const rows = stmt.all(...(userId ? [userId, limit] : [limit])) as Array<{
    task_id: string;
    customer_id: string;
    brand_name: string;
    industry: string;
    query: string;
    selected_models_json: string;
    execution_mode: string;
    created_at: string;
  }>;

  return rows.map(mapTaskRow);
}

export async function getCustomer(customerId: string, userId?: string): Promise<CustomerRecord | null> {
  if (usePostgres()) {
    const result = await queryPostgres<{
      customer_id: string;
      brand_name: string;
      industry: string;
      business_summary: string;
      created_at: string;
      updated_at: string;
      task_count: string;
      latest_task_at: string | null;
    }>(
      `
        SELECT
          c.customer_id,
          c.brand_name,
          c.industry,
          c.business_summary,
          c.created_at,
          c.updated_at,
          COUNT(t.task_id) AS task_count,
          MAX(t.created_at) AS latest_task_at
        FROM customers c
        LEFT JOIN scan_tasks t ON t.customer_id = c.customer_id
        WHERE c.customer_id = $1
        ${userId ? "AND c.user_id = $2" : ""}
        GROUP BY c.customer_id, c.brand_name, c.industry, c.business_summary, c.created_at, c.updated_at
      `,
      userId ? [customerId, userId] : [customerId]
    );
    return result.rows[0] ? mapCustomerRow(result.rows[0]) : null;
  }

  const stmt = sqlite().prepare(`
    SELECT
      c.customer_id,
      c.brand_name,
      c.industry,
      c.business_summary,
      c.created_at,
      c.updated_at,
      COUNT(t.task_id) AS task_count,
      MAX(t.created_at) AS latest_task_at
    FROM customers c
    LEFT JOIN scan_tasks t ON t.customer_id = c.customer_id
    WHERE c.customer_id = ?
    ${userId ? "AND c.user_id = ?" : ""}
    GROUP BY c.customer_id, c.brand_name, c.industry, c.business_summary, c.created_at, c.updated_at
  `);

  const row = stmt.get(...(userId ? [customerId, userId] : [customerId])) as
    | {
        customer_id: string;
        brand_name: string;
        industry: string;
        business_summary: string;
        created_at: string;
        updated_at: string;
        task_count: number;
        latest_task_at: string | null;
      }
    | undefined;

  return row ? mapCustomerRow(row) : null;
}

export async function listCustomerTasks(
  customerId: string,
  limit = 20,
  userId?: string
): Promise<ScanTaskRecord[]> {
  if (usePostgres()) {
    const result = await queryPostgres<{
      task_id: string;
      customer_id: string;
      brand_name: string;
      industry: string;
      query: string;
      selected_models_json: string;
      execution_mode: string;
      created_at: string;
    }>(
      `
        SELECT task_id, customer_id, brand_name, industry, query, selected_models_json, execution_mode, created_at
        FROM scan_tasks
        WHERE customer_id = $1
        ${userId ? "AND user_id = $3" : ""}
        ORDER BY created_at DESC
        LIMIT $2
      `,
      userId ? [customerId, limit, userId] : [customerId, limit]
    );
    return result.rows.map(mapTaskRow);
  }

  const stmt = sqlite().prepare(`
    SELECT task_id, customer_id, brand_name, industry, query, selected_models_json, execution_mode, created_at
    FROM scan_tasks
    WHERE customer_id = ?
    ${userId ? "AND user_id = ?" : ""}
    ORDER BY datetime(created_at) DESC
    LIMIT ?
  `);

  const rows = stmt.all(...(userId ? [customerId, userId, limit] : [customerId, limit])) as Array<{
    task_id: string;
    customer_id: string;
    brand_name: string;
    industry: string;
    query: string;
    selected_models_json: string;
    execution_mode: string;
    created_at: string;
  }>;

  return rows.map(mapTaskRow);
}

export async function getCustomerDetail(
  customerId: string,
  userId?: string
): Promise<CustomerDetailRecord | null> {
  const customer = await getCustomer(customerId, userId);
  if (!customer) return null;

  const tasks = await listCustomerTasks(customerId, 50, userId);
  const reports = await Promise.all(
    tasks.map(async (task) => {
      const report = await getReport(task.taskId, userId);
      if (!report) return null;

      return {
        taskId: task.taskId,
        brandName: task.brandName,
        createdAt: task.createdAt,
        userId: userId || null,
        report,
      };
    })
  );

  return {
    ...customer,
    tasks,
    reports: reports.filter((item): item is ScanReportRecord => Boolean(item)),
  };
}

function parseSourceNames(value: unknown) {
  if (!value) return [] as string[];

  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parseSourceNames(parsed);
    } catch {
      return value
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

async function listRankingObservationRows(options?: {
  industry?: string;
  city?: string;
  days?: number;
}) {
  const industry = options?.industry?.trim();
  const city = options?.city?.trim() || "全国";
  const days = options?.days ?? 30;

  if (usePostgres()) {
    const values: unknown[] = [];
    const where: string[] = [];

    values.push(city);
    where.push(`o.city = $${values.length}`);

    if (industry && industry !== "全部") {
      values.push(industry);
      where.push(`o.industry = $${values.length}`);
    }

    if (days && Number.isFinite(days)) {
      values.push(String(days));
      where.push(`o.snapshot_date >= CURRENT_DATE - ($${values.length}::int - 1)`);
    }

    const result = await queryPostgres<{
      snapshot_date: string;
      city: string;
      industry: string;
      query_text: string;
      brand_name: string;
      brand_type: string;
      city_scope: string;
      model: string;
      mentioned: boolean;
      mention_position: number | null;
      sentiment: string | null;
      source_names_json: string | null;
      answer_text: string | null;
      created_at: string;
    }>(
      `
        SELECT
          o.snapshot_date::text AS snapshot_date,
          o.city,
          o.industry,
          q.query_text,
          b.brand_name,
          b.brand_type,
          b.city_scope,
          o.model,
          o.mentioned,
          o.mention_position,
          o.sentiment,
          o.source_names_json,
          o.answer_text,
          o.created_at::text AS created_at
        FROM ranking_observations o
        INNER JOIN ranking_queries q ON q.id = o.query_id
        INNER JOIN ranking_brands b ON b.id = o.brand_id
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
        ORDER BY o.snapshot_date DESC, o.created_at DESC
      `,
      values
    );

    return result.rows.map((row) => ({
      snapshotDate: row.snapshot_date,
      city: row.city,
      industry: row.industry,
      queryText: row.query_text,
      brandName: row.brand_name,
      brandType: (row.brand_type || "national") as RankingObservationJoinedRow["brandType"],
      cityScope: row.city_scope || "全国",
      model: row.model as PlatformKey,
      mentioned: Boolean(row.mentioned),
      mentionPosition: row.mention_position ?? null,
      sentiment: (row.sentiment || null) as RankingObservationJoinedRow["sentiment"],
      sourceNames: parseSourceNames(row.source_names_json),
      answerText: row.answer_text || "",
      createdAt: row.created_at,
    })) as RankingObservationJoinedRow[];
  }

  const stmt = sqlite().prepare(`
    SELECT
      o.snapshot_date,
      o.city,
      o.industry,
      q.query_text,
      b.brand_name,
      b.brand_type,
      b.city_scope,
      o.model,
      o.mentioned,
      o.mention_position,
      o.sentiment,
      o.source_names_json,
      o.answer_text,
      o.created_at
    FROM ranking_observations o
    INNER JOIN ranking_queries q ON q.id = o.query_id
    INNER JOIN ranking_brands b ON b.id = o.brand_id
    WHERE o.city = ?
      ${industry && industry !== "全部" ? "AND o.industry = ?" : ""}
      ${days && Number.isFinite(days) ? "AND o.snapshot_date >= ?" : ""}
    ORDER BY o.snapshot_date DESC, o.created_at DESC
  `);

  const anchor = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const rows = stmt.all(
    ...(industry && industry !== "全部"
      ? days && Number.isFinite(days)
        ? [city, industry, anchor]
        : [city, industry]
      : days && Number.isFinite(days)
        ? [city, anchor]
        : [city])
  ) as Array<{
    snapshot_date: string;
    city: string;
    industry: string;
    query_text: string;
    brand_name: string;
    brand_type: string;
    city_scope: string;
    model: string;
    mentioned: number;
    mention_position: number | null;
    sentiment: string | null;
    source_names_json: string | null;
    answer_text: string | null;
    created_at: string;
  }>;

  return rows.map((row) => ({
    snapshotDate: row.snapshot_date,
    city: row.city,
    industry: row.industry,
    queryText: row.query_text,
    brandName: row.brand_name,
    brandType: (row.brand_type || "national") as RankingObservationJoinedRow["brandType"],
    cityScope: row.city_scope || "全国",
    model: row.model as PlatformKey,
    mentioned: Boolean(row.mentioned),
    mentionPosition: row.mention_position ?? null,
    sentiment: (row.sentiment || null) as RankingObservationJoinedRow["sentiment"],
    sourceNames: parseSourceNames(row.source_names_json),
    answerText: row.answer_text || "",
    createdAt: row.created_at,
  })) as RankingObservationJoinedRow[];
}

function buildPlatformDetailFromRows(rows: RankingObservationJoinedRow[]) {
  const details = {} as Record<PlatformKey, PlatformDetail>;

  (["doubao", "deepseek", "kimi", "qianwen", "yuanbao", "wenxin"] as PlatformKey[]).forEach((platform) => {
    const matched = rows.filter((row) => row.model === platform);
    const mentionedRows = matched.filter((row) => row.mentioned);
    const position = mentionedRows.length
      ? Math.round(average(mentionedRows.map((row) => row.mentionPosition || 10)))
      : null;
    const sentimentScore = average(mentionedRows.map((row) => sentimentWeight(row.sentiment)));
    const sentiment: PlatformDetail["sentiment"] =
      !mentionedRows.length
        ? null
        : sentimentScore >= 0.84
          ? "positive"
          : sentimentScore >= 0.45
            ? "neutral"
            : "negative";

    details[platform] = {
      mentioned: mentionedRows.length > 0,
      position,
      sentiment,
    };
  });

  return details;
}

function scoreObservationGroup(rows: RankingObservationJoinedRow[]) {
  const totalPlatforms = 6;
  const mentionedRows = rows.filter((row) => row.mentioned);
  const mentionedPlatforms = new Set(mentionedRows.map((row) => row.model));
  const distinctQueries = new Set(rows.map((row) => row.queryText)).size || 1;
  const coveredQueries = new Set(mentionedRows.map((row) => row.queryText)).size;
  const sourceHits = mentionedRows.filter((row) => row.sourceNames.length > 0).length;
  const positiveRatio = average(mentionedRows.map((row) => (row.sentiment === "positive" ? 1 : 0)));
  const negativeRatio = average(mentionedRows.map((row) => (row.sentiment === "negative" ? 1 : 0)));
  const coverageRate = mentionedPlatforms.size / totalPlatforms;
  const queryCoverageRate = coveredQueries / distinctQueries;
  const sourceRate = mentionedRows.length ? sourceHits / mentionedRows.length : 0;
  const avgPosition = average(mentionedRows.map((row) => row.mentionPosition || 10));
  const topPositionBonus = !mentionedRows.length ? 0 : avgPosition <= 2.5 ? 12 : avgPosition <= 4.5 ? 7 : 2;

  const tcaCoverage = clampRankingScore(coverageRate * 100);
  const tcaConsistency = clampRankingScore(
    34 + coverageRate * 24 + queryCoverageRate * 24 + positiveRatio * 16 - negativeRatio * 20
  );
  const tcaAuthority = clampRankingScore(28 + sourceRate * 50 + topPositionBonus);
  const tcaTotal = clampRankingScore(tcaConsistency * 0.4 + tcaCoverage * 0.3 + tcaAuthority * 0.3);

  return {
    tcaTotal,
    tcaConsistency,
    tcaCoverage,
    tcaAuthority,
    platformCoverage: mentionedPlatforms.size,
  };
}

function aggregateRankingSnapshots(rows: RankingObservationJoinedRow[]) {
  if (!rows.length) {
    return [] as RankingSnapshotRecord[];
  }

  const snapshotDates = Array.from(new Set(rows.map((row) => row.snapshotDate))).sort().reverse();
  const latestDate = snapshotDates[0];
  const previousDate = snapshotDates[1] || null;
  const currentRows = rows.filter((row) => row.snapshotDate === latestDate);
  const previousRows = previousDate ? rows.filter((row) => row.snapshotDate === previousDate) : [];
  const previousByBrand = new Map<string, ReturnType<typeof scoreObservationGroup>>();

  previousRows.forEach((row) => {
    const key = `${row.city}-${row.industry}-${row.brandName}`;
    const bucket = previousByBrand.get(key);
    if (!bucket) {
      const groupRows = previousRows.filter(
        (item) => item.city === row.city && item.industry === row.industry && item.brandName === row.brandName
      );
      previousByBrand.set(key, scoreObservationGroup(groupRows));
    }
  });

  const groups = new Map<string, RankingObservationJoinedRow[]>();
  currentRows.forEach((row) => {
    const key = `${row.city}-${row.industry}-${row.brandName}`;
    const bucket = groups.get(key) || [];
    bucket.push(row);
    groups.set(key, bucket);
  });

  return Array.from(groups.entries())
    .map(([key, groupRows]) => {
      const sample = groupRows[0];
      const currentScore = scoreObservationGroup(groupRows);
      const previousScore = previousByBrand.get(key);

      return {
        id: buildSlugId("ranksnap", sample.city, sample.industry, sample.brandName, latestDate),
        industry: sample.industry,
        city: sample.city,
        brandName: sample.brandName,
        tcaTotal: currentScore.tcaTotal,
        tcaConsistency: currentScore.tcaConsistency,
        tcaCoverage: currentScore.tcaCoverage,
        tcaAuthority: currentScore.tcaAuthority,
        platformCoverage: currentScore.platformCoverage,
        delta7d: Number((currentScore.tcaTotal - (previousScore?.tcaTotal || currentScore.tcaTotal)).toFixed(1)),
        snapshotDate: latestDate,
        createdAt: sample.createdAt,
        platformDetail: buildPlatformDetailFromRows(groupRows),
        brandType: sample.brandType,
        cityScope: sample.cityScope,
      };
    })
    .sort((left, right) => right.tcaTotal - left.tcaTotal);
}

export async function listRankingObservationAggregates(options?: {
  industry?: string;
  city?: string;
  limit?: number;
  days?: number;
}) {
  const rows = await listRankingObservationRows(options);
  const aggregates = aggregateRankingSnapshots(rows);
  const limit = options?.limit ?? 20;
  return aggregates.slice(0, limit);
}

export async function listRankingObservationTrending(options?: {
  industry?: string;
  city?: string;
  days?: number;
  limit?: number;
}) {
  const rows = await listRankingObservationRows(options);
  if (!rows.length) {
    return [] as RankingTrendingAggregate[];
  }

  const snapshotDates = Array.from(new Set(rows.map((row) => row.snapshotDate))).sort().reverse();
  const latestDate = snapshotDates[0];
  const previousDate = snapshotDates[1] || null;
  const currentRows = rows.filter((row) => row.snapshotDate === latestDate);
  const previousRows = previousDate ? rows.filter((row) => row.snapshotDate === previousDate) : [];
  const previousMentioned = new Map<string, number>();

  previousRows.forEach((row) => {
    if (!row.mentioned) return;
    const key = `${row.industry}-${row.queryText}`;
    previousMentioned.set(key, (previousMentioned.get(key) || 0) + 1);
  });

  const grouped = new Map<string, RankingObservationJoinedRow[]>();
  currentRows.forEach((row) => {
    const key = `${row.industry}-${row.queryText}`;
    const bucket = grouped.get(key) || [];
    bucket.push(row);
    grouped.set(key, bucket);
  });

  const limit = options?.limit ?? 20;

  return Array.from(grouped.entries())
    .map(([key, groupRows], index) => {
      const mentioned = groupRows.filter((row) => row.mentioned);
      const brandGroups = new Map<string, RankingObservationJoinedRow[]>();
      mentioned.forEach((row) => {
        const bucket = brandGroups.get(row.brandName) || [];
        bucket.push(row);
        brandGroups.set(row.brandName, bucket);
      });

      const brandsMentioned = Array.from(brandGroups.entries())
        .map(([brand, brandRows]) => ({
          brand,
          platforms: Array.from(new Set(brandRows.map((row) => row.model))),
          avgPosition: Number(average(brandRows.map((row) => row.mentionPosition || 10)).toFixed(1)),
        }))
        .sort((left, right) => left.avgPosition - right.avgPosition)
        .slice(0, 8);

      const previousCount = previousMentioned.get(key) || 0;
      const delta = brandsMentioned.length - previousCount;
      const trendDirection = delta > 0 ? "up" : delta < 0 ? "down" : "stable";
      const heatScore = Math.min(99, 40 + brandsMentioned.length * 8 + mentioned.length * 3);
      const sample = groupRows[0];

      return {
        rank: index + 1,
        queryText: sample.queryText,
        industry: sample.industry,
        city: sample.city,
        heatScore,
        brandCount: brandsMentioned.length,
        trendDirection,
        brandsMentioned,
      } satisfies RankingTrendingAggregate;
    })
    .sort((left, right) => right.heatScore - left.heatScore)
    .slice(0, limit)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export async function saveRankingObservations(observations: RankingObservationSeed[]) {
  if (!observations.length) {
    return { inserted: 0 };
  }

  if (usePostgres()) {
    for (const observation of observations) {
      const nextQueryId = buildSlugId("rq", observation.city, observation.industry, observation.queryText);
      const existingQuery = await queryPostgres<{ id: string }>(
        `SELECT id FROM ranking_queries WHERE city = $1 AND industry = $2 AND query_text = $3 LIMIT 1`,
        [observation.city, observation.industry, observation.queryText]
      );
      const queryId = existingQuery.rows[0]?.id || nextQueryId;

      const cityScope = observation.cityScope || observation.city;
      const nextBrandId = buildSlugId("rb", cityScope, observation.industry, observation.brandName);
      const existingBrand = await queryPostgres<{ id: string }>(
        `SELECT id FROM ranking_brands WHERE brand_name = $1 AND industry = $2 AND city_scope = $3 LIMIT 1`,
        [observation.brandName, observation.industry, cityScope]
      );
      const brandId = existingBrand.rows[0]?.id || nextBrandId;

      const nextObservationId = buildSlugId(
        "ro",
        observation.snapshotDate,
        observation.city,
        observation.industry,
        observation.model,
        observation.queryText,
        observation.brandName
      );
      const existingObservation = await queryPostgres<{ id: string }>(
        `
          SELECT id
          FROM ranking_observations
          WHERE snapshot_date = $1
            AND city = $2
            AND industry = $3
            AND model = $4
            AND query_id = $5
            AND brand_id = $6
          LIMIT 1
        `,
        [observation.snapshotDate, observation.city, observation.industry, observation.model, queryId, brandId]
      );
      const observationId = existingObservation.rows[0]?.id || nextObservationId;

      await queryPostgres(
        `
          INSERT INTO ranking_queries (id, industry, city, query_text, is_active, updated_at)
          VALUES ($1, $2, $3, $4, TRUE, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE
          SET industry = EXCLUDED.industry,
              city = EXCLUDED.city,
              query_text = EXCLUDED.query_text,
              is_active = TRUE,
              updated_at = CURRENT_TIMESTAMP
        `,
        [queryId, observation.industry, observation.city, observation.queryText]
      );

      await queryPostgres(
        `
          INSERT INTO ranking_brands (id, brand_name, industry, city_scope, brand_type, is_active, updated_at)
          VALUES ($1, $2, $3, $4, $5, TRUE, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE
          SET brand_name = EXCLUDED.brand_name,
              industry = EXCLUDED.industry,
              city_scope = EXCLUDED.city_scope,
              brand_type = EXCLUDED.brand_type,
              is_active = TRUE,
              updated_at = CURRENT_TIMESTAMP
        `,
        [brandId, observation.brandName, observation.industry, cityScope, observation.brandType || "national"]
      );

      await queryPostgres(
        `
          INSERT INTO ranking_observations (
            id, snapshot_date, query_id, brand_id, model, mentioned, mention_position,
            sentiment, source_names_json, answer_text, city, industry
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO UPDATE
          SET mentioned = EXCLUDED.mentioned,
              mention_position = EXCLUDED.mention_position,
              sentiment = EXCLUDED.sentiment,
              source_names_json = EXCLUDED.source_names_json,
              answer_text = EXCLUDED.answer_text,
              city = EXCLUDED.city,
              industry = EXCLUDED.industry
        `,
        [
          observationId,
          observation.snapshotDate,
          queryId,
          brandId,
          observation.model,
          observation.mentioned,
          observation.mentionPosition ?? null,
          observation.sentiment ?? null,
          JSON.stringify(observation.sourceNames || []),
          observation.answerText || "",
          observation.city,
          observation.industry,
        ]
      );
    }

    return { inserted: observations.length };
  }

  const db = sqlite();
  const upsertQuery = db.prepare(`
    INSERT INTO ranking_queries (id, industry, city, query_text, is_active, created_at, updated_at)
    VALUES (@id, @industry, @city, @queryText, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      industry = excluded.industry,
      city = excluded.city,
      query_text = excluded.query_text,
      is_active = 1,
      updated_at = CURRENT_TIMESTAMP
  `);
  const upsertBrand = db.prepare(`
    INSERT INTO ranking_brands (id, brand_name, industry, city_scope, brand_type, is_active, created_at, updated_at)
    VALUES (@id, @brandName, @industry, @cityScope, @brandType, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      brand_name = excluded.brand_name,
      industry = excluded.industry,
      city_scope = excluded.city_scope,
      brand_type = excluded.brand_type,
      is_active = 1,
      updated_at = CURRENT_TIMESTAMP
  `);
  const upsertObservation = db.prepare(`
    INSERT INTO ranking_observations (
      id, snapshot_date, query_id, brand_id, model, mentioned, mention_position,
      sentiment, source_names_json, answer_text, city, industry, created_at
    )
    VALUES (
      @id, @snapshotDate, @queryId, @brandId, @model, @mentioned, @mentionPosition,
      @sentiment, @sourceNamesJson, @answerText, @city, @industry, CURRENT_TIMESTAMP
    )
    ON CONFLICT(id) DO UPDATE SET
      mentioned = excluded.mentioned,
      mention_position = excluded.mention_position,
      sentiment = excluded.sentiment,
      source_names_json = excluded.source_names_json,
      answer_text = excluded.answer_text,
      city = excluded.city,
      industry = excluded.industry
  `);
  const selectQueryId = db.prepare<[{
    city: string;
    industry: string;
    queryText: string;
  }], { id: string }>(`
    SELECT id FROM ranking_queries
    WHERE city = @city AND industry = @industry AND query_text = @queryText
    LIMIT 1
  `);
  const selectBrandId = db.prepare<[{
    brandName: string;
    industry: string;
    cityScope: string;
  }], { id: string }>(`
    SELECT id FROM ranking_brands
    WHERE brand_name = @brandName AND industry = @industry AND city_scope = @cityScope
    LIMIT 1
  `);
  const selectObservationId = db.prepare<[{
    snapshotDate: string;
    city: string;
    industry: string;
    model: string;
    queryId: string;
    brandId: string;
  }], { id: string }>(`
    SELECT id FROM ranking_observations
    WHERE snapshot_date = @snapshotDate
      AND city = @city
      AND industry = @industry
      AND model = @model
      AND query_id = @queryId
      AND brand_id = @brandId
    LIMIT 1
  `);

  const insertMany = db.transaction((items: RankingObservationSeed[]) => {
    items.forEach((observation) => {
      const nextQueryId = buildSlugId("rq", observation.city, observation.industry, observation.queryText);
      const queryId =
        selectQueryId.get({
          city: observation.city,
          industry: observation.industry,
          queryText: observation.queryText,
        })?.id || nextQueryId;

      const cityScope = observation.cityScope || observation.city;
      const nextBrandId = buildSlugId("rb", cityScope, observation.industry, observation.brandName);
      const brandId =
        selectBrandId.get({
          brandName: observation.brandName,
          industry: observation.industry,
          cityScope,
        })?.id || nextBrandId;

      const nextObservationId = buildSlugId(
        "ro",
        observation.snapshotDate,
        observation.city,
        observation.industry,
        observation.model,
        observation.queryText,
        observation.brandName
      );
      const observationId =
        selectObservationId.get({
          snapshotDate: observation.snapshotDate,
          city: observation.city,
          industry: observation.industry,
          model: observation.model,
          queryId,
          brandId,
        })?.id || nextObservationId;

      upsertQuery.run({
        id: queryId,
        industry: observation.industry,
        city: observation.city,
        queryText: observation.queryText,
      });

      upsertBrand.run({
        id: brandId,
        brandName: observation.brandName,
        industry: observation.industry,
        cityScope,
        brandType: observation.brandType || "national",
      });

      upsertObservation.run({
        id: observationId,
        snapshotDate: observation.snapshotDate,
        queryId,
        brandId,
        model: observation.model,
        mentioned: observation.mentioned ? 1 : 0,
        mentionPosition: observation.mentionPosition ?? null,
        sentiment: observation.sentiment ?? null,
        sourceNamesJson: JSON.stringify(observation.sourceNames || []),
        answerText: observation.answerText || "",
        city: observation.city,
        industry: observation.industry,
      });
    });
  });

  insertMany(observations);
  return { inserted: observations.length };
}

export async function listRankingSnapshots(options?: {
  industry?: string;
  city?: string;
  limit?: number;
  days?: number;
}): Promise<RankingSnapshotRecord[]> {
  const industry = options?.industry?.trim();
  const city = options?.city?.trim();
  const limit = options?.limit ?? 20;
  const days = options?.days;
  const observationRows = await listRankingObservationAggregates(options);

  if (observationRows.length) {
    return observationRows;
  }

  if (usePostgres()) {
    const values: unknown[] = [];
    const where: string[] = [];

    if (industry) {
      values.push(industry);
      where.push(`industry = $${values.length}`);
    }

    if (city && city !== "全国") {
      values.push(city);
      where.push(`COALESCE(city, '全国') = $${values.length}`);
    } else {
      where.push(`COALESCE(city, '全国') = '全国'`);
    }

    if (days && Number.isFinite(days)) {
      values.push(String(days));
      where.push(`snapshot_date >= CURRENT_DATE - ($${values.length}::int - 1)`);
    }

    values.push(limit);

      const result = await queryPostgres<{
      id: string;
      industry: string;
      city: string | null;
      brand_name: string;
      tca_total: string;
      tca_consistency: string;
      tca_coverage: string;
      tca_authority: string;
      platform_coverage: number;
      delta_7d: string;
      snapshot_date: string;
      created_at: string;
    }>(
      `
        SELECT id, industry, brand_name, tca_total, tca_consistency, tca_coverage, tca_authority,
          COALESCE(city, '全国') AS city, platform_coverage, delta_7d, snapshot_date, created_at
        FROM ranking_snapshots
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
        ORDER BY snapshot_date DESC, tca_total DESC
        LIMIT $${values.length}
      `,
      values
    );

    const rows = result.rows.map((row) => ({
      id: row.id,
      industry: row.industry,
      city: row.city || "全国",
      brandName: row.brand_name,
      tcaTotal: Number(row.tca_total),
      tcaConsistency: Number(row.tca_consistency),
      tcaCoverage: Number(row.tca_coverage),
      tcaAuthority: Number(row.tca_authority),
      platformCoverage: Number(row.platform_coverage),
      delta7d: Number(row.delta_7d),
      snapshotDate: row.snapshot_date,
      createdAt: row.created_at,
    }));

    if (rows.length) return rows;
  } else {
    const hasCityColumn = sqliteHasColumn("ranking_snapshots", "city");

    const params: unknown[] = [];
    let where = "";

    if (industry) {
      where = "WHERE industry = ?";
      params.push(industry);
    }

    if (city && city !== "全国") {
      if (!hasCityColumn) {
        return [];
      }

      where = where ? `${where} AND COALESCE(city, '全国') = ?` : "WHERE COALESCE(city, '全国') = ?";
      params.push(city);
    } else if (hasCityColumn) {
      where = where ? `${where} AND COALESCE(city, '全国') = '全国'` : "WHERE COALESCE(city, '全国') = '全国'";
    }

    if (days && Number.isFinite(days)) {
      const anchor = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      where = where ? `${where} AND snapshot_date >= ?` : "WHERE snapshot_date >= ?";
      params.push(anchor);
    }

    const stmt = sqlite().prepare(`
      SELECT id, industry, ${hasCityColumn ? "COALESCE(city, '全国')" : "'全国'"} AS city, brand_name, tca_total, tca_consistency, tca_coverage, tca_authority,
        platform_coverage, delta_7d, snapshot_date, created_at
      FROM ranking_snapshots
      ${where}
      ORDER BY snapshot_date DESC, tca_total DESC
      LIMIT ?
    `);

    const rows = stmt.all(...params, limit) as Array<{
      id: string;
      industry: string;
      city: string;
      brand_name: string;
      tca_total: number;
      tca_consistency: number;
      tca_coverage: number;
      tca_authority: number;
      platform_coverage: number;
      delta_7d: number;
      snapshot_date: string;
      created_at: string;
    }>;

    if (rows.length) {
      return rows.map((row) => ({
        id: row.id,
        industry: row.industry,
        city: row.city || "全国",
        brandName: row.brand_name,
        tcaTotal: Number(row.tca_total),
        tcaConsistency: Number(row.tca_consistency),
        tcaCoverage: Number(row.tca_coverage),
        tcaAuthority: Number(row.tca_authority),
        platformCoverage: Number(row.platform_coverage),
        delta7d: Number(row.delta_7d),
        snapshotDate: row.snapshot_date,
        createdAt: row.created_at,
      }));
    }
  }

  return mockRankingSnapshots
    .filter((item) => (!industry || item.industry === industry) && (!city ? item.city === "全国" : city === "全国" ? item.city === "全国" : item.city === city))
    .slice(0, limit);
}
