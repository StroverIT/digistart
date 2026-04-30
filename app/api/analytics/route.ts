import { NextRequest, NextResponse } from "next/server";
import {
  isValidAnalyticsBatch,
  MAX_INGEST_BATCH_SIZE,
  storeAnalyticsEvents,
} from "@/lib/analytics/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const events = body?.events;

    if (!isValidAnalyticsBatch(events)) {
      return NextResponse.json(
        { error: `events array is required (max ${MAX_INGEST_BATCH_SIZE})` },
        { status: 400 },
      );
    }

    const inserted = await storeAnalyticsEvents(events);
    return NextResponse.json({ ok: true, inserted });
  } catch {
    return NextResponse.json(
      { error: "Failed to process analytics events" },
      { status: 500 },
    );
  }
}
