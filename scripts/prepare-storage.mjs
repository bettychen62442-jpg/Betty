import "dotenv/config";
import { getSupabaseStorage, getStorageBucket } from "../src/storage/supabase-client.mjs";

if (process.env.STORAGE_PROVIDER === "supabase") {
  const storage = getSupabaseStorage();
  const bucket = getStorageBucket();
  const { data, error } = await storage.listBuckets();
  if (error) throw new Error("Unable to check cloud storage credentials.", { cause: error });
  const existing = data.find(item => item.id === bucket);
  if (existing?.public) throw new Error("The interview storage bucket must be private.");
  if (!existing) {
    const created = await storage.createBucket(bucket, { public: false });
    if (created.error) throw new Error("Unable to create the private storage bucket.", { cause: created.error });
  }
}
