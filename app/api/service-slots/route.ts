import { NextRequest, NextResponse } from "next/server";
import {
  getServiceSlotAvailability,
  listSlotManagedAvailabilities,
} from "@/lib/server/service-slots";

export async function GET(request: NextRequest) {
  const serviceId = request.nextUrl.searchParams.get("serviceId");

  if (serviceId) {
    const availability = await getServiceSlotAvailability(serviceId);
    if (!availability) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }
    return NextResponse.json({ availability });
  }

  const availabilities = await listSlotManagedAvailabilities();
  return NextResponse.json({ availabilities });
}
