-- AlterTable
ALTER TABLE "google_free_analysis_leads" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "google_free_analysis_leads_status_idx" ON "google_free_analysis_leads"("status");
