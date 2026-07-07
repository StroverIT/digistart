import { getFunnelById, SERVICE_FUNNELS, isReadyStoreV2Funnel } from "@/config/service-funnels";
import { getServiceById } from "@/lib/data/services";
import { prisma } from "@/lib/prisma";
import { computeRemainingSlots, paidOrderWhere } from "@/lib/server/service-slots";

export const DEFAULT_FUNNEL_SLOT_CAPACITY = 20;

export interface FunnelSlotAvailability {
  funnelId: string;
  adminLabel: string;
  pagePath: string;
  serviceId: string;
  serviceName: string;
  capacity: number;
  paidCount: number;
  remaining: number;
  isSoldOut: boolean;
}

export function isKnownFunnelId(funnelId: string): boolean {
  return SERVICE_FUNNELS.some((funnel) => funnel.id === funnelId);
}

export async function ensureFunnelSlotRow(funnelId: string) {
  if (!isKnownFunnelId(funnelId)) {
    throw new Error(`Unknown funnel id: ${funnelId}`);
  }

  const funnel = getFunnelById(funnelId);
  const defaultCapacity =
    (funnel && isReadyStoreV2Funnel(funnel) ? funnel.defaultSlotCapacity : undefined) ??
    DEFAULT_FUNNEL_SLOT_CAPACITY;

  return prisma.serviceFunnelSlot.upsert({
    where: { funnelId },
    create: {
      funnelId,
      slotCapacity: defaultCapacity,
    },
    update: {},
  });
}

export async function countPaidPurchasesForFunnel(funnelId: string): Promise<number> {
  return prisma.order.count({
    where: {
      funnelId,
      ...paidOrderWhere(),
    },
  });
}

export async function getFunnelSlotAvailability(
  funnelId: string,
): Promise<FunnelSlotAvailability | null> {
  const funnel = getFunnelById(funnelId);
  if (!funnel) return null;

  let row = await prisma.serviceFunnelSlot.findUnique({
    where: { funnelId },
    select: { slotCapacity: true },
  });

  if (!row) {
    await ensureFunnelSlotRow(funnelId);
    row = await prisma.serviceFunnelSlot.findUnique({
      where: { funnelId },
      select: { slotCapacity: true },
    });
  }

  const service = getServiceById(funnel.serviceId);
  const paidCount = await countPaidPurchasesForFunnel(funnelId);
  const capacity =
    row?.slotCapacity ??
    (isReadyStoreV2Funnel(funnel) ? funnel.defaultSlotCapacity : undefined) ??
    DEFAULT_FUNNEL_SLOT_CAPACITY;
  const remaining = computeRemainingSlots({ capacity, paidCount });

  return {
    funnelId,
    adminLabel: funnel.adminLabel,
    pagePath: funnel.pagePath,
    serviceId: funnel.serviceId,
    serviceName: service?.name ?? funnel.serviceId,
    capacity,
    paidCount,
    remaining,
    isSoldOut: remaining <= 0,
  };
}

export async function listFunnelSlotAvailabilities(): Promise<FunnelSlotAvailability[]> {
  const results: FunnelSlotAvailability[] = [];

  for (const funnel of SERVICE_FUNNELS) {
    const row = await getFunnelSlotAvailability(funnel.id);
    if (row) results.push(row);
  }

  return results;
}

export async function updateFunnelSlotCapacity(funnelId: string, slotCapacity: number) {
  if (!isKnownFunnelId(funnelId)) {
    throw new Error(`Funnel ${funnelId} is not configured.`);
  }
  if (!Number.isInteger(slotCapacity) || slotCapacity < 0) {
    throw new Error("slotCapacity must be a non-negative integer.");
  }

  await ensureFunnelSlotRow(funnelId);

  return prisma.serviceFunnelSlot.update({
    where: { funnelId },
    data: { slotCapacity },
    select: {
      funnelId: true,
      slotCapacity: true,
    },
  });
}
