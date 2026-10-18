import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "@/components/layout/app-sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Interview Coach — 面试复盘与题库管理",
  description: "Record, organize, and review interview questions with AI-powered audio analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className="flex h-full bg-background">
        <TooltipProvider>
          <AppSidebar />
          <main className="flex-1 overflow-auto ml-64">
            <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
          </main>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
