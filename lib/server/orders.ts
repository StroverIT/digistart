import type { Prisma } from "@prisma/client";
import type { Cart, ConsultationBooking, CustomerInfo, Order } from "@/lib/types";
import { prisma } from "@/lib/prisma";
import { ensureBundlePlanServiceInDb, isBundlePlanServiceId } from "@/lib/server/bundle-plans";
import { getServiceById } from "@/lib/data/services";

export type OrderWithItemsAndConsultation = Prisma.OrderGetPayload<{
  include: { items: true; consultation: true };
}>;

function mapOrder(order: OrderWithItemsAndConsultation): Order {
  return {
    id: order.id,
    userId: order.userId ?? undefined,
    cart: {
      items: order.items.map((item) => ({
        id: item.id,
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        selectedOptionId: item.selectedOptionId,
        selectedOptionName: item.selectedOptionName,
        basePrice: item.basePrice,
        upsells: (item.upsells as unknown as Order["cart"]["items"][number]["upsells"]) ?? [],
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
    brandAssets:
      order.brandAssets && typeof order.brandAssets === "object"
        ? (order.brandAssets as { logoUrl?: string | null; paletteUrl?: string | null })
        : undefined,
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
    stripe: {
      checkoutMode:
        order.stripeCheckoutMode === "payment" || order.stripeCheckoutMode === "subscription"
          ? order.stripeCheckoutMode
          : undefined,
      checkoutSessionId: order.stripeCheckoutSessionId ?? undefined,
      paymentIntentId: order.stripePaymentIntentId ?? undefined,
      subscriptionId: order.stripeSubscriptionId ?? undefined,
      customerId: order.stripeCustomerId ?? undefined,
      paymentStatus: order.stripePaymentStatus ?? undefined,
      currency: order.stripeCurrency ?? undefined,
      amountSubtotal: order.stripeAmountSubtotal ?? undefined,
      amountTotal: order.stripeAmountTotal ?? undefined,
      amountTax: order.stripeAmountTax ?? undefined,
      metadata:
        order.stripeMetadata && typeof order.stripeMetadata === "object"
          ? (order.stripeMetadata as Record<string, string>)
          : undefined,
      checkoutCompletedAt: order.stripeCheckoutCompletedAt?.toISOString(),
      paidAt: order.stripePaidAt?.toISOString(),
    },
  };
}

export type PendingCheckoutUser = {
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  company?: string;
};

/** Maps a signed-in customer session to a Prisma user id (email must match checkout). */
export async function resolveCheckoutUserId(params: {
  customerEmail: string;
  sessionEmail?: string | null;
  sessionRole?: string | null;
}): Promise<string | null> {
  const customerEmail = params.customerEmail.toLowerCase().trim();
  const sessionEmail = params.sessionEmail?.toLowerCase().trim();
  if (!sessionEmail || params.sessionRole === "admin") return null;
  if (sessionEmail !== customerEmail) return null;

  const user = await prisma.user.findUnique({
    where: { email: customerEmail },
    select: { id: true },
  });
  return user?.id ?? null;
}

async function verifiedOrderUserId(
  userId: string | null | undefined
): Promise<string | undefined> {
  if (!userId) return undefined;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  return user?.id;
}

export async function createOrderInDb(params: {
  cart: Cart;
  customer: CustomerInfo;
  consultationId?: string;
  userId?: string | null;
  pendingUser?: PendingCheckoutUser | null;
  postCheckoutToken?: string | null;
  brandAssets?: { logoUrl?: string | null; paletteUrl?: string | null } | null;
}) {
  const {
    cart,
    customer,
    consultationId,
    userId,
    pendingUser,
    postCheckoutToken,
    brandAssets,
  } = params;
  const uniqueServiceIds = Array.from(new Set(cart.items.map((item) => item.serviceId)));

  for (const serviceId of uniqueServiceIds) {
    const existing = await prisma.service.findUnique({ where: { id: serviceId } });
    if (existing) continue;

    if (isBundlePlanServiceId(serviceId)) {
      await ensureBundlePlanServiceInDb(serviceId);
      continue;
    }

    const sourceService = getServiceById(serviceId);
    if (!sourceService) {
      throw new Error(`Service ${serviceId} is missing from catalog.`);
    }

    await prisma.service.create({
      data: {
        id: sourceService.id,
        slug: sourceService.slug,
        name: sourceService.name,
        shortDescription: sourceService.description,
        fullDescription: sourceService.description,
        icon: sourceService.icon,
        basePrice: Math.round(sourceService.basePrice),
        isMonthly: sourceService.isMonthly ?? false,
        timeline: sourceService.timeline,
        features: sourceService.features,
        slotCapacity: 20,
      },
    });
  }

  const verifiedUserId = await verifiedOrderUserId(userId);

  const order = await prisma.order.create({
    data: {
      userId: verifiedUserId,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerCompany: customer.company,
      customerNotes: customer.notes,
      totalOneTime: cart.totalOneTime,
      totalMonthly: cart.totalMonthly,
      status: "pending",
      consultationId,
      pendingUserEmail: pendingUser?.email,
      pendingUserPasswordHash: pendingUser?.passwordHash,
      pendingUserName: pendingUser?.name,
      pendingUserPhone: pendingUser?.phone,
      pendingUserCompany: pendingUser?.company,
      postCheckoutToken: postCheckoutToken ?? undefined,
      brandAssets: brandAssets ?? undefined,
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
          upsells: item.upsells as object,
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

  return mapOrder(order as OrderWithItemsAndConsultation);
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

export async function getOrderByIdFromDb(orderId: string): Promise<Order | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      consultation: true,
    },
  });
  return order ? mapOrder(order) : null;
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

export async function setOrderStripeSessionInDb(params: {
  orderId: string;
  checkoutSessionId: string;
  checkoutMode: "payment" | "subscription";
  paymentIntentId?: string | null;
  subscriptionId?: string | null;
  customerId?: string | null;
  paymentStatus?: string | null;
  metadata?: Record<string, string>;
}) {
  const updated = await prisma.order.update({
    where: { id: params.orderId },
    data: {
      stripeCheckoutSessionId: params.checkoutSessionId,
      stripeCheckoutMode: params.checkoutMode,
      stripePaymentIntentId: params.paymentIntentId ?? undefined,
      stripeSubscriptionId: params.subscriptionId ?? undefined,
      stripeCustomerId: params.customerId ?? undefined,
      stripePaymentStatus: params.paymentStatus ?? undefined,
      stripeMetadata: params.metadata ?? undefined,
    },
    include: { items: true, consultation: true },
  });
  return mapOrder(updated);
}

export async function setOrderStripeSnapshotInDb(params: {
  orderId: string;
  checkoutSessionId?: string | null;
  paymentIntentId?: string | null;
  subscriptionId?: string | null;
  customerId?: string | null;
  paymentStatus?: string | null;
  currency?: string | null;
  amountSubtotal?: number | null;
  amountTotal?: number | null;
  amountTax?: number | null;
  metadata?: Record<string, string>;
  checkoutCompletedAt?: Date | null;
  paidAt?: Date | null;
  markAsPaid?: boolean;
}) {
  const updated = await prisma.order.update({
    where: { id: params.orderId },
    data: {
      stripeCheckoutSessionId: params.checkoutSessionId ?? undefined,
      stripePaymentIntentId: params.paymentIntentId ?? undefined,
      stripeSubscriptionId: params.subscriptionId ?? undefined,
      stripeCustomerId: params.customerId ?? undefined,
      stripePaymentStatus: params.paymentStatus ?? undefined,
      stripeCurrency: params.currency ?? undefined,
      stripeAmountSubtotal: params.amountSubtotal ?? undefined,
      stripeAmountTotal: params.amountTotal ?? undefined,
      stripeAmountTax: params.amountTax ?? undefined,
      stripeMetadata: params.metadata ?? undefined,
      stripeCheckoutCompletedAt: params.checkoutCompletedAt ?? undefined,
      stripePaidAt: params.paidAt ?? undefined,
      status: params.markAsPaid ? "paid" : undefined,
    },
    include: { items: true, consultation: true },
  });

  return mapOrder(updated);
}

export async function linkOrderToUserInDb(orderId: string, userId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      userId,
      pendingUserEmail: null,
      pendingUserPasswordHash: null,
      pendingUserName: null,
      pendingUserPhone: null,
      pendingUserCompany: null,
    },
  });
}

export async function clearPostCheckoutTokenInDb(orderId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { postCheckoutToken: null },
  });
}

