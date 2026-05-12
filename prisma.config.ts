import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";
import { resolve } from "node:path";

// Prisma CLI does not always inherit a shell-loaded `.env`. Load project root `.env` before reading URLs.
loadEnv({ path: resolve(process.cwd(), ".env") });

const fallbackDatabaseUrl = "postgresql://postgres:postgres@localhost:5432/postgres";

/**
 * Prisma ORM v7: `datasource.directUrl` in this file was removed. Only `url` is read here.
 * Supabase: the pooler URL (DATABASE_URL, port 6543) cannot run migrations reliably.
 * CLI commands (`migrate deploy`, `db push`, introspect) must use DIRECT_URL (db.*:5432).
 * Runtime pooling stays in `lib/prisma.ts` via process.env.DATABASE_URL.
 */
const migrateUrl =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? fallbackDatabaseUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrateUrl,
  },
});
