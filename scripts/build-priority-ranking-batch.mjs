import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const PRIORITY_INDUSTRIES = new Set(["新茶饮"]);
const PRIORITY_CITIES = new Set(["全国", "上海", "北京"]);
const PRIORITY_MODELS = new Set(["deepseek", "kimi", "qianwen"]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function main() {
  const cwd = process.cwd();
  const inputPath =
    process.argv[2] || path.join(cwd, "data", "ranking-collection-plan.json");
  const outputPath =
    process.argv[3] || path.join(cwd, "data", "ranking-priority-batch.json");
  const jsonlOutputPath =
    process.argv[4] || path.join(cwd, "data", "ranking-priority-batch.jsonl");

  const payload = readJson(path.isAbsolute(inputPath) ? inputPath : path.join(cwd, inputPath));
  const tasks = Array.isArray(payload.tasks) ? payload.tasks : [];

  const filtered = tasks.filter(
    (task) =>
      PRIORITY_INDUSTRIES.has(task.industry) &&
      PRIORITY_CITIES.has(task.city) &&
      PRIORITY_MODELS.has(task.model)
  );

  const jsonPayload = {
    generatedAt: new Date().toISOString(),
    note: "第一批优先执行：新茶饮 × 全国/上海/北京 × DeepSeek/Kimi/通义千问",
    taskCount: filtered.length,
    tasks: filtered,
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(jsonPayload, null, 2)}\n`, "utf8");
  fs.writeFileSync(jsonlOutputPath, `${filtered.map((item) => JSON.stringify(item)).join("\n")}\n`, "utf8");

  console.log(`Prepared priority ranking batch -> ${outputPath}`);
  console.log(`Prepared priority ranking batch JSONL -> ${jsonlOutputPath}`);
  console.log(`Priority task count: ${filtered.length}`);
}

main();
