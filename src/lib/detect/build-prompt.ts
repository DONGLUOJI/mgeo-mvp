import type { DetectInput, DetectPromptSet } from "@/lib/detect/types";

export function buildCoveragePrompt(query: string) {
  return `
请直接回答下面这个用户问题：

${query}

要求：
1. 直接按你的正常回答方式回答
2. 如涉及推荐，请尽量给出多个可选项
3. 不要解释你的回答过程
4. 不要刻意补充你不确定的信息
`.trim();
}

export function buildBrandDescriptionPrompt(brandName: string) {
  return `
请介绍一下「${brandName}」这个品牌或项目。

请按以下结构回答：
1. 你是否了解这个品牌
2. 如果了解，它是做什么的
3. 你对它的定位理解是什么
4. 如果不了解，请直接说明“我不了解该品牌”

要求：
- 不确定就直接说不了解
- 不要编造具体事实
- 不要补充没有把握的细节
`.trim();
}

export function buildSourcePrompt(query: string) {
  return `
请回答下面这个问题：

${query}

如果你的回答中使用了明确的信息来源，请尽量写出来源名称。
如果没有明确来源，请直接回答，不要编造来源。

要求：
1. 不要虚构媒体、机构或报告名称
2. 不确定时不要写“据某些资料显示”这类模糊表述
3. 如果没有明确来源，可以不写来源
`.trim();
}

export function buildPromptSet(input: DetectInput): DetectPromptSet {
  return {
    coverage: buildCoveragePrompt(input.query),
    description: buildBrandDescriptionPrompt(input.brandName),
    source: buildSourcePrompt(input.query),
  };
}

export const buildDetectionPromptSet = buildPromptSet;
