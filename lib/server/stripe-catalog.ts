import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripeServerClient } from "@/lib/server/stripe";

type BillingType = "one_time" | "monthly";

function buildCatalogLookupKey(params: {
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
    selectedOptionId: params.selectedOptionId,
    billingType: params.billingType,
    unitAmount: params.unitAmount,
    currency,
  });

  const existing = await prisma.stripeCatalogMapping.findUnique({ where: { lookupKey } });
  if (existing) return existing;

  const stripe = getStripeServerClient();
  const product = await stripe.products.create({
    name: `${params.serviceName} - ${params.selectedOptionName}`,
    metadata: {
      serviceId: params.serviceId,
      selectedOptionId: params.selectedOptionId,
      billingType: params.billingType,
    },
  });

  const priceData: Stripe.PriceCreateParams = {
    product: product.id,
    currency,
    unit_amount: params.unitAmount,
  };

  if (params.billingType === "monthly") {
    priceData.recurring = { interval: "month" };
  }

  const price = await stripe.prices.create(priceData);
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
  });

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
      stripePaymentLinkId: paymentLink.id,
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
