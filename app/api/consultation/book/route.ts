import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getConsultationBookings,
  saveConsultationBooking,
} from "@/lib/server/consultation-bookings";

const bookingSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().email(),
  phone: z.string().trim().min(6),
  company: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  source: z.enum(["public", "checkout"]).default("public"),
  orderId: z.string().trim().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bookingSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid booking payload", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const bookings = await getConsultationBookings();
    const slotTaken = bookings.some(
      (booking) =>
        booking.status === "scheduled" &&
        booking.date === data.date &&
        booking.time === data.time
    );

    if (slotTaken) {
      return NextResponse.json(
        { error: "This slot is already booked." },
        { status: 409 }
      );
    }

    const bookingRecord = {
      id: `CONS-${Date.now().toString(36).toUpperCase()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      notes: data.notes,
      date: data.date,
      time: data.time,
      source: data.source,
      status: "scheduled" as const,
      orderId: data.orderId,
      createdAt: new Date().toISOString(),
    };

    await saveConsultationBooking(bookingRecord);
    const refreshed = await getConsultationBookings();
    const saved = refreshed.find((booking) => booking.id === bookingRecord.id);

    return NextResponse.json({
      booking: {
        id: bookingRecord.id,
        date: bookingRecord.date,
        time: bookingRecord.time,
        source: bookingRecord.source,
        status: bookingRecord.status,
        orderId: bookingRecord.orderId,
        timezone: saved?.timezone ?? "Europe/Sofia",
        meetUrl: saved?.meetUrl,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unexpected error while booking consultation." },
      { status: 500 }
    );
  }
}
