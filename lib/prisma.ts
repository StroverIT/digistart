import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  var prisma: PrismaClient | undefined;
  var prismaPool: Pool | undefined;
}

// Runtime: pooled DATABASE_URL for Supabase. Prisma CLI uses DIRECT_URL only via prisma.config.ts `datasource.url`.
const databaseUrl = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL or DIRECT_URL must be defined.");
}

const pool =
  global.prismaPool ??
  new Pool({
    connectionString: databaseUrl,
  });

const adapter = new PrismaPg(pool);

export const prisma =
  global.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
  global.prismaPool = pool;
}
