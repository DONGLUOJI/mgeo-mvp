import Link from "next/link";

type KeywordTableItem = {
  id: string;
  brandName: string;
  keyword: string;
  latestScore: number | null;
  latestLevel: string | null;
  delta7d: number;
  platformCoverage: number;
};

export function KeywordTable({
  items,
  showManage,
}: {
  items: KeywordTableItem[];
  showManage?: boolean;
}) {
  return (
    <section style={styles.card}>
      <div style={styles.headerRow}>
        <div>
          <div style={styles.headerTitle}>监控关键词</div>
          <div style={styles.headerText}>查看品牌关键词的最新 TCA 分、7 天变化和覆盖平台数。</div>
        </div>
        {showManage ? (
          <Link href="/dashboard/keywords" style={styles.manageButton}>
            管理关键词
          </Link>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div style={styles.empty}>当前还没有监控关键词，添加后系统会按日自动跑检测并沉淀趋势。</div>
      ) : (
        <div style={styles.table}>
          <div style={styles.rowHead}>
            <span>关键词</span>
            <span>品牌</span>
            <span>最新 TCA</span>
            <span>7 天变化</span>
            <span>覆盖平台</span>
          </div>
          {items.map((item) => (
            <div key={item.id} style={styles.row}>
              <span>{item.keyword}</span>
              <span>{item.brandName}</span>
              <span>{item.latestScore ?? "—"} {item.latestLevel ? `· ${item.latestLevel}` : ""}</span>
              <span style={{ color: item.delta7d >= 0 ? "#0f8b7f" : "#b42318" }}>
                {item.delta7d > 0 ? "+" : ""}
                {item.delta7d}
              </span>
              <span>{item.platformCoverage}</span>
            </div>
          ))}
        </div>
      )}
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
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    flexWrap: "wrap",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: "#111827",
  },
  headerText: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 1.8,
    color: "#667085",
  },
  manageButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 42,
    padding: "0 16px",
    borderRadius: 12,
    background: "#111827",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
  },
  table: {
    display: "grid",
    gap: 10,
  },
  rowHead: {
    display: "grid",
    gridTemplateColumns: "1.6fr 1.2fr 1fr 1fr 0.8fr",
    gap: 12,
    fontSize: 14,
    fontWeight: 700,
    color: "#667085",
    paddingBottom: 10,
    borderBottom: "1px solid #eef2f7",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1.6fr 1.2fr 1fr 1fr 0.8fr",
    gap: 12,
    fontSize: 15,
    color: "#101828",
    padding: "12px 0",
    borderBottom: "1px solid #f2f4f7",
  },
  empty: {
    fontSize: 15,
    lineHeight: 1.8,
    color: "#667085",
  },
};

