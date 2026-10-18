import fs from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";
import { StorageProvider } from "../types";

export function createLocalStorageProvider(namespace: "audio" | "images" = "audio"): StorageProvider {
  const root = path.resolve(process.cwd(), "data", namespace);

  function filePath(relativePath: string) {
    const resolved = path.resolve(root, relativePath);
    if (!resolved.startsWith(root + path.sep)) throw new Error("Invalid storage path.");
    return resolved;
  }

  return {
    name: "local",
    async save(file, relativePath) {
      const fullPath = filePath(relativePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(fullPath, buffer);
      return { storagePath: relativePath, fileSize: buffer.length };
    },
    async getBuffer(storagePath) {
      return fs.readFile(filePath(storagePath));
    },
    async getUrl(storagePath) {
      return namespace === "images"
        ? `/api/upload/image?file=${encodeURIComponent(storagePath)}`
        : `/api/audio/file?path=${encodeURIComponent(storagePath)}`;
    },
    async delete(storagePath) {
      const fullPath = filePath(storagePath);
      if (existsSync(fullPath)) await fs.unlink(fullPath);
    },
  };
}

export const localStorageProvider = createLocalStorageProvider();
