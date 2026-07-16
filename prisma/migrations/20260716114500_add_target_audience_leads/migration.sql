-- CreateTable
CREATE TABLE "target_audience_leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "website" TEXT,
    "company" TEXT NOT NULL,
    "urgency" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'target-audiences',
    "pagePath" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "target_audience_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "target_audience_leads_created_at_idx" ON "target_audience_leads"("created_at" DESC);

-- CreateIndex
CREATE INDEX "target_audience_leads_email_idx" ON "target_audience_leads"("email");
