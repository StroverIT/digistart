import { getServiceById } from "@/lib/data/services";
import { prisma } from "@/lib/prisma";
import {
  SLOT_MANAGED_SERVICE_IDS,
  type SlotManagedServiceId,
} from "@/lib/service-slots-path";

export { SLOT_MANAGED_SERVICE_IDS, type SlotManagedServiceId };

export const DEFAULT_SLOT_CAPACITY = 20;

export interface ServiceSlotAvailability {
  serviceId: string;
  serviceName: string;
  slug: string;
  capacity: number;
  adjustment: number;
  paidCount: number;
  remaining: number;
  isSoldOut: boolean;
}

function isSlotManagedServiceId(id: string): id is SlotManagedServiceId {
  return (SLOT_MANAGED_SERVICE_IDS as readonly string[]).includes(id);
}

/** Paid Stripe checkout only — pending orders do not consume slots. */
export function paidOrderWhere() {
  return {
    OR: [
      { status: "paid" },
      { stripePaidAt: { not: null } },
      { stripePaymentStatus: "paid" },
    ],
  };
}

export async function countPaidPurchasesForService(serviceId: string): Promise<number> {
  return prisma.orderItem.count({
    where: {
      serviceId,
      order: paidOrderWhere(),
    },
  });
}

export function computeRemainingSlots(params: {
  capacity: number;
  adjustment: number;
  paidCount: number;
}): number {
  const effective = params.capacity + params.adjustment - params.paidCount;
  return Math.max(0, effective);
}

export async function getServiceSlotAvailability(
  serviceId: string,
): Promise<ServiceSlotAvailability | null> {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: {
      id: true,
      name: true,
      slug: true,
      slotCapacity: true,
      slotAdjustment: true,
    },
  });

  const fallback = getServiceById(serviceId);
  if (!isSlotManagedServiceId(serviceId) || (!service && !fallback)) {
    return null;
  }

  const paidCount = await countPaidPurchasesForService(serviceId);
  const capacity = service?.slotCapacity ?? DEFAULT_SLOT_CAPACITY;
  const adjustment = service?.slotAdjustment ?? 0;
  const remaining = computeRemainingSlots({ capacity, adjustment, paidCount });

  return {
    serviceId,
    serviceName: service?.name ?? fallback!.name,
    slug: service?.slug ?? fallback!.slug,
    capacity,
    adjustment,
    paidCount,
    remaining,
    isSoldOut: remaining <= 0,
  };
}

export async function listSlotManagedAvailabilities(): Promise<ServiceSlotAvailability[]> {
  const results: ServiceSlotAvailability[] = [];
  for (const serviceId of SLOT_MANAGED_SERVICE_IDS) {
    const row = await getServiceSlotAvailability(serviceId);
    if (row) results.push(row);
  }
  return results;
}

export async function updateServiceSlotSettings(params: {
  serviceId: string;
  slotCapacity?: number;
  slotAdjustment?: number;
}) {
  const { serviceId, slotCapacity, slotAdjustment } = params;
  if (!isSlotManagedServiceId(serviceId)) {
    throw new Error(`Service ${serviceId} is not slot-managed.`);
  }

  const data: { slotCapacity?: number; slotAdjustment?: number } = {};
  if (slotCapacity !== undefined) {
    if (!Number.isInteger(slotCapacity) || slotCapacity < 0) {
      throw new Error("slotCapacity must be a non-negative integer.");
    }
    data.slotCapacity = slotCapacity;
  }
  if (slotAdjustment !== undefined) {
    if (!Number.isInteger(slotAdjustment)) {
      throw new Error("slotAdjustment must be an integer.");
    }
    data.slotAdjustment = slotAdjustment;
  }

  return prisma.service.update({
    where: { id: serviceId },
    data,
    select: {
      id: true,
      name: true,
      slug: true,
      slotCapacity: true,
      slotAdjustment: true,
    },
  });
}

export async function createWaitlistEntry(params: {
  name: string;
  email: string;
  serviceId: string;
}) {
  if (!isSlotManagedServiceId(params.serviceId)) {
    throw new Error("Invalid service for waitlist.");
  }

  const service = await prisma.service.findUnique({
    where: { id: params.serviceId },
    select: { id: true },
  });
  if (!service) {
    throw new Error("Service not found.");
  }

  return prisma.serviceWaitlistEntry.create({
    data: {
      name: params.name.trim(),
      email: params.email.trim().toLowerCase(),
      serviceId: params.serviceId,
    },
  });
}

export async function listWaitlistEntriesNewestFirst() {
  return prisma.serviceWaitlistEntry.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      service: { select: { id: true, name: true, slug: true } },
    },
  });
}
