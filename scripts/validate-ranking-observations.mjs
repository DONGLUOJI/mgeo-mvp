import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function readPayload(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(content);
  const observations = Array.isArray(parsed) ? parsed : parsed.observations;

  if (!Array.isArray(observations) || !observations.length) {
    throw new Error("导入文件里没有 observations 数组");
  }

  return observations;
}

function increment(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function printTop(label, map) {
  const entries = [...map.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`\n${label}:`);
  for (const [key, value] of entries) {
    console.log(`- ${key}: ${value}`);
  }
}

function main() {
  const cwd = process.cwd();
  const target = process.argv[2] || path.join(cwd, "data", "ranking-observations.template.json");
  const filePath = path.isAbsolute(target) ? target : path.join(cwd, target);
  const observations = readPayload(filePath);

  const errors = [];
  const cityCounts = new Map();
  const industryCounts = new Map();
  const modelCounts = new Map();
  const snapshotCounts = new Map();
  let mentionedCount = 0;

  observations.forEach((observation, index) => {
    const row = index + 1;
    const requiredFields = ["snapshotDate", "city", "industry", "queryText", "brandName", "model"];

    for (const field of requiredFields) {
      if (!observation[field]) {
        errors.push(`第 ${row} 条缺少字段：${field}`);
      }
    }

    if (typeof observation.mentioned !== "boolean") {
      errors.push(`第 ${row} 条的 mentioned 必须是 boolean`);
    }

    if (
      observation.mentionPosition !== undefined &&
      observation.mentionPosition !== null &&
      (!Number.isInteger(observation.mentionPosition) || observation.mentionPosition < 1)
    ) {
      errors.push(`第 ${row} 条的 mentionPosition 必须是正整数或 null`);
    }

    if (observation.sourceNames !== undefined && !Array.isArray(observation.sourceNames)) {
      errors.push(`第 ${row} 条的 sourceNames 必须是数组`);
    }

    if (observation.brandType && !["local", "chain", "national"].includes(observation.brandType)) {
      errors.push(`第 ${row} 条的 brandType 非法：${observation.brandType}`);
    }

    increment(cityCounts, observation.city || "未知");
    increment(industryCounts, observation.industry || "未知");
    increment(modelCounts, observation.model || "未知");
    increment(snapshotCounts, observation.snapshotDate || "未知");
    if (observation.mentioned) mentionedCount += 1;
  });

  if (errors.length) {
    console.error("校验失败：");
    for (const error of errors.slice(0, 20)) {
      console.error(`- ${error}`);
    }
    if (errors.length > 20) {
      console.error(`- 还有 ${errors.length - 20} 条错误未展示`);
    }
    process.exit(1);
  }

  console.log(`校验通过：${observations.length} 条 observation`);
  console.log(`提及记录：${mentionedCount}`);
  console.log(`未提及记录：${observations.length - mentionedCount}`);
  printTop("按快照日期统计", snapshotCounts);
  printTop("按城市统计", cityCounts);
  printTop("按行业统计", industryCounts);
  printTop("按模型统计", modelCounts);
}

main();
