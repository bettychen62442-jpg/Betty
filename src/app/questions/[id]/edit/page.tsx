"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Loader2, X } from "lucide-react";
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
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { toast } from "sonner";

export default function EditQuestionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    answer: "",
    difficulty: 3,
    status: "UNFAMILIAR",
    categoryId: "",
    sourceCompany: "",
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/questions/${id}`).then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([qData, cData]) => {
      const q = qData.data;
      if (q) {
        setForm({
          title: q.title,
          content: q.content,
          answer: q.answer || "",
          difficulty: q.difficulty,
          status: q.status,
          categoryId: q.categoryId || "",
          sourceCompany: q.sourceCompany || "",
        });
      }
      setCategories(cData.data || []);
      setLoading(false);
    });
  }, [id]);

  async function createCategory() {
    const name = newCatName.trim();
    if (!name) return;
    if (categories.some((c) => c.name === name)) {
      toast.error(`分类 "${name}" 已存在`);
      return;
    }
    setCreatingCat(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const data = await res.json();
      setCategories((prev) => [...prev, data.data]);
      setForm((f) => ({ ...f, categoryId: data.data.id }));
      setNewCatName("");
      setNewCatOpen(false);
      toast.success("分类已创建");
    } else {
      toast.error("创建分类失败");
    }
    setCreatingCat(false);
  }

  async function deleteCategory(id: string, name: string, e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (form.categoryId === id) setForm((f) => ({ ...f, categoryId: "" }));
      toast.success(`已删除分类 "${name}"`);
    } else {
      toast.error("删除失败（可能有关联题目）");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch(`/api/questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        content: form.content,
        answer: form.answer || undefined,
        difficulty: form.difficulty,
        status: form.status,
        categoryId: form.categoryId || undefined,
        sourceCompany: form.sourceCompany || undefined,
      }),
    });

    if (res.ok) {
      toast.success("题目已更新");
      router.push(`/questions/${id}`);
    } else {
      toast.error("更新失败");
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={`/questions/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">编辑题目</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-lg">基本信息</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">题目标题 *</Label>
              <Input id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="content">题目内容 *</Label>
              <Textarea id="content" required rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="题目描述（支持 Markdown）" />
            </div>
            <div>
              <Label htmlFor="answer">参考答案</Label>
              <RichTextEditor
                value={form.answer}
                onChange={(html) => setForm({ ...form, answer: html })}
                placeholder="标准答案或解题思路..."
                minHeight="300px"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">分类</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>难度</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Slider value={[form.difficulty]} onValueChange={(v) => { const arr = Array.isArray(v) ? v : [v]; setForm({ ...form, difficulty: arr[0] ?? 3 }); }} min={1} max={5} step={1} className="flex-1" />
                  <span className="text-sm w-8">{"⭐".repeat(form.difficulty)}</span>
                </div>
              </div>
              <div>
                <Label>掌握状态</Label>
                <Select value={form.status} onValueChange={(v) => v && setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNFAMILIAR">未掌握</SelectItem>
                    <SelectItem value="REVIEWING">复习中</SelectItem>
                    <SelectItem value="MASTERED">已掌握</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>分类</Label>
              <div className="flex gap-2">
                <Select value={form.categoryId} onValueChange={(v) => v && setForm({ ...form, categoryId: v })}>
                  <SelectTrigger className="flex-1">
                    <span className="text-sm truncate">
                      {categories.find((c) => c.id === form.categoryId)?.name || "选择分类"}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="flex-1 truncate">{c.name}</span>
                        <button
                          type="button"
                          onClick={(e) => deleteCategory(c.id, c.name, e)}
                          className="ml-auto flex-shrink-0 rounded p-0.5 hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title={`删除 "${c.name}"`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Popover open={newCatOpen} onOpenChange={setNewCatOpen}>
                  <PopoverTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                    <Plus className="h-4 w-4" />
                  </PopoverTrigger>
                  <PopoverContent className="w-56" align="end">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">新建分类</h4>
                      <div>
                        <Label className="text-xs">名称</Label>
                        <Input
                          placeholder="如: TypeScript"
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && createCategory()}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setNewCatOpen(false)}>取消</Button>
                        <Button size="sm" onClick={createCategory} disabled={creatingCat || !newCatName.trim()}>
                          {creatingCat && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                          创建
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div>
              <Label>来源公司</Label>
              <Input value={form.sourceCompany} onChange={(e) => setForm({ ...form, sourceCompany: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>{saving ? "保存中..." : "保存修改"}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>取消</Button>
        </div>
      </form>
    </div>
  );
}
