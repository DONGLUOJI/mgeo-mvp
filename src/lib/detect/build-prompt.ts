import type { DetectInput } from "@/lib/detect/types";

export function buildPrompt(input: DetectInput) {
  return `
你是一个品牌信息识别助手。请基于你的理解回答以下问题，并尽量直接、明确。

品牌名称：${input.brandName}
所属行业：${input.industry}
核心业务：${input.businessSummary}

用户问题：${input.query}

请严格按以下结构输出：
1. 是否提到该品牌
2. 对品牌的定位描述
3. 品牌主要提供什么服务或产品
4. 是否存在推荐、比较或排序意味
5. 如果信息不确定，请直接说明不确定
`.trim();
}
