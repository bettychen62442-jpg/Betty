import { NextRequest } from "next/server";
import * as appService from "@/services/application.service";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const result = await appService.listApplications({
    search: searchParams.get("search") || undefined,
    status: searchParams.get("status") || undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 50,
  });
  return Response.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.company || !body.position) {
    return Response.json({ error: "company and position are required" }, { status: 400 });
  }
  const app = await appService.createApplication(body);
  return Response.json({ data: app }, { status: 201 });
}
