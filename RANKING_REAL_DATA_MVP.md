# 排名页真实数据化 MVP

这套 MVP 的目标不是一次性把所有榜单做满，而是先让 `/ranking` 开始吃真实 observation 数据。

## 已准备好的东西

- 真实数据表：
  - `ranking_queries`
  - `ranking_brands`
  - `ranking_observations`
- 导入脚本：
  - `npm run import:ranking`
- 采集任务生成脚本：
  - `npm run plan:ranking`
- OpenCLI 输入导出脚本：
  - `npm run export:ranking-opencli`
- OpenCLI 首批优先任务脚本：
  - `npm run prioritize:ranking-opencli`
- OpenCLI 按行业拆分脚本：
  - `npm run split:ranking-opencli`
- 真实模型直连采集脚本：
  - `npm run collect:ranking`
- OpenCLI 结果归一化脚本：
  - `npm run normalize:ranking`
- observation 校验脚本：
  - `npm run validate:ranking`
- 真实数据修复脚本：
  - `npm run repair:ranking-real`
- 真实数据状态检查脚本：
  - `npm run status:ranking-real`

## 第一步：生成采集任务

```bash
npm run plan:ranking
```

默认会读取：

- `data/ranking-brands.seed.json`
- `data/ranking-queries.seed.json`

输出：

- `data/ranking-collection-plan.json`

这份文件里会给出每个：

- 城市
- 行业
- 搜索问题
- 模型
- 候选品牌
- 采集 prompt

如果你想直接导出成更容易喂给 OpenCLI 的 JSONL，再执行：

```bash
npm run export:ranking-opencli
```

输出：

- `data/ranking-opencli-requests.jsonl`

如果你想先跑“最低成本、最先看到结果”的第一批任务，再执行：

```bash
npm run prioritize:ranking-opencli
```

输出：

- `data/ranking-priority-batch.json`
- `data/ranking-priority-batch.jsonl`

这批任务只包含：

- 行业：`新茶饮`
- 城市：`全国 / 上海 / 北京`
- 模型：`deepseek / kimi / qianwen`

如果你想按行业拆开，再执行：

```bash
npm run split:ranking-opencli
```

输出目录：

- `data/ranking-opencli-batches/`

同时会生成：

- `data/ranking-opencli-batches/manifest.json`

当前默认覆盖：

- 行业：`新茶饮 / 企业服务 / 本地生活`
- 城市：`全国 / 上海 / 北京`
- 模型：`deepseek / kimi / qianwen / doubao / wenxin / yuanbao`

## 第二步：采集真实回答

### 方式 A：直接用项目内置脚本采集

如果你本地 `.env.local` 或环境变量里已经配置了对应模型 key，可以直接运行：

```bash
npm run collect:ranking -- data/ranking-priority-batch.json data/ranking-opencli-raw.json --concurrency=1
```

常用参数：

- `--concurrency=1`：单并发，最稳，适合先跑第一批
- `--limit=10`：只先跑前 10 条任务
- `--model=deepseek`：只跑某一个模型

例如：

```bash
npm run collect:ranking -- data/ranking-priority-batch.json data/ranking-opencli-raw.json --model=deepseek --limit=10
```

输出：

- `data/ranking-opencli-raw.json`

这个输出会直接兼容后面的 `normalize`。

### 方式 B：继续用 OpenCLI 跑真实回答

你可以把 `ranking-collection-plan.json` 里的 `tasks` 扔给 OpenCLI 批量执行。

如果你更喜欢一行一条任务的形式，可以直接用：

- `data/ranking-opencli-requests.jsonl`
- `data/ranking-priority-batch.jsonl`
- 或按行业拆好的 `data/ranking-opencli-batches/*.jsonl`

执行模板可以直接参考：

- `OPENCLI_RANKING_EXECUTION_TEMPLATE.md`

建议每条任务返回一个结构，至少包含：

```json
{
  "city": "上海",
  "industry": "新茶饮",
  "queryText": "上海奶茶品牌推荐",
  "model": "deepseek",
  "answerText": "……",
  "brands": [
    {
      "brandName": "霸王茶姬",
      "mentionPosition": 1,
      "sentiment": "positive",
      "sourceNames": ["大众点评", "品牌官网"]
    }
  ]
}
```

## 第三步：归一化成 observation

把 OpenCLI 跑出来的结果保存为一个 JSON 文件，然后执行：

```bash
npm run normalize:ranking data/ranking-opencli-raw.json data/ranking-observations.generated.json
```

你可以参考这份标准示例：

- `data/ranking-opencli-raw.example.json`

输出会变成项目导入脚本能直接吃的格式：

```json
{
  "observations": [
    {
      "snapshotDate": "2026-04-08",
      "city": "上海",
      "industry": "新茶饮",
      "queryText": "上海奶茶品牌推荐",
      "brandName": "霸王茶姬",
      "brandType": "chain",
      "cityScope": "全国",
      "model": "deepseek",
      "mentioned": true,
      "mentionPosition": 1,
      "sentiment": "positive",
      "sourceNames": ["大众点评", "品牌官网"],
      "answerText": "……"
    }
  ]
}
```

## 第四步：导入数据库

```bash
npm run import:ranking data/ranking-observations.generated.json
```

导入后，`/ranking` 会优先显示真实 observation 聚合结果；没有真实数据时，仍然保留现有 fallback。

## 第五步：校验与确认真实数据已经生效

先校验 observation 文件：

```bash
npm run validate:ranking data/ranking-observations.generated.json
```

如果之前导入过测试数据，或者发现 query / brand / observation 出现旧 ID 或脏关联，可以先执行一次修复：

```bash
npm run repair:ranking-real
```

这个脚本会按当前 observation 的自然键重新生成规范 ID，并重建：

- `ranking_queries`
- `ranking_brands`
- `ranking_observations`

再检查数据库里是不是真的已经有 observation：

```bash
npm run status:ranking-real
```

你会看到：

- observation 总数
- 快照数
- 城市数
- 行业数
- 模型数
- 最新快照日期

如果这里 observation 还是 `0`，说明真实数据还没有真正入库，优先级 1 还不能算完成。

## 这一版的推荐工作顺序

1. 先跑 `data/ranking-priority-batch.jsonl`
2. 执行 `normalize`
3. 执行 `validate`
4. 执行 `import`
5. 执行 `status`
6. 确认 `/ranking` 已经开始吃到真实 observation 数据
7. 再扩到按行业批次的 `data/ranking-opencli-batches/*.jsonl`
8. 每个行业先 10 个问题
9. 每周固定更新一次快照

## 优先级 1 完成标准

满足下面 5 条，就可以认为“排名页真实数据化”已经完成第一阶段，可以进入优先级 2：

1. 已生成首批真实采集批次
2. 已跑出一份真实 OpenCLI 原始结果
3. 已完成 `normalize + validate + import`
4. `npm run status:ranking-real` 中 `observation 总数 > 0`
5. `/ranking` 已经开始显示真实 observation 聚合结果，而不是只靠 mock fallback

## 建议先验证的榜单

- 行业排行
- 热搜问题
- 平台覆盖

涨跌榜要在有至少两个时间快照后才会更有意义。
