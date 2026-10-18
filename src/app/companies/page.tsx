"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Pencil, Trash2, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Application {
  id: string;
  company: string;
  position: string;
  status: string;
  appliedDate: string;
  link: string | null;
  notes: string | null;
  location: string | null;
  salaryRange: string | null;
}

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  APPLIED: { label: "已投递", variant: "outline" },
  SCREENING: { label: "初筛中", variant: "secondary" },
  INTERVIEWING: { label: "面试中", variant: "default" },
  OFFERED: { label: "已发offer", variant: "default" },
  REJECTED: { label: "已拒绝", variant: "destructive" },
  ACCEPTED: { label: "已接受", variant: "default" },
  WITHDRAWN: { label: "已放弃", variant: "destructive" },
};

const STATUSES = Object.keys(STATUS_MAP);

const emptyForm = {
  company: "",
  position: "",
  status: "APPLIED",
  appliedDate: new Date().toISOString().split("T")[0],
  link: "",
  notes: "",
  location: "",
  salaryRange: "",
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Form dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/applications?${params}`);
    const data = await res.json();
    setApps(data.data || []);
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, appliedDate: new Date().toISOString().split("T")[0] });
    setDialogOpen(true);
  }

  function openEdit(app: Application) {
    setEditingId(app.id);
    setForm({
      company: app.company,
      position: app.position,
      status: app.status,
      appliedDate: app.appliedDate ? app.appliedDate.split("T")[0] : "",
      link: app.link || "",
      notes: app.notes || "",
      location: app.location || "",
      salaryRange: app.salaryRange || "",
    });
    setDialogOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company.trim() || !form.position.trim()) return;
    setSaving(true);

    const url = editingId ? `/api/applications/${editingId}` : "/api/applications";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: form.company.trim(),
        position: form.position.trim(),
        status: form.status,
        appliedDate: form.appliedDate,
        link: form.link.trim() || undefined,
        notes: form.notes.trim() || undefined,
        location: form.location.trim() || undefined,
        salaryRange: form.salaryRange.trim() || undefined,
      }),
    });

    if (res.ok) {
      toast.success(editingId ? "已更新" : "已添加");
      setDialogOpen(false);
      fetchApps();
    } else {
      toast.error("保存失败");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/applications/${deleteTarget.id}`, { method: "DELETE" });
    toast.success("已删除");
    setDeleteTarget(null);
    fetchApps();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">投递列表</h1>
          <p className="text-muted-foreground">记录和追踪你的每次投递</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> 添加投递
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索公司或岗位..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" || !v ? "" : v)}>
          <SelectTrigger className="w-[140px]">
            <span className="text-sm truncate">
              {statusFilter ? STATUS_MAP[statusFilter]?.label || statusFilter : "全部状态"}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_MAP[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => {
            const count = apps.filter((a) => a.status === s).length;
            if (count === 0) return null;
            const info = STATUS_MAP[s];
            return (
              <Badge key={s} variant={info.variant} className="text-xs">
                {info.label}: {count}
              </Badge>
            );
          })}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : apps.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">还没有投递记录</p>
          <Button variant="outline" onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> 添加第一条投递
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => {
            const info = STATUS_MAP[app.status] || STATUS_MAP.APPLIED;
            return (
              <Card key={app.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium">{app.company}</h3>
                        <Badge variant={info.variant}>{info.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {app.position}
                        {app.location && ` · ${app.location}`}
                        {app.salaryRange && ` · ${app.salaryRange}`}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span>
                          投递日期: {new Date(app.appliedDate).toLocaleDateString("zh-CN")}
                        </span>
                        {app.link && (
                          <a
                            href={app.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3 w-3" />
                            投递链接
                          </a>
                        )}
                      </div>
                      {app.notes && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                          {app.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-3">
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => openEdit(app)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => setDeleteTarget(app)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "编辑投递" : "添加投递"}</DialogTitle>
            <DialogDescription>记录公司、岗位、投递日期等信息</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="company">公司 *</Label>
                <Input
                  id="company" required
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="如: Google"
                />
              </div>
              <div>
                <Label htmlFor="position">岗位 *</Label>
                <Input
                  id="position" required
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  placeholder="如: Senior Frontend"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>状态</Label>
                <Select value={form.status} onValueChange={(v) => v && setForm({ ...form, status: v })}>
                  <SelectTrigger><span className="text-sm">{STATUS_MAP[form.status]?.label}</span></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_MAP[s].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>投递日期</Label>
                <Input
                  type="date"
                  value={form.appliedDate}
                  onChange={(e) => setForm({ ...form, appliedDate: e.target.value })}
                />
              </div>
              <div>
                <Label>工作地点</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="如: 北京"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>投递链接</Label>
                <Input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>薪资范围</Label>
                <Input
                  value={form.salaryRange}
                  onChange={(e) => setForm({ ...form, salaryRange: e.target.value })}
                  placeholder="如: 30k-50k"
                />
              </div>
            </div>
            <div>
              <Label>备注</Label>
              <Textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="JD要点、内推人、特殊要求等"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
              <Button type="submit" disabled={saving}>{saving ? "保存中..." : "保存"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除 {deleteTarget?.company} — {deleteTarget?.position} 的投递记录吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>取消</Button>
            <Button variant="destructive" onClick={handleDelete}>删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
