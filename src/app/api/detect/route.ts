import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth-options";
import { runDetect } from "@/lib/detect/run-detect";
import type { DetectInput, DetectReport, ModelName } from "@/lib/detect/types";
import { consumeDetectQuota, findRecentDetectTask, getDetectQuotaStatus, saveReport } from "@/lib/db/repository";
import { buildMockReport, createMockTaskId, saveMockReport } from "@/lib/mock/report-data";
import { hasRealProviderConfig } from "@/lib/providers";

type DetectPayload = {
  brandName?: string;
  companyName?: string;
  industry?: string;
  businessSummary?: string;
  businessDescription?: string;
  query?: string;
  searchQuery?: string;
  selectedModels?: ModelName[];
  models?: ModelName[];
  platform?: string;
  locale?: string;
  brandNarrative?: DetectInput["brandNarrative"];
  competitors?: string[];
};

type GuestDetectCookieState = {
  usedAt: string;
  taskId: string;
  signature: string;
};

const GUEST_DETECT_COOKIE = "mgeo_guest_detect_v1";
const GUEST_DETECT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const SAME_DETECT_REUSE_HOURS = 24;

function pickFirst(...values: Array<string | undefined>) {
  return values.find((value) => value?.trim())?.trim() || "";
}

function pickModels(body: DetectPayload) {
  return body.selectedModels?.length ? body.selectedModels : body.models || [];
}

function validatePayload(body: DetectPayload) {
  if (!pickFirst(body.brandName, body.companyName)) return "请输入品牌名";
  if (!body.industry?.trim()) return "请输入所属行业";
  if (!pickFirst(body.businessSummary, body.businessDescription)) return "请输入核心业务描述";
  if (!pickFirst(body.query, body.searchQuery)) return "请输入检测问题";
  if (!pickModels(body).length) return "请至少选择一个模型";
  return "";
}

function buildDetectSignature(brandName: string, query: string) {
  return `${brandName.trim().toLowerCase()}::${query.trim().toLowerCase()}`;
}

function readCookie(req: Request, name: string) {
  const cookieHeader = req.headers.get("cookie") || "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!cookie) return null;
  return cookie.slice(name.length + 1);
}

function readGuestDetectState(req: Request): GuestDetectCookieState | null {
  const raw = readCookie(req, GUEST_DETECT_COOKIE);
  if (!raw) return null;

  try {
    return JSON.parse(decodeURIComponent(raw)) as GuestDetectCookieState;
  } catch {
    return null;
  }
}

function isReusableGuestDetect(state: GuestDetectCookieState, signature: string) {
  if (state.signature !== signature) return false;
  const usedAtMs = new Date(state.usedAt).getTime();
  if (Number.isNaN(usedAtMs)) return false;
  return Date.now() - usedAtMs <= SAME_DETECT_REUSE_HOURS * 60 * 60 * 1000;
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
    const normalizedBrandName = pickFirst(body.brandName, body.companyName);
    const normalizedBusinessSummary = pickFirst(body.businessSummary, body.businessDescription);
    const normalizedQuery = pickFirst(body.query, body.searchQuery);
    const normalizedModels = pickModels(body);
    const detectSignature = buildDetectSignature(normalizedBrandName, normalizedQuery);
    const input: DetectInput = {
      brandName: normalizedBrandName,
      industry: body.industry!.trim(),
      businessSummary: normalizedBusinessSummary,
      query: normalizedQuery,
      platform: body.platform || (normalizedModels.length === 1 ? normalizedModels[0] : "multi-model"),
      selectedModels: normalizedModels,
      locale: body.locale || "zh-CN",
      brandNarrative: body.brandNarrative,
      competitors: body.competitors || [],
    };

    if (session?.user?.id) {
      const recentTask = await findRecentDetectTask({
        userId: session.user.id,
        brandName: normalizedBrandName,
        query: normalizedQuery,
        hours: SAME_DETECT_REUSE_HOURS,
      });
      if (recentTask) {
        const quota = await getDetectQuotaStatus(session.user.id);
        return NextResponse.json({
          success: true,
          data: {
            taskId: recentTask.taskId,
            reused: true,
            quota,
          },
        });
      }
    } else {
      const guestDetectState = readGuestDetectState(req);
      if (guestDetectState && isReusableGuestDetect(guestDetectState, detectSignature)) {
        return NextResponse.json({
          success: true,
          data: {
            taskId: guestDetectState.taskId,
            reused: true,
            guest: true,
          },
        });
      }

      if (guestDetectState) {
        return NextResponse.json(
          {
            success: false,
            code: "GUEST_LIMIT_EXCEEDED",
            message: "未登录用户仅可体验 1 次，请登录后每周可检测 3 次，或提交咨询 / 企业诊断。",
          },
          { status: 403 }
        );
      }
    }

    let quota: Awaited<ReturnType<typeof consumeDetectQuota>> | null = null;
    if (session?.user?.id) {
      quota = await consumeDetectQuota(session.user.id);
      if (!quota.allowed) {
        return NextResponse.json(
          {
            success: false,
            message:
              quota.plan === "free"
                ? `当前免费版${quota.periodLabel}检测额度已用完，请提交咨询或申请企业诊断。`
                : `当前 ${quota.plan} 套餐${quota.periodLabel}检测额度已用完，请升级后继续使用。`,
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

    const response = NextResponse.json({
      success: true,
      data: {
        taskId,
        score: report.score,
        quota,
      },
    });

    if (!session?.user?.id) {
      response.cookies.set(
        GUEST_DETECT_COOKIE,
        encodeURIComponent(
          JSON.stringify({
            usedAt: new Date().toISOString(),
            taskId,
            signature: detectSignature,
          } satisfies GuestDetectCookieState)
        ),
        {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: GUEST_DETECT_COOKIE_MAX_AGE,
          path: "/",
        }
      );
    }

    return response;
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
