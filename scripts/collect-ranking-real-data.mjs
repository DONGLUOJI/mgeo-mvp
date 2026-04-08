import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index <= 0) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function parseArgs(argv) {
  const options = {
    inputPath: path.join(process.cwd(), "data", "ranking-priority-batch.json"),
    outputPath: path.join(process.cwd(), "data", "ranking-opencli-raw.json"),
    concurrency: 1,
    limit: null,
    modelFilter: null,
  };

  const positional = [];
  for (const arg of argv) {
    if (arg.startsWith("--concurrency=")) {
      options.concurrency = Math.max(1, Number(arg.split("=")[1] || "1"));
      continue;
    }
    if (arg.startsWith("--limit=")) {
      const value = Number(arg.split("=")[1] || "0");
      options.limit = Number.isFinite(value) && value > 0 ? value : null;
      continue;
    }
    if (arg.startsWith("--model=")) {
      options.modelFilter = arg.split("=")[1] || null;
      continue;
    }
    positional.push(arg);
  }

  if (positional[0]) {
    options.inputPath = path.isAbsolute(positional[0])
      ? positional[0]
      : path.join(process.cwd(), positional[0]);
  }
  if (positional[1]) {
    options.outputPath = path.isAbsolute(positional[1])
      ? positional[1]
      : path.join(process.cwd(), positional[1]);
  }

  return options;
}

function readTasks(inputPath) {
  const raw = fs.readFileSync(inputPath, "utf8");
  if (inputPath.endsWith(".jsonl")) {
    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  }

  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : parsed.tasks || [];
}

