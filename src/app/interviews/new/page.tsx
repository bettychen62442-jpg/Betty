"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const ROUNDS = [
  { value: "PHONE_SCREEN", label: "电话筛选" },
  { value: "TECHNICAL_1", label: "技术一面" },
  { value: "TECHNICAL_2", label: "技术二面" },
  { value: "ONSITE", label: "现场面试" },
  { value: "BEHAVIORAL", label: "行为面试" },
  { value: "SYSTEM_DESIGN", label: "系统设计" },
  { value: "HR", label: "HR面" },
  { value: "OTHER", label: "其他" },
];

export default function NewInterviewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company: "",
    position: "",
    round: "OTHER",
    interviewDate: new Date().toISOString().split("T")[0],
    result: "PENDING",
    resultReason: "",
    overallNotes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        resultReason: form.resultReason || undefined,
        overallNotes: form.overallNotes || undefined,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      toast.success("面试记录已创建");
      router.push(`/interviews/${data.data.id}`);
    } else {
      toast.error("创建失败");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">记录面试</h1>
        <p className="text-muted-foreground">记录一次面试的详细信息</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">公司 *</Label>
                <Input
                  id="company"
                  required
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="如: Google"
                />
              </div>
              <div>
                <Label htmlFor="position">岗位 *</Label>
                <Input
                  id="position"
                  required
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  placeholder="如: Senior Frontend"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>轮次</Label>
                <Select
                  value={form.round}
                  onValueChange={(v) => v && setForm({ ...form, round: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROUNDS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>日期</Label>
                <Input
                  type="date"
                  value={form.interviewDate}
                  onChange={(e) =>
                    setForm({ ...form, interviewDate: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>结果</Label>
                <Select
                  value={form.result}
                  onValueChange={(v) => v && setForm({ ...form, result: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PASS">通过</SelectItem>
                    <SelectItem value="FAIL">未通过</SelectItem>
                    <SelectItem value="PENDING">待定</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">详细备注</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>结果原因</Label>
              <Textarea
                rows={2}
                value={form.resultReason}
                onChange={(e) =>
                  setForm({ ...form, resultReason: e.target.value })
                }
                placeholder="如果挂了，原因是什么？"
              />
            </div>
            <div>
              <Label>总体笔记</Label>
              <Textarea
                rows={4}
                value={form.overallNotes}
                onChange={(e) =>
                  setForm({ ...form, overallNotes: e.target.value })
                }
                placeholder="面试的整体感受、面试官风格等"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "保存中..." : "创建记录"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            取消
          </Button>
        </div>
      </form>
    </div>
  );
}
