import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import {
  SLOT_MANAGED_SERVICE_IDS,
  getServiceSlotAvailability,
  listSlotManagedAvailabilities,
  updateServiceSlotCapacity,
} from "@/lib/server/service-slots";

const patchSchema = z.object({
  serviceId: z.enum(SLOT_MANAGED_SERVICE_IDS),
  slotCapacity: z.number().int().min(0),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const availabilities = await listSlotManagedAvailabilities();
  return NextResponse.json({ availabilities });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    await updateServiceSlotCapacity(parsed.data.serviceId, parsed.data.slotCapacity);

    const availability = await getServiceSlotAvailability(parsed.data.serviceId);
    return NextResponse.json({ availability });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update slots.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
