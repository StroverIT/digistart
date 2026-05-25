import { NextResponse } from "next/server";
import { z } from "zod";
import { SLOT_MANAGED_SERVICE_IDS, createWaitlistEntry } from "@/lib/server/service-slots";

const payloadSchema = z.object({
  name: z.string().min(2, "Въведете две имена."),
  email: z.string().email("Въведете валиден имейл."),
  serviceId: z.enum(SLOT_MANAGED_SERVICE_IDS),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = payloadSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const entry = await createWaitlistEntry(parsed.data);
    return NextResponse.json({
      entry: {
        id: entry.id,
        name: entry.name,
        email: entry.email,
        serviceId: entry.serviceId,
        createdAt: entry.createdAt.toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save waitlist entry.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
