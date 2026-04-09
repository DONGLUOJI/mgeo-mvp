import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth-options";
import { runDetect } from "@/lib/detect/run-detect";
import type { DetectInput, DetectReport, ModelName } from "@/lib/detect/types";
import {
  checkDetectRateLimits,
  consumeDetectQuota,
  findRecentDetectTask,
  getDetectQuotaStatus,
  recordDetectRequestEvent,
  saveReport,
} from "@/lib/db/repository";
import { hasGoogleVisionConfig, parseImageDataUrl } from "@/lib/evidence/google-vision";
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
  sampleImageDataUrl?: string;
  sampleImageName?: string;
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
  if (!pickFirst(body.brandName, body.companyName)) return "请输入账号昵称或目标名称";
  if (!body.industry?.trim()) return "请选择内容场景";
  if (!pickFirst(body.businessSummary, body.businessDescription)) return "请输入样本描述";
  if (!pickFirst(body.query, body.searchQuery)) return "请输入核验问题";
  if (!pickModels(body).length) return "请至少选择一个核验引擎";
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

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return req.headers.get("x-real-ip")?.trim() || req.headers.get("cf-connecting-ip")?.trim() || null;
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
    const clientIp = getClientIp(req);
    let parsedSampleImage: ReturnType<typeof parseImageDataUrl> | null = null;

    if (body.sampleImageDataUrl) {
      try {
        parsedSampleImage = parseImageDataUrl(body.sampleImageDataUrl);
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            message: error instanceof Error ? error.message : "图片格式无效，请重新上传",
          },
          { status: 400 }
        );
      }

      if (!hasGoogleVisionConfig()) {
        return NextResponse.json(
          {
            success: false,
            message: "已上传图片，但服务端尚未配置 GOOGLE_VISION_API_KEY 或 GOOGLE_VISION_BEARER_TOKEN。",
          },
          { status: 400 }
        );
      }
    }

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
      sampleImageName: body.sampleImageName?.trim() || undefined,
      sampleImageMimeType: parsedSampleImage?.mimeType,
      hasSampleImage: Boolean(parsedSampleImage),
    };

    if (session?.user?.id) {
      const recentTask = await findRecentDetectTask({
        userId: session.user.id,
        brandName: normalizedBrandName,
        query: normalizedQuery,
        hours: SAME_DETECT_REUSE_HOURS,
      });
      if (recentTask) {
        await recordDetectRequestEvent({
          userId: session.user.id,
          clientIp,
          signature: detectSignature,
          status: "reused",
          taskId: recentTask.taskId,
        });
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
        await recordDetectRequestEvent({
          clientIp,
          signature: detectSignature,
          status: "reused",
          taskId: guestDetectState.taskId,
        });
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
        await recordDetectRequestEvent({
          clientIp,
          signature: detectSignature,
          status: "blocked_guest_cookie_limit",
        });
        return NextResponse.json(
          {
            success: false,
            code: "GUEST_LIMIT_EXCEEDED",
            message: "未登录用户仅可体验 1 次，请登录后每周可核验 3 次，或提交企业接入需求。",
          },
          { status: 403 }
        );
      }
    }

    const rateLimit = await checkDetectRateLimits({
      clientIp,
      guest: !session?.user?.id,
    });
    if (!rateLimit.allowed) {
      await recordDetectRequestEvent({
        userId: session?.user?.id || null,
        clientIp,
        signature: detectSignature,
        status: rateLimit.code === "IP_RATE_LIMITED" ? "blocked_rate_limit" : "blocked_guest_limit",
      });

      return NextResponse.json(
        {
          success: false,
          code: rateLimit.code,
          message: rateLimit.message,
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        },
        { status: rateLimit.code === "IP_RATE_LIMITED" ? 429 : 403 },
      );
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
                ? `当前免费版${quota.periodLabel}核验额度已用完，请稍后重试或提交企业接入需求。`
                : `当前 ${quota.plan} 套餐${quota.periodLabel}核验额度已用完，请升级后继续使用。`,
            code: "QUOTA_EXCEEDED",
            quota,
          },
          { status: 403 }
        );
      }
    }

    await recordDetectRequestEvent({
      userId: session?.user?.id || null,
      clientIp,
      signature: detectSignature,
      status: "allowed",
      taskId,
    });

    const runtimeImage = parsedSampleImage
      ? (() => {
          return {
            base64: parsedSampleImage.base64,
            mimeType: parsedSampleImage.mimeType,
            name: body.sampleImageName?.trim() || undefined,
          };
        })()
      : null;

    const report: DetectReport = hasRealProviderConfig(input.selectedModels) || runtimeImage
      ? await runDetect(input, { sampleImage: runtimeImage })
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
