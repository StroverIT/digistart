-- CreateTable
CREATE TABLE "TenantProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "productCategory" TEXT NOT NULL DEFAULT 'clothing',
    "templateId" TEXT,
    "previewSlug" TEXT,
    "setupStatus" TEXT NOT NULL DEFAULT 'draft',
    "onboardingStep" INTEGER NOT NULL DEFAULT 1,
    "businessSettings" JSONB,
    "socialSettings" JSONB,
    "gmailConnectedAt" TIMESTAMP(3),
    "gmailTokens" JSONB,
    "dbMigrationNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantProject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantProject_previewSlug_key" ON "TenantProject"("previewSlug");

-- CreateIndex
CREATE INDEX "TenantProject_userId_idx" ON "TenantProject"("userId");

-- CreateIndex
CREATE INDEX "TenantProject_orderId_idx" ON "TenantProject"("orderId");

-- AddForeignKey
ALTER TABLE "TenantProject" ADD CONSTRAINT "TenantProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
