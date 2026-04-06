"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type SupportedCity = {
  name: string;
  region: string;
  hasData: boolean;
};

type CityRequestPanelProps = {
  cities: SupportedCity[];
  currentTab: string;
  currentCity: string;
  currentIndustry: string;
  currentDays: number;
  currentPlatform?: string;
  currentCoverage?: string;
};

type RequestForm = {
  region: string;
  brand: string;
  contact: string;
  note: string;
};

const initialForm: RequestForm = {
  region: "",
  brand: "",
  contact: "",
  note: "",
};

function buildHref({
  tab,
  city,
  industry,
  days,
  platform,
  coverage,
}: {
  tab: string;
  city: string;
  industry: string;
  days: number;
  platform?: string;
  coverage?: string;
}) {
  const params = new URLSearchParams();
  params.set("tab", tab);
  params.set("city", city);
  if (industry && industry !== "全部") params.set("industry", industry);
  if (days && days !== 30) params.set("days", String(days));
  if (platform) params.set("platform", platform);
  if (coverage) params.set("coverage", coverage);
  return `/ranking?${params.toString()}`;
}

export function CityRequestPanel({
  cities,
  currentTab,
  currentCity,
  currentIndustry,
  currentDays,
  currentPlatform,
  currentCoverage,
}: CityRequestPanelProps) {
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<RequestForm>(initialForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const filteredCities = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return cities.slice(0, 8);
    return cities.filter((city) => `${city.name}${city.region}`.toLowerCase().includes(normalized)).slice(0, 8);
  }, [cities, query]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setFeedback("");

    try {
      const res = await fetch("/api/ranking/city-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "提交失败，请稍后再试。");
      }

      setStatus("success");
      setFeedback("已收到你的地区收录申请，我们会优先评估并通过填写的联系方式跟进。");
      setForm(initialForm);
      setQuery("");
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "提交失败，请稍后再试。");
    }
  }

  function updateField(field: keyof RequestForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <details style={styles.shell}>
      <summary style={styles.trigger}>更多 ▾</summary>
      <div style={styles.panel}>
        <div style={styles.section}>
          <div style={styles.sectionTitle}>搜索已支持地区</div>
          <div style={styles.sectionText}>先搜你所在的城市或区域，找到后就能直接切换查看榜单。</div>
          <input
            style={styles.input}
            placeholder="输入城市 / 区域名，例如：苏州、宁波、朝阳区"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div style={styles.cityList}>
            {filteredCities.length ? (
              filteredCities.map((city) => (
                <Link
                  key={city.name}
                  href={buildHref({
                    tab: currentTab,
                    city: city.name,
                    industry: currentIndustry,
                    days: currentDays,
                    platform: currentPlatform,
                    coverage: currentCoverage,
                  })}
                  style={{
                    ...styles.cityLink,
                    ...(city.name === currentCity ? styles.cityLinkActive : {}),
                  }}
                >
                  <span>{city.name}</span>
                  <span style={{ ...styles.cityState, color: city.hasData ? "#0a7c66" : "#8a8a8a" }}>
                    {city.hasData ? "可查看" : "收录中"}
                  </span>
                </Link>
              ))
            ) : (
              <div style={styles.emptySearch}>还没找到这个地区，可以直接在下面提交收录申请。</div>
            )}
          </div>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.section}>
            <div style={styles.sectionTitle}>提交你的地区，帮助我们收录</div>
            <div style={styles.sectionText}>如果这个城市 / 区域还没上线，你可以直接填写地区和品牌信息，我们会优先评估收录。</div>
          </div>
          <div style={styles.formGrid}>
            <label style={styles.field}>
              <span style={styles.label}>地区 / 城市</span>
              <input style={styles.input} placeholder="例如：苏州 / 朝阳区 / 佛山" value={form.region} onChange={(event) => updateField("region", event.target.value)} />
            </label>
            <label style={styles.field}>
              <span style={styles.label}>品牌 / 公司</span>
              <input style={styles.input} placeholder="例如：董逻辑MGEO / 你的品牌名" value={form.brand} onChange={(event) => updateField("brand", event.target.value)} />
            </label>
            <label style={styles.field}>
              <span style={styles.label}>联系方式</span>
              <input style={styles.input} placeholder="手机号 / 微信 / 邮箱" value={form.contact} onChange={(event) => updateField("contact", event.target.value)} />
            </label>
            <label style={styles.field}>
              <span style={styles.label}>补充说明</span>
              <input style={styles.input} placeholder="例如：希望优先收录新茶饮 / 本地生活" value={form.note} onChange={(event) => updateField("note", event.target.value)} />
            </label>
          </div>
          <button type="submit" style={{ ...styles.submit, opacity: status === "submitting" ? 0.78 : 1 }} disabled={status === "submitting"}>
            {status === "submitting" ? "提交中..." : "提交收录申请"}
          </button>
          {feedback ? <div style={{ ...styles.feedback, color: status === "success" ? "#0a7c66" : "#b42318" }}>{feedback}</div> : null}
        </form>
      </div>
    </details>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    position: "relative",
  },
  trigger: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 38,
    padding: "6px 16px",
    borderRadius: 999,
    textDecoration: "none",
    background: "#ffffff",
    border: "1px solid #d8dde5",
    color: "#666666",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    listStyle: "none",
    boxShadow: "0 1px 0 rgba(15, 23, 42, 0.02)",
  },
  panel: {
    position: "absolute",
    top: "calc(100% + 10px)",
    left: 0,
    zIndex: 20,
    width: 720,
    maxWidth: "min(92vw, 720px)",
    padding: 18,
    borderRadius: 22,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
    display: "grid",
    gap: 18,
  },
  section: {
    display: "grid",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "#111827",
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 1.7,
    color: "#6b7280",
  },
  input: {
    height: 46,
    borderRadius: 14,
    border: "1px solid #d7dde7",
    padding: "0 14px",
    fontSize: 15,
    outline: "none",
  },
  cityList: {
    display: "grid",
    gap: 8,
  },
  cityLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 12,
    textDecoration: "none",
    color: "#111827",
    fontSize: 14,
    fontWeight: 700,
    background: "#f8fafc",
  },
  cityLinkActive: {
    background: "#111827",
    color: "#ffffff",
  },
  cityState: {
    fontSize: 12,
    fontWeight: 700,
  },
  emptySearch: {
    fontSize: 14,
    color: "#8a8a8a",
    lineHeight: 1.7,
    paddingTop: 4,
  },
  form: {
    display: "grid",
    gap: 16,
    paddingTop: 8,
    borderTop: "1px solid #eceae3",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },
  field: {
    display: "grid",
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: "#4b5563",
  },
  submit: {
    width: 168,
    height: 46,
    borderRadius: 14,
    border: "none",
    background: "#111827",
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  feedback: {
    fontSize: 14,
    lineHeight: 1.7,
  },
};
