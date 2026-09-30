export const CONSULTATION_SLOT_TIMES = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
] as const;

export type ConsultationSlotTime = (typeof CONSULTATION_SLOT_TIMES)[number];

export const CONSULTATION_SLOT_BLOCKING_STATUSES = new Set([
  "scheduled",
  "attended",
  "absent",
]);

export const CONSULTATION_PUBLIC_DAY_COUNT = 10;

export function formatConsultationDateKey(date: Date) {
  return date.toISOString().split("T")[0];
}

export function isValidConsultationSlotTime(time: string): time is ConsultationSlotTime {
  return (CONSULTATION_SLOT_TIMES as readonly string[]).includes(time);
}
