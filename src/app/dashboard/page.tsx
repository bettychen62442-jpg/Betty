"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Mic, BarChart3, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Stats {
  totalQuestions: number;
  masteredCount: number;
  reviewingCount: number;
  unfamiliarCount: number;
  totalInterviews: number;
  passRate: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/review/stats")
      .then((r) => r.json())
      .then((d) => setStats(d.data))
      .catch(() => {});
  }, []);

  const statCards = [
    {
      label: "题库总数",
      value: stats?.totalQuestions ?? "-",
      icon: BookOpen,
      href: "/questions",
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "面试次数",
      value: stats?.totalInterviews ?? "-",
      icon: Mic,
      href: "/interviews",
      color: "text-green-600 bg-green-50",
    },
    {
      label: "通过率",
      value: stats ? `${Math.round(stats.passRate * 100)}%` : "-",
      icon: BarChart3,
      href: "/analytics",
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "待复习",
      value: stats?.unfamiliarCount ?? "-",
      icon: Calendar,
      href: "/study",
      color: "text-orange-600 bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">面试复盘概览</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <card.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">快捷操作</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          <Link href="/questions/new">
            <Button variant="outline" className="gap-2">
              <BookOpen className="h-4 w-4" />
              添加题目
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
          <Link href="/interviews/new">
            <Button variant="outline" className="gap-2">
              <Mic className="h-4 w-4" />
              记录面试
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
          <Link href="/study/mock">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              模拟面试
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Status Summary */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">题目掌握情况</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Badge variant="default" className="text-sm px-3 py-1">
                已掌握: {stats.masteredCount}
              </Badge>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                复习中: {stats.reviewingCount}
              </Badge>
              <Badge variant="outline" className="text-sm px-3 py-1">
                未掌握: {stats.unfamiliarCount}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
