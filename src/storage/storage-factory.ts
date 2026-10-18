import { StorageProvider } from "./types";
import { createLocalStorageProvider } from "./providers/local.provider";
import { createSupabaseStorageProvider } from "./providers/supabase.provider";

type Namespace = "audio" | "images";
const providers: Record<string, (namespace: Namespace) => StorageProvider> = {
  local: createLocalStorageProvider,
  supabase: createSupabaseStorageProvider,
};

export function getStorageProvider(name?: string, namespace: Namespace = "audio"): StorageProvider {
  const key = name || process.env.STORAGE_PROVIDER || "local";
  const factory = providers[key];
  if (!factory) {
    throw new Error(
      `Unknown storage provider: "${key}". Available: ${Object.keys(providers).join(", ")}`
    );
  }
  return factory(namespace);
}
