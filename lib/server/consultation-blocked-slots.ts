import { prisma } from "@/lib/prisma";

export type ConsultationBlockedSlotRecord = {
  id: string;
  date: string;
  time: string;
  reason?: string;
  createdAt: string;
};

function toRecord(row: {
  id: string;
  date: string;
  time: string;
  reason: string | null;
  createdAt: Date;
}): ConsultationBlockedSlotRecord {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    reason: row.reason ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listConsultationBlockedSlots(): Promise<
  ConsultationBlockedSlotRecord[]
> {
  const rows = await prisma.consultationBlockedSlot.findMany({
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });
  return rows.map(toRecord);
}

export async function getBlockedTimesByDate(): Promise<Map<string, Set<string>>> {
  const rows = await prisma.consultationBlockedSlot.findMany({
    select: { date: true, time: true },
  });
  const byDate = new Map<string, Set<string>>();
  for (const row of rows) {
    if (!byDate.has(row.date)) {
      byDate.set(row.date, new Set<string>());
    }
    byDate.get(row.date)?.add(row.time);
  }
  return byDate;
}

export async function isConsultationSlotBlocked(
  date: string,
  time: string,
): Promise<boolean> {
  const existing = await prisma.consultationBlockedSlot.findUnique({
    where: { date_time: { date, time } },
    select: { id: true },
  });
  return Boolean(existing);
}

export async function createConsultationBlockedSlot(input: {
  date: string;
  time: string;
  reason?: string;
}): Promise<ConsultationBlockedSlotRecord> {
  const row = await prisma.consultationBlockedSlot.create({
    data: {
      date: input.date,
      time: input.time,
      reason: input.reason?.trim() || null,
    },
  });
  return toRecord(row);
}

export async function deleteConsultationBlockedSlot(
  id: string,
): Promise<ConsultationBlockedSlotRecord | null> {
  try {
    const row = await prisma.consultationBlockedSlot.delete({
      where: { id },
    });
    return toRecord(row);
  } catch {
    return null;
  }
}

export async function deleteConsultationBlockedSlotByDateTime(
  date: string,
  time: string,
): Promise<ConsultationBlockedSlotRecord | null> {
  try {
    const row = await prisma.consultationBlockedSlot.delete({
      where: { date_time: { date, time } },
    });
    return toRecord(row);
  } catch {
    return null;
  }
}
