-- CreateTable
CREATE TABLE "digital_roadmap_leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'digital-roadmap',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "digital_roadmap_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "digital_roadmap_leads_email_key" ON "digital_roadmap_leads"("email");

-- CreateIndex
CREATE INDEX "digital_roadmap_leads_created_at_idx" ON "digital_roadmap_leads"("created_at" DESC);
