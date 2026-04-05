import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth-options";
import { buildCheckoutUrl } from "@/lib/payment/lemonsqueezy";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const plan = searchParams.get("plan");
  if (plan !== "basic" && plan !== "pro") {
    return NextResponse.json(
      {
        success: false,
        message: "暂不支持该套餐结账",
      },
      { status: 400 }
    );
  }

  const origin = new URL(req.url).origin;
  const checkoutUrl = buildCheckoutUrl(plan, {
    email: session.user.email,
    successUrl: `${origin}/billing/success?plan=${plan}`,
    cancelUrl: `${origin}/billing/cancel?plan=${plan}`,
  });
  if (!checkoutUrl) {
    return NextResponse.json(
      {
        success: false,
        message: "当前未配置结账地址，请先补充 LemonSqueezy 环境变量。",
      },
      { status: 503 }
    );
  }

  return NextResponse.redirect(checkoutUrl);
}
