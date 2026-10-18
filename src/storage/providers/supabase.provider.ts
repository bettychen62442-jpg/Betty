import { getSupabaseStorage, getStorageBucket } from "../supabase-client.mjs";
import { StorageProvider } from "../types";

export function createSupabaseStorageProvider(namespace: "audio" | "images"): StorageProvider {
  function objectPath(relativePath: string) {
    if (relativePath.startsWith("/") || relativePath.includes("\\") || relativePath.split("/").some(part => part === ".." || part === ".")) {
      throw new Error("Invalid storage path.");
    }
    return `${namespace}/${relativePath}`;
  }
  function bucket() {
    return getSupabaseStorage().from(getStorageBucket());
  }
  return {
    name: "supabase",
    async save(file, relativePath) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error } = await bucket().upload(objectPath(relativePath), buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
      if (error) throw new Error("Cloud upload failed.", { cause: error });
      return { storagePath: relativePath, fileSize: buffer.length };
    },
    async getBuffer(storagePath) {
      const { data, error } = await bucket().download(objectPath(storagePath));
      if (error) throw new Error("Cloud download failed.", { cause: error });
      return Buffer.from(await data.arrayBuffer());
    },
    async getUrl(storagePath) {
      return namespace === "images"
        ? `/api/upload/image?file=${encodeURIComponent(storagePath)}`
        : `/api/audio/file?path=${encodeURIComponent(storagePath)}`;
    },
    async delete(storagePath) {
      const { error } = await bucket().remove([objectPath(storagePath)]);
      if (error) throw new Error("Cloud deletion failed.", { cause: error });
    },
  };
}
