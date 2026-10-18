import { NextRequest } from "next/server";
import * as questionService from "@/services/question.service";
import { createCategorySchema } from "@/lib/validators";

export async function GET() {
  const categories = await questionService.listCategories();
  return Response.json({ data: categories });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Auto-generate slug from name if not provided
  const data = {
    ...parsed.data,
    slug:
      parsed.data.slug ||
      parsed.data.name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9一-鿿぀-ゟ゠-ヿ가-힯-]/g, "") ||
      `cat-${Date.now()}`,
  };

  const category = await questionService.createCategory(data);
  return Response.json({ data: category }, { status: 201 });
}
