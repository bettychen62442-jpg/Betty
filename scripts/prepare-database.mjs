import "dotenv/config";
import { mkdir, open } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const databaseUrl = process.env.DATABASE_URL || `file:${process.cwd()}/dev.db`;
if (!databaseUrl.startsWith("file:")) {
  throw new Error("This deployment requires a local SQLite file URL.");
}

const path = fileURLToPath(new URL(databaseUrl, pathToFileURL(`${process.cwd()}/`)));
await mkdir(dirname(path), { recursive: true });
// Prisma can migrate an empty SQLite file; append mode never truncates existing data.
const file = await open(path, "a", 0o600);
await file.close();
