type TrendPoint = {
  date: string;
  tcaTotal: number;
};

export function TrendChart({
  points,
  title,
}: {
  points: TrendPoint[];
  title: string;
}) {
  if (!points.length) {
    return (
      <section style={styles.card}>
        {title ? <div style={styles.header}>{title}</div> : null}
        <div style={styles.empty}>当前暂无趋势样本，先跑一轮监控后这里会自动生成曲线。</div>
      </section>
    );
  }

  const width = 720;
  const height = 240;
  const paddingX = 28;
  const paddingY = 24;
  const values = points.map((item) => item.tcaTotal);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 100);
  const span = Math.max(max - min, 1);

  const coords = points.map((point, index) => {
    const x = paddingX + (index * (width - paddingX * 2)) / Math.max(points.length - 1, 1);
    const y = height - paddingY - ((point.tcaTotal - min) / span) * (height - paddingY * 2);
    return { ...point, x, y };
  });

  const path = coords
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ");

  return (
    <section style={styles.card}>
      {title ? <div style={styles.header}>{title}</div> : null}
      <svg viewBox={`0 0 ${width} ${height}`} style={styles.chart}>
        <defs>
          <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(15,139,127,0.26)" />
            <stop offset="100%" stopColor="rgba(15,139,127,0)" />
          </linearGradient>
        </defs>

        {[0, 25, 50, 75, 100].map((tick) => {
          const y = height - paddingY - ((tick - min) / span) * (height - paddingY * 2);
          return (
            <g key={tick}>
              <line x1={paddingX} x2={width - paddingX} y1={y} y2={y} stroke="#eef2f7" />
              <text x={6} y={y + 5} fontSize="12" fill="#98a2b3">
                {tick}
              </text>
            </g>
          );
        })}

        <path
          d={`${path} L ${coords[coords.length - 1].x} ${height - paddingY} L ${coords[0].x} ${
            height - paddingY
          } Z`}
          fill="url(#trendFill)"
        />
        <path d={path} fill="none" stroke="#0f8b7f" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />

        {coords.map((point) => (
          <g key={`${point.date}-${point.tcaTotal}`}>
            <circle cx={point.x} cy={point.y} r="5" fill="#fff" stroke="#0f8b7f" strokeWidth="3" />
            <text x={point.x} y={height - 6} fontSize="12" textAnchor="middle" fill="#98a2b3">
              {point.date.slice(5)}
            </text>
          </g>
        ))}
      </svg>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "#fff",
    border: "1px solid #e7ebf0",
    borderRadius: 28,
    padding: 28,
    display: "grid",
    gap: 18,
  },
  header: {
    fontSize: 24,
    fontWeight: 800,
    color: "#111827",
  },
  chart: {
    width: "100%",
    height: "auto",
  },
  empty: {
    fontSize: 15,
    lineHeight: 1.8,
    color: "#667085",
  },
};
