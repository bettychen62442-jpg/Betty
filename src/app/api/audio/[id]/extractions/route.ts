import { NextRequest } from "next/server";
import * as extractionService from "@/services/extraction.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const extractions = await extractionService.getExtractionsByAudio(id);
  return Response.json({ data: extractions });
}
