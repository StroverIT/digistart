import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import {
  createOrderInDb,
  setOrderStripeSessionInDb,
  type PendingCheckoutUser,
} from "@/lib/server/orders";
import type { CartItemUpsell } from "@/lib/types";
import { isBundlePlanServiceId } from "@/lib/server/bundle-plans";
import { getServiceByIdFromDb } from "@/lib/server/services";
import { getStripeServerClient } from "@/lib/server/stripe";
import {
  resolveOrCreateCatalogPrice,
  resolveOrCreateStripeCustomer,
} from "@/lib/server/stripe-catalog";

const upsellSchema: z.ZodType<CartItemUpsell> = z.object({
  upsellId: z.string(),
  quantity: z.number().int(),
  choiceId: z.string().optional(),
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
        planId: z.string().optional(),
      })
    ),
    totalOneTime: z.number(),
    totalMonthly: z.number(),
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
      const mapped = await resolveOrCreateCatalogPrice({
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        selectedOptionId: `${item.selectedOptionId}:one_time`,
        selectedOptionName: item.selectedOptionName,
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

    for (const item of parsed.data.cart.items) {
      if (isBundlePlanServiceId(item.serviceId)) continue;

      const service = await getServiceByIdFromDb(item.serviceId);
      if (!service) {
        return NextResponse.json(
          { error: `Service not found: ${item.serviceId}` },
          { status: 400 }
        );
      }
      const option = service.options.find((opt) => opt.id === item.selectedOptionId);
      if (!option) {
        return NextResponse.json(
          { error: `Option not found for service ${item.serviceId}` },
          { status: 400 }
        );
      }
    }

    const lineItems = await buildLineItems(parsed.data.cart.items);
    if (lineItems.length === 0) {
      return NextResponse.json({ error: "No payable line items found." }, { status: 400 });
    }

    const customerEmail = parsed.data.customer.email.toLowerCase().trim();
    const sessionUserId =
      session?.user?.id &&
      session.user.role !== "admin" &&
      session.user.email?.toLowerCase() === customerEmail
        ? session.user.id
        : null;

    let pendingUser: PendingCheckoutUser | null = null;
    let postCheckoutToken: string | null = null;

    if (!sessionUserId) {
      const pu = parsed.data.pendingUser;
      if (!pu) {
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
      cart: parsed.data.cart,
      customer: parsed.data.customer,
      consultationId: parsed.data.consultationId,
      userId: sessionUserId,
      pendingUser,
      postCheckoutToken,
      brandAssets,
    });

    const stripe = getStripeServerClient();
    const siteUrl = getSiteUrl(req);
    const mode = parsed.data.cart.totalMonthly > 0 ? "subscription" : "payment";
    const stripeCustomer = await resolveOrCreateStripeCustomer({
      email: parsed.data.customer.email,
      name: parsed.data.customer.name,
      phone: parsed.data.customer.phone,
    });

    const uiMode = parsed.data.uiMode ?? "redirect";
    const sessionBase: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode,
      line_items: lineItems,
      customer: stripeCustomer.stripeCustomerId,
      metadata: {
        orderId: order.id,
        ...(parsed.data.cart.items.find((i) => i.planId)
          ? { planId: parsed.data.cart.items.find((i) => i.planId)!.planId! }
          : {}),
        ...(purchaseAsBusiness ? { purchaseAsBusiness: "true" } : {}),
      },
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
      sessionBase.subscription_data = {
        metadata: {
          orderId: order.id,
          ...(parsed.data.cart.items.find((i) => i.planId)
            ? { planId: parsed.data.cart.items.find((i) => i.planId)!.planId! }
            : {}),
          ...(purchaseAsBusiness ? { purchaseAsBusiness: "true" } : {}),
        },
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
