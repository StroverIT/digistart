import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import bcrypt from "bcryptjs";
import type Stripe from "stripe";
import { authOptions } from "@/lib/auth";
import {
  createOrderInDb,
  resolveCheckoutUserId,
  setOrderStripeSessionInDb,
  type PendingCheckoutUser,
} from "@/lib/server/orders";
import type { CartItemUpsell } from "@/lib/types";
import { getCheckoutSlotBlockReason } from "@/lib/server/checkout-slot-guard";
import { getStripeServerClient } from "@/lib/server/stripe";
import {
  cartQualifiesForOnlineStoreTrial,
  ONLINE_STORE_TRIAL_DAYS,
} from "@/lib/server/online-store-trial";
import {
  resolveOrCreateCatalogPrice,
  resolveOrCreateStripeCustomer,
} from "@/lib/server/stripe-catalog";
import { isAdminCheckoutRole } from "@/lib/pricing/admin-checkout-pricing";
import { resolveCheckoutCart } from "@/lib/server/resolve-checkout-cart";

const upsellSchema: z.ZodType<CartItemUpsell> = z.object({
  upsellId: z.string(),
  quantity: z.number().int(),
  choiceId: z.string().optional(),
  choiceQuantities: z.record(z.string(), z.number().int()).optional(),
  entries: z.array(z.string()).optional(),
  note: z.string().optional(),
});

const pendingUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  phone: z.string().min(6),
  company: z.string().optional(),
});

const brandAssetsSchema = z.object({
  logoUrl: z.string().url().optional().nullable(),
  paletteUrl: z.string().url().optional().nullable(),
});

const selectedTemplateSchema = z.object({
  productCategory: z.string().min(1),
  templateId: z.string().min(1),
});

const payloadSchema = z.object({
  cart: z.object({
    items: z.array(
      z.object({
        id: z.string(),
        serviceId: z.string(),
        serviceName: z.string(),
        selectedOptionId: z.string(),
        selectedOptionName: z.string(),
        basePrice: z.number(),
        upsells: z.array(upsellSchema),
        totalPrice: z.number(),
        totalOneTime: z.number(),
        totalMonthly: z.number(),
        isMonthly: z.boolean().optional(),
        billingCycle: z.enum(["monthly", "annual-prepaid"]).optional(),
        annualPrepaySubtotal: z.number().optional(),
        annualDiscountAmount: z.number().optional(),
        annualDiscountRate: z.number().optional(),
        planId: z.string().optional(),
      })
    ),
    totalOneTime: z.number(),
    totalMonthly: z.number(),
    funnelId: z.string().optional(),
  }),
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(6),
    company: z.string().optional(),
    notes: z.string().optional(),
  }),
  consultationId: z.string().optional(),
  uiMode: z.enum(["redirect", "embedded"]).optional(),
  pendingUser: pendingUserSchema.optional(),
  brandAssets: brandAssetsSchema.optional(),
  selectedTemplate: selectedTemplateSchema.optional(),
  purchaseAsBusiness: z.boolean().optional(),
});

function amountToMinorUnits(amount: number) {
  return Math.round(amount * 100);
}

function extractStripeId(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    return typeof id === "string" ? id : null;
  }
  return null;
}

