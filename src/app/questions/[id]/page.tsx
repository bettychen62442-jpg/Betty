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
    <div className="question-reading min-w-0 max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-2 sm:gap-3">
          <Link href="/questions" aria-label="返回题库" title="返回题库" className="shrink-0">
            <Button variant="ghost" size="icon" className="size-11 sm:size-8" aria-label="返回题库">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl leading-relaxed font-bold [overflow-wrap:anywhere] sm:text-2xl">{question.title}</h1>
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
        <div className="flex shrink-0 items-center gap-2">
          <Select value={status} onValueChange={(v) => v && updateStatus(v)}>
            <SelectTrigger aria-label="掌握状态" className="h-11 min-w-0 flex-1 sm:h-8 sm:w-[120px] sm:flex-none">
              <SelectValue>{status === "MASTERED" ? "已掌握" : status === "REVIEWING" ? "复习中" : "未掌握"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UNFAMILIAR">未掌握</SelectItem>
              <SelectItem value="REVIEWING">复习中</SelectItem>
              <SelectItem value="MASTERED">已掌握</SelectItem>
            </SelectContent>
          </Select>
          <Link href={`/questions/${id}/edit`} aria-label="编辑题目" title="编辑题目">
            <Button variant="outline" size="icon" className="size-11 sm:size-8" aria-label="编辑题目">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            className="size-11 sm:size-8"
            aria-label="删除题目"
            title="删除题目"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <section aria-labelledby="question-content-heading" className="space-y-3 border-t pt-5">
          <h2 id="question-content-heading" className="text-base font-semibold">题目内容</h2>
          <div className="question-document prose dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {question.content}
            </ReactMarkdown>
          </div>
      </section>

      {/* Answer */}
      {question.answer && (
        <section aria-labelledby="question-answer-heading" className="space-y-3 border-t pt-5">
            <h2 id="question-answer-heading" className="text-base font-semibold">参考答案</h2>
            {question.answer.startsWith("<") ? (
              <div
                className="question-document prose dark:prose-invert max-w-none [&_mark]:bg-yellow-200 [&_mark]:dark:bg-yellow-800 [&_mark]:px-0.5 [&_mark]:rounded [&_img]:cursor-pointer [&_img]:hover:opacity-90 [&_img]:transition-opacity"
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
                className="question-document prose dark:prose-invert max-w-none [&_img]:cursor-pointer [&_img]:hover:opacity-90"
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
        </section>
      )}

      {/* Info */}
      <section aria-labelledby="question-stats-heading" className="space-y-3 border-t pt-5">
        <h2 id="question-stats-heading" className="text-base font-semibold">统计信息</h2>
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
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
        </div>
      </section>

      {/* Linked Interviews */}
      {question.interviewQuestions.length > 0 && (
        <section aria-labelledby="question-interviews-heading" className="space-y-3 border-t pt-5">
          <h2 id="question-interviews-heading" className="text-base font-semibold">相关面试</h2>
          <div className="space-y-2">
            {question.interviewQuestions.map((iq) => (
              <Link key={iq.id} href={`/interviews/${iq.interview.id}`}>
                <div className="flex flex-col gap-2 rounded-lg border p-3 hover:bg-accent sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 [overflow-wrap:anywhere]">
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
          </div>
        </section>
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
