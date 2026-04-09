"use client";

import { useState } from "react";

import type { LeadRequestStatus } from "@/lib/db/repository";

type LeadStatusFormProps = {
  leadId: string;
  initialStatus: LeadRequestStatus;
  initialOwner: string | null;
  initialNote: string | null;
};

const statusOptions: Array<{ value: LeadRequestStatus; label: string }> = [
  { value: "new", label: "新线索" },
  { value: "contacted", label: "已联系" },
  { value: "in_progress", label: "跟进中" },
  { value: "won", label: "已成交" },
  { value: "invalid", label: "无效" },
];

export function LeadStatusForm({ leadId, initialStatus, initialOwner, initialNote }: LeadStatusFormProps) {
  const [status, setStatus] = useState<LeadRequestStatus>(initialStatus);
  const [owner, setOwner] = useState(initialOwner || "");
  const [note, setNote] = useState(initialNote || "");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback("");

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, owner, note }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "保存失败，请稍后再试。");
      }

      setFeedback("已保存");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "保存失败，请稍后再试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <div style={styles.grid}>
        <label style={styles.field}>
          <span style={styles.label}>跟进状态</span>
          <select style={styles.select} value={status} onChange={(event) => setStatus(event.target.value as LeadRequestStatus)}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label style={styles.field}>
          <span style={styles.label}>负责人</span>
          <input style={styles.input} value={owner} placeholder="例如：董逻辑" onChange={(event) => setOwner(event.target.value)} />
        </label>
      </div>
      <label style={styles.field}>
        <span style={styles.label}>跟进备注</span>
        <textarea
          style={styles.textarea}
          rows={3}
          value={note}
          placeholder="记录是否已联系、跟进进度或下一步动作"
          onChange={(event) => setNote(event.target.value)}
        />
      </label>
      <div style={styles.actions}>
        <button type="submit" style={{ ...styles.button, opacity: submitting ? 0.78 : 1 }} disabled={submitting}>
          {submitting ? "保存中..." : "保存线索状态"}
        </button>
        {feedback ? <span style={{ ...styles.feedback, color: feedback === "已保存" ? "#0a7c66" : "#b42318" }}>{feedback}</span> : null}
      </div>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: "grid",
    gap: 14,
    marginTop: 4,
  },
  grid: {
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
    color: "#667085",
  },
  select: {
    height: 44,
    borderRadius: 14,
    border: "1px solid #d8dee6",
    padding: "0 14px",
    fontSize: 14,
    background: "#ffffff",
  },
  input: {
    height: 44,
    borderRadius: 14,
    border: "1px solid #d8dee6",
    padding: "0 14px",
    fontSize: 14,
    outline: "none",
    background: "#ffffff",
  },
  textarea: {
    borderRadius: 14,
    border: "1px solid #d8dee6",
    padding: "12px 14px",
    fontSize: 14,
    lineHeight: 1.6,
    outline: "none",
    resize: "vertical",
    background: "#ffffff",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  button: {
    height: 42,
    borderRadius: 14,
    border: "none",
    padding: "0 18px",
    background: "#0f8b7f",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  feedback: {
    fontSize: 13,
    lineHeight: 1.5,
  },
};

