import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth-options";
import { listCustomers } from "@/lib/db/repository";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "请先登录后再查看客户列表",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const industry = searchParams.get("industry")?.trim() || "";
    const sort = searchParams.get("sort")?.trim() || "updated_desc";
    const limitParam = Number(searchParams.get("limit") || "100");
    const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(limitParam, 500)) : 100;
    const customers = await listCustomers(100, session.user.id);
    const filteredCustomers = customers
      .filter((customer) => {
        const matchesQ =
          !q ||
          normalize(customer.brandName).includes(normalize(q)) ||
          normalize(customer.businessSummary).includes(normalize(q)) ||
          normalize(customer.customerId).includes(normalize(q));

        const matchesIndustry = !industry || customer.industry === industry;
        return matchesQ && matchesIndustry;
      })
      .sort((a, b) => {
        if (sort === "tasks_desc") return b.taskCount - a.taskCount;
        if (sort === "tasks_asc") return a.taskCount - b.taskCount;
        if (sort === "created_desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sort === "created_asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sort === "brand_asc") return a.brandName.localeCompare(b.brandName, "zh-CN");
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: filteredCustomers,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "客户列表读取失败",
      },
      { status: 500 }
    );
  }
}
