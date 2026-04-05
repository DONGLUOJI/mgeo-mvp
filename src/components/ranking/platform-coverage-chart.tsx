"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type PlatformCoverageChartProps = {
  data: Array<{
    label: string;
    rate: number;
    color: string;
  }>;
};

export function PlatformCoverageChart({ data }: PlatformCoverageChartProps) {
  return (
    <div style={styles.wrap}>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 8, right: 20, left: 4, bottom: 8 }}>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 6" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#e5e7eb" }} />
          <YAxis tickFormatter={(value) => `${value}%`} tick={{ fill: "#6b7280", fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip formatter={(value) => [`${value}%`, "覆盖率"]} contentStyle={{ borderRadius: 14, border: "1px solid #e5e7eb", boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)" }} />
          <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.label} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    width: "100%",
    height: 280,
  },
};
