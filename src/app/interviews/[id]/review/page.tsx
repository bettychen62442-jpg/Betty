"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, X, Pencil, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ExtractedQ {
  id: string;
  questionText: string;
  answerText: string | null;
  suggestedCategory: string | null;
  suggestedTags: string | null;
  suggestedDifficulty: number | null;
  status: string;
  reviewNote: string | null;
  promotedQuestionId: string | null;
}

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const recordingId = searchParams.get("recordingId");
  const [extractions, setExtractions] = useState<ExtractedQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!recordingId) return;
    fetch(`/api/audio/${recordingId}/extractions`)
      .then((r) => r.json())
      .then((d) => {
        setExtractions(d.data || []);
        setLoading(false);
      });
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []));
  }, [recordingId]);

  async function handleReject(extractionId: string) {
    await fetch(`/api/extractions/${extractionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "REJECTED" }),
    });
    setExtractions((prev) =>
      prev.map((e) => (e.id === extractionId ? { ...e, status: "REJECTED" } : e))
    );
    toast.success("已拒绝");
  }

  async function handleAccept(extractionId: string) {
    const extraction = extractions.find((e) => e.id === extractionId);
    if (!extraction) return;

    try {
      const suggestedTags = extraction.suggestedTags
        ? JSON.parse(extraction.suggestedTags)
        : [];

      const res = await fetch(`/api/extractions/${extractionId}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: extraction.questionText,
          difficulty: extraction.suggestedDifficulty || 3,
          tagNames: suggestedTags,
        }),
      });

      if (res.ok) {
        setExtractions((prev) =>
          prev.map((e) =>
            e.id === extractionId ? { ...e, status: "ACCEPTED" } : e
          )
        );
        toast.success("已加入题库");
      } else {
        toast.error("入库失败");
      }
    } catch {
      toast.error("入库失败");
    }
  }

  async function handleSaveEdit(extractionId: string) {
    await fetch(`/api/extractions/${extractionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionText: editText, status: "MODIFIED" }),
    });
    setExtractions((prev) =>
      prev.map((e) =>
        e.id === extractionId
          ? { ...e, questionText: editText, status: "MODIFIED" }
          : e
      )
    );
    setEditingId(null);
    toast.success("已保存修改");
  }

  if (!recordingId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        请从面试详情页选择一条录音
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">加载中...</div>;
  }

  const pending = extractions.filter(
    (e) => e.status === "PENDING_REVIEW" || e.status === "MODIFIED"
  );
  const processed = extractions.filter(
    (e) => e.status === "ACCEPTED" || e.status === "REJECTED"
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href={`/interviews/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">审核提取题目</h1>
          <p className="text-muted-foreground text-sm">
            AI从录音中提取了 {extractions.length} 道题目，请审核后选择是否加入题库
          </p>
        </div>
      </div>

      {extractions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">还没有提取的题目，请先进行题目提取</p>
          <Link href={`/interviews/${id}`}>
            <Button variant="outline">返回面试详情</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Pending */}
          {pending.length > 0 && (
            <div className="space-y-4">
              {pending.map((eq) => (
                <Card key={eq.id}>
                  <CardContent className="p-4 space-y-3">
                    {editingId === eq.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(eq.id)}
                          >
                            保存
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            取消
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">{eq.questionText}</p>
                        {eq.answerText && (
                          <p className="text-sm text-muted-foreground mt-1">
                            候选人回答: {eq.answerText.slice(0, 200)}
                            {eq.answerText.length > 200 && "..."}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {eq.suggestedCategory && (
                            <Badge variant="secondary">{eq.suggestedCategory}</Badge>
                          )}
                          {eq.suggestedTags &&
                            (() => {
                              try {
                                return JSON.parse(eq.suggestedTags).map(
                                  (t: string) => (
                                    <Badge key={t} variant="outline" className="text-xs">
                                      {t}
                                    </Badge>
                                  )
                                );
                              } catch {
                                return null;
                              }
                            })()}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleAccept(eq.id)}
                      >
                        <Check className="h-3 w-3 mr-1" /> 接受
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(eq.id);
                          setEditText(eq.questionText);
                        }}
                      >
                        <Pencil className="h-3 w-3 mr-1" /> 编辑
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(eq.id)}
                      >
                        <X className="h-3 w-3 mr-1" /> 拒绝
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Processed */}
          {processed.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">已处理 ({processed.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {processed.map((eq) => (
                  <div
                    key={eq.id}
                    className="flex items-center justify-between p-2 rounded border"
                  >
                    <span className="text-sm flex-1 truncate mr-4">
                      {eq.questionText}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          eq.status === "ACCEPTED" ? "default" : "destructive"
                        }
                      >
                        {eq.status === "ACCEPTED" ? "已入库" : "已拒绝"}
                      </Badge>
                      {eq.promotedQuestionId && (
                        <Link href={`/questions/${eq.promotedQuestionId}`}>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
