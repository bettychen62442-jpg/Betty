import { PrismaClient, $Enums } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaPg } from "@prisma/adapter-pg";
import { getDatabaseProvider, getDatabaseUrl } from "./database-config.mjs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapter = getDatabaseProvider() === "postgresql"
    ? new PrismaPg({ connectionString: getDatabaseUrl(), max: 3 })
    : new PrismaLibSql({ url: getDatabaseUrl() });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { $Enums };
