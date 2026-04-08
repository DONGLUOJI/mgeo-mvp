import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function normalizeFileName(value) {
  return String(value).trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");
}

function main() {
  const cwd = process.cwd();
  const inputPath =
    process.argv[2] || path.join(cwd, "data", "ranking-opencli-requests.jsonl");
  const outputDir =
    process.argv[3] || path.join(cwd, "data", "ranking-opencli-batches");

  const resolvedInput = path.isAbsolute(inputPath) ? inputPath : path.join(cwd, inputPath);
  const resolvedOutputDir = path.isAbsolute(outputDir) ? outputDir : path.join(cwd, outputDir);

  const content = fs.readFileSync(resolvedInput, "utf8").trim();
  if (!content) {
    throw new Error("OpenCLI JSONL 输入为空，无法拆分。");
  }

  const records = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));

  fs.mkdirSync(resolvedOutputDir, { recursive: true });

  const byIndustry = new Map();

  for (const record of records) {
    const key = record.industry || "unknown";
    if (!byIndustry.has(key)) byIndustry.set(key, []);
    byIndustry.get(key).push(record);
  }

  for (const [industry, items] of byIndustry.entries()) {
    const fileName = `${normalizeFileName(industry)}.jsonl`;
    const filePath = path.join(resolvedOutputDir, fileName);
    const output = items.map((item) => JSON.stringify(item)).join("\n");
    fs.writeFileSync(filePath, `${output}\n`, "utf8");
  }

  const manifest = Array.from(byIndustry.entries()).map(([industry, items]) => ({
    industry,
    count: items.length,
    fileName: `${normalizeFileName(industry)}.jsonl`,
  }));

  fs.writeFileSync(
    path.join(resolvedOutputDir, "manifest.json"),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), batches: manifest }, null, 2)}\n`,
    "utf8"
  );

  console.log(`Split ${records.length} OpenCLI requests into ${manifest.length} industry batches -> ${resolvedOutputDir}`);
}

main();
