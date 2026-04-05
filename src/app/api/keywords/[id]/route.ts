import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth-options";
import { deleteMonitoredKeyword } from "@/lib/db/repository";

type Context = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_req: Request, context: Context) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "请先登录" }, { status: 401 });
  }

  const { id } = await context.params;
  await deleteMonitoredKeyword(id, session.user.id);
  return NextResponse.json({ success: true });
}

