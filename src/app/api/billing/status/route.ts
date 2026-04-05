import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth-options";
import { getDetectQuotaStatus, getUserById } from "@/lib/db/repository";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const [user, quota] = await Promise.all([
    getUserById(session.user.id),
    getDetectQuotaStatus(session.user.id),
  ]);

  if (!user) {
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      email: user.email,
      plan: user.plan,
      quota,
      updatedAt: user.updatedAt,
    },
  });
}
