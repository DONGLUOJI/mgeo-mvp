# 董逻辑 MGEO 检测系统

这是一个最小可运行版本，当前已包含：

- `/detect` 免费检测页
- `/api/detect` 检测提交接口
- `/report/[taskId]` 报告详情页
- `/api/report/[taskId]` 报告接口

## 1. 安装依赖

```bash
cd /Users/dongchen/Documents/Playground
npm install
```

## 2. 配置环境变量

复制模板：

```bash
cp .env.example .env.local
```

优先填写这 2 组：

```env
DEEPSEEK_API_KEY=你的_deepseek_key
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat

KIMI_API_KEY=你的_kimi_key
KIMI_BASE_URL=https://api.moonshot.cn/v1
KIMI_MODEL=moonshot-v1-8k
```

如果没有填 key，系统会自动回退到 mock 结果，方便先跑演示链路。

豆包与文心可继续这样补：

```env
DOUBAO_API_KEY=你的火山方舟_ARK_API_KEY
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_MODEL=你的 endpoint id 或模型名

WENXIN_API_KEY=你的百度千帆_API_Key
WENXIN_BASE_URL=https://qianfan.baidubce.com/v2
WENXIN_MODEL=你在千帆里可用的模型名
```

数据库支持两种模式：

- 默认：本地 SQLite
- 可切换：线上 Postgres

如果要切到 Postgres，在 `.env.local` 里增加：

```env
DATABASE_URL=你的_postgres_连接串
PGSSL=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=请替换为更长的随机字符串
```

填了 `DATABASE_URL` 之后，项目会自动改走 Postgres，并在首次访问时自动创建 `scan_reports` 表。

当前数据库结构已经拆成：

- `customers`：品牌客户基础信息
- `scan_tasks`：每一次检测任务
- `scan_reports`：具体报告内容
- `monitored_keywords`：关键词监控配置
- `monitor_results`：每日监控结果时间序列

最小登录与额度控制：

- 登录页：`/login`
- 当前 MVP 使用最小邮箱登录，输入邮箱即可创建账号并进入内部工作台
- 受保护页面：`/ops`、`/dashboard`、`/customers`、`/tasks`、`/history`
- 免费套餐默认每月 `3` 次检测额度，登录后调用 `/api/detect` 会自动计数
- 定价页：`/pricing`
- 运维入口：`/ops`
- Dashboard：`/dashboard`
- 关键词管理：`/dashboard/keywords`
- 支付状态回跳页：`/billing/success`、`/billing/cancel`

也就是说，现在系统不再只是“存一份报告 JSON”，而是已经按客户和任务做了分层，为后面继续扩展服务项目、顾问跟进和复盘记录打好了基础。

支付与监控的补充说明：

- LemonSqueezy 结账会从 `/api/billing/checkout` 发起
- 支付成功后会回跳到 `/billing/success`
- 支付取消后会回跳到 `/billing/cancel`
- 定价页可点击“刷新套餐状态”主动拉取最新套餐与额度
- 每日监控 cron 路由为 `/api/cron/daily-monitor`
- 生产环境部署到 Vercel 后会按 `vercel.json` 自动触发定时监控

## 3. 生产部署建议

推荐正式环境使用：

- 前端与 API：Vercel
- 数据库：Postgres
- 鉴权：NextAuth
- 支付：LemonSqueezy
- 定时任务：Vercel Cron

部署前优先检查这几个页面：

- `/ops`
- `/deployment`
- `/deployment/release`
- `/deployment/logbook`
- `/deployment/runbook`
- `/deployment/verify`
- `/deployment/env`
- `/deployment/checklist`
- `/deployment/health`

Vercel 中至少要补齐这些环境变量：

```env
NEXTAUTH_URL=https://你的正式域名
NEXTAUTH_SECRET=长随机字符串
DATABASE_URL=线上 Postgres 连接串
CRON_SECRET=cron 路由鉴权密钥

LEMONSQUEEZY_STORE_ID=你的店铺 ID
LEMONSQUEEZY_API_KEY=你的 API Key
LEMONSQUEEZY_WEBHOOK_SECRET=你的 webhook secret
LEMONSQUEEZY_BASIC_VARIANT_ID=基础版 variant id
LEMONSQUEEZY_PRO_VARIANT_ID=专业版 variant id
LEMONSQUEEZY_BASIC_CHECKOUT_URL=基础版 checkout url
LEMONSQUEEZY_PRO_CHECKOUT_URL=专业版 checkout url
```

模型 provider 建议至少先配置这 2 组：

```env
DEEPSEEK_API_KEY=你的 key
KIMI_API_KEY=你的 key
```

如果要增强真实覆盖，再继续补：

```env
DOUBAO_API_KEY=你的 key
WENXIN_API_KEY=你的 key
```

生产联调建议顺序：

1. 先验证登录、检测、报告、历史页
2. 再验证 Postgres 写入是否正常
3. 再验证 LemonSqueezy 支付回跳和 webhook
4. 最后验证 `/api/cron/daily-monitor` 是否能写入 `monitor_results`

系统健康检查补充：

- `/deployment/health` 会直接检查数据库连通性、鉴权变量、支付配置、cron 配置和真实 Provider 配置状态
- `/api/system/health` 提供同样的登录后 JSON 检查结果，方便后续接内部运维面板
- `/api/system/release` 提供登录后的机器可读上线结论摘要，适合留档或接内部运维流程
- `/deployment/release` 会把环境变量、健康检查、阻塞项和待完善项汇总成一条可执行的上线结论
- `/deployment/logbook` 用于记录每次试运营或正式发布的结论、变更范围与回退预案
- `/deployment/runbook` 提供上线前 30 分钟、发布后 10 分钟、支付/cron/数据库排查与回退策略的运行手册
- `/deployment/verify` 把发布当天要点开的公开页面、后台页面、关键 API 与支付回跳入口集中到一页验证

## 4. 启动项目

```bash
npm run dev
```

打开：

- `http://localhost:3000/`
- `http://localhost:3000/detect`
- `http://localhost:3000/report/scan_001`

## 5. 当前真实调用逻辑

- `/api/detect` 会优先检查所选模型是否配置了真实 API
- 配了 key：走真实 provider
- 没配 key：自动回退 mock

## 6. 当前默认模型

- DeepSeek
- Kimi
- 豆包
- 腾讯元宝
- 文心一言

OpenAI 代码仍保留，但不在默认流程里启用。
