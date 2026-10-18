"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { pinyin } from "pinyin-pro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  title: string;
  difficulty: number;
  status: string;
  category?: { name: string } | null;
  tags: { name: string }[];
  lastReviewed: string | null;
  timesReviewed: number;
}

type QuestionGroup = { letter: string; questions: Question[] };

const ALL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

function getFirstLetter(title: string): string {
  if (!title) return "#";
  const first = title.charAt(0);

  // English letter
  if (/^[a-zA-Z]$/.test(first)) return first.toUpperCase();

  // Chinese character — use pinyin
  if (/^[一-鿿]$/.test(first)) {
    const py = pinyin(first, { pattern: "first", toneType: "none" });
    if (py) return py.charAt(0).toUpperCase();
  }

  // Number
  if (/^\d$/.test(first)) return "#";

  // Other — try pinyin on whole string
  const py = pinyin(title.slice(0, 2), { pattern: "first", toneType: "none" });
  if (py && /^[a-zA-Z]/.test(py)) return py.charAt(0).toUpperCase();

  return "#";
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (categoryId) params.set("categoryId", categoryId);
    params.set("limit", "500");

    const res = await fetch(`/api/questions?${params}`);
    const data = await res.json();
    setQuestions(data.data || []);
    setLoading(false);
  }, [search, status, categoryId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []));
  }, []);

  // Group questions by first letter
  const grouped = useMemo(() => {
    const groups: Record<string, Question[]> = {};
    for (const q of questions) {
      const letter = getFirstLetter(q.title);
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(q);
    }
    // Sort letters, but keep # at the end
    const sorted = Object.entries(groups)
      .sort(([a], [b]) => {
        if (a === "#") return 1;
        if (b === "#") return -1;
        return a.localeCompare(b);
      })
      .map(([letter, qs]) => ({ letter, questions: qs }));
    return sorted;
  }, [questions]);

  // Which letters have content
  const activeLetters = useMemo(() => {
    const set = new Set(grouped.map((g) => g.letter));
    return set;
  }, [grouped]);

  function scrollToLetter(letter: string) {
    const el = sectionRefs.current[letter];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const statusBadge = (s: string) => {
    switch (s) {
      case "MASTERED":
        return <Badge variant="default">已掌握</Badge>;
      case "REVIEWING":
        return <Badge variant="secondary">复习中</Badge>;
      default:
        return <Badge variant="outline">未掌握</Badge>;
    }
  };

  const difficultyStars = (d: number) => "⭐".repeat(d) + "☆".repeat(5 - d);

  const statusLabel = (s: string) => {
    if (!s) return "状态";
    const map: Record<string, string> = {
      UNFAMILIAR: "未掌握",
      REVIEWING: "复习中",
      MASTERED: "已掌握",
    };
    return map[s] || s;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">题库</h1>
          <p className="text-muted-foreground">管理你的面试题目</p>
        </div>
        <Link href="/questions/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> 添加题目
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索题目..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" || !v ? "" : v)}>
          <SelectTrigger className="w-[140px]">
            <span className="text-sm truncate">{statusLabel(status)}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="UNFAMILIAR">未掌握</SelectItem>
            <SelectItem value="REVIEWING">复习中</SelectItem>
            <SelectItem value="MASTERED">已掌握</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryId || "all"} onValueChange={(v) => setCategoryId(v === "all" || !v ? "" : v)}>
          <SelectTrigger className="w-[160px]">
            <span className="text-sm truncate">
              {categories.find((c) => c.id === categoryId)?.name || "分类"}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content area with sidebar index */}
      <div className="flex gap-6 relative">
        {/* Question list */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">加载中...</div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">还没有题目，开始添加吧</p>
              <Link href="/questions/new">
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" /> 添加第一道题目
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {grouped.map((group) => (
                <div
                  key={group.letter}
                  ref={(el) => { sectionRefs.current[group.letter] = el; }}
                >
                  {/* Section header */}
                  <div className="flex items-center gap-2 mb-3 sticky top-0 bg-background z-10 py-2">
                    <span className="text-lg font-bold text-primary w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {group.letter}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {group.questions.length} 题
                    </span>
                    <div className="flex-1 h-px bg-border ml-2" />
                  </div>

                  {/* Questions in this group */}
                  <div className="space-y-2">
                    {group.questions.map((q) => (
                      <Link key={q.id} href={`/questions/${q.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{q.title}</h3>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                {q.category && (
                                  <span className="text-xs text-muted-foreground">
                                    {q.category.name}
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {difficultyStars(q.difficulty)}
                                </span>
                                {q.tags?.map((t) => (
                                  <Badge key={t.name} variant="outline" className="text-xs">
                                    {t.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                              {statusBadge(q.status)}
                              <span className="text-xs text-muted-foreground">
                                复习 {q.timesReviewed} 次
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alphabet index — only show when we have questions */}
        {!loading && questions.length > 0 && (
          <nav className="hidden md:flex flex-col items-center gap-0.5 sticky top-8 self-start pr-1">
            {ALL_LETTERS.map((letter) => {
              const isActive = activeLetters.has(letter);
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => scrollToLetter(letter)}
                  disabled={!isActive}
                  className={cn(
                    "w-6 h-6 rounded text-xs font-medium transition-colors",
                    isActive
                      ? "text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      : "text-muted-foreground/30 cursor-default"
                  )}
                  title={isActive ? `${letter} (${grouped.find(g => g.letter === letter)?.questions.length} 题)` : undefined}
                >
                  {letter}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
