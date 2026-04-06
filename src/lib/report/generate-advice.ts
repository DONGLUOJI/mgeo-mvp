type TcaScores = {
  consistency: number;
  coverage: number;
  authority: number;
};

export type Advice = {
  dimension: string;
  dimensionLabel: string;
  score: number;
  level: string;
  suggestion: string;
  priority: number;
};

export function generateAdvice(tca: TcaScores): Advice[] {
  const advices: Advice[] = [];

  if (tca.consistency < 40) {
    advices.push({
      dimension: "Consistency",
      dimensionLabel: "一致性",
      score: tca.consistency,
      level: "偏弱",
      suggestion: "各 AI 平台对你的品牌描述存在明显冲突，建议优先统一品牌叙事，确保核心定位在所有平台保持一致。",
      priority: 1,
    });
  } else if (tca.consistency < 60) {
    advices.push({
      dimension: "Consistency",
      dimensionLabel: "一致性",
      score: tca.consistency,
      level: "待优化",
      suggestion: "部分平台的品牌描述存在偏差，建议检查并统一各平台的品牌关键词和核心定位表述。",
      priority: 2,
    });
  } else if (tca.consistency < 80) {
    advices.push({
      dimension: "Consistency",
      dimensionLabel: "一致性",
      score: tca.consistency,
      level: "良好",
      suggestion: "品牌描述基本一致，可进一步细化不同平台的表述层次，让推荐话术更稳定。",
      priority: 3,
    });
  }

  if (tca.coverage < 40) {
    advices.push({
      dimension: "Coverage",
      dimensionLabel: "覆盖度",
      score: tca.coverage,
      level: "偏弱",
      suggestion: "品牌在大多数 AI 平台中几乎不可见，建议尽快在主流平台布局品牌相关内容，先完成基础覆盖。",
      priority: 1,
    });
  } else if (tca.coverage < 60) {
    advices.push({
      dimension: "Coverage",
      dimensionLabel: "覆盖度",
      score: tca.coverage,
      level: "待优化",
      suggestion: "仅部分平台能稳定提及你的品牌，建议优先补齐未覆盖的平台，尤其是高频问答场景。",
      priority: 2,
    });
  } else if (tca.coverage < 80) {
    advices.push({
      dimension: "Coverage",
      dimensionLabel: "覆盖度",
      score: tca.coverage,
      level: "良好",
      suggestion: "覆盖面已经建立，下一步适合针对薄弱平台补强内容与推荐位表现。",
      priority: 3,
    });
  }

  if (tca.authority < 40) {
    advices.push({
      dimension: "Authority",
      dimensionLabel: "权威性",
      score: tca.authority,
      level: "偏弱",
      suggestion: "品牌被 AI 引用的信源质量偏低，建议优先在知乎、行业媒体、百科等高权重平台发布专业内容。",
      priority: 1,
    });
  } else if (tca.authority < 60) {
    advices.push({
      dimension: "Authority",
      dimensionLabel: "权威性",
      score: tca.authority,
      level: "待优化",
      suggestion: "品牌信源的权威性不足，建议补充行业报告引用、专家背书和权威媒体报道等高可信内容。",
      priority: 2,
    });
  } else if (tca.authority < 80) {
    advices.push({
      dimension: "Authority",
      dimensionLabel: "权威性",
      score: tca.authority,
      level: "良好",
      suggestion: "权威性表现良好，可进一步争取行业头部媒体和更高质量的外部引用入口。",
      priority: 3,
    });
  }

  return advices.sort((a, b) => a.score - b.score || a.priority - b.priority);
}
