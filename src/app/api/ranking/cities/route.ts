import { NextResponse } from "next/server";

import { SUPPORTED_CITIES } from "@/lib/ranking/shared";

export async function GET() {
  return NextResponse.json({
    cities: SUPPORTED_CITIES.map((city) => ({
      city_code: city.code,
      city_name: city.name,
      region: city.region,
      has_data: city.hasData,
    })),
  });
}
