import { NextResponse } from "next/server";

import { getTrendingQueriesData } from "@/lib/ranking/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get("industry") || undefined;
    const city = searchParams.get("city") || undefined;
    const days = Number(searchParams.get("days") || 30);
    const limit = Number(searchParams.get("limit") || 20);
    const offset = Number(searchParams.get("offset") || 0);

    const data = await getTrendingQueriesData({
      industry,
      city,
      days: Number.isFinite(days) ? days : 30,
      limit: Number.isFinite(limit) ? limit : 20,
      offset: Number.isFinite(offset) ? offset : 0,
    });

    return NextResponse.json({
      queries: data.queries.map((query) => ({
        query_text: query.queryText,
        industry: query.industry,
        heat_score: query.heatScore,
        brand_count: query.brandCount,
        trend_direction: query.trendDirection,
        brands_mentioned: query.brandsMentioned,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "获取热搜问题失败" },
      { status: 500 }
    );
  }
}
