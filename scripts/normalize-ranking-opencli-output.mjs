import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizeMentions(item) {
  const brands = item.brands || item.extractedBrands || item.mentions || [];
  if (!Array.isArray(brands)) return [];

  return brands.map((brand) => ({
    brandName: brand.brandName || brand.brand || "",
    brandType: brand.brandType || "national",
    cityScope: brand.cityScope || item.city || "全国",
    mentioned: brand.mentioned ?? true,
    mentionPosition: brand.mentionPosition ?? brand.position ?? null,
    sentiment: brand.sentiment ?? "neutral",
    sourceNames: Array.isArray(brand.sourceNames)
      ? brand.sourceNames
      : Array.isArray(brand.sources)
        ? brand.sources
        : [],
    answerText: item.answerText || item.responseText || item.answer || "",
  }));
}

function main() {
  const cwd = process.cwd();
  const inputPath =
    process.argv[2] || path.join(cwd, "data", "ranking-opencli-raw.json");
  const outputPath =
    process.argv[3] || path.join(cwd, "data", "ranking-observations.generated.json");

  const payload = readJson(path.isAbsolute(inputPath) ? inputPath : path.join(cwd, inputPath));
  const items = Array.isArray(payload) ? payload : payload.results || payload.tasks || [];

  if (!Array.isArray(items) || !items.length) {
    throw new Error("没有找到可归一化的采集结果，请确认输入文件是数组或包含 results/tasks。");
  }

  const snapshotDate = new Date().toISOString().slice(0, 10);
  const observations = [];

  for (const item of items) {
    const mentions = normalizeMentions(item);
    for (const mention of mentions) {
      if (!mention.brandName) continue;
      observations.push({
        snapshotDate: item.snapshotDate || snapshotDate,
        city: item.city || "全国",
        industry: item.industry || "全部",
        queryText: item.queryText || item.query || "",
        brandName: mention.brandName,
        brandType: mention.brandType,
        cityScope: mention.cityScope,
        model: item.model,
        mentioned: Boolean(mention.mentioned),
        mentionPosition: mention.mentionPosition,
        sentiment: mention.sentiment,
        sourceNames: mention.sourceNames,
        answerText: mention.answerText,
      });
    }
  }

  fs.writeFileSync(outputPath, `${JSON.stringify({ observations }, null, 2)}\n`, "utf8");
  console.log(`Normalized ${observations.length} ranking observations -> ${outputPath}`);
}

main();