function createOpenAiCompatCaller({ baseUrl, apiKey, model }) {
  const enabled = Boolean(baseUrl && apiKey && model);

  return {
    enabled,
    async call(prompt) {
      const start = Date.now();
      if (!enabled) {
        return {
          success: false,
          latencyMs: 0,
          error: "provider 未配置",
          rawText: "",
        };
      }

      try {
        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            temperature: 0.2,
            messages: [
              {
                role: "system",
                content: "你是一个严谨的品牌信息识别助手。",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
          }),
        });

        if (!res.ok) {
          return {
            success: false,
            latencyMs: Date.now() - start,
            rawText: "",
            error: `HTTP ${res.status}: ${await res.text()}`,
          };
        }

        const data = await res.json();
        const rawText =
          data.choices?.[0]?.message?.content ||
          data.result ||
          data.body?.result ||
          data.output_text ||
          "";

        return {
          success: true,
          latencyMs: Date.now() - start,
          rawText,
        };
      } catch (error) {
        return {
          success: false,
          latencyMs: Date.now() - start,
          rawText: "",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  };
}

function createDoubaoCaller() {
  const baseUrl = process.env.DOUBAO_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";
  const apiKey = process.env.DOUBAO_API_KEY || "";
  const model = process.env.DOUBAO_MODEL || "";
  const enabled = Boolean(apiKey && model);

  return {
    enabled,
    async call(prompt) {
      const start = Date.now();
      if (!enabled) {
        return {
          success: false,
          latencyMs: 0,
          rawText: "",
          error: "doubao 未配置",
        };
      }

      try {
        const res = await fetch(`${baseUrl}/responses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            input: [
              {
                role: "user",
                content: [{ type: "input_text", text: prompt }],
              },
            ],
          }),
        });

        if (!res.ok) {
          return {
            success: false,
            latencyMs: Date.now() - start,
            rawText: "",
            error: `HTTP ${res.status}: ${await res.text()}`,
          };
        }

        const data = await res.json();
        const rawText =
          data.output_text ||
          data.output
            ?.flatMap((item) => item.content || [])
            .map((item) => item.text || "")
            .join("\n") ||
          "";

        return {
          success: true,
          latencyMs: Date.now() - start,
          rawText,
        };
      } catch (error) {
        return {
          success: false,
          latencyMs: Date.now() - start,
          rawText: "",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  };
}

function createCallers() {
  return {
    deepseek: createOpenAiCompatCaller({
      baseUrl: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
      apiKey: process.env.DEEPSEEK_API_KEY || "",
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
    }),
    kimi: createOpenAiCompatCaller({
      baseUrl: process.env.KIMI_BASE_URL || "https://api.moonshot.cn/v1",
      apiKey: process.env.KIMI_API_KEY || "",
      model: process.env.KIMI_MODEL || "moonshot-v1-8k",
    }),
    qianwen: createOpenAiCompatCaller({
      baseUrl: process.env.QIANWEN_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1",
      apiKey: process.env.QIANWEN_API_KEY || "",
      model: process.env.QIANWEN_MODEL || "qwen-plus",
    }),
    yuanbao: createOpenAiCompatCaller({
      baseUrl: process.env.YUANBAO_BASE_URL || "https://api.hunyuan.cloud.tencent.com/v1",
      apiKey: process.env.YUANBAO_API_KEY || "",
      model: process.env.YUANBAO_MODEL || "hunyuan-turbos-latest",
    }),
    wenxin: createOpenAiCompatCaller({
      baseUrl: process.env.WENXIN_BASE_URL || "https://qianfan.baidubce.com/v2",
      apiKey: process.env.WENXIN_API_KEY || "",
      model: process.env.WENXIN_MODEL || "ernie-5.0",
    }),
    doubao: createDoubaoCaller(),
  };
}

function extractJsonObject(rawText) {
  if (!rawText) return null;

  const fenced = rawText.match(/```json\s*([\s\S]*?)```/i) || rawText.match(/```\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : rawText;

  let start = candidate.indexOf("{");
  while (start !== -1) {
    let depth = 0;
    for (let index = start; index < candidate.length; index += 1) {
      const char = candidate[index];
      if (char === "{") depth += 1;
      if (char === "}") {
        depth -= 1;
        if (depth === 0) {
          const fragment = candidate.slice(start, index + 1);
          try {
            return JSON.parse(fragment);
          } catch {
            break;
          }
        }
      }
    }
    start = candidate.indexOf("{", start + 1);
  }

  return null;
}

function inferSentiment(answerText, brandName) {
  const slice = answerText.toLowerCase();
  const brand = brandName.toLowerCase();
  const index = slice.indexOf(brand);
  const context = index >= 0 ? slice.slice(Math.max(0, index - 24), Math.min(slice.length, index + brand.length + 24)) : slice;

  if (/(推荐|优先|不错|好喝|口碑|值得|适合|领先|热门|强)/.test(context)) {
    return "positive";
  }
  if (/(一般|争议|不稳|偏少|不足|低|弱|不推荐)/.test(context)) {
    return "negative";
  }
  return "neutral";
}

function extractSourceNames(answerText) {
  const names = [];
  const sourcePatterns = [
    "品牌官网",
    "大众点评",
    "小红书",
    "抖音",
    "知乎",
    "行业报告",
    "媒体报道",
    "产品官网",
    "用户评价",
    "门店评价",
  ];

  for (const pattern of sourcePatterns) {
    if (answerText.includes(pattern)) {
      names.push(pattern);
    }
  }

  return names;
}

function fallbackBrands(task, answerText) {
  const mentions = [];
  task.candidateBrands.forEach((brandName) => {
    const index = answerText.indexOf(brandName);
    if (index === -1) return;
    mentions.push({
      brandName,
      mentionPosition: mentions.length + 1,
      sentiment: inferSentiment(answerText, brandName),
      sourceNames: extractSourceNames(answerText),
    });
  });
  return mentions;
}

function normalizeBrands(task, answerText, parsed) {
  const brands =
    parsed?.result?.brands ||
    parsed?.brands ||
    parsed?.result?.mentions ||
    parsed?.mentions ||
    [];

  if (Array.isArray(brands) && brands.length) {
    return brands
      .map((brand, index) => ({
        brandName: brand.brandName || brand.brand || "",
        mentionPosition: brand.mentionPosition ?? brand.position ?? index + 1,
        sentiment: brand.sentiment || inferSentiment(answerText, brand.brandName || brand.brand || ""),
        sourceNames: Array.isArray(brand.sourceNames)
          ? brand.sourceNames
          : Array.isArray(brand.sources)
            ? brand.sources
            : extractSourceNames(answerText),
      }))
      .filter((brand) => task.candidateBrands.includes(brand.brandName));
  }

  return fallbackBrands(task, answerText);
}

async function runWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  async function consume() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length || 1) }, () => consume());
  await Promise.all(workers);
  return results;
}

async function main() {
  loadLocalEnv();
  const options = parseArgs(process.argv.slice(2));
  const callers = createCallers();

  let tasks = readTasks(options.inputPath);
  if (options.modelFilter) {
    tasks = tasks.filter((task) => task.model === options.modelFilter);
  }
  if (options.limit) {
    tasks = tasks.slice(0, options.limit);
  }

  if (!tasks.length) {
    throw new Error("没有找到可执行的采集任务。");
  }

  const enabledModels = [...new Set(tasks.map((task) => task.model))].filter((model) => callers[model]?.enabled);
  if (!enabledModels.length) {
    throw new Error("当前批次没有任何已配置的模型，请先检查 .env.local 或环境变量。");
  }

  console.log(`准备执行 ${tasks.length} 条真实采集任务`);
  console.log(`启用模型: ${enabledModels.join(", ")}`);

  const snapshotDate = new Date().toISOString().slice(0, 10);
  const startedAt = Date.now();

  const results = await runWithConcurrency(tasks, options.concurrency, async (task, index) => {
    const caller = callers[task.model];
    if (!caller?.enabled) {
      return {
        snapshotDate,
        city: task.city,
        industry: task.industry,
        queryText: task.queryText,
        model: task.model,
        answerText: "",
        brands: [],
        error: `${task.model} 未配置`,
      };
    }

    console.log(`[${index + 1}/${tasks.length}] ${task.model} | ${task.city} | ${task.queryText}`);
    const response = await caller.call(task.prompt);
    const answerText = response.rawText || "";
    const parsed = extractJsonObject(answerText);
    const brands = response.success ? normalizeBrands(task, answerText, parsed) : [];

    return {
      snapshotDate,
      city: task.city,
      industry: task.industry,
      queryText: task.queryText,
      model: task.model,
      answerText,
      brands,
      success: response.success,
      latencyMs: response.latencyMs,
      error: response.error,
    };
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    source: "direct-provider-collection",
    durationMs: Date.now() - startedAt,
    taskCount: tasks.length,
    results,
  };

  fs.writeFileSync(options.outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`真实采集结果已输出 -> ${options.outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
