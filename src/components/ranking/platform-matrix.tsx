import { PLATFORM_OPTIONS, type PlatformKey } from "@/lib/ranking/data";

type PlatformMatrixRow = {
  brandName: string;
  industry: string;
  platforms: Record<PlatformKey, boolean>;
  coverageRate: number;
};

export function PlatformMatrix({ brands }: { brands: PlatformMatrixRow[] }) {
  return (
    <div style={styles.wrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.thLeft}>品牌</th>
            {PLATFORM_OPTIONS.map((platform) => (
              <th key={platform.key} style={styles.th}>
                {platform.label}
              </th>
            ))}
            <th style={styles.th}>覆盖率</th>
          </tr>
        </thead>
        <tbody>
          {brands.map((brand) => (
            <tr key={brand.brandName}>
              <td style={styles.tdLeft}>
                <div style={styles.brandName}>{brand.brandName}</div>
                <div style={styles.industry}>{brand.industry}</div>
              </td>
              {PLATFORM_OPTIONS.map((platform) => (
                <td key={platform.key} style={styles.tdCenter}>
                  <span style={brand.platforms[platform.key] ? styles.hit : styles.miss}>
                    {brand.platforms[platform.key] ? "✅" : "❌"}
                  </span>
                </td>
              ))}
              <td style={styles.tdStrong}>{Math.round(brand.coverageRate * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    overflowX: "auto",
    border: "1px solid #eceff3",
    borderRadius: 24,
    background: "#ffffff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 920,
  },
  th: {
    padding: "18px 14px",
    fontSize: 15,
    fontWeight: 800,
    color: "#6b7280",
    textAlign: "center",
    background: "#f8fafc",
    borderBottom: "1px solid #eceff3",
  },
  thLeft: {
    padding: "18px 20px",
    fontSize: 15,
    fontWeight: 800,
    color: "#6b7280",
    textAlign: "left",
    background: "#f8fafc",
    borderBottom: "1px solid #eceff3",
  },
  tdLeft: {
    padding: "18px 20px",
    borderBottom: "1px solid #f0f2f5",
    verticalAlign: "middle",
  },
  tdCenter: {
    padding: "18px 14px",
    textAlign: "center",
    borderBottom: "1px solid #f0f2f5",
  },
  tdStrong: {
    padding: "18px 14px",
    textAlign: "center",
    borderBottom: "1px solid #f0f2f5",
    fontWeight: 800,
    color: "#111827",
  },
  brandName: {
    fontSize: 16,
    fontWeight: 800,
    color: "#111827",
  },
  industry: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
  },
  hit: {
    fontSize: 18,
  },
  miss: {
    fontSize: 18,
    opacity: 0.72,
  },
};
