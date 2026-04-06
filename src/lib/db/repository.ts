import type { DetectReport } from "@/lib/detect/types";
import { getPlanConfig } from "@/lib/auth/plans";
import { queryPostgres } from "@/lib/db/postgres";
import { getSqliteDb } from "@/lib/db/sqlite";

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

function shouldResetUsage(resetAt: string | null) {
  if (!resetAt) return true;
  return new Date(resetAt).getTime() < new Date(getCurrentMonthAnchor()).getTime();
}

function mapReportRow(row: {
  task_id: string;
  brand_name: string;
  report_json: string;
  user_id: string | null;
  created_at: string;
}): ScanReportRecord {
  return {
    taskId: row.task_id,
    brandName: row.brand_name,
    createdAt: row.created_at,
    userId: row.user_id,
    report: JSON.parse(row.report_json) as DetectReport,
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
  return {
    id: row.id,
    keywordId: row.keyword_id,
    userId: row.user_id,
    tcaTotal: Number(row.tca_total),
    tcaConsistency: Number(row.tca_consistency),
    tcaCoverage: Number(row.tca_coverage),
    tcaAuthority: Number(row.tca_authority),
    tcaLevel: row.tca_level,
    result: JSON.parse(row.result_json) as DetectReport,
    checkedAt: row.checked_at,
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

export async function consumeDetectQuota(userId: string): Promise<DetectQuotaRecord> {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error("未找到当前用户");
  }

  const monthAnchor = getCurrentMonthAnchor();
  const limit = getMonthlyLimit(user.plan);
  const shouldReset = shouldResetUsage(user.monthlyDetectResetAt);
  const currentUsed = shouldReset ? 0 : user.monthlyDetectCount;

  if (currentUsed >= limit) {
    return {
      allowed: false,
      limit,
      used: currentUsed,
      remaining: 0,
      plan: user.plan,
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
      [userId, nextUsed, monthAnchor, now]
    );
  } else {
    const stmt = sqlite().prepare(`
      UPDATE users
      SET monthly_detect_count = ?,
          monthly_detect_reset_at = ?,
          updated_at = ?
      WHERE id = ?
    `);
    stmt.run(nextUsed, monthAnchor, now, userId);
  }

  return {
    allowed: true,
    limit,
    used: nextUsed,
    remaining: Math.max(limit - nextUsed, 0),
    plan: user.plan,
  };
}

export async function getDetectQuotaStatus(userId: string): Promise<DetectQuotaRecord | null> {
  const user = await getUserById(userId);
  if (!user) return null;

  const limit = getMonthlyLimit(user.plan);
  const used = shouldResetUsage(user.monthlyDetectResetAt) ? 0 : user.monthlyDetectCount;
  return {
    allowed: used < limit,
    limit,
    used,
    remaining: Math.max(limit - used, 0),
    plan: user.plan,
  };
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
        input.report.score.total,
        input.report.score.consistency,
        input.report.score.coverage,
        input.report.score.authority,
        input.report.score.level,
        JSON.stringify(input.report),
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
    input.report.score.total,
    input.report.score.consistency,
    input.report.score.coverage,
    input.report.score.authority,
    input.report.score.level,
    JSON.stringify(input.report),
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
    return result.rows.map(mapMonitorResultRow);
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

  return rows.map(mapMonitorResultRow);
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
  const customerId = buildCustomerId(report.input.brandName);
  const executionMode = report.debug?.mode || "mock";

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
        report.input.brandName,
        report.input.industry,
        report.input.businessSummary,
        userId || null,
        createdAt,
        createdAt,
      ]
    );

    await queryPostgres(
      `
        INSERT INTO scan_tasks (
          task_id, customer_id, brand_name, industry, query, selected_models_json, execution_mode, user_id, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (task_id)
        DO UPDATE SET
          customer_id = EXCLUDED.customer_id,
          brand_name = EXCLUDED.brand_name,
          industry = EXCLUDED.industry,
          query = EXCLUDED.query,
          selected_models_json = EXCLUDED.selected_models_json,
          execution_mode = EXCLUDED.execution_mode,
          user_id = EXCLUDED.user_id
      `,
      [
        taskId,
        customerId,
        report.input.brandName,
        report.input.industry,
        report.input.query,
        JSON.stringify(report.input.selectedModels),
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
      [taskId, report.input.brandName, JSON.stringify(report), userId || null, createdAt]
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
    brand_name: report.input.brandName,
    industry: report.input.industry,
    business_summary: report.input.businessSummary,
    user_id: userId || null,
    created_at: createdAt,
    updated_at: createdAt,
  });

  upsertTaskStmt.run({
    task_id: taskId,
    customer_id: customerId,
    brand_name: report.input.brandName,
    industry: report.input.industry,
    query: report.input.query,
    selected_models_json: JSON.stringify(report.input.selectedModels),
    execution_mode: executionMode,
    user_id: userId || null,
    created_at: createdAt,
  });

  upsertReportStmt.run({
    task_id: taskId,
    brand_name: report.input.brandName,
    report_json: JSON.stringify(report),
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
    return JSON.parse(row.report_json) as DetectReport;
  }

  const stmt = sqlite().prepare(`SELECT report_json, user_id FROM scan_reports WHERE task_id = ?`);
  const row = stmt.get(taskId) as { report_json: string; user_id: string | null } | undefined;
  if (!row) return null;
  if (row.user_id && row.user_id !== userId) return null;
  return JSON.parse(row.report_json) as DetectReport;
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
    return {
      report: JSON.parse(row.report_json) as DetectReport,
      createdAt: row.created_at || null,
    };
  }

  const stmt = sqlite().prepare(`SELECT report_json, user_id, created_at FROM scan_reports WHERE task_id = ?`);
  const row = stmt.get(taskId) as { report_json: string; user_id: string | null; created_at: string } | undefined;
  if (!row) return null;
  if (row.user_id && row.user_id !== userId) return null;
  return {
    report: JSON.parse(row.report_json) as DetectReport,
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

    return result.rows.map(mapReportRow);
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

  return rows.map(mapReportRow);
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
    const params: unknown[] = [];
    let where = "";

    if (industry) {
      where = "WHERE industry = ?";
      params.push(industry);
    }

    if (city && city !== "全国") {
      where = where ? `${where} AND COALESCE(city, '全国') = ?` : "WHERE COALESCE(city, '全国') = ?";
      params.push(city);
    } else {
      where = where ? `${where} AND COALESCE(city, '全国') = '全国'` : "WHERE COALESCE(city, '全国') = '全国'";
    }

    if (days && Number.isFinite(days)) {
      const anchor = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      where = where ? `${where} AND snapshot_date >= ?` : "WHERE snapshot_date >= ?";
      params.push(anchor);
    }

    const stmt = sqlite().prepare(`
      SELECT id, industry, COALESCE(city, '全国') AS city, brand_name, tca_total, tca_consistency, tca_coverage, tca_authority,
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
