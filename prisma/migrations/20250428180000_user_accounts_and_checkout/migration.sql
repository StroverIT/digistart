-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "role" TEXT NOT NULL DEFAULT 'customer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AlterTable
ALTER TABLE IF EXISTS "Order" ADD COLUMN "userId" TEXT;
ALTER TABLE IF EXISTS "Order" ADD COLUMN "pendingUserEmail" TEXT;
ALTER TABLE IF EXISTS "Order" ADD COLUMN "pendingUserPasswordHash" TEXT;
ALTER TABLE IF EXISTS "Order" ADD COLUMN "pendingUserName" TEXT;
ALTER TABLE IF EXISTS "Order" ADD COLUMN "pendingUserPhone" TEXT;
ALTER TABLE IF EXISTS "Order" ADD COLUMN "pendingUserCompany" TEXT;
ALTER TABLE IF EXISTS "Order" ADD COLUMN "postCheckoutToken" TEXT;
ALTER TABLE IF EXISTS "Order" ADD COLUMN "invoiceWanted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE IF EXISTS "Order" ADD COLUMN "invoiceData" JSONB;
ALTER TABLE IF EXISTS "Order" ADD COLUMN "brandAssets" JSONB;
ALTER TABLE IF EXISTS "Order" ADD COLUMN "subscriptionRenewsAt" TIMESTAMP(3);

-- CreateIndex
DO $$
BEGIN
  IF to_regclass('"Order"') IS NOT NULL THEN
    CREATE UNIQUE INDEX IF NOT EXISTS "Order_postCheckoutToken_key" ON "Order"("postCheckoutToken");
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF to_regclass('"Order"') IS NOT NULL THEN
    ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
