import { NextRequest } from "next/server";
import * as questionService from "@/services/question.service";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") || undefined;
  const tags = await questionService.listTags(search);
  return Response.json({ data: tags });
}
