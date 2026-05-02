import { config } from "dotenv";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env.production");
const envResult = config({ path: envPath });

if (envResult.error) {
  console.error(`Failed to load environment file: ${envPath}`);
  console.error(envResult.error.message);
  process.exit(1);
}

const prismaCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const prismaArgs = ["prisma", "generate"];

const result = spawnSync(prismaCommand, prismaArgs, {
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  console.error("Failed to run prisma generate.");
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
