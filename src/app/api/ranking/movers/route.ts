import { NextResponse } from "next/server";

import { getMoversData } from "@/lib/ranking/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get("industry") || undefined;
    const days = Number(searchParams.get("days") || 7);
    const limit = Number(searchParams.get("limit") || 10);

    const data = await getMoversData({
      industry,
      days: Number.isFinite(days) ? days : 7,
      limit: Number.isFinite(limit) ? limit : 10,
    });

    return NextResponse.json({
      risers: data.risers.map((brand) => ({
        brand_name: brand.brandName,
        industry: brand.industry,
        change: brand.change,
        current_score: brand.currentScore,
      })),
      fallers: data.fallers.map((brand) => ({
        brand_name: brand.brandName,
        industry: brand.industry,
        change: brand.change,
        current_score: brand.currentScore,
      })),
      industry_trends: data.industryTrends,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "获取涨跌榜失败" },
      { status: 500 }
    );
  }
}
