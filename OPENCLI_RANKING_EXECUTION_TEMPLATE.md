# OpenCLI 排名采集执行模板

你可以直接把下面这段作为 OpenCLI 的执行说明。

## 单批次执行模板

```text
你现在要执行 MGEO 排名系统的数据采集任务。

请读取我提供的 JSONL 文件，每一行都是一条独立任务。

对每条任务：
1. 使用任务里的 model 作为目标模型。
2. 把 prompt 原样发给对应模型。
3. 保留模型原始回答文本。
4. 从模型回答中提取 result.brands。
5. 输出一个 JSON 数组，每个元素必须包含：
   - city
   - industry
   - queryText
   - model
   - answerText
   - brands

brands 中每个元素必须包含：
   - brandName
   - mentionPosition
   - sentiment
   - sourceNames

如果模型没有提及任何候选品牌：
   - brands 返回空数组
   - answerText 仍然保留

不要输出解释，不要输出 markdown，只输出 JSON。
```

## 推荐执行顺序

先按行业批次跑：

1. `data/ranking-opencli-batches/新茶饮.jsonl` 或对应 slug 文件
2. `data/ranking-opencli-batches/企业服务.jsonl`
3. `data/ranking-opencli-batches/本地生活.jsonl`

## 推荐落地方式

每跑完一个行业：

1. 保存为一个原始 JSON 文件，例如：
   - `data/ranking-opencli-raw-tea.json`
2. 归一化：

```bash
npm run normalize:ranking data/ranking-opencli-raw-tea.json data/ranking-observations-tea.json
```

3. 导入数据库：

```bash
npm run import:ranking data/ranking-observations-tea.json
```

这样你不用等全部行业都跑完，先让一部分真实数据上线。

## 最稳的第一批建议

先只跑：

- 行业：`新茶饮`
- 城市：`全国 / 上海 / 北京`
- 模型：`deepseek / kimi / qianwen`

这样成本最低，也最容易先看到 `/ranking` 开始吃到真实 observation 数据。
