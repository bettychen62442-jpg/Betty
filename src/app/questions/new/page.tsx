"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Plus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export default function NewQuestionPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
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
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []));
  }, []);

  async function createCategory() {
    const name = newCatName.trim();
    if (!name) return;
    // Check for duplicate
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
    e.stopPropagation(); // Prevent Select from picking up the click
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

    const res = await fetch("/api/questions", {
      method: "POST",
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
      toast.success("题目已创建");
      router.push("/questions");
    } else {
      toast.error("创建失败");
    }
    setSaving(false);
  }

  return (
    <div className="question-form min-w-0 max-w-2xl space-y-6 pb-24 sm:pb-0">
      <div>
        <h1 className="text-2xl font-bold">添加题目</h1>
        <p className="text-muted-foreground">添加一道新的面试题目到题库</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <section aria-labelledby="question-basic-heading" className="space-y-4 border-t pt-5">
          <h2 id="question-basic-heading" className="text-base font-semibold">基本信息</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">题目标题 *</Label>
              <Input
                id="title"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="例如：Two Sum"
              />
            </div>
            <div>
              <Label htmlFor="content">题目内容 *</Label>
              <Textarea
                id="content"
                required
                rows={5}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="题目描述（支持 Markdown）"
              />
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
          </div>
        </section>

        <section aria-labelledby="question-category-heading" className="space-y-4 border-t pt-5">
          <h2 id="question-category-heading" className="text-base font-semibold">分类</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>难度</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Slider
                    aria-label="难度"
                    value={[form.difficulty]}
                    onValueChange={(v) => { const arr = Array.isArray(v) ? v : [v]; setForm({ ...form, difficulty: arr[0] ?? 3 }); }}
                    min={1}
                    max={5}
                    step={1}
                    className="min-w-0 flex-1"
                  />
                  <span className="w-12 shrink-0 text-right text-sm tabular-nums">{form.difficulty} / 5</span>
                </div>
              </div>
              <div>
                <Label>掌握状态</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => v && setForm({ ...form, status: v })}
                >
                  <SelectTrigger aria-label="掌握状态">
                    <SelectValue>{form.status === "MASTERED" ? "已掌握" : form.status === "REVIEWING" ? "复习中" : "未掌握"}</SelectValue>
                  </SelectTrigger>
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
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => v && setForm({ ...form, categoryId: v })}
                >
                  <SelectTrigger aria-label="分类" className="min-w-0 flex-1">
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
                  <PopoverTrigger aria-label="新建分类" title="新建分类" className="inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground sm:size-10">
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
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void createCategory(); } }}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setNewCatOpen(false)}
                        >
                          取消
                        </Button>
                        <Button
                          size="sm"
                          onClick={createCategory}
                          disabled={creatingCat || !newCatName.trim()}
                        >
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
              <Label htmlFor="source-company">来源公司</Label>
              <Input
                id="source-company"
                value={form.sourceCompany}
                onChange={(e) => setForm({ ...form, sourceCompany: e.target.value })}
                placeholder="如: Google"
              />
            </div>
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-30 flex gap-3 border-t bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:static sm:border-0 sm:bg-transparent sm:p-0">
          <Button type="submit" className="h-11 flex-1 sm:h-8 sm:flex-none" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {saving ? "保存中..." : "创建题目"}
          </Button>
          <Button type="button" className="h-11 sm:h-8" variant="outline" onClick={() => router.back()}>
            取消
          </Button>
        </div>
      </form>
    </div>
  );
}
