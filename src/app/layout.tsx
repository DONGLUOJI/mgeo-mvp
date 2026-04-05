import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.dongluoji.com"),
  title: "董逻辑MGEO - 帮助品牌在AI搜索中被看见",
  description: "多模式生成式引擎优化，覆盖豆包、DeepSeek、Kimi、通义千问等 6 大 AI 平台，基于 TCA 三支柱模型做品牌可见性诊断。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
