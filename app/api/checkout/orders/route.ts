import { NextResponse } from "next/server";
import { z } from "zod";
import { createOrderInDb, listOrdersFromDb, updateOrderStatusInDb } from "@/lib/server/orders";
import type { CartItemUpsell, Order } from "@/lib/types";
import { getCheckoutSlotBlockReason } from "@/lib/server/checkout-slot-guard";
import { resolveCheckoutCart } from "@/lib/server/resolve-checkout-cart";

const upsellSchema: z.ZodType<CartItemUpsell> = z.object({
  upsellId: z.string(),
  quantity: z.number().int(),
  choiceId: z.string().optional(),
  choiceQuantities: z.record(z.string(), z.number().int()).optional(),
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
        billingCycle: z.enum(["monthly", "annual-prepaid"]).optional(),
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
});

export async function GET() {
  const orders = await listOrdersFromDb();
  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = payloadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid checkout payload", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const resolvedCart = resolveCheckoutCart(parsed.data.cart.items);
    if (!resolvedCart.ok) {
      return NextResponse.json({ error: resolvedCart.error }, { status: resolvedCart.status });
    }

    const checkoutCart: typeof resolvedCart.cart = {
      ...resolvedCart.cart,
      funnelId: parsed.data.cart.funnelId,
    };

    const slotBlockReason = await getCheckoutSlotBlockReason(checkoutCart);
    if (slotBlockReason) {
      return NextResponse.json({ error: slotBlockReason }, { status: 409 });
    }

    const order = await createOrderInDb({
      ...parsed.data,
      cart: checkoutCart,
    });
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = (await req.json()) as { orderId?: string; status?: Order["status"] };
    if (!body.orderId || !body.status) {
      return NextResponse.json({ error: "orderId and status are required." }, { status: 400 });
    }

    const order = await updateOrderStatusInDb(body.orderId, body.status);
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Failed to update order status." }, { status: 500 });
  }
}
