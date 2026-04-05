import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth-options";
import { addMonitoredKeyword, listMonitoredKeywords } from "@/lib/db/repository";
import type { ModelName } from "@/lib/detect/types";

type KeywordPayload = {
  brandName?: string;
  keyword?: string;
  industry?: string;
  businessSummary?: string;
  selectedModels?: ModelName[];
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "请先登录" }, { status: 401 });
  }

  const data = await listMonitoredKeywords(session.user.id);
  return NextResponse.json({ success: true, data });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "请先登录" }, { status: 401 });
  }

  const body = (await req.json()) as KeywordPayload;
  if (!body.brandName?.trim() || !body.keyword?.trim()) {
    return NextResponse.json({ success: false, message: "请输入品牌名和监控关键词" }, { status: 400 });
  }
  if (!body.selectedModels?.length) {
    return NextResponse.json({ success: false, message: "请至少选择一个监控模型" }, { status: 400 });
  }

  try {
    const id = await addMonitoredKeyword({
      userId: session.user.id,
      brandName: body.brandName.trim(),
      keyword: body.keyword.trim(),
      industry: body.industry?.trim() || null,
      businessSummary: body.businessSummary?.trim() || "",
      selectedModels: body.selectedModels,
    });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "添加监控关键词失败",
      },
      { status: 400 }
    );
  }
}

