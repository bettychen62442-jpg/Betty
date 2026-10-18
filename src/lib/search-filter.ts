import { getDatabaseProvider } from "./database-config.mjs";

export function containsText(value: string) {
  return getDatabaseProvider() === "postgresql"
    ? { contains: value, mode: "insensitive" as const }
    : { contains: value };
}
