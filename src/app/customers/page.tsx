import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth/auth-options";
import { listCustomers } from "@/lib/db/repository";

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

export default async function CustomersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; industry?: string; sort?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = searchParams ? await searchParams : {};
  const q = params?.q?.trim() || "";
  const industry = params?.industry?.trim() || "";
  const sort = params?.sort?.trim() || "updated_desc";
  const customers = await listCustomers(100, session.user.id);
  const industries = Array.from(new Set(customers.map((item) => item.industry))).sort((a, b) =>
    a.localeCompare(b, "zh-CN")
  );
  const filteredCustomers = customers
    .filter((customer) => {
      const matchesQ =
        !q ||
        normalize(customer.brandName).includes(normalize(q)) ||
        normalize(customer.businessSummary).includes(normalize(q)) ||
        normalize(customer.customerId).includes(normalize(q));

      const matchesIndustry = !industry || customer.industry === industry;
      return matchesQ && matchesIndustry;
    })
    .sort((a, b) => {
      if (sort === "tasks_desc") return b.taskCount - a.taskCount;
      if (sort === "tasks_asc") return a.taskCount - b.taskCount;
      if (sort === "created_desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "created_asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === "brand_asc") return a.brandName.localeCompare(b.brandName, "zh-CN");
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div style={styles.badge}>客户列表</div>
          <h1 style={styles.title}>查看已经进入系统的品牌客户</h1>
          <p style={styles.text}>
            这里展示的是按品牌聚合后的客户视图。每次检测提交都会自动沉淀到客户表里，方便后续继续做诊断、服务转化和项目跟进。
          </p>
          <form action="/customers" style={styles.filterBar}>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="搜索品牌名、业务描述或客户ID"
              style={styles.searchInput}
            />
            <select name="industry" defaultValue={industry} style={styles.select}>
              <option value="">全部行业</option>
              {industries.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select name="sort" defaultValue={sort} style={styles.select}>
              <option value="updated_desc">按最近更新</option>
              <option value="tasks_desc">按检测次数从高到低</option>
              <option value="tasks_asc">按检测次数从低到高</option>
              <option value="created_desc">按首次进入时间</option>
              <option value="created_asc">按最早进入时间</option>
              <option value="brand_asc">按品牌名称</option>
            </select>
            <button type="submit" style={styles.filterButton}>
              筛选客户
            </button>
          </form>
          <div style={styles.actions}>
            <Link href="/detect" style={styles.primaryButton}>
              新建检测
            </Link>
            <Link href="/history" style={styles.secondaryButton}>
              查看检测历史
            </Link>
            <Link href="/tasks" style={styles.secondaryButton}>
              查看任务列表
            </Link>
          </div>
        </section>

        {filteredCustomers.length === 0 ? (
          <section style={styles.emptyCard}>
            <h2 style={styles.emptyTitle}>还没有客户记录</h2>
            <p style={styles.emptyText}>
              {customers.length === 0
                ? "先去提交一次检测，系统会自动为品牌建立客户档案。"
                : "当前筛选条件下没有匹配客户，你可以换个关键词或行业再看。"}
            </p>
          </section>
        ) : (
          <section style={styles.list}>
            {filteredCustomers.map((customer) => (
              <article key={customer.customerId} style={styles.card}>
                <div style={styles.cardTop}>
                  <div>
                    <div style={styles.cardMeta}>{customer.customerId}</div>
                    <h2 style={styles.cardTitle}>{customer.brandName}</h2>
                    <p style={styles.cardText}>{customer.businessSummary}</p>
                  </div>
                  <div style={styles.countCard}>
                    <div style={styles.countValue}>{customer.taskCount}</div>
                    <div style={styles.countLabel}>检测次数</div>
                  </div>
                </div>

                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>行业</span>
                    <span style={styles.infoValue}>{customer.industry}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>首次进入</span>
                    <span style={styles.infoValue}>{formatDateTime(customer.createdAt)}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>最近更新</span>
                    <span style={styles.infoValue}>{formatDateTime(customer.updatedAt)}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>最近检测</span>
                    <span style={styles.infoValue}>{formatDateTime(customer.latestTaskAt)}</span>
                  </div>
                </div>

                <div style={styles.actions}>
                  <Link href={`/customers/${customer.customerId}`} style={styles.primaryButton}>
                    查看客户详情
                  </Link>
                  <Link href="/tasks" style={styles.secondaryButton}>
                    查看全部任务
                  </Link>
                </div>
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
    maxWidth: 1120,
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
    maxWidth: 820,
  },
  filterBar: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.6fr) 220px 220px 140px",
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
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "flex-start",
  },
  cardMeta: {
    color: "#0f8b7f",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 8,
  },
  cardTitle: {
    margin: 0,
    fontSize: 28,
    color: "#111827",
  },
  cardText: {
    margin: "12px 0 0",
    fontSize: 16,
    color: "#667085",
    lineHeight: 1.75,
    maxWidth: 760,
  },
  countCard: {
    minWidth: 120,
    borderRadius: 20,
    background: "#111827",
    color: "#ffffff",
    padding: "18px 20px",
    textAlign: "center",
  },
  countValue: {
    fontSize: 40,
    lineHeight: 1,
    fontWeight: 800,
  },
  countLabel: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.8,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 14,
  },
  infoItem: {
    border: "1px solid #edf0f4",
    borderRadius: 16,
    padding: 14,
    display: "grid",
    gap: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: "#667085",
  },
  infoValue: {
    fontSize: 15,
    color: "#111827",
    lineHeight: 1.6,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 14,
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    padding: "0 20px",
    borderRadius: 14,
    background: "#111827",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 700,
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    padding: "0 20px",
    borderRadius: 14,
    border: "1px solid #d8dee6",
    background: "#ffffff",
    color: "#111827",
    textDecoration: "none",
    fontWeight: 700,
  },
  emptyCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 24,
    padding: 32,
    textAlign: "center",
  },
  emptyTitle: {
    margin: 0,
    fontSize: 30,
    color: "#111827",
  },
  emptyText: {
    margin: "12px 0 0",
    color: "#667085",
    fontSize: 16,
  },
};
