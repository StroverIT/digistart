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
  paidCount: number;
  remaining: number;
  isSoldOut: boolean;
}

function isSlotManagedServiceId(id: string): id is SlotManagedServiceId {
  return (SLOT_MANAGED_SERVICE_IDS as readonly string[]).includes(id);
}

function catalogServiceDbFields(serviceId: string) {
  const catalog = getServiceById(serviceId);
  if (!catalog) return null;
  return {
    id: catalog.id,
    slug: catalog.slug,
    name: catalog.name,
    shortDescription: catalog.description,
    fullDescription: catalog.description,
    icon: catalog.icon,
    basePrice: Math.round(catalog.basePrice),
    isMonthly: catalog.isMonthly ?? false,
    timeline: catalog.timeline,
    features: catalog.features,
  };
}

/** Ensures a Service row exists for FKs, waitlist, and slot settings (catalog stays in lib/data). */
export async function ensureSlotManagedServiceRow(serviceId: SlotManagedServiceId) {
  const fields = catalogServiceDbFields(serviceId);
  if (!fields) {
    throw new Error(`Service ${serviceId} is missing from catalog.`);
  }

  return prisma.service.upsert({
    where: { id: serviceId },
    create: {
      ...fields,
      slotCapacity: DEFAULT_SLOT_CAPACITY,
    },
    update: fields,
  });
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
  paidCount: number;
}): number {
  return Math.max(0, params.capacity - params.paidCount);
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
    },
  });

  const fallback = getServiceById(serviceId);
  if (!isSlotManagedServiceId(serviceId) || (!service && !fallback)) {
    return null;
  }

  const paidCount = await countPaidPurchasesForService(serviceId);
  const capacity = service?.slotCapacity ?? DEFAULT_SLOT_CAPACITY;
  const remaining = computeRemainingSlots({ capacity, paidCount });

  return {
    serviceId,
    serviceName: service?.name ?? fallback!.name,
    slug: service?.slug ?? fallback!.slug,
    capacity,
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

export async function updateServiceSlotCapacity(serviceId: string, slotCapacity: number) {
  if (!isSlotManagedServiceId(serviceId)) {
    throw new Error(`Service ${serviceId} is not slot-managed.`);
  }
  if (!Number.isInteger(slotCapacity) || slotCapacity < 0) {
    throw new Error("slotCapacity must be a non-negative integer.");
  }

  await ensureSlotManagedServiceRow(serviceId);

  return prisma.service.update({
    where: { id: serviceId },
    data: { slotCapacity },
    select: {
      id: true,
      name: true,
      slug: true,
      slotCapacity: true,
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

  await ensureSlotManagedServiceRow(params.serviceId);

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
