import Link from "next/link";
import { SiteShell } from "@/components/marketing/SiteShell";

const REGISTER_NAV_ITEMS = [
  { href: "/#detector", label: "免费检测" },
  { href: "/ranking", label: "排名" },
  { href: "/pricing", label: "服务方案" },
  { href: "/cases", label: "案例成果" },
  { href: "/#contact", label: "联系我们" },
  { href: "/whitepaper", label: "MGEO白皮书" },
];

const benefits = [
  "注册后可保存检测记录与历史报告，方便持续跟踪品牌表现。",
  "统一管理客户、任务和品牌信息，减少重复录入成本。",
  "后续可直接承接套餐升级、监测任务与交付流程。",
];

export default function RegisterPage() {
  return (
    <SiteShell navItems={REGISTER_NAV_ITEMS} ctaHref="/register" ctaLabel="注册" hideFooter>
      <main style={styles.page}>
        <section style={styles.shell}>
          <section style={styles.copyCard}>
            <h1 style={styles.copyTitle}>注册 MGEO 账号，开始保存你的品牌检测与增长线索</h1>
            <p style={styles.copyText}>
              这一步主要是把原先静态页面里的注册入口补回站点，让导航和路径与你之前的版本保持一致。后续我们可以继续把注册流程接成真实可用的账号创建流程。
            </p>
            <ul style={styles.benefitList}>
              {benefits.map((item) => (
                <li key={item} style={styles.benefitItem}>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section style={styles.formCard}>
            <h2 style={styles.formTitle}>创建账号</h2>
            <p style={styles.formText}>当前先恢复原始导航入口与页面壳，注册提交链路下一步可以继续接真实后端。</p>

            <form style={styles.formGrid}>
              <label style={styles.field}>
                <span style={styles.label}>姓名</span>
                <input style={styles.input} placeholder="请输入您的姓名" />
              </label>
              <label style={styles.field}>
                <span style={styles.label}>公司 / 品牌</span>
                <input style={styles.input} placeholder="请输入公司或品牌名称" />
              </label>
              <label style={styles.field}>
                <span style={styles.label}>手机号</span>
                <input style={styles.input} placeholder="请输入手机号" />
              </label>
              <label style={styles.field}>
                <span style={styles.label}>邮箱</span>
                <input style={styles.input} placeholder="请输入邮箱地址" />
              </label>
              <label style={{ ...styles.field, gridColumn: "1 / -1" }}>
                <span style={styles.label}>验证码</span>
                <div style={styles.inlineAction}>
                  <input style={styles.input} placeholder="请输入验证码" />
                  <button type="button" style={styles.codeButton}>
                    发送验证码
                  </button>
                </div>
              </label>
              <button type="button" style={styles.submitButton}>
                创建账号
              </button>
            </form>

            <div style={styles.loginHint}>
              已经有账号？
              <Link href="/login" style={styles.loginLink}>
                直接登录
              </Link>
            </div>
          </section>
        </section>
      </main>
    </SiteShell>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "108px 24px 48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(circle at top, rgba(10,124,102,0.08), transparent 42%)",
  },
  shell: {
    width: "100%",
    maxWidth: 1160,
    display: "grid",
    gridTemplateColumns: "1fr 560px",
    gap: 24,
  },
  copyCard: {
    padding: 46,
    borderRadius: 32,
    background: "linear-gradient(135deg, #0d1117 0%, #17382f 100%)",
    color: "#ffffff",
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
  },
  copyTitle: {
    margin: 0,
    fontSize: 50,
    lineHeight: 1.08,
    letterSpacing: "-0.04em",
  },
  copyText: {
    margin: "18px 0 0",
    fontSize: 18,
    lineHeight: 1.75,
    color: "rgba(255,255,255,0.82)",
  },
  benefitList: {
    listStyle: "none",
    margin: "28px 0 0",
    padding: 0,
  },
  benefitItem: {
    fontSize: 16,
    lineHeight: 1.7,
    padding: "12px 0",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  formCard: {
    padding: "42px 38px",
    borderRadius: 32,
    background: "#ffffff",
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
  },
  formTitle: {
    margin: 0,
    fontSize: 38,
    letterSpacing: "-0.03em",
  },
  formText: {
    margin: "10px 0 24px",
    color: "#6e6e73",
    fontSize: 16,
    lineHeight: 1.7,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1d1d1f",
  },
  input: {
    width: "100%",
    border: "1px solid #d2d2d7",
    borderRadius: 16,
    padding: "15px 16px",
    fontSize: 16,
    color: "#1d1d1f",
    background: "#ffffff",
  },
  inlineAction: {
    display: "flex",
    gap: 12,
    alignItems: "stretch",
  },
  codeButton: {
    flexShrink: 0,
    border: "1px solid #d2d2d7",
    borderRadius: 16,
    padding: "0 18px",
    background: "#f5f5f7",
    color: "#1d1d1f",
    fontWeight: 600,
    cursor: "pointer",
  },
  submitButton: {
    gridColumn: "1 / -1",
    marginTop: 8,
    height: 56,
    borderRadius: 16,
    border: "none",
    background: "#0a7c66",
    color: "#ffffff",
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
  },
  loginHint: {
    marginTop: 20,
    color: "#6e6e73",
    fontSize: 15,
  },
  loginLink: {
    marginLeft: 8,
    color: "#0a7c66",
    textDecoration: "none",
    fontWeight: 700,
  },
};
