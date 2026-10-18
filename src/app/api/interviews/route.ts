import { NextRequest } from "next/server";
import * as interviewService from "@/services/interview.service";
import { createInterviewSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const params = {
    company: searchParams.get("company") || undefined,
    result: searchParams.get("result") || undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
  };

  const result = await interviewService.listInterviews(params);
  return Response.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createInterviewSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const interview = await interviewService.createInterview(parsed.data);
  return Response.json({ data: interview }, { status: 201 });
}
