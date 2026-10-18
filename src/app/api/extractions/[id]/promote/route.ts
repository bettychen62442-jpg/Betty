import { NextRequest } from "next/server";
import * as extractionService from "@/services/extraction.service";
import { promoteExtractionSchema } from "@/lib/validators";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = promoteExtractionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const question = await extractionService.promoteToQuestion(id, parsed.data);
    return Response.json({ data: question }, { status: 201 });
  } catch (error) {
    console.error("Promote error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Promote failed" },
      { status: 500 }
    );
  }
}
