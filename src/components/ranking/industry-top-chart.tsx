"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type IndustryTopChartProps = {
  data: Array<{
    brandName: string;
    tcaTotal: number;
    marketScope?: "local" | "national";
  }>;
  currentCity?: string;
};

export function IndustryTopChart({ data, currentCity = "全国" }: IndustryTopChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.brandName,
    score: item.tcaTotal,
    fill:
      currentCity !== "全国"
        ? item.marketScope === "local"
          ? index < 3
            ? "#0f9b84"
            : "#8FD8C8"
          : index < 3
            ? "#35506C"
            : "#C9D7E5"
        : index < 3
          ? "#0fbc8c"
          : "#9FE1CB",
  }));

  return (
    <section style={styles.card}>
      <div style={styles.head}>
        <h3 style={styles.title}>{currentCity === "全国" ? "TOP 10 品牌分布" : `${currentCity} 本地商家榜 TOP 10`}</h3>
        <div style={styles.caption}>
          {currentCity === "全国"
            ? "只在选定行业时显示，帮助快速对比头部梯队差距。"
            : "绿色代表本地品牌，蓝灰代表全国连锁，帮助快速看出城市搜索场景里的本地竞争格局。"}
        </div>
      </div>
      <div style={styles.chartWrap}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid stroke="#eceae3" strokeDasharray="4 6" horizontal={false} />
            <XAxis type="number" tick={{ fill: "#7c8493", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis
              dataKey="name"
              type="category"
              width={88}
              tick={{ fill: "#4b5563", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value) => [`${value} 分`, "TCA 综合分"]}
              contentStyle={{
                borderRadius: 14,
                border: "1px solid #e5e7eb",
                boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
              }}
            />
            <Bar dataKey="score" radius={[0, 10, 10, 0]} barSize={18}>
              {chartData.map((item) => (
                <Cell key={item.name} fill={item.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    borderRadius: 20,
    background: "#ffffff",
    border: "1px solid #eceae3",
    padding: 20,
    display: "grid",
    gap: 14,
  },
  head: {
    display: "grid",
    gap: 4,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
    color: "#111827",
  },
  caption: {
    fontSize: 13,
    color: "#7c8493",
  },
  chartWrap: {
    width: "100%",
    height: 320,
  },
};
