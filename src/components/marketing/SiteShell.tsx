import Link from "next/link";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/detect", label: "免费检测" },
  { href: "/ranking", label: "排名" },
  { href: "/pricing", label: "服务方案" },
  { href: "/cases", label: "案例成果" },
];

type SiteShellProps = {
  children: ReactNode;
  current?: string;
};

export function SiteShell({ children, current }: SiteShellProps) {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.navWrap}>
          <Link href="/" style={styles.brand}>
            董逻辑MGEO
          </Link>

          <nav style={styles.nav}>
            {NAV_ITEMS.map((item) => {
              const active = current === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    ...styles.navLink,
                    ...(active ? styles.navLinkActive : {}),
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div style={styles.auth}>
            <Link href="/login" style={styles.login}>
              登录
            </Link>
            <Link href="/detect" style={styles.cta}>
              免费检测
            </Link>
          </div>
        </div>
      </header>

      <div>{children}</div>

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div>
            <div style={styles.footerBrand}>董逻辑MGEO</div>
            <p style={styles.footerText}>
              面向 AI 搜索场景的多模型品牌可见性检测与增长系统。
            </p>
          </div>
          <div style={styles.footerLinks}>
            <Link href="/pricing" style={styles.footerLink}>
              服务方案
            </Link>
            <Link href="/cases" style={styles.footerLink}>
              案例成果
            </Link>
            <Link href="/ranking" style={styles.footerLink}>
              排名
            </Link>
            <Link href="/detect" style={styles.footerLink}>
              免费检测
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f6f8fb",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    backdropFilter: "blur(14px)",
    background: "rgba(255,255,255,0.88)",
    borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
  },
  navWrap: {
    maxWidth: 1240,
    margin: "0 auto",
    padding: "0 24px",
    height: 76,
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    alignItems: "center",
    gap: 24,
  },
  brand: {
    textDecoration: "none",
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: "-0.03em",
    color: "#101828",
    whiteSpace: "nowrap",
  },
  nav: {
    display: "flex",
    justifyContent: "center",
    gap: 26,
    flexWrap: "wrap",
  },
  navLink: {
    textDecoration: "none",
    color: "#344054",
    fontSize: 17,
    fontWeight: 600,
  },
  navLinkActive: {
    color: "#0f8b7f",
  },
  auth: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 16,
  },
  login: {
    textDecoration: "none",
    color: "#101828",
    fontSize: 16,
    fontWeight: 600,
  },
  cta: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 42,
    padding: "0 18px",
    borderRadius: 999,
    background: "#0f8b7f",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
  },
  footer: {
    borderTop: "1px solid #e7ebf0",
    marginTop: 80,
    background: "#fff",
  },
  footerInner: {
    maxWidth: 1240,
    margin: "0 auto",
    padding: "28px 24px 40px",
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    flexWrap: "wrap",
  },
  footerBrand: {
    fontSize: 20,
    fontWeight: 800,
    color: "#101828",
  },
  footerText: {
    margin: "10px 0 0",
    fontSize: 15,
    lineHeight: 1.8,
    color: "#667085",
    maxWidth: 560,
  },
  footerLinks: {
    display: "flex",
    gap: 20,
    alignItems: "center",
    flexWrap: "wrap",
  },
  footerLink: {
    color: "#475467",
    textDecoration: "none",
    fontWeight: 600,
  },
};
