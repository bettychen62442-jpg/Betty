import { NextRequest } from "next/server";
import * as audioService from "@/services/audio.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const audio = await audioService.getAudio(id);
  if (!audio) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ data: audio });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await audioService.deleteAudio(id);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Delete failed" }, { status: 500 });
  }
}
