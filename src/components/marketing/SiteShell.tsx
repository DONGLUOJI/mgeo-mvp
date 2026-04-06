import Link from "next/link";
import type { ReactNode } from "react";

export const MARKETING_NAV_ITEMS = [
  { href: "/#detector", label: "免费检测" },
  { href: "/ranking", label: "排名" },
  { href: "/pricing", label: "服务方案" },
  { href: "/cases", label: "方法与效果" },
  { href: "/#contact", label: "联系我们" },
  { href: "/whitepaper", label: "MGEO白皮书" },
];

type SiteShellProps = {
  children: ReactNode;
  current?: string;
  navItems?: Array<{ href: string; label: string }>;
  ctaHref?: string;
  ctaLabel?: string;
  hideFooter?: boolean;
};

export function SiteShell({
  children,
  current,
  navItems = MARKETING_NAV_ITEMS,
  ctaHref = "/register",
  ctaLabel = "注册",
  hideFooter = false,
}: SiteShellProps) {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.navWrap}>
          <Link href="/" style={styles.brand}>
            董逻辑MGEO
          </Link>

          <nav style={styles.nav}>
            {navItems.map((item) => {
              const active = current === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
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
            <Link href={ctaHref} style={styles.cta}>
              {ctaLabel}
            </Link>
          </div>
        </div>
      </header>

      <div>{children}</div>

      {hideFooter ? null : (
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
                方法与效果
              </Link>
              <Link href="/ranking" style={styles.footerLink}>
                排名
              </Link>
              <Link href="/#detector" style={styles.footerLink}>
                免费检测
              </Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f5f5f7",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    backdropFilter: "saturate(180%) blur(20px)",
    background: "rgba(255,255,255,0.72)",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
  },
  navWrap: {
    maxWidth: "none",
    margin: 0,
    padding: "0 24px 0 96px",
    height: 52,
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    alignItems: "center",
    gap: 24,
  },
  brand: {
    textDecoration: "none",
    fontSize: 26,
    fontWeight: 600,
    letterSpacing: "-0.021em",
    color: "#1d1d1f",
    whiteSpace: "nowrap",
  },
  nav: {
    display: "flex",
    justifyContent: "center",
    gap: 32,
    flexWrap: "wrap",
    margin: "0 auto",
  },
  navLink: {
    textDecoration: "none",
    color: "#1d1d1f",
    fontSize: 18,
    fontWeight: 500,
    opacity: 0.8,
  },
  navLinkActive: {
    color: "#0a7c66",
    opacity: 1,
  },
  auth: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
  },
  login: {
    textDecoration: "none",
    color: "#1d1d1f",
    fontSize: 16,
    fontWeight: 600,
    padding: "8px 10px",
    opacity: 0.82,
  },
  cta: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
    padding: "8px 20px",
    borderRadius: 8,
    background: "#0fbc8c",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 16,
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
