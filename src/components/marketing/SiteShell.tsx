import Link from "next/link";
import type { ReactNode } from "react";

export const MARKETING_NAV_ITEMS = [
  { href: "/#detector", label: "免费检查" },
  { href: "/pricing", label: "定价" },
  { href: "/#contact", label: "联系我们" },
];

type SiteShellProps = {
  children: ReactNode;
  current?: string;
  navItems?: ReadonlyArray<{ href: string; label: string }>;
  ctaHref?: string;
  ctaLabel?: string;
  brandLabel?: string;
  brandHref?: string;
  footerBrand?: string;
  footerText?: string;
  footerLinks?: ReadonlyArray<{ href: string; label: string }>;
  hideFooter?: boolean;
};

export function SiteShell({
  children,
  current,
  navItems = MARKETING_NAV_ITEMS,
  ctaHref = "/detect",
  ctaLabel = "开始检查",
  brandLabel = "FakeCheck",
  brandHref = "/",
  footerBrand = "FakeCheck",
  footerText = "面向 C 端交友安全的公开资料核验工具，帮助快速判断图片复用、资料冲突、发布时间与证据强度。",
  footerLinks = [
    { href: "/detect", label: "开始检查" },
    { href: "/pricing", label: "定价" },
    { href: "/#detector", label: "免费检查" },
  ],
  hideFooter = false,
}: SiteShellProps) {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.navWrap}>
          <Link href={brandHref} style={styles.brand}>
            {brandLabel}
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
              <div style={styles.footerBrand}>{footerBrand}</div>
              <p style={styles.footerText}>{footerText}</p>
            </div>
            <div style={styles.footerLinks}>
              {footerLinks.map((item) => (
                <Link key={item.href} href={item.href} style={styles.footerLink}>
                  {item.label}
                </Link>
              ))}
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
    background: "var(--bg)",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    backdropFilter: "saturate(180%) blur(20px)",
    background: "rgba(245, 244, 237, 0.88)",
    borderBottom: "1px solid var(--line)",
  },
  navWrap: {
    maxWidth: 1240,
    margin: "0 auto",
    padding: "0 24px",
    minHeight: 68,
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    alignItems: "center",
    gap: 24,
  },
  brand: {
    textDecoration: "none",
    fontSize: 28,
    fontWeight: 500,
    letterSpacing: "-0.03em",
    color: "var(--text)",
    whiteSpace: "nowrap",
    fontFamily: "var(--font-serif)",
    textTransform: "none",
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
    color: "var(--text-soft)",
    fontSize: 16,
    fontWeight: 500,
    opacity: 0.82,
  },
  navLinkActive: {
    color: "var(--text)",
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
    color: "var(--text-soft)",
    fontSize: 15,
    fontWeight: 500,
    padding: "8px 10px",
    opacity: 0.82,
  },
  cta: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
    padding: "10px 18px",
    borderRadius: 12,
    background: "var(--brand)",
    color: "var(--surface)",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 15,
    boxShadow: "0 0 0 1px var(--brand)",
  },
  footer: {
    borderTop: "1px solid var(--line)",
    marginTop: 80,
    background: "var(--surface)",
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
    fontSize: 28,
    fontWeight: 500,
    color: "var(--text)",
    fontFamily: "var(--font-serif)",
  },
  footerText: {
    margin: "10px 0 0",
    fontSize: 15,
    lineHeight: 1.8,
    color: "var(--muted)",
    maxWidth: 560,
  },
  footerLinks: {
    display: "flex",
    gap: 20,
    alignItems: "center",
    flexWrap: "wrap",
  },
  footerLink: {
    color: "var(--text-soft)",
    textDecoration: "none",
    fontWeight: 500,
  },
};
