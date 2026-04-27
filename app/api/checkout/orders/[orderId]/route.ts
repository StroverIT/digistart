import { NextResponse } from "next/server";
import { getOrderByIdFromDb } from "@/lib/server/orders";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await ctx.params;
  const order = await getOrderByIdFromDb(orderId);

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ order });
}
