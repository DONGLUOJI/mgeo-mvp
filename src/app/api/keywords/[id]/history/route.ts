import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth-options";
import { listMonitorResults } from "@/lib/db/repository";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, context: Context) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "请先登录" }, { status: 401 });
  }

  const { id } = await context.params;
  const data = await listMonitorResults(id, session.user.id);
  return NextResponse.json({ success: true, data });
}

