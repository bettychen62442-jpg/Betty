import { NextRequest } from "next/server";
import path from "node:path";
import { getStorageProvider } from "@/storage/storage-factory";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"];
  if (!allowedTypes.includes(file.type)) {
    return Response.json(
      { error: `Unsupported file type: ${file.type}. Allowed: ${allowedTypes.join(", ")}` },
      { status: 400 }
    );
  }

  // Validate size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: "File too large. Max 5MB." }, { status: 400 });
  }

  try {
    const ext = file.name.split(".").pop() || "png";
    const id = crypto.randomUUID();
    const filename = `${id}.${ext}`;
    await getStorageProvider(undefined, "images").save(file, filename);

    const url = `/api/upload/image?file=${filename}`;

    return Response.json({ data: { url, filename } }, { status: 201 });
  } catch (error) {
    console.error("Image upload error:", error);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const file = searchParams.get("file");

  if (!file) {
    return Response.json({ error: "file param required" }, { status: 400 });
  }

  // Sanitize filename to prevent path traversal
  const safeName = path.basename(file);

  try {
    const buffer = await getStorageProvider(undefined, "images").getBuffer(safeName);
    const ext = safeName.split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
    };
    const contentType = mimeTypes[ext || ""] || "application/octet-stream";

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return Response.json({ error: "File not found" }, { status: 404 });
  }
}
