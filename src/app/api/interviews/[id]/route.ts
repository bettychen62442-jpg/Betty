import { NextRequest } from "next/server";
import * as interviewService from "@/services/interview.service";
import { updateInterviewSchema } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const interview = await interviewService.getInterview(id);
  if (!interview) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ data: interview });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateInterviewSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const interview = await interviewService.updateInterview(id, parsed.data);
  return Response.json({ data: interview });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await interviewService.deleteInterview(id);
  return Response.json({ success: true });
}
