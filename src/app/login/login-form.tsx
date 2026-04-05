"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("请输入有效邮箱");
      return;
    }

    setSubmitting(true);

    const result = await signIn("credentials", {
      email,
      callbackUrl: "/dashboard",
      redirect: false,
    });

    setSubmitting(false);

    if (result?.error) {
      setError("登录失败，请稍后再试");
      return;
    }

    window.location.href = result?.url || "/dashboard";
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <label style={styles.field}>
        <span style={styles.label}>登录邮箱</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="请输入登录邮箱"
          style={styles.input}
        />
      </label>

      {error ? <div style={styles.error}>{error}</div> : null}

      <button type="submit" disabled={submitting} style={styles.button}>
        {submitting ? "登录中..." : "继续登录"}
      </button>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: "grid",
    gap: 18,
  },
  field: {
    display: "grid",
    gap: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: 700,
    color: "#111827",
  },
  input: {
    height: 54,
    borderRadius: 16,
    border: "1px solid #d8dee6",
    padding: "0 16px",
    fontSize: 16,
    outline: "none",
  },
  error: {
    fontSize: 14,
    color: "#b42318",
  },
  button: {
    height: 52,
    borderRadius: 16,
    border: "none",
    background: "#111827",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 16,
    cursor: "pointer",
  },
};
