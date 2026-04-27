import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripeServerClient } from "@/lib/server/stripe";

type BillingType = "one_time" | "monthly";

function normalizeKeyPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function buildCatalogLookupKey(params: {
  serviceId: string;
  serviceName: string;
  selectedOptionId: string;
  selectedOptionName: string;
  billingType: BillingType;
  unitAmount: number;
  currency: string;
}) {
  const normalizedCurrency = params.currency.toLowerCase();
  const serviceNameKey = normalizeKeyPart(params.serviceName);
  const optionNameKey = normalizeKeyPart(params.selectedOptionName);
  return [
    "digistart",
    params.serviceId,
    serviceNameKey,
    params.selectedOptionId,
    optionNameKey,
    params.billingType,
    params.unitAmount.toString(),
    normalizedCurrency,
  ].join(":");
}

function buildLegacyLookupKey(params: {
  serviceId: string;
  selectedOptionId: string;
  billingType: BillingType;
  unitAmount: number;
  currency: string;
}) {
  const normalizedCurrency = params.currency.toLowerCase();
  return [
    params.serviceId,
    params.selectedOptionId,
    params.billingType,
    params.unitAmount.toString(),
    normalizedCurrency,
  ].join(":");
}

async function ensurePaymentLinkForPrice(priceId: string, existingPaymentLinkId?: string | null) {
  if (existingPaymentLinkId) return existingPaymentLinkId;
  const stripe = getStripeServerClient();
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [{ price: priceId, quantity: 1 }],
  });
  return paymentLink.id;
}

export async function resolveOrCreateCatalogPrice(params: {
  serviceId: string;
  serviceName: string;
  selectedOptionId: string;
  selectedOptionName: string;
  billingType: BillingType;
  unitAmount: number;
  currency?: string;
}) {
  const currency = (params.currency ?? "eur").toLowerCase();
  const lookupKey = buildCatalogLookupKey({
    serviceId: params.serviceId,
    serviceName: params.serviceName,
    selectedOptionId: params.selectedOptionId,
    selectedOptionName: params.selectedOptionName,
    billingType: params.billingType,
    unitAmount: params.unitAmount,
    currency,
  });
  const legacyLookupKey = buildLegacyLookupKey({
    serviceId: params.serviceId,
    selectedOptionId: params.selectedOptionId,
    billingType: params.billingType,
    unitAmount: params.unitAmount,
    currency,
  });

  const existing = await prisma.stripeCatalogMapping.findUnique({ where: { lookupKey } });
  if (existing) {
    const paymentLinkId = await ensurePaymentLinkForPrice(
      existing.stripePriceId,
      existing.stripePaymentLinkId
    );
    if (!existing.stripePaymentLinkId) {
      return prisma.stripeCatalogMapping.update({
        where: { id: existing.id },
        data: { stripePaymentLinkId: paymentLinkId },
      });
    }
    return existing;
  }

  const legacy = await prisma.stripeCatalogMapping.findUnique({ where: { lookupKey: legacyLookupKey } });
  if (legacy) {
    const paymentLinkId = await ensurePaymentLinkForPrice(
      legacy.stripePriceId,
      legacy.stripePaymentLinkId
    );
    return prisma.stripeCatalogMapping.update({
      where: { id: legacy.id },
      data: {
        lookupKey,
        serviceName: params.serviceName,
        selectedOptionName: params.selectedOptionName,
        stripePaymentLinkId: paymentLinkId,
      },
    });
  }

  const stripe = getStripeServerClient();
  const priceFromLookup = await stripe.prices.list({
    lookup_keys: [lookupKey],
    limit: 1,
    expand: ["data.product"],
  });

  if (priceFromLookup.data[0]) {
    const matchedPrice = priceFromLookup.data[0];
    const product =
      typeof matchedPrice.product === "string" ? matchedPrice.product : matchedPrice.product.id;
    const paymentLinkId = await ensurePaymentLinkForPrice(matchedPrice.id);
    return prisma.stripeCatalogMapping.create({
      data: {
        lookupKey,
        serviceId: params.serviceId,
        serviceName: params.serviceName,
        selectedOptionId: params.selectedOptionId,
        selectedOptionName: params.selectedOptionName,
        billingType: params.billingType,
        unitAmount: params.unitAmount,
        currency,
        stripeProductId: product,
        stripePriceId: matchedPrice.id,
        stripePaymentLinkId: paymentLinkId,
      },
    });
  }

  const existingProducts = await stripe.products.list({
    active: true,
    limit: 100,
  });
  const matchedProduct = existingProducts.data.find((product) => {
    const productName = product.name?.trim().toLowerCase();
    const expectedName = `${params.serviceName} - ${params.selectedOptionName}`.trim().toLowerCase();
    return (
      product.metadata?.serviceId === params.serviceId &&
      product.metadata?.selectedOptionId === params.selectedOptionId &&
      product.metadata?.billingType === params.billingType &&
      productName === expectedName
    );
  });

  const product = matchedProduct
    ? { id: matchedProduct.id }
    : await stripe.products.create({
        name: `${params.serviceName} - ${params.selectedOptionName}`,
        metadata: {
          serviceId: params.serviceId,
          selectedOptionId: params.selectedOptionId,
          billingType: params.billingType,
          lookupKey,
        },
      });

  const existingPrices = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 100,
  });
  const matchedPrice = existingPrices.data.find((price) => {
    const sameAmount = price.unit_amount === params.unitAmount;
    const sameCurrency = price.currency.toLowerCase() === currency;
    const recurringInterval = price.recurring?.interval;
    const expectedInterval = params.billingType === "monthly" ? "month" : undefined;
    return sameAmount && sameCurrency && recurringInterval === expectedInterval;
  });

  const priceData: Stripe.PriceCreateParams = {
    product: product.id,
    currency,
    unit_amount: params.unitAmount,
    lookup_key: lookupKey,
  };

  if (params.billingType === "monthly") {
    priceData.recurring = { interval: "month" };
  }

  const price = matchedPrice ?? (await stripe.prices.create(priceData));
  const paymentLinkId = await ensurePaymentLinkForPrice(price.id);

  return prisma.stripeCatalogMapping.create({
    data: {
      lookupKey,
      serviceId: params.serviceId,
      serviceName: params.serviceName,
      selectedOptionId: params.selectedOptionId,
      selectedOptionName: params.selectedOptionName,
      billingType: params.billingType,
      unitAmount: params.unitAmount,
      currency,
      stripeProductId: product.id,
      stripePriceId: price.id,
      stripePaymentLinkId: paymentLinkId,
    },
  });
}

export async function resolveOrCreateStripeCustomer(params: {
  email: string;
  name?: string;
  phone?: string;
}) {
  const existing = await prisma.stripeCustomerMapping.findUnique({
    where: { customerEmail: params.email },
  });
  if (existing) return existing;

  const stripe = getStripeServerClient();
  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    phone: params.phone,
  });

  return prisma.stripeCustomerMapping.create({
    data: {
      customerEmail: params.email,
      customerName: params.name,
      stripeCustomerId: customer.id,
    },
  });
}
