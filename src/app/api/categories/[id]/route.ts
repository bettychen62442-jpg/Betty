import { NextRequest } from "next/server";
import * as questionService from "@/services/question.service";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await questionService.deleteCategory(id);
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Delete failed" }, { status: 500 });
  }
}
