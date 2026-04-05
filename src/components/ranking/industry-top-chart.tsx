"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type IndustryTopChartProps = {
  data: Array<{
    brandName: string;
    tcaTotal: number;
  }>;
};

export function IndustryTopChart({ data }: IndustryTopChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.brandName,
    score: item.tcaTotal,
    fill: index < 3 ? "#0fbc8c" : "#9FE1CB",
  }));

  return (
    <section style={styles.card}>
      <div style={styles.head}>
        <h3 style={styles.title}>TOP 10 品牌分布</h3>
        <div style={styles.caption}>只在选定行业时显示，帮助快速对比头部梯队差距。</div>
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
