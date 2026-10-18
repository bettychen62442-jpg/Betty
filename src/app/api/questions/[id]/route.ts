import { NextRequest } from "next/server";
import * as questionService from "@/services/question.service";
import { updateQuestionSchema } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const question = await questionService.getQuestion(id);
  if (!question) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ data: question });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const question = await questionService.updateQuestion(id, parsed.data);
  return Response.json({ data: question });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await questionService.deleteQuestion(id);
  return Response.json({ success: true });
}
