-- Remove checkout company-invoice fields (no longer used).
ALTER TABLE "Order" DROP COLUMN IF EXISTS "invoiceWanted";
ALTER TABLE "Order" DROP COLUMN IF EXISTS "invoiceData";
