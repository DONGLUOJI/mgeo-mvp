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
  "保留品牌基础信息与咨询记录",
  "统一管理免费检测与服务沟通",
  "后续可扩展工作台、报告和案例查看",
];

export default function RegisterPage() {
  return (
    <SiteShell navItems={REGISTER_NAV_ITEMS} ctaHref="/register" ctaLabel="注册" hideFooter>
      <main style={styles.page}>
        <section style={styles.shell}>
          <section style={styles.copyCard}>
            <h1 style={styles.copyTitle}>注册账号，开始建立您的 MGEO 增长流程</h1>
            <p style={styles.copyText}>
              注册后，您可以继续使用免费检测、提交咨询、查看服务方案，并为后续的品牌增长协作建立统一入口。
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
            <p style={styles.formText}>填写基础信息并完成邮箱验证后即可注册，后续可继续完善品牌资料与合作需求。</p>

            <form style={styles.formGrid}>
              <label style={styles.field}>
                <span style={styles.label}>姓名</span>
                <input style={styles.input} placeholder="请输入您的姓名" />
              </label>
              <label style={styles.field}>
                <span style={styles.label}>公司 / 品牌</span>
                <input style={styles.input} placeholder="请输入公司或品牌名称" />
              </label>
              <label style={{ ...styles.field, gridColumn: "1 / -1" }}>
                <span style={styles.label}>邮箱</span>
                <div style={styles.inlineAction}>
                  <input style={styles.input} placeholder="请输入邮箱" />
                  <button type="button" style={styles.codeButton}>
                    发送验证码
                  </button>
                </div>
              </label>
              <label style={{ ...styles.field, gridColumn: "1 / -1" }}>
                <span style={styles.label}>邮箱验证码</span>
                <input style={styles.input} placeholder="请输入邮箱验证码" />
              </label>
              <label style={{ ...styles.field, gridColumn: "1 / -1" }}>
                <span style={styles.label}>设置密码</span>
                <input style={styles.input} placeholder="请设置登录密码" type="password" />
              </label>
              <label style={styles.checkbox}>
                <input type="checkbox" />
                <span>
                  我已阅读并同意
                  <Link href="#" style={styles.inlineLink}>
                    《用户协议》
                  </Link>
                  与
                  <Link href="#" style={styles.inlineLink}>
                    《隐私政策》
                  </Link>
                </span>
              </label>
              <button type="button" style={styles.submitButton}>
                立即注册
              </button>
            </form>

            <div style={styles.helper}>
              当前页面采用邮箱验证码注册逻辑，后续可继续接入真实发信服务、验证码校验与邀请机制。
            </div>

            <div style={styles.loginHint}>
              已有账号？
              <Link href="/login" style={styles.loginLink}>
                立即登录
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
    border: "none",
    borderRadius: 16,
    padding: "0 18px",
    background: "#1f1f22",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  checkbox: {
    gridColumn: "1 / -1",
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    margin: "2px 0 4px",
    color: "#4b5563",
    fontSize: 14,
    lineHeight: 1.6,
  },
  inlineLink: {
    color: "#0a7c66",
    textDecoration: "none",
    fontWeight: 600,
    margin: "0 2px",
  },
  submitButton: {
    gridColumn: "1 / -1",
    marginTop: 8,
    height: 58,
    borderRadius: 18,
    border: "none",
    background: "#0a7c66",
    color: "#ffffff",
    fontSize: 18,
    fontWeight: 600,
    cursor: "pointer",
  },
  helper: {
    marginTop: 18,
    padding: "16px 18px",
    borderRadius: 18,
    background: "#f8fbfa",
    border: "1px solid #e4f1ec",
    color: "#4b5563",
    fontSize: 14,
    lineHeight: 1.7,
  },
  loginHint: {
    marginTop: 22,
    color: "#6e6e73",
    fontSize: 15,
    textAlign: "center",
  },
  loginLink: {
    marginLeft: 8,
    color: "#0a7c66",
    textDecoration: "none",
    fontWeight: 700,
  },
};
