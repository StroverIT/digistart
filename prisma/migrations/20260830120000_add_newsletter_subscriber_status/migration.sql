-- AlterTable
ALTER TABLE "newsletter_subscribers" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'subscribed';
ALTER TABLE "newsletter_subscribers" ADD COLUMN "unsubscribed_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "newsletter_subscribers_status_idx" ON "newsletter_subscribers"("status");
