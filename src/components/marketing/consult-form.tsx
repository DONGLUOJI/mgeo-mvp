"use client";

import { useState } from "react";

type FormState = {
  name: string;
  company: string;
  phone: string;
  industry: string;
  message: string;
};

const initialState: FormState = {
  name: "",
  company: "",
  phone: "",
  industry: "",
  message: "",
};

export function ConsultForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatus("submitting");
    setFeedback("");

    try {
      const res = await fetch("/api/contact", {
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
      setFeedback("提交成功，我们会尽快通过你填写的联系方式跟进。");
      setForm(initialState);
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "提交失败，请稍后再试。");
    }
  }

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <div style={styles.row}>
        <label style={styles.field}>
          <span style={styles.label}>姓名</span>
          <input style={styles.input} placeholder="请输入您的姓名" value={form.name} onChange={(event) => updateField("name", event.target.value)} />
        </label>
        <label style={styles.field}>
          <span style={styles.label}>公司 / 品牌</span>
          <input style={styles.input} placeholder="请输入公司或品牌名称" value={form.company} onChange={(event) => updateField("company", event.target.value)} />
        </label>
      </div>
      <div style={styles.row}>
        <label style={styles.field}>
          <span style={styles.label}>联系电话</span>
          <input style={styles.input} placeholder="请输入手机号或微信号" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
        </label>
        <label style={styles.field}>
          <span style={styles.label}>所属行业</span>
          <input style={styles.input} placeholder="例如：企业服务 / 本地生活" value={form.industry} onChange={(event) => updateField("industry", event.target.value)} />
        </label>
      </div>
      <label style={styles.field}>
        <span style={styles.label}>需求描述</span>
        <textarea
          style={styles.textarea}
          placeholder="请简单描述当前遇到的问题、目标或者希望了解的服务内容"
          rows={5}
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
        />
      </label>
      <button type="submit" style={{ ...styles.button, opacity: status === "submitting" ? 0.78 : 1 }} disabled={status === "submitting"}>
        {status === "submitting" ? "提交中..." : "提交咨询"}
      </button>
      {feedback ? (
        <div style={{ ...styles.feedback, color: status === "success" ? "#0a7c66" : "#b42318" }}>
          {feedback}
        </div>
      ) : null}
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: "grid",
    gap: 20,
    marginTop: 24,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },
  field: {
    display: "grid",
    gap: 10,
  },
  label: {
    color: "#202226",
    fontSize: 16,
    fontWeight: 700,
  },
  input: {
    height: 54,
    borderRadius: 18,
    border: "1px solid #d7dde7",
    padding: "0 18px",
    fontSize: 16,
    outline: "none",
  },
  textarea: {
    borderRadius: 18,
    border: "1px solid #d7dde7",
    padding: "16px 18px",
    fontSize: 16,
    lineHeight: 1.75,
    outline: "none",
    resize: "vertical",
  },
  button: {
    width: 256,
    height: 68,
    borderRadius: 18,
    border: "none",
    background: "#232123",
    color: "#ffffff",
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 10,
  },
  feedback: {
    marginTop: -2,
    fontSize: 14,
    lineHeight: 1.7,
  },
};
