import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth-options";
import { sendContactEmail } from "@/lib/contact/send-contact-email";
import { createLeadRequest } from "@/lib/db/repository";

type ContactBody = {
  name?: string;
  company?: string;
  phone?: string;
  industry?: string;
  message?: string;
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = (await request.json()) as ContactBody;

    const payload = {
      name: body.name?.trim() || "",
      company: body.company?.trim() || "",
      phone: body.phone?.trim() || "",
      industry: body.industry?.trim() || "",
      message: body.message?.trim() || "",
    };

    if (!payload.name || !payload.company || !payload.phone || !payload.message) {
      return NextResponse.json({ error: "请完整填写姓名、公司/品牌、联系电话和需求描述。" }, { status: 400 });
    }

    await createLeadRequest({
      type: "contact",
      source: "homepage_consult",
      name: payload.name,
      company: payload.company,
      phone: payload.phone,
      industry: payload.industry,
      message: payload.message,
      userId: session?.user?.id || null,
    });

    await sendContactEmail(payload);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "SMTP_PASS_MISSING") {
      return NextResponse.json({ error: "邮件服务尚未完成配置，请稍后再试。" }, { status: 503 });
    }

    console.error("Failed to submit contact form", error);
    return NextResponse.json({ error: "提交失败，请稍后再试。" }, { status: 500 });
  }
}
