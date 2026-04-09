import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth-options";
import { updateLeadRequest } from "@/lib/db/repository";
import type { LeadRequestStatus } from "@/lib/db/repository";

type LeadUpdateBody = {
  status?: LeadRequestStatus;
  owner?: string;
  note?: string;
};

const allowedStatuses = new Set<LeadRequestStatus>(["new", "contacted", "in_progress", "won", "invalid"]);

export async function PATCH(request: Request, context: { params: Promise<{ leadId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  try {
    const { leadId } = await context.params;
    const body = (await request.json()) as LeadUpdateBody;

    if (body.status && !allowedStatuses.has(body.status)) {
      return NextResponse.json({ error: "线索状态不合法。" }, { status: 400 });
    }

    const updated = await updateLeadRequest({
      id: leadId,
      status: body.status,
      owner: body.owner,
      note: body.note,
    });

    if (!updated) {
      return NextResponse.json({ error: "未找到这条线索。" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, lead: updated });
  } catch (error) {
    console.error("Failed to update lead request", error);
    return NextResponse.json({ error: "更新失败，请稍后再试。" }, { status: 500 });
  }
}

