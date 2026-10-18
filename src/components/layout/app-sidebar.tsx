"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
  Menu,
  X,
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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 48rem)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const navigation = (
    <nav aria-label="主导航" className="min-h-0 flex-1 space-y-1 overflow-auto px-3 py-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            onClick={() => setOpen(false)}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors md:min-h-9",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <header className="flex shrink-0 items-center gap-3 border-b bg-sidebar px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="size-11" aria-label="打开导航菜单" title="打开导航菜单" />}>
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" showCloseButton={false} className="gap-0 data-[side=left]:w-[min(20rem,calc(100vw-2rem))]">
            <SheetHeader className="border-b pt-[max(1.25rem,env(safe-area-inset-top))] pr-12">
              <SheetTitle>Interview Coach</SheetTitle>
            </SheetHeader>
            <SheetClose render={<Button variant="ghost" size="icon" className="absolute top-[max(0.5rem,env(safe-area-inset-top))] right-2 size-11" aria-label="关闭导航菜单" title="关闭导航菜单" />}>
              <X className="size-5" />
            </SheetClose>
            {navigation}
          </SheetContent>
        </Sheet>
        <Link href="/questions" className="min-w-0 flex-1 truncate text-sm font-semibold">Interview Coach</Link>
        <span className="pr-1 text-xs text-muted-foreground">
          {navItems.find(item => pathname === item.href || pathname.startsWith(item.href + "/"))?.label}
        </span>
      </header>
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r bg-sidebar md:flex">
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
      {navigation}

      {/* Footer */}
      <div className="px-6 py-4 border-t text-xs text-muted-foreground">
        Interview Coach v0.1
      </div>
      </aside>
    </>
  );
}
