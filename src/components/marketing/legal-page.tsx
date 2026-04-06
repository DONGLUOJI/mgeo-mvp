import type { CSSProperties, ReactNode } from "react";

import { SiteShell } from "@/components/marketing/SiteShell";

type LegalSection = {
  title: string;
  body: ReactNode[];
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  summary: string;
  updatedAt: string;
  sections: LegalSection[];
  note?: string;
};

export function LegalPage({ eyebrow, title, summary, updatedAt, sections, note }: LegalPageProps) {
  return (
    <SiteShell>
      <main style={styles.page}>
        <section style={styles.hero}>
          <div style={styles.eyebrow}>{eyebrow}</div>
          <h1 style={styles.title}>{title}</h1>
          <p style={styles.summary}>{summary}</p>
          <div style={styles.meta}>更新日期：{updatedAt}</div>
          {note ? <div style={styles.note}>{note}</div> : null}
        </section>

        <section style={styles.contentShell}>
          {sections.map((section) => (
            <article key={section.title} style={styles.sectionCard}>
              <h2 style={styles.sectionTitle}>{section.title}</h2>
              <div style={styles.sectionBody}>
                {section.body.map((paragraph, index) => (
                  <p key={`${section.title}-${index}`} style={styles.paragraph}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </section>
      </main>
    </SiteShell>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "112px 24px 72px",
    background: "#f5f5f7",
  },
  hero: {
    maxWidth: 1080,
    margin: "0 auto 28px",
    padding: "40px 42px",
    borderRadius: 32,
    background: "#ffffff",
    boxShadow: "0 18px 48px rgba(15, 23, 42, 0.07)",
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    height: 36,
    padding: "0 16px",
    borderRadius: 999,
    background: "rgba(10,124,102,0.12)",
    color: "#0a7c66",
    fontSize: 14,
    fontWeight: 700,
  },
  title: {
    margin: "20px 0 14px",
    fontSize: 52,
    lineHeight: 1.08,
    letterSpacing: "-0.04em",
    color: "#1d1d1f",
  },
  summary: {
    margin: 0,
    maxWidth: 820,
    fontSize: 20,
    lineHeight: 1.8,
    color: "#6e6e73",
  },
  meta: {
    marginTop: 18,
    fontSize: 14,
    color: "#8b92a6",
  },
  note: {
    marginTop: 16,
    padding: "16px 18px",
    borderRadius: 18,
    background: "#f7faf9",
    border: "1px solid rgba(10,124,102,0.14)",
    color: "#495161",
    fontSize: 15,
    lineHeight: 1.7,
  },
  contentShell: {
    maxWidth: 1080,
    margin: "0 auto",
    display: "grid",
    gap: 18,
  },
  sectionCard: {
    padding: "30px 32px",
    borderRadius: 28,
    background: "#ffffff",
    boxShadow: "0 14px 36px rgba(15, 23, 42, 0.06)",
  },
  sectionTitle: {
    margin: 0,
    fontSize: 28,
    lineHeight: 1.25,
    letterSpacing: "-0.02em",
    color: "#1d1d1f",
  },
  sectionBody: {
    marginTop: 18,
    display: "grid",
    gap: 12,
  },
  paragraph: {
    margin: 0,
    fontSize: 16,
    lineHeight: 1.9,
    color: "#535862",
  },
};
