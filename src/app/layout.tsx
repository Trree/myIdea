import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Business Idea Generator - 免费商业创意生成器",
  description: "使用 AI 生成创新的商业创意。支持 DeepSeek、Qwen、GPT-4、Claude 等多种大模型。",
  keywords: ["AI", "商业创意", "创业", "DeepSeek", "Qwen", "通义千问", "GPT-4"],
  authors: [{ name: "AI Business Idea Generator" }],
  openGraph: {
    title: "AI Business Idea Generator",
    description: "使用 AI 生成创新的商业创意",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
