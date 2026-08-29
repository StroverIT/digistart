-- CreateTable
CREATE TABLE "google_analysis_3_tips_leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "google_maps_url" TEXT NOT NULL,
    "urgency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "source" TEXT NOT NULL DEFAULT 'analysis-3-tips',
    "page_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_analysis_3_tips_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "google_analysis_3_tips_leads_created_at_idx" ON "google_analysis_3_tips_leads"("created_at" DESC);

-- CreateIndex
CREATE INDEX "google_analysis_3_tips_leads_email_idx" ON "google_analysis_3_tips_leads"("email");

-- CreateIndex
CREATE INDEX "google_analysis_3_tips_leads_status_idx" ON "google_analysis_3_tips_leads"("status");
