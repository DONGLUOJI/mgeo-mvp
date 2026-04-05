"use client";

import Link from "next/link";
import { useState } from "react";

import { getBrandAnchorId } from "@/lib/ranking/shared";

type SearchResult =
  | {
      found: true;
      brand: {
        rank: number;
        brand_name: string;
        tca_total: number;
        industry: string;
      };
    }
  | {
      found: false;
      query: string;
    }
  | null;

export function BrandSearchBox() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const keyword = query.trim();
    if (!keyword) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/ranking/industry?q=${encodeURIComponent(keyword)}&limit=1`, {
        cache: "no-store",
      });
      const data = await res.json();
      const firstBrand = data?.brands?.[0];

      if (firstBrand) {
        setResult({
          found: true,
          brand: firstBrand,
        });
      } else {
        setResult({ found: false, query: keyword });
      }
    } catch {
      setResult({ found: false, query: keyword });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={styles.card}>
      <div style={styles.copyBlock}>
        <div style={styles.eyebrow}>品牌搜索</div>
        <h1 style={styles.title}>输入品牌名，查看你的 AI 可见性排名</h1>
        <p style={styles.text}>白底黑字的排名页先用结构和数据密度把回访理由做出来，后续你给 API Key 后再接入真实更新。</p>
      </div>

      <form onSubmit={handleSearch} style={styles.form}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="输入你的品牌名，查看 AI 可见性排名"
          style={styles.input}
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "查询中..." : "查询"}
        </button>
      </form>

      {result?.found ? (
        <div style={styles.resultCard}>
          <div>
            <div style={styles.resultLabel}>已收录</div>
            <div style={styles.resultTitle}>
              {result.brand.brand_name} 当前排第 {result.brand.rank} 位
            </div>
            <div style={styles.resultText}>
              行业：{result.brand.industry} | TCA 综合分：{result.brand.tca_total}
            </div>
          </div>
          <div style={styles.resultActions}>
            <a href={`#${getBrandAnchorId(result.brand.brand_name)}`} style={styles.inlineAction}>
              查看榜单位置
            </a>
            <Link href="/pricing" style={styles.inlineActionSecondary}>
              想提升排名？查看优化建议
            </Link>
          </div>
        </div>
      ) : null}

      {result && !result.found ? (
        <div style={styles.resultCardMuted}>
          <div>
            <div style={styles.resultLabel}>暂未收录</div>
            <div style={styles.resultTitle}>「{result.query}」暂未进入当前排名系统</div>
            <div style={styles.resultText}>立即免费检测，30 秒获取你的 AI 可见性评分，并为后续上榜做基线记录。</div>
          </div>
          <Link href={`/detect?brandName=${encodeURIComponent(result.query)}`} style={styles.detectAction}>
            免费检测你的品牌
          </Link>
        </div>
      ) : null}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 28,
    padding: "28px 28px 24px",
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.05)",
  },
  copyBlock: {
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#0a7c66",
  },
  title: {
    margin: "10px 0 0",
    fontSize: 40,
    lineHeight: 1.08,
    letterSpacing: "-0.04em",
    color: "#111827",
  },
  text: {
    margin: "12px 0 0",
    fontSize: 17,
    lineHeight: 1.7,
    color: "#6b7280",
    maxWidth: 860,
  },
  form: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 12,
    alignItems: "center",
  },
  input: {
    height: 56,
    borderRadius: 12,
    border: "1px solid #d0d5dd",
    padding: "0 18px",
    fontSize: 16,
    color: "#111827",
    outline: "none",
    background: "#ffffff",
  },
  button: {
    height: 56,
    minWidth: 124,
    border: "none",
    borderRadius: 12,
    background: "#0a7c66",
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    padding: "0 20px",
  },
  resultCard: {
    marginTop: 18,
    borderRadius: 20,
    border: "1px solid #d6f0e8",
    background: "#f5fbf8",
    padding: "18px 20px",
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    flexWrap: "wrap",
  },
  resultCardMuted: {
    marginTop: 18,
    borderRadius: 20,
    border: "1px solid #e5e7eb",
    background: "#fafafa",
    padding: "18px 20px",
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    flexWrap: "wrap",
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0a7c66",
  },
  resultTitle: {
    marginTop: 6,
    fontSize: 22,
    lineHeight: 1.3,
    fontWeight: 800,
    color: "#111827",
  },
  resultText: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 1.7,
    color: "#6b7280",
  },
  resultActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  inlineAction: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: 12,
    textDecoration: "none",
    background: "#111827",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 15,
  },
  inlineActionSecondary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: 12,
    textDecoration: "none",
    border: "1px solid #d0d5dd",
    color: "#111827",
    fontWeight: 700,
    fontSize: 15,
    background: "#ffffff",
  },
  detectAction: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 18px",
    borderRadius: 12,
    textDecoration: "none",
    background: "#0a7c66",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 15,
  },
};
