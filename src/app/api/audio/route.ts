import { NextRequest } from "next/server";
import * as audioService from "@/services/audio.service";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const interviewId = formData.get("interviewId") as string | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }
  if (!interviewId) {
    return Response.json({ error: "interviewId is required" }, { status: 400 });
  }

  try {
    const audio = await audioService.uploadAudio(file, interviewId);
    return Response.json({ data: audio }, { status: 201 });
  } catch (error) {
    console.error("Audio upload error:", error);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
