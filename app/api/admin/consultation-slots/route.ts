import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import {
  CONSULTATION_PUBLIC_DAY_COUNT,
  CONSULTATION_SLOT_BLOCKING_STATUSES,
  CONSULTATION_SLOT_TIMES,
  formatConsultationDateKey,
  isValidConsultationSlotTime,
} from "@/lib/consultation/slots";
import { getConsultationBookings } from "@/lib/server/consultation-bookings";
import {
  createConsultationBlockedSlot,
  deleteConsultationBlockedSlotByDateTime,
  listConsultationBlockedSlots,
} from "@/lib/server/consultation-blocked-slots";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session;
}

const lockSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  reason: z.string().trim().max(200).optional(),
});

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [bookings, blockedSlots] = await Promise.all([
    getConsultationBookings(),
    listConsultationBlockedSlots(),
  ]);

  const bookedByDate = new Map<
    string,
    Map<string, { name: string; id: string }>
  >();
  for (const booking of bookings) {
    if (!CONSULTATION_SLOT_BLOCKING_STATUSES.has(booking.status)) continue;
    if (!bookedByDate.has(booking.date)) {
      bookedByDate.set(booking.date, new Map());
    }
    bookedByDate.get(booking.date)?.set(booking.time, {
      name: booking.name,
      id: booking.id,
    });
  }

  const blockedByDate = new Map<
    string,
    Map<string, { id: string; reason?: string }>
  >();
  for (const blocked of blockedSlots) {
    if (!blockedByDate.has(blocked.date)) {
      blockedByDate.set(blocked.date, new Map());
    }
    blockedByDate.get(blocked.date)?.set(blocked.time, {
      id: blocked.id,
      reason: blocked.reason,
    });
  }

  const days: {
    date: string;
    availableTimes: string[];
    slots: {
      time: string;
      status: "available" | "booked" | "blocked";
      bookingId?: string;
      bookingName?: string;
      blockId?: string;
      reason?: string;
    }[];
  }[] = [];

  const cursor = new Date();
  cursor.setDate(cursor.getDate() + 1);

  while (days.length < CONSULTATION_PUBLIC_DAY_COUNT) {
    const date = formatConsultationDateKey(cursor);
    const bookedTimes = bookedByDate.get(date) ?? new Map();
    const blockedTimes = blockedByDate.get(date) ?? new Map();

    const slots = CONSULTATION_SLOT_TIMES.map((time) => {
      const booking = bookedTimes.get(time);
      if (booking) {
        return {
          time,
          status: "booked" as const,
          bookingId: booking.id,
          bookingName: booking.name,
        };
      }
      const block = blockedTimes.get(time);
      if (block) {
        return {
          time,
          status: "blocked" as const,
          blockId: block.id,
          reason: block.reason,
        };
      }
      return { time, status: "available" as const };
    });

    days.push({
      date,
      availableTimes: slots
        .filter((slot) => slot.status === "available")
        .map((slot) => slot.time),
      slots,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return NextResponse.json({
    days,
    timezone: "Europe/Sofia",
    slotDurationMinutes: 60,
  });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const json = await req.json();
    const parsed = lockSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid lock payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { date, time, reason } = parsed.data;
    if (!isValidConsultationSlotTime(time)) {
      return NextResponse.json({ error: "Invalid slot time." }, { status: 400 });
    }

    const today = formatConsultationDateKey(new Date());
    if (date <= today) {
      return NextResponse.json(
        { error: "Cannot lock same-day or past slots." },
        { status: 400 },
      );
    }

    const bookings = await getConsultationBookings();
    const slotTaken = bookings.some(
      (booking) =>
        CONSULTATION_SLOT_BLOCKING_STATUSES.has(booking.status) &&
        booking.date === date &&
        booking.time === time,
    );
    if (slotTaken) {
      return NextResponse.json(
        { error: "This slot already has a client booking." },
        { status: 409 },
      );
    }

    try {
      const blocked = await createConsultationBlockedSlot({ date, time, reason });
      return NextResponse.json({ blocked }, { status: 201 });
    } catch {
      return NextResponse.json(
        { error: "This slot is already locked." },
        { status: 409 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Unexpected error while locking slot." },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const json = await req.json();
    const parsed = lockSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid unlock payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const removed = await deleteConsultationBlockedSlotByDateTime(
      parsed.data.date,
      parsed.data.time,
    );
    if (!removed) {
      return NextResponse.json({ error: "Locked slot not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, blocked: removed });
  } catch {
    return NextResponse.json(
      { error: "Unexpected error while unlocking slot." },
      { status: 500 },
    );
  }
}
