"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Mic,
  BarChart3,
  Calendar,
  Library,
  Send,
  Download,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/questions", label: "题库", icon: BookOpen },
  { href: "/interviews", label: "面试记录", icon: Mic },
  { href: "/analytics", label: "复盘分析", icon: BarChart3 },
  { href: "/study", label: "复习计划", icon: Calendar },
  { href: "/knowledge", label: "知识库", icon: Library },
  { href: "/companies", label: "投递列表", icon: Send },
  { href: "/export", label: "导出", icon: Download },
  { href: "/settings", label: "设置", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-full w-64 border-r bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Mic className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold leading-tight">Interview Coach</h1>
          <p className="text-xs text-muted-foreground">面试复盘助手</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t text-xs text-muted-foreground">
        Interview Coach v0.1
      </div>
    </aside>
  );
}
