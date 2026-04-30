import { NextResponse } from "next/server";
import { z } from "zod";
import { updateConsultationBookingStatus } from "@/lib/server/consultation-bookings";

const paramsSchema = z.object({
  id: z.string().min(1),
});

const payloadSchema = z.object({
  status: z.enum(["scheduled", "attended", "absent"]),
});

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = paramsSchema.safeParse(await context.params);
    if (!params.success) {
      return NextResponse.json({ error: "Invalid consultation id." }, { status: 400 });
    }

    const json = await req.json();
    const parsed = payloadSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid status payload", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const updated = await updateConsultationBookingStatus(params.data.id, parsed.data.status);
    return NextResponse.json({ consultation: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update consultation status." }, { status: 500 });
  }
}
