import fs from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";
import { StorageProvider } from "../types";

const UPLOAD_DIR = path.join(process.cwd(), "data", "audio");

async function ensureDir(dir: string): Promise<void> {
  if (!existsSync(dir)) {
    await fs.mkdir(dir, { recursive: true });
  }
}

export const localStorageProvider: StorageProvider = {
  name: "local",

  async save(file: File, relativePath: string) {
    await ensureDir(path.join(UPLOAD_DIR, relativePath, ".."));

    const buffer = Buffer.from(await file.arrayBuffer());
    const fullPath = path.join(UPLOAD_DIR, relativePath);
    await fs.writeFile(fullPath, buffer);

    return {
      storagePath: relativePath,
      fileSize: buffer.length,
    };
  },

  async getBuffer(storagePath: string) {
    return fs.readFile(path.join(UPLOAD_DIR, storagePath));
  },

  async getUrl(storagePath: string) {
    // For local storage, return a relative URL that maps to the Next.js public folder
    // In production, this would be a signed URL or CDN URL
    return `/api/audio/file?path=${encodeURIComponent(storagePath)}`;
  },

  async delete(storagePath: string) {
    const fullPath = path.join(UPLOAD_DIR, storagePath);
    if (existsSync(fullPath)) {
      await fs.unlink(fullPath);
    }
  },
};
