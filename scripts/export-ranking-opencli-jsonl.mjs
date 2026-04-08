import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function main() {
  const cwd = process.cwd();
  const inputPath =
    process.argv[2] || path.join(cwd, "data", "ranking-collection-plan.json");
  const outputPath =
    process.argv[3] || path.join(cwd, "data", "ranking-opencli-requests.jsonl");

  const payload = readJson(path.isAbsolute(inputPath) ? inputPath : path.join(cwd, inputPath));
  const tasks = Array.isArray(payload.tasks) ? payload.tasks : [];

  if (!tasks.length) {
    throw new Error("采集计划里没有 tasks，请先运行 npm run plan:ranking");
  }

  const lines = tasks.map((task, index) =>
    JSON.stringify({
      id: `ranking-task-${index + 1}`,
      city: task.city,
      industry: task.industry,
      model: task.model,
      queryText: task.queryText,
      candidateBrands: task.candidateBrands,
      prompt: task.prompt,
    })
  );

  fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
  console.log(`Exported ${tasks.length} OpenCLI requests -> ${outputPath}`);
}

main();
