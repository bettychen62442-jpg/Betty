"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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

interface Question {
  id: string;
  title: string;
  content: string;
  answer: string | null;
  difficulty: number;
  status: string;
  category: { name: string } | null;
  tags: { name: string }[];
  source: string | null;
  sourceCompany: string | null;
  timesReviewed: number;
  timesCorrect: number;
  lastReviewed: string | null;
  interviewQuestions: {
    id: string;
    selfScore: number | null;
    wasCorrect: boolean | null;
    interview: { id: string; company: string; position: string; interviewDate: string };
  }[];
}

export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [status, setStatus] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    fetch(`/api/questions/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setQuestion(d.data);
        setStatus(d.data?.status);
      });
  }, [id]);

  async function updateStatus(newStatus: string) {
    setStatus(newStatus);
    await fetch(`/api/questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    toast.success("状态已更新");
  }

  async function handleDelete() {
    await fetch(`/api/questions/${id}`, { method: "DELETE" });
    toast.success("题目已删除");
    router.push("/questions");
  }

  if (!question) {
    return <div className="text-center py-12 text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/questions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{question.title}</h1>
            <div className="flex gap-2 mt-1 flex-wrap">
              {question.category && (
                <Badge variant="secondary">{question.category.name}</Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {"⭐".repeat(question.difficulty)}
                {"☆".repeat(5 - question.difficulty)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={status} onValueChange={(v) => v && updateStatus(v)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UNFAMILIAR">未掌握</SelectItem>
              <SelectItem value="REVIEWING">复习中</SelectItem>
              <SelectItem value="MASTERED">已掌握</SelectItem>
            </SelectContent>
          </Select>
          <Link href={`/questions/${id}/edit`}>
            <Button variant="outline" size="icon">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">题目内容</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {question.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Answer */}
      {question.answer && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">参考答案</CardTitle>
          </CardHeader>
          <CardContent>
            {question.answer.startsWith("<") ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none [&_mark]:bg-yellow-200 [&_mark]:dark:bg-yellow-800 [&_mark]:px-0.5 [&_mark]:rounded [&_img]:cursor-pointer [&_img]:hover:opacity-90 [&_img]:transition-opacity"
                dangerouslySetInnerHTML={{ __html: question.answer }}
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
                  {question.answer}
                </ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">统计信息</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">复习次数</span>
            <p className="text-lg font-bold">{question.timesReviewed}</p>
          </div>
          <div>
            <span className="text-muted-foreground">正确次数</span>
            <p className="text-lg font-bold">{question.timesCorrect}</p>
          </div>
          <div>
            <span className="text-muted-foreground">上次复习</span>
            <p className="text-lg font-bold">
              {question.lastReviewed
                ? new Date(question.lastReviewed).toLocaleDateString("zh-CN")
                : "从未"}
            </p>
          </div>
          {question.sourceCompany && (
            <div>
              <span className="text-muted-foreground">来源公司</span>
              <p>{question.sourceCompany}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Linked Interviews */}
      {question.interviewQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">相关面试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {question.interviewQuestions.map((iq) => (
              <Link key={iq.id} href={`/interviews/${iq.interview.id}`}>
                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent">
                  <div>
                    <span className="font-medium">{iq.interview.company}</span>
                    <span className="text-muted-foreground"> — {iq.interview.position}</span>
                  </div>
                  <div className="flex gap-3 text-sm">
                    {iq.selfScore && <span>自评: {iq.selfScore}/5</span>}
                    {iq.wasCorrect !== null && (
                      <Badge variant={iq.wasCorrect ? "default" : "destructive"}>
                        {iq.wasCorrect ? "正确" : "错误"}
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              删除后将无法恢复。确定要删除 &quot;{question.title}&quot; 吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
