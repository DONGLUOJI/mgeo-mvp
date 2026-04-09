import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { LeadStatusForm } from "@/components/leads/lead-status-form";
import { authOptions } from "@/lib/auth/auth-options";
import { listLeadRequests } from "@/lib/db/repository";

function formatDateTime(value: string | null) {
  if (!value) return "暂无";

  const date = new Date(value);
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

const statusLabel: Record<string, string> = {
  new: "新线索",
  contacted: "已联系",
  in_progress: "跟进中",
  won: "已成交",
  invalid: "无效",
};

const typeLabel: Record<string, string> = {
  contact: "咨询线索",
  city_request: "城市收录申请",
};

const statusStyles: Record<string, React.CSSProperties> = {
  new: { background: "#eef8ff", color: "#1769aa" },
  contacted: { background: "#fff4e5", color: "#b54708" },
  in_progress: { background: "#eef4ff", color: "#315fd6" },
  won: { background: "#edf8f6", color: "#0a7c66" },
  invalid: { background: "#f4f4f5", color: "#667085" },
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string; type?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = searchParams ? await searchParams : {};
  const q = params?.q?.trim() || "";
  const status = params?.status?.trim() || "";
  const type = params?.type?.trim() || "";

  const leads = await listLeadRequests(200);
  const filteredLeads = leads.filter((lead) => {
    const haystack = [
      lead.name,
      lead.company,
      lead.brand,
      lead.phone,
      lead.contact,
      lead.industry,
      lead.region,
      lead.message,
      lead.note,
    ]
      .filter(Boolean)
      .join(" ");

    const matchesQ = !q || normalize(haystack).includes(normalize(q));
    const matchesStatus = !status || lead.status === status;
    const matchesType = !type || lead.type === type;
    return matchesQ && matchesStatus && matchesType;
  });

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.badge}>线索管理后台</div>
          <h1 style={styles.title}>统一查看咨询线索与城市收录申请</h1>
          <p style={styles.text}>
            这里集中管理来自首页咨询表单和排名页城市收录入口的线索。你可以查看来源、联系方式、需求内容，并把每条线索推进到跟进状态。
          </p>
          <form action="/leads" style={styles.filterBar}>
            <input type="text" name="q" defaultValue={q} placeholder="搜索品牌、公司、地区、电话或备注" style={styles.searchInput} />
            <select name="status" defaultValue={status} style={styles.select}>
              <option value="">全部状态</option>
              <option value="new">新线索</option>
              <option value="contacted">已联系</option>
              <option value="in_progress">跟进中</option>
              <option value="won">已成交</option>
              <option value="invalid">无效</option>
            </select>
            <select name="type" defaultValue={type} style={styles.select}>
              <option value="">全部类型</option>
              <option value="contact">咨询线索</option>
              <option value="city_request">城市收录申请</option>
            </select>
            <button type="submit" style={styles.filterButton}>
              筛选
            </button>
          </form>
        </section>

        {filteredLeads.length === 0 ? (
          <section style={styles.emptyState}>
            <h2 style={styles.emptyTitle}>暂时没有符合条件的线索</h2>
            <p style={styles.emptyText}>等用户提交咨询或地区收录申请后，这里就会自动显示。</p>
          </section>
        ) : (
          <section style={styles.list}>
            {filteredLeads.map((lead) => (
              <article key={lead.id} style={styles.card}>
                <div style={styles.cardHead}>
                  <div style={styles.headMain}>
                    <div style={styles.badges}>
                      <span style={styles.typeBadge}>{typeLabel[lead.type] || lead.type}</span>
                      <span style={{ ...styles.statusBadge, ...(statusStyles[lead.status] || statusStyles.new) }}>
                        {statusLabel[lead.status] || lead.status}
                      </span>
                    </div>
                    <h2 style={styles.cardTitle}>{lead.company || lead.brand || lead.name || "未命名线索"}</h2>
                    <p style={styles.cardText}>
                      {lead.message ||
                        lead.note ||
                        (lead.type === "city_request"
                          ? "用户希望收录新的地区 / 城市数据。"
                          : "用户提交了咨询请求，等待进一步沟通。")}
                    </p>
                  </div>
                  <div style={styles.metaCard}>
                    <div style={styles.metaLabel}>最近更新时间</div>
                    <div style={styles.metaValue}>{formatDateTime(lead.updatedAt)}</div>
                  </div>
                </div>

                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>姓名</span>
                    <span style={styles.infoValue}>{lead.name || "暂无"}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>品牌 / 公司</span>
                    <span style={styles.infoValue}>{lead.company || lead.brand || "暂无"}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>联系电话</span>
                    <span style={styles.infoValue}>{lead.phone || lead.contact || "暂无"}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>所属行业</span>
                    <span style={styles.infoValue}>{lead.industry || "暂无"}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>地区 / 城市</span>
                    <span style={styles.infoValue}>{lead.region || "暂无"}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>来源</span>
                    <span style={styles.infoValue}>{lead.source}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>创建时间</span>
                    <span style={styles.infoValue}>{formatDateTime(lead.createdAt)}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>用户ID</span>
                    <span style={styles.infoValue}>{lead.userId || "游客提交"}</span>
                  </div>
                </div>

                <div style={styles.noteCard}>
                  <div style={styles.noteTitle}>原始内容</div>
                  <p style={styles.noteText}>
                    {lead.message || lead.note || "暂无补充内容"}
                  </p>
                </div>

                <LeadStatusForm
                  leadId={lead.id}
                  initialStatus={lead.status}
                  initialOwner={lead.owner}
                  initialNote={lead.note}
                />
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f6f8fb",
    padding: "40px 20px 80px",
  },
  container: {
    maxWidth: 1180,
    margin: "0 auto",
    display: "grid",
    gap: 24,
  },
  hero: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 28,
    padding: 32,
  },
  badge: {
    display: "inline-flex",
    width: "fit-content",
    padding: "8px 14px",
    borderRadius: 999,
    background: "#edf8f6",
    color: "#0f8b7f",
    fontWeight: 700,
    fontSize: 14,
  },
  title: {
    margin: "18px 0 0",
    fontSize: 42,
    lineHeight: 1.12,
    color: "#111827",
  },
  text: {
    margin: "16px 0 0",
    color: "#667085",
    fontSize: 18,
    lineHeight: 1.8,
    maxWidth: 860,
  },
  filterBar: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.7fr) 180px 180px 140px",
    gap: 12,
    alignItems: "center",
    marginTop: 20,
  },
  searchInput: {
    height: 48,
    borderRadius: 14,
    border: "1px solid #d8dee6",
    padding: "0 16px",
    fontSize: 15,
    outline: "none",
    background: "#ffffff",
  },
  select: {
    height: 48,
    borderRadius: 14,
    border: "1px solid #d8dee6",
    padding: "0 14px",
    fontSize: 15,
    background: "#ffffff",
    color: "#111827",
  },
  filterButton: {
    height: 48,
    border: "none",
    borderRadius: 14,
    background: "#0f8b7f",
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  emptyState: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 32,
  },
  emptyTitle: {
    margin: 0,
    fontSize: 28,
    color: "#111827",
  },
  emptyText: {
    margin: "12px 0 0",
    fontSize: 16,
    lineHeight: 1.8,
    color: "#667085",
  },
  list: {
    display: "grid",
    gap: 20,
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 24,
    display: "grid",
    gap: 18,
  },
  cardHead: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 220px",
    gap: 18,
    alignItems: "start",
  },
  headMain: {
    display: "grid",
    gap: 10,
  },
  badges: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  typeBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: 999,
    background: "#eef4ff",
    color: "#315fd6",
    fontSize: 13,
    fontWeight: 700,
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 700,
  },
  cardTitle: {
    margin: 0,
    fontSize: 32,
    lineHeight: 1.18,
    color: "#111827",
  },
  cardText: {
    margin: 0,
    fontSize: 16,
    lineHeight: 1.8,
    color: "#667085",
  },
  metaCard: {
    background: "#f7f9fc",
    border: "1px solid #e7ebf0",
    borderRadius: 18,
    padding: 18,
    display: "grid",
    gap: 8,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#667085",
  },
  metaValue: {
    fontSize: 18,
    lineHeight: 1.6,
    color: "#111827",
    fontWeight: 700,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 12,
  },
  infoItem: {
    background: "#f9fbfd",
    border: "1px solid #edf1f5",
    borderRadius: 16,
    padding: 16,
    display: "grid",
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#667085",
  },
  infoValue: {
    fontSize: 15,
    lineHeight: 1.7,
    color: "#111827",
    wordBreak: "break-word",
  },
  noteCard: {
    background: "#fcfcfd",
    border: "1px solid #edf1f5",
    borderRadius: 16,
    padding: 18,
    display: "grid",
    gap: 8,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#667085",
  },
  noteText: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.8,
    color: "#111827",
    whiteSpace: "pre-wrap",
  },
};
