import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripeServerClient } from "@/lib/server/stripe";
import { trySendOrderPaidConfirmationEmails } from "@/lib/server/order-emails";
import { applyCheckoutTemplateFromOrderMetadata } from "@/lib/server/checkout-template";
import {
  ensureGuestUserForOrderInDb,
  setOrderStripeSnapshotInDb,
  setOrderSubscriptionRenewsAtInDb,
} from "@/lib/server/orders";

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable.");
  }
  return secret;
}

function toIsoDate(value?: number | null) {
  if (!value) return null;
  return new Date(value * 1000);
}

function companyVatFromCheckoutSession(session: Stripe.Checkout.Session): string | null {
  const fields = session.custom_fields;
  if (!Array.isArray(fields)) return null;
  for (const field of fields) {
    if (field.key !== "companyvat") continue;
    if (field.type === "text" && field.text?.value) {
      const v = String(field.text.value).trim();
      return v.length > 0 ? v : null;
    }
  }
  return null;
}

async function provisionGuestUserFromOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      customerName: true,
      customerEmail: true,
    },
  });
  if (!order) return { guestProvisioned: false as const };

  const ensured = await ensureGuestUserForOrderInDb(orderId);
  if (ensured.guestProvisioned) {
    return {
      guestProvisioned: true as const,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
    };
  }
  return { guestProvisioned: false as const };
}

async function handleCheckoutSessionEvent(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;
  const orderRow = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true },
  });
  if (!orderRow) return;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
  const invoiceId =
    typeof session.invoice === "string" ? session.invoice : session.invoice?.id;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  const paidAt = session.payment_status === "paid" ? new Date() : null;

  const vat = companyVatFromCheckoutSession(session);
  const baseMeta =
    session.metadata && typeof session.metadata === "object"
      ? { ...(session.metadata as Record<string, string>) }
      : {};
  if (vat) baseMeta.companyVat = vat;

  await setOrderStripeSnapshotInDb({
    orderId,
    checkoutSessionId: session.id,
    paymentIntentId: paymentIntentId ?? invoiceId,
    subscriptionId,
    customerId,
    paymentStatus: session.payment_status,
    currency: session.currency,
    amountSubtotal: session.amount_subtotal,
    amountTotal: session.amount_total,
    amountTax: session.total_details?.amount_tax ?? null,
    metadata: baseMeta,
    checkoutCompletedAt: toIsoDate(session.created),
    paidAt,
    markAsPaid: session.payment_status === "paid",
  });

  if (session.payment_status === "paid") {
    await provisionGuestUserFromOrder(orderId);
    const orderUser = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true },
    });
    const userId = orderUser?.userId ?? null;
    if (userId) {
      await applyCheckoutTemplateFromOrderMetadata(orderId, userId);
    }
    if (subscriptionId) {
      try {
        const stripe = getStripeServerClient();
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const cpe = "current_period_end" in sub ? (sub as { current_period_end?: number }).current_period_end : undefined;
        const end = cpe ? new Date(cpe * 1000) : null;
        await setOrderSubscriptionRenewsAtInDb(orderId, end);
      } catch (e) {
        console.error("subscription renew cache", e);
      }
    }

    try {
      await trySendOrderPaidConfirmationEmails(orderId);
    } catch (err) {
      console.error("stripe webhook: paid confirmation emails", err);
    }
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
    }

    const stripe = getStripeServerClient();
    const webhookSecret = getWebhookSecret();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    const existing = await prisma.stripeWebhookEvent.findUnique({
      where: { stripeEventId: event.id },
    });
    if (existing) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionEvent(session);
        break;
      }
      default:
        break;
    }

    await prisma.stripeWebhookEvent.create({
      data: {
        stripeEventId: event.id,
        eventType: event.type,
        orderId:
          (event.data.object as { metadata?: { orderId?: string } }).metadata?.orderId ?? null,
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error", error);
    return NextResponse.json({ error: "Webhook handling failed." }, { status: 400 });
  }
}
