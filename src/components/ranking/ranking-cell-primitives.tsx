import { PLATFORM_OPTIONS, type PlatformDetail } from "@/lib/ranking/data";
import { getCityMeta, getIndustryTheme } from "@/lib/ranking/shared";

function getScoreColor(value: number) {
  if (value >= 80) return "#0fbc8c";
  if (value >= 60) return "#378ADD";
  if (value >= 40) return "#EF9F27";
  return "#E24B4A";
}

export function RankBadge({ rank }: { rank: number }) {
  const style =
    rank === 1
      ? { background: "#D4A04A", color: "#ffffff" }
      : rank === 2
        ? { background: "#A0A0A0", color: "#ffffff" }
        : rank === 3
          ? { background: "#CD7F32", color: "#ffffff" }
          : { background: "#F1EFE8", color: "#5F5E5A" };

  return (
    <span style={{ ...styles.rankBadge, ...style }}>
      {rank}
    </span>
  );
}

export function IndustryTag({ industry }: { industry: string }) {
  const theme = getIndustryTheme(industry);
  return (
    <span
      style={{
        ...styles.industryTag,
        color: theme.text,
        background: theme.background,
        borderColor: theme.border,
      }}
    >
      {industry}
    </span>
  );
}

export function CityTag({ city }: { city: string }) {
  const meta = getCityMeta(city);

  return (
    <span style={styles.cityTag}>
      {meta.name}
    </span>
  );
}

export function TcaScoreBar({ value, width = 80 }: { value: number; width?: number }) {
  const color = getScoreColor(value);

  return (
    <span style={styles.scoreWrap}>
      <span style={styles.scoreNumber}>{value}</span>
      <span style={{ ...styles.scoreTrack, width }}>
        <span style={{ ...styles.scoreFill, width: `${value}%`, background: color }} />
      </span>
    </span>
  );
}

export function ChangeBadge({ value }: { value: number }) {
  const state = Math.abs(value) <= 0.5 ? "stable" : value > 0 ? "up" : "down";
  const style =
    state === "up"
      ? { color: "#085041", background: "#E1F5EE" }
      : state === "down"
        ? { color: "#791F1F", background: "#FCEBEB" }
        : { color: "#5F5E5A", background: "#F1EFE8" };
  const prefix = state === "up" ? "↑" : state === "down" ? "↓" : "→";

  return (
    <span style={{ ...styles.changeBadge, ...style }}>
      {prefix} {Math.abs(value).toFixed(1)}
    </span>
  );
}

export function PlatformDots({
  coverage,
  total,
  detail,
}: {
  coverage: number;
  total: number;
  detail: Record<string, PlatformDetail>;
}) {
  const tooltip = PLATFORM_OPTIONS.map((platform) => {
    const item = detail[platform.key];
    return `${platform.label}：${item.mentioned ? `已提及，第 ${item.position} 位` : "未被提及"}`;
  }).join("\n");

  return (
    <span style={styles.platformDotsWrap} title={tooltip}>
      <span style={styles.platformDots}>
        {PLATFORM_OPTIONS.map((platform) => {
          const mentioned = detail[platform.key].mentioned;
          return (
            <span
              key={platform.key}
              style={{
                ...styles.platformDot,
                background: mentioned ? "#0fbc8c" : "#ffffff",
                borderColor: mentioned ? "#0fbc8c" : "#D3D1C7",
              }}
            />
          );
        })}
      </span>
      <span style={styles.platformCoverageText}>
        {coverage}/{total}
      </span>
    </span>
  );
}

export function DetailTcaBar({ label, value }: { label: string; value: number }) {
  const color = getScoreColor(value);

  return (
    <div style={styles.detailBarRow}>
      <span style={styles.detailBarLabel}>{label}</span>
      <span style={styles.detailBarValue}>{value}</span>
      <span style={styles.detailBarTrack}>
        <span style={{ ...styles.detailBarFill, width: `${value}%`, background: color }} />
      </span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 800,
  },
  industryTag: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "fit-content",
    padding: "3px 10px",
    borderRadius: 8,
    border: "1px solid transparent",
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  cityTag: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "fit-content",
    padding: "3px 10px",
    borderRadius: 8,
    border: "1px solid #d4d9e2",
    background: "#f8fafc",
    color: "#4b5563",
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  scoreWrap: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },
  scoreNumber: {
    minWidth: 28,
    fontSize: 15,
    fontWeight: 800,
    color: "#1a1a1a",
  },
  scoreTrack: {
    height: 8,
    borderRadius: 999,
    background: "#eceae3",
    overflow: "hidden",
  },
  scoreFill: {
    height: "100%",
    borderRadius: 999,
  },
  changeBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px 12px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  platformDotsWrap: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
  },
  platformDots: {
    display: "inline-flex",
    gap: 4,
  },
  platformDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    border: "1px solid #D3D1C7",
    boxSizing: "border-box",
  },
  platformCoverageText: {
    fontSize: 13,
    color: "#5F5E5A",
    fontWeight: 700,
  },
  detailBarRow: {
    display: "grid",
    gridTemplateColumns: "110px 42px 1fr",
    gap: 12,
    alignItems: "center",
  },
  detailBarLabel: {
    fontSize: 14,
    color: "#4b5563",
  },
  detailBarValue: {
    fontSize: 14,
    fontWeight: 800,
    color: "#111827",
    textAlign: "right",
  },
  detailBarTrack: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    background: "#eceae3",
    overflow: "hidden",
  },
  detailBarFill: {
    height: "100%",
    borderRadius: 999,
  },
};
