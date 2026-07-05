-- AlterTable
ALTER TABLE "Order" ADD COLUMN "funnel_id" TEXT;

-- CreateTable
CREATE TABLE "service_funnel_slots" (
    "funnel_id" TEXT NOT NULL,
    "slot_capacity" INTEGER NOT NULL DEFAULT 20,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_funnel_slots_pkey" PRIMARY KEY ("funnel_id")
);

-- CreateIndex
CREATE INDEX "Order_funnel_id_idx" ON "Order"("funnel_id");
