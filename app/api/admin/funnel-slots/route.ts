import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { SERVICE_FUNNELS } from "@/config/service-funnels";
import { authOptions } from "@/lib/auth";
import {
  getFunnelSlotAvailability,
  listFunnelSlotAvailabilities,
  updateFunnelSlotCapacity,
} from "@/lib/server/funnel-slots";

const funnelIds = SERVICE_FUNNELS.map((funnel) => funnel.id) as [string, ...string[]];

const patchSchema = z.object({
  funnelId: z.enum(funnelIds),
  slotCapacity: z.number().int().min(0),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const availabilities = await listFunnelSlotAvailabilities();
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

    await updateFunnelSlotCapacity(parsed.data.funnelId, parsed.data.slotCapacity);

    const availability = await getFunnelSlotAvailability(parsed.data.funnelId);
    return NextResponse.json({ availability });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update funnel slots.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
