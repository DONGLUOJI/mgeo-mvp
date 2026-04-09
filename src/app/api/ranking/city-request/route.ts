import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth-options";
import { sendCityRequestEmail } from "@/lib/contact/send-city-request-email";
import { createLeadRequest } from "@/lib/db/repository";

type CityRequestBody = {
  region?: string;
  brand?: string;
  contact?: string;
  note?: string;
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = (await request.json()) as CityRequestBody;

    const payload = {
      region: body.region?.trim() || "",
      brand: body.brand?.trim() || "",
      contact: body.contact?.trim() || "",
      note: body.note?.trim() || "",
    };

    if (!payload.region || !payload.brand || !payload.contact) {
      return NextResponse.json({ error: "请完整填写地区、品牌/公司和联系方式。" }, { status: 400 });
    }

    await createLeadRequest({
      type: "city_request",
      source: "ranking_city_request",
      brand: payload.brand,
      contact: payload.contact,
      region: payload.region,
      note: payload.note,
      userId: session?.user?.id || null,
    });

    await sendCityRequestEmail(payload);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "SMTP_PASS_MISSING") {
      return NextResponse.json({ error: "邮件服务尚未完成配置，请稍后再试。" }, { status: 503 });
    }

    console.error("Failed to submit city request", error);
    return NextResponse.json({ error: "提交失败，请稍后再试。" }, { status: 500 });
  }
}
