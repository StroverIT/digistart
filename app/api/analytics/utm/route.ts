import { NextRequest, NextResponse } from "next/server";
import { storeUtmLandingEvent } from "@/lib/analytics/server";
import type { UtmLandingEventPayload } from "@/lib/analytics/types";

function isValidUtmPayload(value: unknown): value is UtmLandingEventPayload {
  if (!value || typeof value !== "object") return false;
  const candidate = value as UtmLandingEventPayload;

  if (typeof candidate.page !== "string" || candidate.page.length === 0 || candidate.page.length > 500) {
    return false;
  }
  if (
    typeof candidate.fullUrl !== "string" ||
    candidate.fullUrl.length === 0 ||
    candidate.fullUrl.length > 2000
  ) {
    return false;
  }

  if (
    typeof candidate.dedupeKey !== "string" ||
    candidate.dedupeKey.length < 8 ||
    candidate.dedupeKey.length > 128
  ) {
    return false;
  }

  if (!candidate.utmPayload || typeof candidate.utmPayload !== "object") {
    return false;
  }

  const entries = Object.entries(candidate.utmPayload);
  if (entries.length === 0) return false;

  return entries.every(
    ([key, val]) =>
      key.startsWith("utm_") &&
      typeof val === "string" &&
      val.trim().length > 0 &&
      key.length <= 120 &&
      val.length <= 200,
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!isValidUtmPayload(body)) {
      return NextResponse.json({ error: "Invalid UTM event payload" }, { status: 400 });
    }

    const result = await storeUtmLandingEvent(body);
    return NextResponse.json({ ok: true, inserted: result.inserted });
  } catch {
    return NextResponse.json({ error: "Failed to process UTM event" }, { status: 500 });
  }
}
