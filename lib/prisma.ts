import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  var prisma: PrismaClient | undefined;
  var prismaPool: Pool | undefined;
}

// Runtime: prefer pooled DATABASE_URL when both exist (Supabase). Migrations use DIRECT_URL via prisma.config.ts only.
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
