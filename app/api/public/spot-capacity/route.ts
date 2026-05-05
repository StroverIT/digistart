import { NextResponse } from "next/server";
import { getSpotCapacity } from "@/lib/server/spot-capacity";

export async function GET() {
  const capacity = await getSpotCapacity();
  return NextResponse.json(capacity, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
