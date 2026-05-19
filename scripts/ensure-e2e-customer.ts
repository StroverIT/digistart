/**
 * Ensures the Playwright logged-in customer exists in Postgres.
 * Run: E2E_CUSTOMER_PASSWORD=... npx tsx scripts/ensure-e2e-customer.ts
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { getE2eCustomerEmailForTests } from "../lib/server/email-test";

const prisma = new PrismaClient();

async function main() {
  const email = getE2eCustomerEmailForTests();
  const password = process.env.E2E_CUSTOMER_PASSWORD?.trim();
  if (!password) {
    console.error("E2E_CUSTOMER_PASSWORD is required.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      name: "E2E Test Customer",
      phone: "+359888123456",
      role: "customer",
    },
    update: {
      passwordHash,
      name: "E2E Test Customer",
      role: "customer",
    },
  });

  console.log(`E2E customer ready: ${email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
