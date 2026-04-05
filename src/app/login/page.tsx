import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { SiteShell } from "@/components/marketing/SiteShell";
import { authOptions } from "@/lib/auth/auth-options";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <SiteShell>
      <main style={styles.page}>
        <section style={styles.card}>
          <span style={styles.badge}>邮箱登录</span>
          <h1 style={styles.title}>继续进入 MGEO 内部工作台</h1>
          <p style={styles.text}>
            输入邮箱即可登录并进入工作台，继续查看客户、任务、检测历史与服务状态。
          </p>
          <LoginForm />
        </section>
      </main>
    </SiteShell>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 920,
    margin: "0 auto",
    padding: "72px 24px 0",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e7ebf0",
    borderRadius: 28,
    padding: 36,
    display: "grid",
    gap: 18,
  },
  badge: {
    display: "inline-flex",
    width: "fit-content",
    height: 34,
    padding: "0 14px",
    alignItems: "center",
    borderRadius: 999,
    background: "#edf8f6",
    color: "#0f8b7f",
    fontWeight: 700,
    fontSize: 14,
  },
  title: {
    margin: 0,
    fontSize: 42,
    lineHeight: 1.15,
    letterSpacing: "-0.04em",
  },
  text: {
    margin: 0,
    fontSize: 18,
    lineHeight: 1.85,
    color: "#667085",
  },
};
