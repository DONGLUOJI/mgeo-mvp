import { NextResponse } from "next/server";

import { getTrendingQueriesData } from "@/lib/ranking/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get("industry") || undefined;
    const limit = Number(searchParams.get("limit") || 20);
    const offset = Number(searchParams.get("offset") || 0);

    const data = await getTrendingQueriesData({
      industry,
      limit: Number.isFinite(limit) ? limit : 20,
      offset: Number.isFinite(offset) ? offset : 0,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "获取热搜问题失败" },
      { status: 500 }
    );
  }
}
