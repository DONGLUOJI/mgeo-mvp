import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth-options";
import { runDetect } from "@/lib/detect/run-detect";
import type { DetectInput, DetectReport, ModelName } from "@/lib/detect/types";
import { consumeDetectQuota, saveReport } from "@/lib/db/repository";
import { buildMockReport, createMockTaskId, saveMockReport } from "@/lib/mock/report-data";
import { hasRealProviderConfig } from "@/lib/providers";

type DetectPayload = {
  brandName?: string;
  industry?: string;
  businessSummary?: string;
  query?: string;
  selectedModels?: ModelName[];
};

function validatePayload(body: DetectPayload) {
  if (!body.brandName?.trim()) return "请输入品牌名";
  if (!body.industry?.trim()) return "请输入所属行业";
  if (!body.businessSummary?.trim()) return "请输入核心业务描述";
  if (!body.query?.trim()) return "请输入检测问题";
  if (!body.selectedModels?.length) return "请至少选择一个模型";
  return "";
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = (await req.json()) as DetectPayload;
    const error = validatePayload(body);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error,
        },
        { status: 400 }
      );
    }

    const taskId = createMockTaskId();
    const input: DetectInput = {
      brandName: body.brandName!.trim(),
      industry: body.industry!.trim(),
      businessSummary: body.businessSummary!.trim(),
      query: body.query!.trim(),
      selectedModels: body.selectedModels!,
    };

    let quota: Awaited<ReturnType<typeof consumeDetectQuota>> | null = null;
    if (session?.user?.id) {
      quota = await consumeDetectQuota(session.user.id);
      if (!quota.allowed) {
        return NextResponse.json(
          {
            success: false,
            message: `当前 ${quota.plan} 套餐本月检测额度已用完，请升级后继续使用。`,
            code: "QUOTA_EXCEEDED",
            quota,
          },
          { status: 403 }
        );
      }
    }

    const report: DetectReport = hasRealProviderConfig(input.selectedModels)
      ? await runDetect(input)
      : buildMockReport(input);

    saveMockReport(taskId, report);
    await saveReport(taskId, report, session?.user?.id || null);

    return NextResponse.json({
      success: true,
      data: {
        taskId,
        score: report.score,
        quota,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "检测失败，请稍后再试",
      },
      { status: 500 }
    );
  }
}
