import { NextResponse } from "next/server";

import { getIndustryRankingData } from "@/lib/ranking/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get("industry") || undefined;
    const city = searchParams.get("city") || undefined;
    const days = Number(searchParams.get("days") || 30);
    const limit = Number(searchParams.get("limit") || 50);
    const offset = Number(searchParams.get("offset") || 0);
    const q = searchParams.get("q") || undefined;

    const data = await getIndustryRankingData({
      industry,
      city,
      days: Number.isFinite(days) ? days : 30,
      limit: Number.isFinite(limit) ? limit : 50,
      offset: Number.isFinite(offset) ? offset : 0,
      q,
    });

    return NextResponse.json({
      total: data.total,
      snapshot_date: data.snapshotDate,
      brands: data.brands.map((brand) => ({
        rank: brand.rank,
        brand_name: brand.brandName,
        industry: brand.industry,
        city: brand.city,
        tca_total: brand.tcaTotal,
        tca_consistency: brand.tcaConsistency,
        tca_coverage: brand.tcaCoverage,
        tca_authority: brand.tcaAuthority,
        platform_coverage: brand.platformCoverage,
        platform_total: brand.platformTotal,
        change_7d: brand.change7d,
        prev_tca_total: brand.prevTcaTotal,
        platform_detail: brand.platformDetail,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "获取行业排名失败" },
      { status: 500 }
    );
  }
}
