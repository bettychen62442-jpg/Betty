import { createClient } from "@supabase/supabase-js";

export function getSupabaseStorage() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY are required for cloud file storage.");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  }).storage;
}

export function getStorageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || "interview-coach";
}
