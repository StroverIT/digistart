import { NextResponse } from "next/server";
import {
  CONSULTATION_PUBLIC_DAY_COUNT,
  CONSULTATION_SLOT_BLOCKING_STATUSES,
  CONSULTATION_SLOT_TIMES,
  formatConsultationDateKey,
} from "@/lib/consultation/slots";
import { getConsultationBookings } from "@/lib/server/consultation-bookings";
import { getBlockedTimesByDate } from "@/lib/server/consultation-blocked-slots";

export async function GET() {
  const [bookings, blockedByDate] = await Promise.all([
    getConsultationBookings(),
    getBlockedTimesByDate(),
  ]);
  const bookedByDate = new Map<string, Set<string>>();

  for (const booking of bookings) {
    if (!CONSULTATION_SLOT_BLOCKING_STATUSES.has(booking.status)) continue;
    if (!bookedByDate.has(booking.date)) {
      bookedByDate.set(booking.date, new Set<string>());
    }
    bookedByDate.get(booking.date)?.add(booking.time);
  }

  const days: { date: string; availableTimes: string[] }[] = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() + 1);

  while (days.length < CONSULTATION_PUBLIC_DAY_COUNT) {
    const date = formatConsultationDateKey(cursor);
    const bookedTimes = bookedByDate.get(date) ?? new Set<string>();
    const blockedTimes = blockedByDate.get(date) ?? new Set<string>();
    const availableTimes = CONSULTATION_SLOT_TIMES.filter(
      (time) => !bookedTimes.has(time) && !blockedTimes.has(time),
    );

    days.push({ date, availableTimes: [...availableTimes] });
    cursor.setDate(cursor.getDate() + 1);
  }

  return NextResponse.json({
    days,
    timezone: "Europe/Sofia",
    slotDurationMinutes: 60,
  });
}
