import { NextRequest } from "next/server";
import * as questionService from "@/services/question.service";
import { createQuestionSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const params = {
    search: searchParams.get("search") || undefined,
    status: searchParams.get("status") || undefined,
    categoryId: searchParams.get("categoryId") || undefined,
    difficulty: searchParams.get("difficulty")
      ? Number(searchParams.get("difficulty"))
      : undefined,
    tagName: searchParams.get("tagName") || undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
  };

  const result = await questionService.listQuestions(params);
  return Response.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const question = await questionService.createQuestion(parsed.data);
  return Response.json({ data: question }, { status: 201 });
}
