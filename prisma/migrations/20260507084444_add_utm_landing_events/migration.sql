-- CreateTable
CREATE TABLE "utm_landing_events" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_payload" JSONB NOT NULL,
    "dedupe_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utm_landing_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utm_landing_events_dedupe_key_key" ON "utm_landing_events"("dedupe_key");

-- CreateIndex
CREATE INDEX "utm_landing_events_created_at_idx" ON "utm_landing_events"("created_at");

-- CreateIndex
CREATE INDEX "utm_landing_events_utm_source_idx" ON "utm_landing_events"("utm_source");

-- CreateIndex
CREATE INDEX "utm_landing_events_utm_medium_idx" ON "utm_landing_events"("utm_medium");

-- CreateIndex
CREATE INDEX "utm_landing_events_utm_campaign_idx" ON "utm_landing_events"("utm_campaign");
