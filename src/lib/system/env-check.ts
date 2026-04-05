type EnvCheckItem = {
  key: string;
  required: boolean;
  configured: boolean;
  group: string;
  note?: string;
  suggested?: string;
  example?: string;
};

type EnvCheckSummary = {
  allRequiredReady: boolean;
  requiredCount: number;
  readyRequiredCount: number;
  groups: Array<{
    name: string;
    items: EnvCheckItem[];
  }>;
};

function hasEnv(key: string) {
  return Boolean(process.env[key]?.trim());
}

export function getEnvCheckSummary(): EnvCheckSummary {
  const items: EnvCheckItem[] = [
    {
      key: "NEXTAUTH_URL",
      required: true,
      configured: hasEnv("NEXTAUTH_URL"),
      group: "基础部署",
      note: "生产环境应填写正式域名，例如 https://你的域名",
      suggested: "填写你部署后的正式站点域名，必须是 HTTPS。",
      example: "https://mgeo.donglogic.com",
    },
    {
      key: "NEXTAUTH_SECRET",
      required: true,
      configured: hasEnv("NEXTAUTH_SECRET") && process.env.NEXTAUTH_SECRET !== "dev_secret_change_me",
      group: "基础部署",
      note: "必须替换为长随机字符串",
      suggested: "至少 32 位以上的随机字符串，用于加密会话。",
      example: "openssl rand -base64 32 生成的结果",
    },
    {
      key: "DATABASE_URL",
      required: true,
      configured: hasEnv("DATABASE_URL"),
      group: "数据库",
      note: "上线建议使用 Postgres",
      suggested: "填写线上 Postgres 连接串，优先使用托管数据库。",
      example: "postgres://user:password@host:5432/dbname",
    },
    {
      key: "CRON_SECRET",
      required: true,
      configured: hasEnv("CRON_SECRET") && process.env.CRON_SECRET !== "dev_cron_secret",
      group: "定时监控",
      note: "保护 cron 路由，避免被外部直接调用",
      suggested: "填写一串仅你自己知道的长随机字符串，后续 cron 调用时带上 Bearer 头。",
      example: "mgeo_cron_2026_xxxxxxxxxx",
    },
    {
      key: "LEMONSQUEEZY_WEBHOOK_SECRET",
      required: true,
      configured: hasEnv("LEMONSQUEEZY_WEBHOOK_SECRET"),
      group: "支付",
      note: "用于校验 webhook 签名",
      suggested: "填写 LemonSqueezy Webhook 配置页生成的 signing secret。",
    },
    {
      key: "LEMONSQUEEZY_BASIC_CHECKOUT_URL",
      required: true,
      configured: hasEnv("LEMONSQUEEZY_BASIC_CHECKOUT_URL"),
      group: "支付",
      suggested: "填写基础版结账链接，确保能跳回当前站点。",
    },
    {
      key: "LEMONSQUEEZY_PRO_CHECKOUT_URL",
      required: true,
      configured: hasEnv("LEMONSQUEEZY_PRO_CHECKOUT_URL"),
      group: "支付",
      suggested: "填写专业版结账链接，确保能跳回当前站点。",
    },
    {
      key: "LEMONSQUEEZY_BASIC_VARIANT_ID",
      required: true,
      configured: hasEnv("LEMONSQUEEZY_BASIC_VARIANT_ID"),
      group: "支付",
      suggested: "填写 LemonSqueezy 里基础版产品对应的 variant id。",
    },
    {
      key: "LEMONSQUEEZY_PRO_VARIANT_ID",
      required: true,
      configured: hasEnv("LEMONSQUEEZY_PRO_VARIANT_ID"),
      group: "支付",
      suggested: "填写 LemonSqueezy 里专业版产品对应的 variant id。",
    },
    {
      key: "DEEPSEEK_API_KEY",
      required: false,
      configured: hasEnv("DEEPSEEK_API_KEY"),
      group: "模型 Provider",
      note: "建议至少配置 1 个真实模型",
      suggested: "优先配置这个，作为首个真实检测模型。",
    },
    {
      key: "KIMI_API_KEY",
      required: false,
      configured: hasEnv("KIMI_API_KEY"),
      group: "模型 Provider",
      suggested: "作为第二个真实模型，补足结果对比。",
    },
    {
      key: "DOUBAO_API_KEY",
      required: false,
      configured: hasEnv("DOUBAO_API_KEY"),
      group: "模型 Provider",
      suggested: "如果你要覆盖更多国内模型，建议优先补豆包。",
    },
    {
      key: "WENXIN_API_KEY",
      required: false,
      configured: hasEnv("WENXIN_API_KEY"),
      group: "模型 Provider",
      suggested: "适合补足文心场景下的结果覆盖。",
    },
  ];

  const groupOrder = ["基础部署", "数据库", "定时监控", "支付", "模型 Provider"];
  const groups = groupOrder.map((groupName) => ({
    name: groupName,
    items: items.filter((item) => item.group === groupName),
  }));

  const requiredItems = items.filter((item) => item.required);
  const readyRequiredCount = requiredItems.filter((item) => item.configured).length;

  return {
    allRequiredReady: readyRequiredCount === requiredItems.length,
    requiredCount: requiredItems.length,
    readyRequiredCount,
    groups,
  };
}
