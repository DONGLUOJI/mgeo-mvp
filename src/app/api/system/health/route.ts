import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth/auth-options";
import { getRuntimeHealthSummary } from "@/lib/system/runtime-health";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
  }

  const health = await getRuntimeHealthSummary();
  return NextResponse.json({ success: true, data: health });
}
