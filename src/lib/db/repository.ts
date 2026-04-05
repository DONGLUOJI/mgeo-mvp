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
    baseScore: 88,
    brands: ["喜茶", "霸王茶姬", "茶百道", "沪上阿姨", "奈雪的茶", "蜜雪冰城", "古茗", "CoCo都可", "书亦烧仙草", "益禾堂", "茶颜悦色", "七分甜", "阿水大杯茶", "乐乐茶", "1點點", "爷爷不泡茶", "悸动烧仙草", "新时沏", "茉酸奶", "柠季"],
  },
  {
    industry: "餐饮连锁",
    baseScore: 90,
    brands: ["海底捞", "西贝", "巴奴火锅", "外婆家", "绿茶餐厅", "太二酸菜鱼", "九毛九", "费大厨", "老乡鸡", "大米先生", "和府捞面", "乡村基", "南城香", "呷哺呷哺", "鱼你在一起", "杨国福", "张亮麻辣烫", "小菜园", "陶陶居", "半天妖"],
  },
  {
    industry: "教培",
    baseScore: 91,
    brands: ["新东方", "学而思", "火花思维", "猿辅导", "高途", "作业帮", "斑马", "核桃编程", "编程猫", "小叶子", "豌豆思维", "VIPKID", "51Talk", "掌门教育", "粉笔", "中公教育", "华图教育", "洋葱学园", "有道精品课", "希望学"],
  },
  {
    industry: "家政服务",
    baseScore: 83,
    brands: ["天鹅到家", "好慷在家", "58到家", "轻喜到家", "阿姨来了", "无忧保姆", "爱君家政", "e家洁", "到位", "管家帮", "阿姨帮", "好孕妈妈", "洁妹子", "叮当找阿姨", "宅翻新家政", "三替家政", "乐家庭服务", "家事无忧", "优侍家政", "家邻家政"],
  },
  {
    industry: "美妆护肤",
    baseScore: 89,
    brands: ["珀莱雅", "薇诺娜", "花西子", "可复美", "橘朵", "HBN", "韩束", "自然堂", "完美日记", "毛戈平", "润百颜", "玉泽", "夸迪", "丸美", "欧诗漫", "百雀羚", "花知晓", "谷雨", "瑷尔博士", "酵色"],
  },
  {
    industry: "企业服务",
    baseScore: 90,
    brands: ["飞书", "钉钉", "销售易", "纷享销客", "金蝶云星空", "用友BIP", "北森", "石墨文档", "Teambition", "明道云", "伙伴云", "简道云", "道一云", "有赞", "微盟", "网易数帆", "腾讯会议", "企微管家", "泛微", "致远互联"],
  },
] as const;

const mockRankingSeeds: RankingSeed[] = rankingSeedCatalog.flatMap((group, groupIndex) =>
  group.brands.map((brandName, brandIndex) => ({
    industry: group.industry,
    brandName,
    tcaTotal: Math.max(52, group.baseScore - brandIndex * 2 + ((brandIndex + groupIndex) % 3)),
    platformCoverage: Math.max(2, Math.min(6, 6 - Math.floor(brandIndex / 4) + ((brandIndex + groupIndex) % 2))),
    delta7d: Number((((groupIndex % 2 === 0 ? 1 : -1) * ((brandIndex % 7) - 3)) + (brandIndex % 3) * 0.6).toFixed(1)),
  }))
);

const mockRankingSnapshots: RankingSnapshotRecord[] = mockRankingSeeds.map((seed, index) => ({
  id: `rank_${index + 1}`,
  industry: seed.industry,
  brandName: seed.brandName,
  tcaTotal: seed.tcaTotal,
  tcaConsistency: Math.max(52, Math.min(98, seed.tcaTotal + (index % 3 === 0 ? 2 : -1))),
  tcaCoverage: Math.max(50, Math.min(98, seed.tcaTotal - 3 + (index % 4))),
  tcaAuthority: Math.max(51, Math.min(98, seed.tcaTotal + (index % 5) - 2)),
  platformCoverage: seed.platformCoverage,
  delta7d: seed.delta7d,
  snapshotDate: "2026-04-05",
  createdAt: "2026-04-05T09:00:00.000Z",
}));

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
  limit?: number;
  days?: number;
}): Promise<RankingSnapshotRecord[]> {
  const industry = options?.industry?.trim();
  const limit = options?.limit ?? 20;
  const days = options?.days;

  if (usePostgres()) {
    const values: unknown[] = [];
    const where: string[] = [];

    if (industry) {
      values.push(industry);
      where.push(`industry = $${values.length}`);
    }

    if (days && Number.isFinite(days)) {
      values.push(String(days));
      where.push(`snapshot_date >= CURRENT_DATE - ($${values.length}::int - 1)`);
    }

    values.push(limit);

    const result = await queryPostgres<{
      id: string;
      industry: string;
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
          platform_coverage, delta_7d, snapshot_date, created_at
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

    if (days && Number.isFinite(days)) {
      const anchor = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      where = where ? `${where} AND snapshot_date >= ?` : "WHERE snapshot_date >= ?";
      params.push(anchor);
    }

    const stmt = sqlite().prepare(`
      SELECT id, industry, brand_name, tca_total, tca_consistency, tca_coverage, tca_authority,
        platform_coverage, delta_7d, snapshot_date, created_at
      FROM ranking_snapshots
      ${where}
      ORDER BY snapshot_date DESC, tca_total DESC
      LIMIT ?
    `);

    const rows = stmt.all(...params, limit) as Array<{
      id: string;
      industry: string;
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

  return mockRankingSnapshots.filter((item) => !industry || item.industry === industry).slice(0, limit);
}
