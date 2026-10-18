import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className="flex h-dvh flex-col overflow-hidden bg-background md:flex-row">
        <TooltipProvider>
          <AppSidebar />
          <main id="main-content" className="min-h-0 min-w-0 flex-1 overflow-auto md:ml-64">
            <div className="mx-auto max-w-5xl px-4 pt-5 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6 sm:pt-8">{children}</div>
          </main>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
