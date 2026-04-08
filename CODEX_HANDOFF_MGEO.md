# MGEO Codex Handoff

更新时间：2026-04-05
工作目录：`/Users/dongchen/Documents/Playground`
线上地址：`https://mgeo-mvp.vercel.app`
本地参考稿目录：`/Users/dongchen/test-mgeo`

## 当前目标

把当前 Next.js 站点尽量对齐到本地静态参考稿，核心参考文件是：

- `/Users/dongchen/test-mgeo/donglogic-mgeo-apple-cn.html`
- `/Users/dongchen/test-mgeo/register.html`
- `/Users/dongchen/test-mgeo/whitepaper.html`
- `/Users/dongchen/test-mgeo/ranking.html`
- `/Users/dongchen/test-mgeo/subscription.html`
- `/Users/dongchen/test-mgeo/cases.html`

## 已完成内容

### 1. GitHub / Vercel 问题已修复

- 修复了提交作者被识别成 `ocean-buse` 的问题
- 本地 git 作者已改成 GitHub noreply 邮箱
- Vercel 最新提交作者识别已恢复成 `DONGLUOJI`

### 2. 线上运行错误已修复

- 修复了 Postgres 部署下误初始化 SQLite 导致的运行时 500
- `/login`
- `/api/auth/providers`
- `/dashboard`
  这些关键路径之前已验证恢复正常

### 3. 首页已按参考稿对齐过多轮

当前首页已完成这些内容：

- 导航栏样式往参考稿靠齐
- `董逻辑MGEO` 位置、导航项位置、`登录/注册` 位置已调整
- `多模式生成式引擎` 左侧点已做成动态脉冲闪烁
- hero 背景、标题、指标区已按参考稿重调
- 首页检测锚点已改成 `#detector`
- 首页导航现在是：
  - 免费检测 -> `/#detector`
  - 排名 -> `/ranking`
  - 服务方案 -> `/pricing`
  - 案例成果 -> `/cases`
  - 联系我们 -> `/#contact`
  - MGEO白皮书 -> `/whitepaper`

### 4. 缺失导航页已补齐

已补路由：

- `/register`
- `/whitepaper`

并已继续对齐：

- `/ranking`
- `/pricing`
- `/cases`
- `/register`
- `/whitepaper`

## 最近几次关键提交

- `2c29a76 chore: refresh GitHub author identity`
- `71e2018 fix: lazy-load sqlite in postgres deployments`
- `e276ac9 fix: restore homepage detect form`
- `8722b38 fix: restore original marketing homepage`
- `87a9939 style: tighten homepage layout`
- `0e1f7c9 style: align homepage hero with original design`
- `af04e8f style: add pulsing hero badge dot`
- `c3fcaf5 style: align homepage with local html reference`
- `6a7bcc5 feat: restore missing navigation destinations`
- `58dff56 style: align secondary pages with html reference`
- `8716aed style: refine register and whitepaper pages`

## 当前线上可核对链接

- 首页：`https://mgeo-mvp.vercel.app/`
- 注册：`https://mgeo-mvp.vercel.app/register`
- 白皮书：`https://mgeo-mvp.vercel.app/whitepaper`
- 排名：`https://mgeo-mvp.vercel.app/ranking`
- 服务方案：`https://mgeo-mvp.vercel.app/pricing`
- 案例成果：`https://mgeo-mvp.vercel.app/cases`

## 下一步建议优先做的事

最建议继续抠首页检测卡，因为它和参考稿还有肉眼可见差距：

1. 检测卡输入框补字数计数
2. 平台选中态补右上角勾勾
3. 输入框 / 按钮 / 平台项的 hover 和 active 状态继续对齐参考稿
4. 白卡上浮高度、宽度、圆角和阴影继续精修

其次可继续补这些页面的参考稿细节：

1. `register` 页加更完整的演示交互反馈样式
2. `whitepaper` 页继续扩成更完整章节，不只是精简版
3. `pricing` 页继续按 `subscription.html` 增加更多 section
4. `ranking` 页继续按 `ranking.html` 增加更多说明区块
5. `cases` 页继续按 `cases.html` 增加更多指标与案例详情入口

## 关键说明

- 用户非常在意“不要把他原来页面改没了”，所以后续每次修改都要强调：
  - 是按参考稿对齐
  - 做完给线上核对链接
- 用户明确要求：下次继续时，做完要直接附核对链接
- `.gitignore` 有用户自己的改动，之前一直没有动它

## 最近一次 Vercel 失败部署记录

- 时间：`2026-04-09`
- 失败部署提交：`3aeeffd feat: add direct ranking data collection workflow`
- 失败现象：
  - Vercel 生产部署失败
  - 用户收到 `Failed production deployment` 邮件
  - 构建日志报错：
    - `Module not found: Can't resolve '@/lib/detect/report-shape'`
- 根因：
  - 本地已有 `src/lib/detect/report-shape.ts`
  - 但当时推送时漏提了这批检测结构对齐相关文件
  - 导致 `src/lib/db/repository.ts` 在生产构建中引用失败
- 修复方式：
  - 补提并推送以下检测结构相关文件：
    - `src/lib/detect/report-shape.ts`
    - `src/lib/detect/build-prompt.ts`
    - `src/lib/detect/parser.ts`
    - `src/lib/detect/run-detect.ts`
    - `src/lib/detect/scoring.ts`
    - `src/lib/detect/types.ts`
    - `src/lib/mock/report-data.ts`
    - `src/lib/report/export-html.ts`
    - `src/app/api/cron/daily-monitor/route.ts`
    - `src/app/report/[taskId]/page.tsx`
- 修复提交：
  - `5637928 fix: restore detect report shape files`
- 修复结果：
  - 新生产部署已 `Ready`
  - `https://www.dongluoji.com/ranking` 已恢复 `HTTP/2 200`
- 后续注意事项：
  - 以后凡是改检测结果结构（尤其 `types / report-shape / run-detect / report page / export-html`）时，要一起检查是否都已纳入提交
  - 推送后优先看一次 `vercel inspect <deployment> --logs`，确认没有 `module not found`
