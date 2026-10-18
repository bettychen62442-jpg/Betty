import { NextRequest } from "next/server";
import * as audioService from "@/services/audio.service";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const filePath = searchParams.get("path");

  if (!filePath) {
    return Response.json({ error: "path is required" }, { status: 400 });
  }

  try {
    const buffer = await audioService.getAudioFile(filePath);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `inline; filename="${filePath.split("/").pop()}"`,
      },
    });
  } catch {
    return Response.json({ error: "File not found" }, { status: 404 });
  }
}
