import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const DEFAULT_MODELS = ["deepseek", "kimi", "qianwen", "doubao", "wenxin", "yuanbao"];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function buildPrompt({ city, industry, queryText, brands, model }) {
  return [
    "你是 MGEO 排名系统的数据采集员。",
    `当前平台模型：${model}`,
    `城市：${city}`,
    `行业：${industry}`,
    `用户搜索问题：${queryText}`,
    "",
    "请回答这个真实搜索问题，并在回答后只输出一个 JSON 对象。",
    "要求：",
    "1. 先正常给出推荐回答。",
    "2. 再输出 JSON，字段必须包含 result.brands。",
    "3. brands 里只允许出现候选品牌名单中的品牌。",
    "4. 没被提及的品牌不要写进 brands。",
    "5. 每个品牌输出：brandName, mentionPosition, sentiment, sourceNames。",
    "",
    `候选品牌名单：${brands.join("、")}`,
    "",
    'JSON 模板：{"result":{"brands":[{"brandName":"品牌名","mentionPosition":1,"sentiment":"positive","sourceNames":["来源A","来源B"]}]}}',
  ].join("\n");
}

function main() {
  const cwd = process.cwd();
  const brandsPath =
    process.argv[2] || path.join(cwd, "data", "ranking-brands.seed.json");
  const queriesPath =
    process.argv[3] || path.join(cwd, "data", "ranking-queries.seed.json");
  const outputPath =
    process.argv[4] || path.join(cwd, "data", "ranking-collection-plan.json");

  const brandsSeed = readJson(path.isAbsolute(brandsPath) ? brandsPath : path.join(cwd, brandsPath));
  const queriesSeed = readJson(path.isAbsolute(queriesPath) ? queriesPath : path.join(cwd, queriesPath));

  const industryBrands = new Map(
    brandsSeed.industries.map((item) => [item.industry, item])
  );

  const tasks = [];

  for (const queryGroup of queriesSeed.queries) {
    const brandGroup = industryBrands.get(queryGroup.industry);
    if (!brandGroup) continue;

    for (const city of brandGroup.cities) {
      const cityBrands = brandGroup.brands
        .filter((brand) => brand.cityScope === "全国" || brand.cityScope === city)
        .map((brand) => brand.brandName);

      for (const queryText of queryGroup.queries) {
        const fullQuery = city === "全国" ? queryText : `${city}${queryText}`;
        for (const model of DEFAULT_MODELS) {
          tasks.push({
            city,
            industry: queryGroup.industry,
            model,
            queryText: fullQuery,
            candidateBrands: cityBrands,
            prompt: buildPrompt({
              city,
              industry: queryGroup.industry,
              queryText: fullQuery,
              brands: cityBrands,
              model,
            }),
          });
        }
      }
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    models: DEFAULT_MODELS,
    taskCount: tasks.length,
    tasks,
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Generated ${tasks.length} ranking collection tasks -> ${outputPath}`);
}

main();
