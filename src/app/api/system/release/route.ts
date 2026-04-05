import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth/auth-options";
import { getReleaseReadinessSummary } from "@/lib/system/release-readiness";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        success: false,
        message: "未登录，无法查看上线结论。",
      },
      { status: 401 },
    );
  }

  const release = await getReleaseReadinessSummary();

  return NextResponse.json({
    success: true,
    data: release,
  });
}
