import { NextResponse } from "next/server";
import { listRankingSnapshots } from "@/lib/db/repository";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const industry = searchParams.get("industry") || undefined;
    const days = Number(searchParams.get("days") || 30);
    const limit = Number(searchParams.get("limit") || 20);

    const rows = await listRankingSnapshots({
      industry,
      days: Number.isFinite(days) ? days : 30,
      limit: Number.isFinite(limit) ? limit : 20,
    });

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "获取排名失败",
      },
      { status: 500 }
    );
  }
}
