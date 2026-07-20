-- CreateTable
CREATE TABLE "google_free_analysis_leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "google_maps_url" TEXT NOT NULL,
    "urgency" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'google-free-analysis',
    "page_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_free_analysis_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "google_free_analysis_leads_created_at_idx" ON "google_free_analysis_leads"("created_at" DESC);

-- CreateIndex
CREATE INDEX "google_free_analysis_leads_email_idx" ON "google_free_analysis_leads"("email");
