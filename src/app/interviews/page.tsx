"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Interview {
  id: string;
  company: string;
  position: string;
  round: string;
  interviewDate: string;
  result: string;
  _count: { questions: number; audioRecordings: number };
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [company, setCompany] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (company) params.set("company", company);
    if (result) params.set("result", result);
    const res = await fetch(`/api/interviews?${params}`);
    const data = await res.json();
    setInterviews(data.data || []);
    setLoading(false);
  }, [company, result]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const resultBadge = (r: string) => {
    switch (r) {
      case "PASS":
        return <Badge variant="default">通过</Badge>;
      case "FAIL":
        return <Badge variant="destructive">未通过</Badge>;
      default:
        return <Badge variant="outline">待定</Badge>;
    }
  };

  const roundLabel = (r: string) => {
    const map: Record<string, string> = {
      PHONE_SCREEN: "电话筛选",
      TECHNICAL_1: "技术一面",
      TECHNICAL_2: "技术二面",
      ONSITE: "现场面试",
      BEHAVIORAL: "行为面试",
      SYSTEM_DESIGN: "系统设计",
      HR: "HR面",
      OTHER: "其他",
    };
    return map[r] || r;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">面试记录</h1>
          <p className="text-muted-foreground">记录每次面试的详细信息</p>
        </div>
        <Link href="/interviews/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> 记录面试
          </Button>
        </Link>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索公司名..."
            className="pl-9"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <Select value={result} onValueChange={(v) => v && setResult(v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="结果" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="PASS">通过</SelectItem>
            <SelectItem value="FAIL">未通过</SelectItem>
            <SelectItem value="PENDING">待定</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : interviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">还没有面试记录</p>
          <Link href="/interviews/new">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" /> 记录第一次面试
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((inv) => (
            <Link key={inv.id} href={`/interviews/${inv.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium">{inv.company}</h3>
                    <p className="text-sm text-muted-foreground">
                      {inv.position} · {roundLabel(inv.round)} ·{" "}
                      {new Date(inv.interviewDate).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    {inv._count.audioRecordings > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mic className="h-3 w-3" /> {inv._count.audioRecordings}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {inv._count.questions} 题
                    </span>
                    {resultBadge(inv.result)}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
