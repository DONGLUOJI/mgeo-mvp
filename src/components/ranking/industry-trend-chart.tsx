const SERIES_COLORS = ["#111827", "#0a7c66", "#dc6803", "#7c3aed", "#2563eb", "#be123c"];

type IndustryTrendChartProps = {
  series: Array<{
    industry: string;
    data: Array<{ week: string; avgScore: number }>;
  }>;
};

export function IndustryTrendChart({ series }: IndustryTrendChartProps) {
  const width = 960;
  const height = 320;
  const padding = 32;
  const points = series.flatMap((item) => item.data.map((entry) => entry.avgScore));
  const min = Math.min(...points) - 2;
  const max = Math.max(...points) + 2;

  function getPath(data: Array<{ week: string; avgScore: number }>) {
    return data
      .map((point, index) => {
        const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
        const y = height - padding - ((point.avgScore - min) / Math.max(max - min, 1)) * (height - padding * 2);
        return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>行业平均分趋势</div>
          <div style={styles.text}>过去 12 周不同板块的 TCA 均分变化，用于营造“每周都要回来看看”的信息节奏。</div>
        </div>
        <div style={styles.legend}>
          {series.map((item, index) => (
            <div key={item.industry} style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: SERIES_COLORS[index % SERIES_COLORS.length] }} />
              {item.industry}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.chartWrap}>
        <svg viewBox={`0 0 ${width} ${height}`} style={styles.svg} role="img" aria-label="行业平均分趋势图">
          {[0, 1, 2, 3].map((index) => {
            const y = padding + index * ((height - padding * 2) / 3);
            return <line key={index} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e5e7eb" strokeDasharray="4 6" />;
          })}

          {series.map((item, index) => (
            <path
              key={item.industry}
              d={getPath(item.data)}
              fill="none"
              stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}
        </svg>

        <div style={styles.xAxis}>
          {series[0]?.data.map((point) => (
            <span key={point.week}>{point.week}</span>
          ))}
        </div>
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
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
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
    maxWidth: 620,
  },
  legend: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  legendItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: "#4b5563",
    fontWeight: 700,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  chartWrap: {
    overflowX: "auto",
  },
  svg: {
    width: "100%",
    minWidth: 760,
    height: 320,
    display: "block",
  },
  xAxis: {
    display: "grid",
    gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
    gap: 8,
    marginTop: 10,
    fontSize: 12,
    color: "#6b7280",
    minWidth: 760,
  },
};
