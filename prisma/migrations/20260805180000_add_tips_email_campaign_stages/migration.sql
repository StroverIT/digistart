-- AlterTable
ALTER TABLE "newsletter_subscribers" ADD COLUMN "tips_email_stage" INTEGER;
ALTER TABLE "newsletter_subscribers" ADD COLUMN "tips_last_email_sent_at" TIMESTAMP(3);

-- Backfill existing three-free-tips subscribers to stage 1
UPDATE "newsletter_subscribers"
SET "tips_email_stage" = 1
WHERE "tips_email_stage" IS NULL
  AND (
    "source" = 'three-free-tips'
    OR (
      "metadata" IS NOT NULL
      AND "metadata" ? 'threeFreeTipsAt'
    )
  );
