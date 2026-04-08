import { NextResponse } from "next/server";

import { getUserById, listActiveMonitoredKeywords, saveMonitorResult } from "@/lib/db/repository";
import { getPlanConfig } from "@/lib/auth/plans";
import { runDetect } from "@/lib/detect/run-detect";
import type { DetectInput, ModelName } from "@/lib/detect/types";
import { buildMockReport } from "@/lib/mock/report-data";
import { hasRealProviderConfig } from "@/lib/providers";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const keywords = await listActiveMonitoredKeywords();
  let successCount = 0;
  let skippedCount = 0;

  for (const item of keywords) {
    try {
      const user = await getUserById(item.userId);
      if (!user || getPlanConfig(user.plan).maxKeywords <= 0) {
        skippedCount += 1;
        continue;
      }

      const input: DetectInput = {
        brandName: item.brandName,
        industry: item.industry || "未分类",
        businessSummary: item.businessSummary || `${item.brandName} 的品牌信息监控`,
        query: item.keyword,
        platform: (item.selectedModels?.length || 0) === 1 ? String(item.selectedModels?.[0]) : "multi-model",
        selectedModels: item.selectedModels as ModelName[],
        locale: "zh-CN",
        competitors: [],
      };

      const report = hasRealProviderConfig(input.selectedModels)
        ? await runDetect(input)
        : buildMockReport(input);

      await saveMonitorResult({
        keywordId: item.id,
        userId: item.userId,
        report,
      });
      successCount += 1;
    } catch {
      skippedCount += 1;
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      total: keywords.length,
      successCount,
      skippedCount,
    },
  });
}
