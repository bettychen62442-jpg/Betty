import { NextRequest } from "next/server";
import * as appService from "@/services/application.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const app = await appService.getApplication(id);
  if (!app) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ data: app });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const app = await appService.updateApplication(id, body);
  return Response.json({ data: app });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await appService.deleteApplication(id);
  return Response.json({ success: true });
}
