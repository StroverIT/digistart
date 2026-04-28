import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrderByIdFromDb } from "@/lib/server/orders";

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
