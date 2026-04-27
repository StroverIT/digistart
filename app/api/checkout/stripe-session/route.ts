import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOrderInDb, setOrderStripeSessionInDb } from "@/lib/server/orders";
import type { CartItemUpsell } from "@/lib/types";
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
});

function amountToMinorUnits(amount: number) {
  return Math.round(amount * 100);
}

function getSiteUrl(req: NextRequest) {
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envSiteUrl) return envSiteUrl.replace(/\/$/, "");

  const origin = req.headers.get("origin");
  if (origin) return origin.replace(/\/$/, "");

  return "http://localhost:3000";
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
    const parsed = payloadSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid checkout payload", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    if (parsed.data.cart.items.length === 0) {
      return NextResponse.json({ error: "Cart cannot be empty." }, { status: 400 });
    }

    for (const item of parsed.data.cart.items) {
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

    const order = await createOrderInDb(parsed.data);
    const stripe = getStripeServerClient();
    const siteUrl = getSiteUrl(req);
    const mode = parsed.data.cart.totalMonthly > 0 ? "subscription" : "payment";
    const stripeCustomer = await resolveOrCreateStripeCustomer({
      email: parsed.data.customer.email,
      name: parsed.data.customer.name,
      phone: parsed.data.customer.phone,
    });

    const uiMode = parsed.data.uiMode ?? "redirect";
    // `payment_method_collection` is only valid when the session has recurring line items
    // (subscription mode). One-time `payment` mode must omit it on API 2026-04-22.dahlia+.
    const sessionBase: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode,
      line_items: lineItems,
      customer: stripeCustomer.stripeCustomerId,
      metadata: { orderId: order.id },
      billing_address_collection: "auto",
      locale: "bg",
      ...(mode === "subscription" ? { payment_method_collection: "always" as const } : {}),
    };

    if (uiMode === "embedded") {
      sessionBase.ui_mode = "embedded_page";
      sessionBase.return_url = `${siteUrl}/checkout/success?id=${order.id}&session_id={CHECKOUT_SESSION_ID}`;
    } else {
      sessionBase.success_url = `${siteUrl}/checkout/success?id=${order.id}&session_id={CHECKOUT_SESSION_ID}`;
      sessionBase.cancel_url = `${siteUrl}/checkout`;
    }

    const session = await stripe.checkout.sessions.create(sessionBase);

    if (uiMode === "embedded" && !session.client_secret) {
      return NextResponse.json(
        { error: "Stripe embedded session has no client secret." },
        { status: 500 }
      );
    }

    if (uiMode === "redirect" && !session.url) {
      return NextResponse.json({ error: "Stripe session has no redirect URL." }, { status: 500 });
    }

    await setOrderStripeSessionInDb({
      orderId: order.id,
      checkoutSessionId: session.id,
      checkoutMode: mode,
      customerId: stripeCustomer.stripeCustomerId,
      metadata: {
        orderId: order.id,
      },
    });

    return NextResponse.json({
      checkoutUrl: session.url ?? null,
      clientSecret: session.client_secret ?? null,
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
