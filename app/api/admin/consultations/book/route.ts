import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { CONSULTATION_SLOT_BLOCKING_STATUSES } from "@/lib/consultation/slots";
import {
  getConsultationBookings,
  GoogleMeetCreationError,
  saveConsultationBooking,
} from "@/lib/server/consultation-bookings";
import { isConsultationSlotBlocked } from "@/lib/server/consultation-blocked-slots";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }
  return session;
}

const manualBookingSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().min(1).optional(),
  notes: z.string().trim().max(2000).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  meetingType: z.enum(["online", "in_person"]).default("online"),
  address: z.string().trim().optional(),
});

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const json = await req.json();
    const parsed = manualBookingSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid booking payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const today = formatDate(new Date());
    if (data.date < today) {
      return NextResponse.json(
        { error: "Не може да се резервира минал ден." },
        { status: 400 },
      );
    }

    if (
      data.meetingType === "in_person" &&
      (!data.address || data.address.length < 5)
    ) {
      return NextResponse.json(
        { error: "Адресът е задължителен за консултация на място." },
        { status: 400 },
      );
    }

    const [bookings, slotBlocked] = await Promise.all([
      getConsultationBookings(),
      isConsultationSlotBlocked(data.date, data.time),
    ]);

    if (slotBlocked) {
      return NextResponse.json(
        { error: "Този час е заключен. Отключете го първо от Календар." },
        { status: 409 },
      );
    }

    const slotTaken = bookings.some(
      (booking) =>
        CONSULTATION_SLOT_BLOCKING_STATUSES.has(booking.status) &&
        booking.date === data.date &&
        booking.time === data.time,
    );

    if (slotTaken) {
      return NextResponse.json(
        { error: "Този час вече е зает." },
        { status: 409 },
      );
    }

    const bookingRecord = {
      id: `CONS-${Date.now().toString(36).toUpperCase()}`,
      name: data.name,
      email: data.email,
      phone: data.phone?.trim() || "—",
      notes: data.notes,
      date: data.date,
      time: data.time,
      source: "admin" as const,
      sourcePage: "Админ — ръчна резервация",
      pagePath: "/admin/consultations",
      status: "scheduled" as const,
      meetingType: data.meetingType,
      address: data.meetingType === "in_person" ? data.address : undefined,
      createdAt: new Date().toISOString(),
    };

    const saved = await saveConsultationBooking(bookingRecord);

    return NextResponse.json({
      booking: {
        id: saved.id,
        date: saved.date,
        time: saved.time,
        source: saved.source,
        status: saved.status,
        timezone: saved.timezone ?? "Europe/Sofia",
        meetUrl: saved.meetUrl,
        calendarUrl: saved.calendarUrl,
        meetingType: saved.meetingType ?? "online",
        name: saved.name,
        email: saved.email,
      },
    });
  } catch (error) {
    if (error instanceof GoogleMeetCreationError) {
      return NextResponse.json(
        {
          error:
            "Google Meet / Calendar не можа да се създаде. Проверете Google OAuth правата.",
        },
        { status: 503 },
      );
    }

    console.error("Admin manual consultation booking failed:", error);
    return NextResponse.json(
      { error: "Неочаквана грешка при ръчната резервация." },
      { status: 500 },
    );
  }
}
