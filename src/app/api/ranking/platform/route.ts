import { NextResponse } from "next/server";

import { getPlatformCoverageData } from "@/lib/ranking/data";
import type { PlatformKey } from "@/lib/ranking/shared";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get("industry") || undefined;
    const city = searchParams.get("city") || undefined;
    const platform = searchParams.get("platform") || undefined;
    const coverage = searchParams.get("coverage") || undefined;
    const limit = Number(searchParams.get("limit") || 50);
    const offset = Number(searchParams.get("offset") || 0);

    const data = await getPlatformCoverageData({
      industry,
      city,
      platform: platform as PlatformKey | undefined,
      coverage: coverage as "low" | "medium" | "high" | undefined,
      limit: Number.isFinite(limit) ? limit : 50,
      offset: Number.isFinite(offset) ? offset : 0,
    });

    return NextResponse.json({
      platform_stats: data.platformStats,
      brands: data.brands.map((brand) => ({
        brand_name: brand.brandName,
        industry: brand.industry,
        platforms: brand.platforms,
        coverage_rate: brand.coverageRate,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "获取平台覆盖失败" },
      { status: 500 }
    );
  }
}
