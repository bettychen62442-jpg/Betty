import { NextRequest } from "next/server";
import * as extractionService from "@/services/extraction.service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const extractions = await extractionService.triggerExtraction(id);
    return Response.json({ data: extractions });
  } catch (error) {
    console.error("Extraction error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Extraction failed" },
      { status: 500 }
    );
  }
}
