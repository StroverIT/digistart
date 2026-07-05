import { NextRequest, NextResponse } from "next/server";
import {
  getFunnelSlotAvailability,
  listFunnelSlotAvailabilities,
} from "@/lib/server/funnel-slots";

export async function GET(request: NextRequest) {
  const funnelId = request.nextUrl.searchParams.get("funnelId");

  if (funnelId) {
    const availability = await getFunnelSlotAvailability(funnelId);
    if (!availability) {
      return NextResponse.json({ error: "Funnel not found." }, { status: 404 });
    }
    return NextResponse.json({ availability });
  }

  const availabilities = await listFunnelSlotAvailabilities();
  return NextResponse.json({ availabilities });
}
