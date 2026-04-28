import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendGuestOrderSuccessEmails } from "@/lib/server/order-emails";
import { getStripeServerClient } from "@/lib/server/stripe";
import {
  ensureGuestUserForOrderInDb,
  getOrderByIdFromDb,
  setOrderStripeSnapshotInDb,
} from "@/lib/server/orders";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await ctx.params;
  const order = await getOrderByIdFromDb(orderId);

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (sessionId) {
    const row = await prisma.order.findUnique({
      where: { id: orderId },
      select: { stripeCheckoutSessionId: true, postCheckoutToken: true },
    });
    if (
      row?.stripeCheckoutSessionId === sessionId &&
      row.postCheckoutToken
    ) {
      return NextResponse.json({
        order: { ...order, postCheckoutToken: row.postCheckoutToken },
      });
    }
  }

  return NextResponse.json({ order });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as { session_id?: string };
  const sessionId = body.session_id?.trim();

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id." }, { status: 400 });
  }

  const row = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      customerName: true,
      customerEmail: true,
      stripeCheckoutSessionId: true,
      postCheckoutToken: true,
    },
  });
  if (!row) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (row.stripeCheckoutSessionId !== sessionId) {
    return NextResponse.json({ error: "Session does not match order." }, { status: 403 });
  }

  const stripe = getStripeServerClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

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
    checkoutCompletedAt: new Date(session.created * 1000),
    paidAt,
    markAsPaid: session.payment_status === "paid",
  });

  if (session.payment_status === "paid") {
    const ensured = await ensureGuestUserForOrderInDb(orderId);
    if (ensured.guestProvisioned) {
      await sendGuestOrderSuccessEmails({
        orderId,
        customerName: row.customerName,
        customerEmail: row.customerEmail,
      }).catch(() => undefined);
    }
  }

  const order = await getOrderByIdFromDb(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const tokenRow = await prisma.order.findUnique({
    where: { id: orderId },
    select: { postCheckoutToken: true },
  });

  return NextResponse.json({
    order: {
      ...order,
      postCheckoutToken: tokenRow?.postCheckoutToken ?? undefined,
    },
  });
}
