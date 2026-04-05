import { NextResponse } from "next/server";

import { getUserByEmail, updateUserPlan } from "@/lib/db/repository";
import { mapVariantToPlan, verifyLemonSqueezyWebhook } from "@/lib/payment/lemonsqueezy";

function extractEmail(payload: any) {
  return (
    payload?.data?.attributes?.user_email ||
    payload?.meta?.custom_data?.email ||
    payload?.data?.attributes?.customer_email ||
    null
  );
}

function extractVariantId(payload: any) {
  return payload?.data?.attributes?.variant_id || payload?.meta?.custom_data?.variant_id || null;
}

function extractSubscriptionId(payload: any) {
  return payload?.data?.id || null;
}

function extractCustomerId(payload: any) {
  return payload?.data?.attributes?.customer_id || null;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature");

  if (!verifyLemonSqueezyWebhook(rawBody, signature)) {
    return NextResponse.json(
      {
        success: false,
        message: "Webhook 签名校验失败",
      },
      { status: 401 }
    );
  }

  const payload = JSON.parse(rawBody);
  const eventName = payload?.meta?.event_name || "";
  const email = extractEmail(payload);

  if (!email) {
    return NextResponse.json({
      success: true,
      message: "未携带用户邮箱，已忽略",
    });
  }

  const user = await getUserByEmail(String(email).trim().toLowerCase());
  if (!user) {
    return NextResponse.json({
      success: true,
      message: "用户不存在，已忽略",
    });
  }

  let plan = mapVariantToPlan(extractVariantId(payload));
  if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
    plan = "free";
  }

  await updateUserPlan(user.id, plan, {
    stripeCustomerId: extractCustomerId(payload),
    stripeSubscriptionId: extractSubscriptionId(payload),
  });

  return NextResponse.json({
    success: true,
    data: {
      eventName,
      email,
      plan,
    },
  });
}

