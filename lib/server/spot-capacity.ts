import { prisma } from "@/lib/prisma";

const DEFAULT_SPOT_LIMIT = 20;

/** Successful orders that consume a spot (aligned with user dashboard “real” orders). */
const COUNTABLE_STATUSES = ["paid", "in_progress", "completed"] as const;

export function getSpotLimit(): number {
  const raw = process.env.SPOT_LIMIT ?? process.env.NEXT_PUBLIC_SPOT_LIMIT;
  if (raw == null || raw === "") return DEFAULT_SPOT_LIMIT;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_SPOT_LIMIT;
}

export type SpotCapacity = {
  limit: number;
  used: number;
  remaining: number;
  isFull: boolean;
};

export async function getSpotCapacity(): Promise<SpotCapacity> {
  const limit = getSpotLimit();
  const used = await prisma.order.count({
    where: { status: { in: [...COUNTABLE_STATUSES] } },
  });
  const remaining = Math.max(0, limit - used);
  return {
    limit,
    used,
    remaining,
    isFull: remaining <= 0,
  };
}
