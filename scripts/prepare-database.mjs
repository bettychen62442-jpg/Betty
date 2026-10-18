import "dotenv/config";
import { mkdir, open } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { getDatabaseProvider, getDatabaseUrl } from "../src/lib/database-config.mjs";

if (getDatabaseProvider() === "postgresql") {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for PostgreSQL.");
  getDatabaseUrl(true);
} else {
  const path = fileURLToPath(new URL(getDatabaseUrl(), pathToFileURL(`${process.cwd()}/`)));
  await mkdir(dirname(path), { recursive: true });
  // Append mode never truncates existing SQLite data.
  const file = await open(path, "a", 0o600);
  await file.close();
}
