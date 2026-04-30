-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "fullDescription" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "isMonthly" BOOLEAN NOT NULL DEFAULT false,
    "timeline" TEXT NOT NULL,
    "features" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceOption" (
    "id" TEXT NOT NULL,
    "optionKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "isMonthly" BOOLEAN NOT NULL DEFAULT false,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "ServiceOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceUpsell" (
    "id" TEXT NOT NULL,
    "upsellKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "kind" TEXT,
    "unit" TEXT,
    "pricePerUnit" INTEGER,
    "isMonthly" BOOLEAN NOT NULL DEFAULT false,
    "min" INTEGER,
    "max" INTEGER,
    "defaultValue" INTEGER,
    "helperText" TEXT,
    "includedUnits" INTEGER,
    "tierStep" INTEGER,
    "tierPrice" INTEGER,
    "allowEntries" BOOLEAN NOT NULL DEFAULT false,
    "entryLabel" TEXT,
    "entryPlaceholder" TEXT,
    "choices" JSONB,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "ServiceUpsell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerCompany" TEXT,
    "customerNotes" TEXT,
    "totalOneTime" INTEGER NOT NULL,
    "totalMonthly" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "consultationId" TEXT,
    "pendingUserEmail" TEXT,
    "pendingUserPasswordHash" TEXT,
    "pendingUserName" TEXT,
    "pendingUserPhone" TEXT,
    "pendingUserCompany" TEXT,
    "postCheckoutToken" TEXT,
    "invoiceWanted" BOOLEAN NOT NULL DEFAULT false,
    "invoiceData" JSONB,
    "brandAssets" JSONB,
    "subscriptionRenewsAt" TIMESTAMP(3),
    "stripeCheckoutMode" TEXT,
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "stripePaymentStatus" TEXT,
    "stripeCurrency" TEXT,
    "stripeAmountSubtotal" INTEGER,
    "stripeAmountTotal" INTEGER,
    "stripeAmountTax" INTEGER,
    "stripeMetadata" JSONB,
    "stripeCheckoutCompletedAt" TIMESTAMP(3),
    "stripePaidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "selectedOptionId" TEXT NOT NULL,
    "selectedOptionName" TEXT NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "totalOneTime" INTEGER NOT NULL,
    "totalMonthly" INTEGER NOT NULL,
    "isMonthly" BOOLEAN NOT NULL DEFAULT false,
    "upsells" JSONB NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultationBooking" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT,
    "notes" TEXT,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "orderId" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Sofia',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "meetUrl" TEXT,
    "googleEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultationBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeCatalogMapping" (
    "id" TEXT NOT NULL,
    "lookupKey" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "selectedOptionId" TEXT NOT NULL,
    "selectedOptionName" TEXT NOT NULL,
    "billingType" TEXT NOT NULL,
    "unitAmount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'eur',
    "stripeProductId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "stripePaymentLinkId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StripeCatalogMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeCustomerMapping" (
    "id" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "stripeCustomerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StripeCustomerMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeWebhookEvent" (
    "id" TEXT NOT NULL,
    "stripeEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "orderId" TEXT,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceOption_serviceId_optionKey_key" ON "ServiceOption"("serviceId", "optionKey");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceUpsell_serviceId_upsellKey_key" ON "ServiceUpsell"("serviceId", "upsellKey");

-- CreateIndex
CREATE UNIQUE INDEX "Order_consultationId_key" ON "Order"("consultationId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_postCheckoutToken_key" ON "Order"("postCheckoutToken");

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripeCheckoutSessionId_key" ON "Order"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeCatalogMapping_lookupKey_key" ON "StripeCatalogMapping"("lookupKey");

-- CreateIndex
CREATE UNIQUE INDEX "StripeCustomerMapping_customerEmail_key" ON "StripeCustomerMapping"("customerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "StripeCustomerMapping_stripeCustomerId_key" ON "StripeCustomerMapping"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeWebhookEvent_stripeEventId_key" ON "StripeWebhookEvent"("stripeEventId");

-- AddForeignKey
ALTER TABLE "ServiceOption" ADD CONSTRAINT "ServiceOption_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceUpsell" ADD CONSTRAINT "ServiceUpsell_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "ConsultationBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
