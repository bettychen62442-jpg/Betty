import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { readFileSync } from "node:fs";
import { getDatabaseProvider, getDatabaseUrl } from "../src/lib/database-config.mjs";

const keys = ["DATABASE_PROVIDER", "DATABASE_URL", "DIRECT_URL"];
const original = Object.fromEntries(keys.map(key => [key, process.env[key]]));
beforeEach(() => { for (const key of keys) delete process.env[key]; });
afterEach(() => {
  for (const [key, value] of Object.entries(original)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test("local development retains SQLite defaults", () => {
  assert.equal(getDatabaseProvider(), "sqlite");
  assert.match(getDatabaseUrl(), /^file:/);
});
test("a remote database URL selects PostgreSQL with verified TLS", () => {
  process.env.DATABASE_URL = "postgresql://user@database.example/postgres";
  assert.equal(getDatabaseProvider(), "postgresql");
  assert.equal(new URL(getDatabaseUrl()).searchParams.get("sslmode"), "verify-full");
  assert.equal(new URL(getDatabaseUrl(true)).searchParams.get("sslaccept"), "strict");
});
test("a separate migration URL does not replace the runtime connection", () => {
  process.env.DATABASE_PROVIDER = "postgresql";
  process.env.DATABASE_URL = "postgresql://user@runtime.example/postgres";
  process.env.DIRECT_URL = "postgresql://user@migrations.example/postgres";
  assert.equal(new URL(getDatabaseUrl()).hostname, "runtime.example");
  assert.equal(new URL(getDatabaseUrl(true)).hostname, "migrations.example");
});
test("unsupported providers fail instead of silently using a local database", () => {
  process.env.DATABASE_PROVIDER = "unknown";
  assert.throws(getDatabaseProvider, /DATABASE_PROVIDER/);
});
test("SQLite and PostgreSQL models stay identical", () => {
  const sqlite = readFileSync(new URL("../prisma/schema.prisma", import.meta.url), "utf8");
  const postgres = readFileSync(new URL("../prisma/postgres/schema.prisma", import.meta.url), "utf8");
  assert.equal(postgres.slice(postgres.indexOf("model Category")), sqlite.slice(sqlite.indexOf("model Category")));
});