async function buildLineItems(
  items: z.infer<typeof payloadSchema>["cart"]["items"]
): Promise<Array<{ price: string; quantity: number }>> {
  const lineItems: Array<{ price: string; quantity: number }> = [];

  for (const item of items) {
    if (item.totalOneTime > 0) {
      const isAnnualPrepaid = item.billingCycle === "annual-prepaid";
      const mapped = await resolveOrCreateCatalogPrice({
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        selectedOptionId: isAnnualPrepaid
          ? `${item.selectedOptionId}:annual_prepaid`
          : `${item.selectedOptionId}:one_time`,
        selectedOptionName: isAnnualPrepaid
          ? `${item.selectedOptionName} (Annual prepaid)`
          : item.selectedOptionName,
        billingType: "one_time",
        unitAmount: amountToMinorUnits(item.totalOneTime),
      });
      lineItems.push({
        quantity: 1,
        price: mapped.stripePriceId,
      });
    }

    if (item.totalMonthly > 0) {
      const mapped = await resolveOrCreateCatalogPrice({
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        selectedOptionId: `${item.selectedOptionId}:monthly`,
        selectedOptionName: `${item.selectedOptionName} (Monthly)`,
        billingType: "monthly",
        unitAmount: amountToMinorUnits(item.totalMonthly),
      });
      lineItems.push({
        quantity: 1,
        price: mapped.stripePriceId,
      });
    }
  }

  return lineItems;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const rawBody = await req.json();
    const parsed = payloadSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid checkout payload", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const purchaseAsBusiness = parsed.data.purchaseAsBusiness === true;
    const companyTrimmed = parsed.data.customer.company?.trim() ?? "";
    if (purchaseAsBusiness && companyTrimmed.length < 2) {
      return NextResponse.json(
        { error: "При закупуване като фирма въведете име на фирмата (поне 2 символа)." },
        { status: 400 }
      );
    }

    if (parsed.data.cart.items.length === 0) {
      return NextResponse.json({ error: "Cart cannot be empty." }, { status: 400 });
    }

    const isAdminCheckout = isAdminCheckoutRole(session?.user?.role);
    const resolvedCart = resolveCheckoutCart(parsed.data.cart.items, { isAdminCheckout });
    if (!resolvedCart.ok) {
      return NextResponse.json({ error: resolvedCart.error }, { status: resolvedCart.status });
    }
    const checkoutCart = resolvedCart.cart;
    checkoutCart.funnelId = parsed.data.cart.funnelId;

    const slotBlockReason = await getCheckoutSlotBlockReason(checkoutCart);
    if (slotBlockReason) {
      return NextResponse.json({ error: slotBlockReason }, { status: 409 });
    }

    const lineItems = await buildLineItems(checkoutCart.items);
    if (lineItems.length === 0) {
      return NextResponse.json({ error: "No payable line items found." }, { status: 400 });
    }

    const customerEmail = parsed.data.customer.email.toLowerCase().trim();
    const isSessionCustomerForEmail =
      session?.user?.email?.toLowerCase() === customerEmail &&
      session.user.role !== "admin";
    const sessionUserId = await resolveCheckoutUserId({
      customerEmail,
      sessionEmail: session?.user?.email,
      sessionRole: session?.user?.role,
    });

    let pendingUser: PendingCheckoutUser | null = null;
    let postCheckoutToken: string | null = null;

    if (!sessionUserId && !isAdminCheckout) {
      const pu = parsed.data.pendingUser;
      if (!pu) {
        if (isSessionCustomerForEmail) {
          return NextResponse.json(
            {
              error:
                "Акаунтът не е намерен в системата. Моля, излезте и влезте отново, или създайте нов акаунт.",
            },
            { status: 401 }
          );
        }
        return NextResponse.json(
          { error: "Липсват данни за акаунт или влезте в профила си." },
          { status: 400 }
        );
      }
      if (pu.email.toLowerCase().trim() !== customerEmail) {
        return NextResponse.json(
          { error: "Имейлът за акаунт трябва да съвпада с имейла за контакт." },
          { status: 400 }
        );
      }
      const passwordHash = await bcrypt.hash(pu.password, 12);
      pendingUser = {
        email: customerEmail,
        passwordHash,
        name: pu.name.trim(),
        phone: pu.phone.trim(),
        company: pu.company?.trim(),
      };
      postCheckoutToken = randomBytes(32).toString("hex");
    }

    const brandAssets = parsed.data.brandAssets
      ? {
          logoUrl: parsed.data.brandAssets.logoUrl ?? undefined,
          paletteUrl: parsed.data.brandAssets.paletteUrl ?? undefined,
        }
      : null;

    const order = await createOrderInDb({
      cart: checkoutCart,
      customer: parsed.data.customer,
      consultationId: parsed.data.consultationId,
      userId: sessionUserId,
      pendingUser,
      postCheckoutToken,
      brandAssets,
    });

    const stripe = getStripeServerClient();
    const siteUrl = getSiteUrl(req);
    const mode =
      isAdminCheckout || checkoutCart.totalMonthly <= 0 ? "payment" : "subscription";
    const stripeCustomer = await resolveOrCreateStripeCustomer({
      email: parsed.data.customer.email,
      name: parsed.data.customer.name,
      phone: parsed.data.customer.phone,
    });

    const selectedTemplate = parsed.data.selectedTemplate;
    const planItem = parsed.data.cart.items.find((i) => i.planId);
    const checkoutMetadata: Stripe.MetadataParam = {
      orderId: order.id,
      ...(selectedTemplate
        ? {
            templateCategory: selectedTemplate.productCategory,
            templateId: selectedTemplate.templateId,
          }
        : {}),
      ...(planItem?.planId ? { planId: planItem.planId } : {}),
      ...(purchaseAsBusiness ? { purchaseAsBusiness: "true" } : {}),
      ...(isAdminCheckout ? { adminCheckout: "true" } : {}),
    };

    const uiMode = parsed.data.uiMode ?? "redirect";
    const sessionBase: Stripe.Checkout.SessionCreateParams = {
      mode,
      line_items: lineItems,
      customer: stripeCustomer.stripeCustomerId,
      metadata: checkoutMetadata,
      // Tax ID collection is often hidden (e.g. Customer already has a tax ID, or Stripe UI
      // heuristics). Custom fields always render in embedded Checkout for collectable VAT.
      billing_address_collection: purchaseAsBusiness ? "required" : "auto",
      locale: "bg",
      ...(purchaseAsBusiness
        ? {
            custom_fields: [
              {
                key: "companyvat",
                label: { type: "custom", custom: "VAT / ДДС номер (фирма)" },
                type: "text",
                text: { minimum_length: 4, maximum_length: 32 },
                optional: false,
              },
            ],
          }
        : {}),
      ...(mode === "subscription" ? { payment_method_collection: "always" as const } : {}),
    };

    if (mode === "subscription") {
      const applyStoreTrial = cartQualifiesForOnlineStoreTrial(parsed.data.cart.items);
      sessionBase.subscription_data = {
        metadata: {
          ...checkoutMetadata,
          ...(applyStoreTrial ? { trialDays: String(ONLINE_STORE_TRIAL_DAYS) } : {}),
        },
        ...(applyStoreTrial ? { trial_period_days: ONLINE_STORE_TRIAL_DAYS } : {}),
      };
    }

    if (uiMode === "embedded") {
      sessionBase.ui_mode = "embedded_page";
      sessionBase.return_url = `${siteUrl}/checkout/success?id=${order.id}&session_id={CHECKOUT_SESSION_ID}`;
    } else {
      sessionBase.success_url = `${siteUrl}/checkout/success?id=${order.id}&session_id={CHECKOUT_SESSION_ID}`;
      sessionBase.cancel_url = `${siteUrl}/checkout`;
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      ...sessionBase,
      expand: ["payment_intent", "subscription.latest_invoice.payment_intent"],
    });

    const directPaymentIntentId = extractStripeId(checkoutSession.payment_intent);
    const subscriptionId = extractStripeId(checkoutSession.subscription);
    const expandedSubscription =
      typeof checkoutSession.subscription === "object" && checkoutSession.subscription
        ? checkoutSession.subscription
        : null;
    const subscriptionPaymentIntentId =
      expandedSubscription && typeof expandedSubscription === "object"
        ? extractStripeId(
            (expandedSubscription as { latest_invoice?: { payment_intent?: unknown } | null })
              .latest_invoice?.payment_intent
          )
        : null;
    const invoiceId = extractStripeId(checkoutSession.invoice);
    const paymentIntentId = directPaymentIntentId ?? subscriptionPaymentIntentId ?? invoiceId;

    if (uiMode === "embedded" && !checkoutSession.client_secret) {
      return NextResponse.json(
        { error: "Stripe embedded session has no client secret." },
        { status: 500 }
      );
    }

    if (uiMode === "redirect" && !checkoutSession.url) {
      return NextResponse.json({ error: "Stripe session has no redirect URL." }, { status: 500 });
    }

    await setOrderStripeSessionInDb({
      orderId: order.id,
      checkoutSessionId: checkoutSession.id,
      checkoutMode: mode,
      paymentIntentId,
      subscriptionId,
      customerId: stripeCustomer.stripeCustomerId,
      paymentStatus: checkoutSession.payment_status ?? null,
      metadata: {
        orderId: order.id,
      },
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.url ?? null,
      clientSecret: checkoutSession.client_secret ?? null,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Stripe checkout session error", error);
    return NextResponse.json(
      { error: "Failed to create Stripe checkout session." },
      { status: 500 }
    );
  }
}

function getSiteUrl(req: NextRequest) {
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envSiteUrl) return envSiteUrl.replace(/\/$/, "");

  const origin = req.headers.get("origin");
  if (origin) return origin.replace(/\/$/, "");

  return "http://localhost:3000";
}
