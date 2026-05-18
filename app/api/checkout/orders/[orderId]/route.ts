import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { trySendOrderPaidConfirmationEmails } from "@/lib/server/order-emails";
import { getStripeServerClient } from "@/lib/server/stripe";
import { applyCheckoutTemplateFromOrderMetadata } from "@/lib/server/checkout-template";
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
  const invoiceId =
    typeof session.invoice === "string" ? session.invoice : session.invoice?.id;
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
    paymentIntentId: paymentIntentId ?? invoiceId,
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
    markAsPaid: false,
  });

  if (session.payment_status === "paid") {
    const ensured = await ensureGuestUserForOrderInDb(orderId);
    const userId =
      ensured.userId ??
      (
        await prisma.order.findUnique({
          where: { id: orderId },
          select: { userId: true },
        })
      )?.userId;
    if (userId) {
      await applyCheckoutTemplateFromOrderMetadata(orderId, userId);
    }
    await prisma.order.updateMany({
      where: { id: orderId, status: { not: "paid" } },
      data: { status: "paid" },
    });
    try {
      await trySendOrderPaidConfirmationEmails(orderId);
    } catch (err) {
      console.error("checkout order POST: paid confirmation emails", err);
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
