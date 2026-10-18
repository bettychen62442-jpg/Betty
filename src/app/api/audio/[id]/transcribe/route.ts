import { NextRequest } from "next/server";
import * as audioService from "@/services/audio.service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const audio = await audioService.triggerTranscription(id);
    return Response.json({ data: audio });
  } catch (error) {
    console.error("Transcription error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Transcription failed" },
      { status: 500 }
    );
  }
}
