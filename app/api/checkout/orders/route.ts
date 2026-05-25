import { NextResponse } from "next/server";
import { z } from "zod";
import { createOrderInDb, listOrdersFromDb, updateOrderStatusInDb } from "@/lib/server/orders";
import type { CartItemUpsell, Order } from "@/lib/types";
import { getServiceById } from "@/lib/data/services";
import { getServiceSlotAvailability } from "@/lib/server/service-slots";

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

    for (const item of parsed.data.cart.items) {
      const service = getServiceById(item.serviceId);
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

      const availability = await getServiceSlotAvailability(item.serviceId);
      if (availability?.isSoldOut) {
        return NextResponse.json(
          {
            error: `Няма свободни места за ${availability.serviceName}. Запишете се в waitlist.`,
          },
          { status: 409 },
        );
      }
    }

    const order = await createOrderInDb(parsed.data);
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
