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

function createPrismaClient() {
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

/** Bump when the schema changes so dev HMR does not reuse a stale client. */
const PRISMA_SCHEMA_CACHE_KEY = "20260805180000-add-tips-email-campaign-stages";

declare global {
  // eslint-disable-next-line no-var
  var prismaSchemaCacheKey: string | undefined;
}

/** Dev HMR can keep an old PrismaClient without newly generated models/fields. */
function getCachedPrisma(): PrismaClient | undefined {
  const cached = global.prisma;
  if (!cached) return undefined;
  if (global.prismaSchemaCacheKey !== PRISMA_SCHEMA_CACHE_KEY) {
    global.prisma = undefined;
    return undefined;
  }
  const runtime = cached as PrismaClient & {
    _runtimeDataModel?: { models?: Record<string, { fields?: Record<string, unknown> }> };
  };
  const serviceFields = runtime._runtimeDataModel?.models?.Service?.fields;
  if (serviceFields && !("slotCapacity" in serviceFields)) {
    global.prisma = undefined;
    return undefined;
  }
  if (
    !("supportChat" in cached) ||
    !("serviceWaitlistEntry" in cached) ||
    !("appSetting" in cached) ||
    !("newsletterSubscriber" in cached)
  ) {
    global.prisma = undefined;
    return undefined;
  }
  const newsletterFields = runtime._runtimeDataModel?.models?.NewsletterSubscriber?.fields;
  if (newsletterFields && !("tipsEmailStage" in newsletterFields)) {
    global.prisma = undefined;
    return undefined;
  }
  return cached;
}

export const prisma = getCachedPrisma() ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
  global.prismaPool = pool;
  global.prismaSchemaCacheKey = PRISMA_SCHEMA_CACHE_KEY;
}
