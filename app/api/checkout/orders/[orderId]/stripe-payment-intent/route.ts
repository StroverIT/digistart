import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getOrderByIdFromDb } from "@/lib/server/orders";
import { getStripeServerClient } from "@/lib/server/stripe";

function extractPaymentIntentIdFromUnknown(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "id" in value) {
    const candidate = (value as { id?: unknown }).id;
    return typeof candidate === "string" ? candidate : null;
  }
  return null;
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await ctx.params;
  const order = await getOrderByIdFromDb(orderId);

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.stripe?.paymentIntentId) {
    return NextResponse.json({ paymentIntentId: order.stripe.paymentIntentId });
  }

  const checkoutSessionId = order.stripe?.checkoutSessionId;
  const subscriptionId = order.stripe?.subscriptionId;

  if (!checkoutSessionId && !subscriptionId) {
    return NextResponse.json({ paymentIntentId: null });
  }

  const stripe = getStripeServerClient();

  let paymentIntentId: string | null = null;
  let fallbackInvoiceId: string | null = null;

  try {
    let sessionInvoiceId: string | null = null;
    let sessionPaymentStatus: string | null = null;
    let sessionMode: string | null = null;

    if (checkoutSessionId) {
      const session = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
        expand: ["payment_intent", "invoice"],
      });
      paymentIntentId = extractPaymentIntentIdFromUnknown(session.payment_intent);
      sessionPaymentStatus = session.payment_status ?? null;
      sessionMode = session.mode ?? null;
      sessionInvoiceId =
        typeof session.invoice === "string"
          ? session.invoice
          : session.invoice?.id ?? null;
      fallbackInvoiceId = sessionInvoiceId;

    }

    if (!paymentIntentId && subscriptionId) {
      const subscription = (await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ["latest_invoice.payment_intent"],
      })) as Stripe.Subscription & {
        latest_invoice?: Stripe.Invoice | null;
      };
      const latestInvoice = subscription.latest_invoice as
        | (Stripe.Invoice & { payment_intent?: unknown; charge?: unknown })
        | null
        | undefined;
      paymentIntentId = extractPaymentIntentIdFromUnknown(latestInvoice?.payment_intent);
      if (!fallbackInvoiceId) {
        fallbackInvoiceId = latestInvoice?.id ?? null;
      }

    }

    return NextResponse.json({ paymentIntentId: paymentIntentId ?? fallbackInvoiceId });
  } catch {
    return NextResponse.json({ paymentIntentId: null }, { status: 200 });
  }
}
