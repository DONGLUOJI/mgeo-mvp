import type { ReactNode } from "react";

export function ScoreCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  accent?: string;
}) {
  return (
    <article
      style={{
        background: "#fff",
        border: "1px solid #e7ebf0",
        borderRadius: 24,
        padding: 24,
        display: "grid",
        gap: 10,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 700, color: "#667085" }}>{label}</div>
      <div
        style={{
          fontSize: 42,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: "-0.04em",
          color: accent || "#111827",
        }}
      >
        {value}
      </div>
      {hint ? <div style={{ fontSize: 14, lineHeight: 1.7, color: "#667085" }}>{hint}</div> : null}
    </article>
  );
}

