"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getIndustryTheme } from "@/lib/ranking/shared";

type IndustryTrendChartProps = {
  series: Array<{
    industry: string;
    data: Array<{ week: string; avgScore: number }>;
  }>;
};

export function IndustryTrendChart({ series }: IndustryTrendChartProps) {
  const chartData =
    series[0]?.data.map((point, index) => {
      const row: Record<string, string | number> = {
        week: point.week,
      };

      series.forEach((item) => {
        row[item.industry] = item.data[index]?.avgScore ?? 0;
      });

      return row;
    }) || [];

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.title}>行业平均分趋势</div>
        <div style={styles.text}>过去 12 周不同行业的 TCA 均分变化。</div>
      </div>

      <div style={styles.chartWrap}>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 8, right: 20, left: 4, bottom: 8 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 6" vertical={false} />
            <XAxis dataKey="week" tick={{ fill: "#6b7280", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#e5e7eb" }} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} tickLine={false} axisLine={false} domain={["dataMin - 2", "dataMax + 2"]} />
            <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #e5e7eb", boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)" }} />
            <Legend wrapperStyle={{ fontSize: 13, color: "#4b5563" }} />
            {series.map((item, index) => (
              <Line
                key={item.industry}
                type="monotone"
                dataKey={item.industry}
                stroke={getIndustryTheme(item.industry).line}
                strokeWidth={3}
                dot={{ r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    marginTop: 24,
    border: "1px solid #eceff3",
    borderRadius: 24,
    background: "#ffffff",
    padding: 22,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    color: "#111827",
  },
  text: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 1.7,
    color: "#6b7280",
  },
  chartWrap: {
    width: "100%",
    height: 320,
  },
};
