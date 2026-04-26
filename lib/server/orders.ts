import type { Cart, ConsultationBooking, CustomerInfo, Order } from "@/lib/types";
import { prisma } from "@/lib/prisma";

function mapOrder(order: Awaited<ReturnType<typeof prisma.order.findFirstOrThrow>>): Order {
  return {
    id: order.id,
    cart: {
      items: order.items.map((item) => ({
        id: item.id,
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        selectedOptionId: item.selectedOptionId,
        selectedOptionName: item.selectedOptionName,
        basePrice: item.basePrice,
        upsells: (item.upsells as Order["cart"]["items"][number]["upsells"]) ?? [],
        totalPrice: item.totalPrice,
        totalOneTime: item.totalOneTime,
        totalMonthly: item.totalMonthly,
        isMonthly: item.isMonthly,
      })),
      totalOneTime: order.totalOneTime,
      totalMonthly: order.totalMonthly,
    },
    customer: {
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
      company: order.customerCompany ?? undefined,
      notes: order.customerNotes ?? undefined,
    },
    consultation: order.consultation
      ? {
          id: order.consultation.id,
          date: order.consultation.date,
          time: order.consultation.time,
          source: order.consultation.source as ConsultationBooking["source"],
          status: order.consultation.status as ConsultationBooking["status"],
          orderId: order.consultation.orderId ?? undefined,
          timezone: order.consultation.timezone,
          meetUrl: order.consultation.meetUrl ?? undefined,
        }
      : undefined,
    status: order.status as Order["status"],
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export async function createOrderInDb(params: {
  cart: Cart;
  customer: CustomerInfo;
  consultationId?: string;
}) {
  const { cart, customer, consultationId } = params;
  const order = await prisma.order.create({
    data: {
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerCompany: customer.company,
      customerNotes: customer.notes,
      totalOneTime: cart.totalOneTime,
      totalMonthly: cart.totalMonthly,
      status: "pending",
      consultationId,
      items: {
        create: cart.items.map((item) => ({
          serviceId: item.serviceId,
          serviceName: item.serviceName,
          selectedOptionId: item.selectedOptionId,
          selectedOptionName: item.selectedOptionName,
          basePrice: item.basePrice,
          totalPrice: item.totalPrice,
          totalOneTime: item.totalOneTime,
          totalMonthly: item.totalMonthly,
          isMonthly: item.isMonthly ?? false,
          upsells: item.upsells,
        })),
      },
    },
    include: {
      items: true,
      consultation: true,
    },
  });

  if (consultationId) {
    await prisma.consultationBooking.update({
      where: { id: consultationId },
      data: { orderId: order.id },
    });
  }

  return mapOrder(order);
}

export async function listOrdersFromDb(): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    include: {
      items: true,
      consultation: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return orders.map(mapOrder);
}

export async function updateOrderStatusInDb(orderId: string, status: Order["status"]) {
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      items: true,
      consultation: true,
    },
  });
  return mapOrder(updated);
}
