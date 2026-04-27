import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripeServerClient } from "@/lib/server/stripe";
import { setOrderStripeSnapshotInDb } from "@/lib/server/orders";

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

async function handleCheckoutSessionEvent(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  const paidAt = session.payment_status === "paid" ? new Date() : null;

  await setOrderStripeSnapshotInDb({
    orderId,
    checkoutSessionId: session.id,
    paymentIntentId,
    subscriptionId,
    customerId,
    paymentStatus: session.payment_status,
    currency: session.currency,
    amountSubtotal: session.amount_subtotal,
    amountTotal: session.amount_total,
    amountTax: session.total_details?.amount_tax ?? null,
    metadata: session.metadata ?? {},
    checkoutCompletedAt: toIsoDate(session.created),
    paidAt,
    markAsPaid: session.payment_status === "paid",
  });
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
