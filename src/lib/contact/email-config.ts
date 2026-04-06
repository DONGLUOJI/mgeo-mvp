export function getEmailConfig() {
  const pass = process.env.SMTP_PASS?.trim();

  if (!pass) {
    throw new Error("SMTP_PASS_MISSING");
  }

  return {
    host: process.env.SMTP_HOST?.trim() || "smtp.163.com",
    port: Number(process.env.SMTP_PORT || "465"),
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : true,
    user: process.env.SMTP_USER?.trim() || "dongluoji2026@163.com",
    pass,
    from: process.env.CONTACT_FROM_EMAIL?.trim() || process.env.SMTP_USER?.trim() || "dongluoji2026@163.com",
    to: process.env.CONTACT_TO_EMAIL?.trim() || "dongluoji2026@163.com",
  };
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
