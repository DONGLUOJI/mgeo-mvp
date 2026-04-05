import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/auth-options";
import { listScanTasks } from "@/lib/db/repository";

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
          message: "请先登录后再查看任务列表",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const brand = searchParams.get("brand")?.trim() || "";
    const mode = searchParams.get("mode")?.trim() || "";
    const from = searchParams.get("from")?.trim() || "";
    const to = searchParams.get("to")?.trim() || "";
    const limitParam = Number(searchParams.get("limit") || "100");
    const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(limitParam, 500)) : 100;
    const tasks = await listScanTasks(100, session.user.id);
    const filteredTasks = tasks
      .filter((task) => {
        const matchesQ =
          !q ||
          normalize(task.brandName).includes(normalize(q)) ||
          normalize(task.query).includes(normalize(q)) ||
          normalize(task.customerId).includes(normalize(q));

        const matchesBrand = !brand || task.brandName === brand;
        const matchesMode = !mode || task.executionMode === mode;
        const taskTime = new Date(task.createdAt).getTime();
        const fromTime = from ? new Date(`${from}T00:00:00`).getTime() : null;
        const toTime = to ? new Date(`${to}T23:59:59`).getTime() : null;
        const matchesFrom = fromTime === null || taskTime >= fromTime;
        const matchesTo = toTime === null || taskTime <= toTime;

        return matchesQ && matchesBrand && matchesMode && matchesFrom && matchesTo;
      })
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: filteredTasks,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "检测任务列表读取失败",
      },
      { status: 500 }
    );
  }
}
