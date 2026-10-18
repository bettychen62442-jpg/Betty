export function getDatabaseProvider() {
  const provider = process.env.DATABASE_PROVIDER;
  if (provider && !["sqlite", "postgresql"].includes(provider)) {
    throw new Error("DATABASE_PROVIDER must be sqlite or postgresql.");
  }
  if (provider) return provider;
  return /^postgres(?:ql)?:/.test(process.env.DATABASE_URL || "") ? "postgresql" : "sqlite";
}

export function getDatabaseUrl(migration = false) {
  const provider = getDatabaseProvider();
  const value = (migration && process.env.DIRECT_URL) || process.env.DATABASE_URL;
  if (provider === "sqlite") return value || `file:${process.cwd()}/dev.db`;

  const url = new URL(value || "postgresql://localhost:5432/interview_coach");
  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("PostgreSQL requires a postgres or postgresql connection URL.");
  }
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
    url.searchParams.set("sslmode", migration ? "require" : "verify-full");
    if (migration) url.searchParams.set("sslaccept", "strict");
  }
  return url.toString();
}
