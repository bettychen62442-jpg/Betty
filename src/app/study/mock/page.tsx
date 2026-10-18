"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shuffle, Eye, EyeOff } from "lucide-react";

interface Question {
  id: string;
  title: string;
  content: string;
  answer: string | null;
  difficulty: number;
  category?: { name: string } | null;
}

export default function MockInterviewPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [count, setCount] = useState("5");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []));
  }, []);

  async function startMock() {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoryId) params.set("categoryId", categoryId);
    params.set("count", count);

    const res = await fetch(`/api/questions?${params}&limit=${count}`);
    const data = await res.json();
    setQuestions(data.data || []);
    setCurrentIndex(0);
    setShowAnswer(false);
    setStarted(true);
    setLoading(false);
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">模拟面试</h1>
        <p className="text-muted-foreground">随机抽题，模拟真实面试场景</p>
      </div>

      {!started ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">配置模拟面试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">分类</label>
                <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="全部分类" />
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
              <div>
                <label className="text-sm font-medium">题目数量</label>
                <Select value={count} onValueChange={(v) => v && setCount(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 题</SelectItem>
                    <SelectItem value="5">5 题</SelectItem>
                    <SelectItem value="10">10 题</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={startMock} disabled={loading} className="gap-2">
              <Shuffle className="h-4 w-4" />
              {loading ? "加载中..." : "开始模拟面试"}
            </Button>
          </CardContent>
        </Card>
      ) : questions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            题库中没有符合条件的题目
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Progress */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              第 {currentIndex + 1} / {questions.length} 题
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentIndex === 0}
                onClick={() => {
                  setCurrentIndex((i) => i - 1);
                  setShowAnswer(false);
                }}
              >
                上一题
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentIndex === questions.length - 1}
                onClick={() => {
                  setCurrentIndex((i) => i + 1);
                  setShowAnswer(false);
                }}
              >
                下一题
              </Button>
            </div>
          </div>

          {/* Question */}
          {currentQ && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {currentQ.category && (
                      <Badge variant="secondary">{currentQ.category.name}</Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {"⭐".repeat(currentQ.difficulty)}
                    </span>
                  </div>
                </div>
                <CardTitle className="text-xl mt-2">{currentQ.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                    {currentQ.content}
                  </ReactMarkdown>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="gap-2"
                  >
                    {showAnswer ? (
                      <>
                        <EyeOff className="h-4 w-4" /> 隐藏答案
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" /> 查看答案
                      </>
                    )}
                  </Button>
                </div>

                {showAnswer && currentQ.answer && (
                  <div className="p-4 rounded-lg bg-accent">
                    {currentQ.answer.startsWith("<") ? (
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none [&_mark]:bg-yellow-200 [&_mark]:dark:bg-yellow-800 [&_mark]:px-0.5 [&_mark]:rounded [&_img]:cursor-pointer [&_img]:hover:opacity-90 [&_img]:transition-opacity"
                        dangerouslySetInnerHTML={{ __html: currentQ.answer }}
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (target.tagName === "IMG") {
                            const src = (target as HTMLImageElement).src;
                            if (src) window.open(src, "_blank");
                          }
                        }}
                      />
                    ) : (
                      <div
                        className="prose dark:prose-invert max-w-none [&_img]:cursor-pointer [&_img]:hover:opacity-90"
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (target.tagName === "IMG") {
                            const src = (target as HTMLImageElement).src;
                            if (src) window.open(src, "_blank");
                          }
                        }}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                          {currentQ.answer}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
