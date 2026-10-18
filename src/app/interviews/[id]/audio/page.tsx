"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mic, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TranscriptData {
  id: string;
  fullText: string;
  segments: string | null;
  language: string | null;
  providerName: string | null;
  audio: {
    id: string;
    originalName: string;
    durationSeconds: number | null;
    processingStatus: string;
  };
  extractedQuestions: {
    id: string;
    questionText: string;
    status: string;
  }[];
}

export default function AudioTranscriptPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const recordingId = searchParams.get("recordingId");
  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!recordingId) return;
    fetch(`/api/audio/${recordingId}`)
      .then((r) => r.json())
      .then((d) => {
        setTranscript(d.data?.transcript || null);
        setLoading(false);
      });
  }, [recordingId]);

  if (!recordingId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        请从面试详情页选择一条录音
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href={`/interviews/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">转录文本</h1>
          <p className="text-muted-foreground text-sm">
            {transcript?.audio.originalName || "录音"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : !transcript ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">还没有转录文本，请先进行转录</p>
          <Link href={`/interviews/${id}`}>
            <Button variant="outline">返回面试详情</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Extracted Questions Summary */}
          {transcript.extractedQuestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  已提取题目 ({transcript.extractedQuestions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {transcript.extractedQuestions.map((eq) => (
                  <div
                    key={eq.id}
                    className="flex items-center justify-between p-2 rounded border"
                  >
                    <span className="text-sm">{eq.questionText}</span>
                    <Badge
                      variant={
                        eq.status === "ACCEPTED"
                          ? "default"
                          : eq.status === "REJECTED"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {eq.status === "ACCEPTED"
                        ? "已接受"
                        : eq.status === "REJECTED"
                        ? "已拒绝"
                        : "待审核"}
                    </Badge>
                  </div>
                ))}
                <div className="pt-2">
                  <Link href={`/interviews/${id}/review?recordingId=${recordingId}`}>
                    <Button size="sm">去审核题目</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Full Transcript */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mic className="h-4 w-4" />
                完整转录
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] rounded-md border p-4">
                <div className="space-y-4">
                  {transcript.segments ? (
                    (() => {
                      try {
                        const segments = JSON.parse(transcript.segments);
                        return segments.map(
                          (
                            seg: { start: number; end: number; text: string },
                            i: number
                          ) => (
                            <div key={i} className="flex gap-3">
                              <span className="text-xs text-muted-foreground whitespace-nowrap pt-1">
                                {Math.floor(seg.start / 60)}:
                                {String(Math.floor(seg.start % 60)).padStart(2, "0")}
                              </span>
                              <p className="text-sm">{seg.text}</p>
                            </div>
                          )
                        );
                      } catch {
                        return (
                          <p className="text-sm whitespace-pre-wrap">
                            {transcript.fullText}
                          </p>
                        );
                      }
                    })()
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{transcript.fullText}</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
