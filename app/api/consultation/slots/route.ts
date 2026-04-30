import { NextResponse } from "next/server";
import { getConsultationBookings } from "@/lib/server/consultation-bookings";

const SLOT_TIMES = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export async function GET() {
  const bookings = await getConsultationBookings();
  const bookedByDate = new Map<string, Set<string>>();

  for (const booking of bookings) {
    if (booking.status !== "scheduled") continue;
    if (!bookedByDate.has(booking.date)) {
      bookedByDate.set(booking.date, new Set<string>());
    }
    bookedByDate.get(booking.date)?.add(booking.time);
  }

  const days: { date: string; availableTimes: string[] }[] = [];
  let cursor = new Date();
  cursor.setDate(cursor.getDate() + 1);

  while (days.length < 10) {
    const dayOfWeek = cursor.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (!isWeekend) {
      const date = formatDate(cursor);
      const bookedTimes = bookedByDate.get(date) ?? new Set<string>();
      const availableTimes = SLOT_TIMES.filter((time) => !bookedTimes.has(time));

      days.push({ date, availableTimes });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return NextResponse.json({
    days,
    timezone: "Europe/Sofia",
    slotDurationMinutes: 60,
  });
}
