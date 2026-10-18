"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Mic, FileText, Upload, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface InterviewData {
  id: string;
  company: string;
  position: string;
  round: string;
  interviewDate: string;
  result: string;
  resultReason: string | null;
  overallNotes: string | null;
  questions: {
    id: string;
    questionText: string | null;
    selfScore: number | null;
    wasCorrect: boolean | null;
    interviewerNote: string | null;
    question: { id: string; title: string; status: string } | null;
  }[];
  audioRecordings: {
    id: string;
    originalName: string;
    processingStatus: string;
    fileSize: number;
    durationSeconds: number | null;
    transcript: {
      id: string;
      fullText: string;
      _count: { extractedQuestions: number };
    } | null;
  }[];
}

const roundMap: Record<string, string> = {
  PHONE_SCREEN: "电话筛选",
  TECHNICAL_1: "技术一面",
  TECHNICAL_2: "技术二面",
  ONSITE: "现场面试",
  BEHAVIORAL: "行为面试",
  SYSTEM_DESIGN: "系统设计",
  HR: "HR面",
  OTHER: "其他",
};

const statusMap: Record<string, string> = {
  UPLOADED: "已上传",
  TRANSCRIBING: "转录中",
  TRANSCRIBED: "已转录",
  EXTRACTING: "提取中",
  COMPLETED: "已完成",
  FAILED: "失败",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function InterviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchInterview();
  }, [id]);

  async function fetchInterview() {
    const res = await fetch(`/api/interviews/${id}`);
    const data = await res.json();
    setInterview(data.data);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("interviewId", id);

    const res = await fetch("/api/audio", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      toast.success("音频已上传");
      fetchInterview();
    } else {
      toast.error("上传失败");
    }
    setUploading(false);
    e.target.value = "";
  }

  async function handleTranscribe(audioId: string) {
    setProcessing(audioId);
    const res = await fetch(`/api/audio/${audioId}/transcribe`, { method: "POST" });
    if (res.ok) {
      toast.success("转录完成");
      fetchInterview();
    } else {
      toast.error("转录失败");
    }
    setProcessing(null);
  }

  async function handleExtract(audioId: string) {
    setProcessing(audioId);
    const res = await fetch(`/api/audio/${audioId}/extract`, { method: "POST" });
    if (res.ok) {
      toast.success("题目提取完成");
      fetchInterview();
    } else {
      toast.error("提取失败");
    }
    setProcessing(null);
  }

  async function handleDelete() {
    await fetch(`/api/interviews/${id}`, { method: "DELETE" });
    toast.success("面试记录已删除");
    router.push("/interviews");
  }

  if (!interview) {
    return <div className="text-center py-12 text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/interviews">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {interview.company} — {interview.position}
            </h1>
            <p className="text-muted-foreground">
              {roundMap[interview.round] || interview.round} ·{" "}
              {new Date(interview.interviewDate).toLocaleDateString("zh-CN")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Result Badge */}
      <div className="flex gap-2">
        <Badge
          variant={
            interview.result === "PASS"
              ? "default"
              : interview.result === "FAIL"
              ? "destructive"
              : "outline"
          }
          className="text-sm px-3 py-1"
        >
          {interview.result === "PASS"
            ? "通过"
            : interview.result === "FAIL"
            ? "未通过"
            : "待定"}
        </Badge>
        {interview.resultReason && (
          <span className="text-sm text-muted-foreground">
            原因: {interview.resultReason}
          </span>
        )}
      </div>

      <Tabs defaultValue="questions">
        <TabsList>
          <TabsTrigger value="questions">
            题目 ({interview.questions.length})
          </TabsTrigger>
          <TabsTrigger value="audio">
            录音 ({interview.audioRecordings.length})
          </TabsTrigger>
          <TabsTrigger value="notes">备注</TabsTrigger>
        </TabsList>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-4 mt-4">
          {interview.questions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              还没有关联题目。上传录音后可通过AI提取题目。
            </div>
          ) : (
            interview.questions.map((iq) => (
              <Card key={iq.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {iq.question ? (
                        <Link
                          href={`/questions/${iq.question.id}`}
                          className="font-medium hover:underline"
                        >
                          {iq.question.title}
                        </Link>
                      ) : (
                        <p className="font-medium">{iq.questionText}</p>
                      )}
                      <div className="flex gap-3 mt-2">
                        {iq.selfScore && (
                          <span className="text-sm text-muted-foreground">
                            自评: {iq.selfScore}/5
                          </span>
                        )}
                        {iq.wasCorrect !== null && (
                          <Badge variant={iq.wasCorrect ? "default" : "destructive"}>
                            {iq.wasCorrect ? "回答正确" : "回答有误"}
                          </Badge>
                        )}
                      </div>
                      {iq.interviewerNote && (
                        <p className="text-sm text-muted-foreground mt-2">
                          面试官反馈: {iq.interviewerNote}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Audio Tab */}
        <TabsContent value="audio" className="space-y-4 mt-4">
          {/* Upload */}
          <Card>
            <CardContent className="p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">
                  {uploading ? "上传中..." : "点击上传面试录音"}
                </span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </CardContent>
          </Card>

          {/* Audio Recordings */}
          {interview.audioRecordings.map((audio) => (
            <Card key={audio.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mic className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{audio.originalName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(audio.fileSize)}
                        {audio.durationSeconds
                          ? ` · ${Math.floor(audio.durationSeconds / 60)}:${String(audio.durationSeconds % 60).padStart(2, "0")}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{statusMap[audio.processingStatus]}</Badge>
                </div>

                {/* Processing Actions */}
                <div className="flex gap-2">
                  {audio.processingStatus === "UPLOADED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTranscribe(audio.id)}
                      disabled={processing === audio.id}
                    >
                      {processing === audio.id ? "转录中..." : "开始转录"}
                    </Button>
                  )}
                  {audio.processingStatus === "TRANSCRIBED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExtract(audio.id)}
                      disabled={processing === audio.id}
                    >
                      {processing === audio.id ? "提取中..." : "提取题目"}
                    </Button>
                  )}
                  {audio.transcript && (
                    <Link href={`/interviews/${id}/audio?recordingId=${audio.id}`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <FileText className="h-3 w-3" />
                        查看转录
                        {audio.transcript._count.extractedQuestions > 0 &&
                          ` (${audio.transcript._count.extractedQuestions} 题)`}
                      </Button>
                    </Link>
                  )}
                  {audio.processingStatus === "COMPLETED" && (
                    <Link href={`/interviews/${id}/review?recordingId=${audio.id}`}>
                      <Button variant="default" size="sm">
                        审核提取题目
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardContent className="p-4">
              {interview.overallNotes ? (
                <p className="whitespace-pre-wrap text-sm">{interview.overallNotes}</p>
              ) : (
                <p className="text-muted-foreground text-sm">暂无备注</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              删除后将无法恢复。确定要删除 {interview.company} 的面试记录吗？
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
