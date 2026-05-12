-- Idempotency for paid-order customer + admin notification emails
ALTER TABLE "Order" ADD COLUMN "paidConfirmationEmailsSentAt" TIMESTAMP(3);
