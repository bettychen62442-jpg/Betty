import { NextRequest } from "next/server";
import * as extractionService from "@/services/extraction.service";
import { updateExtractionSchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateExtractionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const extraction = await extractionService.updateExtraction(id, parsed.data);
  return Response.json({ data: extraction });
}
