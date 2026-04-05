import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "董逻辑MGEO 检测系统",
  description: "面向品牌在 AI 搜索中的检测、诊断与增长演示系统。",
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
