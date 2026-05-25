-- AlterTable
ALTER TABLE "Service" ADD COLUMN "slot_capacity" INTEGER NOT NULL DEFAULT 20;
ALTER TABLE "Service" ADD COLUMN "slot_adjustment" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "service_waitlist_entries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_waitlist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_waitlist_entries_created_at_idx" ON "service_waitlist_entries"("created_at" DESC);

-- CreateIndex
CREATE INDEX "service_waitlist_entries_service_id_idx" ON "service_waitlist_entries"("service_id");

-- AddForeignKey
ALTER TABLE "service_waitlist_entries" ADD CONSTRAINT "service_waitlist_entries_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
