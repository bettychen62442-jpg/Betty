import { StorageProvider } from "./types";
import { localStorageProvider } from "./providers/local.provider";

const providers: Record<string, () => StorageProvider> = {
  local: () => localStorageProvider,
};

export function getStorageProvider(name?: string): StorageProvider {
  const key = name || process.env.STORAGE_PROVIDER || "local";
  const factory = providers[key];
  if (!factory) {
    throw new Error(
      `Unknown storage provider: "${key}". Available: ${Object.keys(providers).join(", ")}`
    );
  }
  return factory();
}