export async function updateOrderBrandAssetsInDb(
  orderId: string,
  brandAssets: { logoUrl?: string | null; paletteUrl?: string | null }
) {
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { brandAssets },
    include: { items: true, consultation: true },
  });
  return mapOrder(updated);
}

export async function setOrderSubscriptionRenewsAtInDb(
  orderId: string,
  subscriptionRenewsAt: Date | null
) {
  await prisma.order.update({
    where: { id: orderId },
    data: { subscriptionRenewsAt },
  });
}

export async function ensureGuestUserForOrderInDb(orderId: string): Promise<{
  guestProvisioned: boolean;
  userId: string | null;
}> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      userId: true,
      pendingUserEmail: true,
      pendingUserPasswordHash: true,
      pendingUserName: true,
      pendingUserPhone: true,
      pendingUserCompany: true,
    },
  });

  if (!order) {
    return { guestProvisioned: false, userId: null };
  }

  if (order.userId) {
    return { guestProvisioned: false, userId: order.userId };
  }

  if (!order.pendingUserEmail || !order.pendingUserPasswordHash) {
    return { guestProvisioned: false, userId: null };
  }

  const existing = await prisma.user.findUnique({
    where: { email: order.pendingUserEmail },
    select: { id: true },
  });

  if (existing) {
    await linkOrderToUserInDb(orderId, existing.id);
    return { guestProvisioned: true, userId: existing.id };
  }

  const created = await prisma.user.create({
    data: {
      email: order.pendingUserEmail,
      passwordHash: order.pendingUserPasswordHash,
      name: order.pendingUserName,
      phone: order.pendingUserPhone,
      company: order.pendingUserCompany,
      role: "customer",
    },
    select: { id: true },
  });

  await linkOrderToUserInDb(orderId, created.id);
  return { guestProvisioned: true, userId: created.id };
}
