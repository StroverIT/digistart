-- CreateTable
CREATE TABLE "ConsultationBlockedSlot" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultationBlockedSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConsultationBlockedSlot_date_idx" ON "ConsultationBlockedSlot"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ConsultationBlockedSlot_date_time_key" ON "ConsultationBlockedSlot"("date", "time");
