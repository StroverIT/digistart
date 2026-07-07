import { NextRequest, NextResponse } from "next/server";
import { COMPETITOR_PLATFORMS, type CompetitorPlatform } from "@/lib/funnel/competitor-platform";
import { prisma } from "@/lib/prisma";

const VALID_PLATFORMS = new Set<string>(COMPETITOR_PLATFORMS);
const MIN_OTHER_LABEL_LENGTH = 2;

interface FunnelCompetitorPayload {
  funnelId: string;
  platform: string;
  page?: string;
  sessionId?: string;
  otherLabel?: string;
}

function isValidPayload(body: unknown): body is FunnelCompetitorPayload {
  if (!body || typeof body !== "object") return false;
  const payload = body as FunnelCompetitorPayload;
  if (typeof payload.funnelId !== "string" || payload.funnelId.trim().length === 0) return false;
  if (!VALID_PLATFORMS.has(payload.platform)) return false;

  if (payload.platform === "other") {
    const label = typeof payload.otherLabel === "string" ? payload.otherLabel.trim() : "";
    if (label.length < MIN_OTHER_LABEL_LENGTH) return false;
  }

  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    if (!isValidPayload(body)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const platform = body.platform as CompetitorPlatform;
    const otherLabel =
      platform === "other" && typeof body.otherLabel === "string"
        ? body.otherLabel.trim()
        : undefined;

    await prisma.analyticsEvent.create({
      data: {
        eventType: "funnel_competitor_selection",
        page: body.page ?? "/",
        sessionId: body.sessionId ?? null,
        metadata: {
          funnel_id: body.funnelId.trim(),
          platform,
          ...(otherLabel ? { other_label: otherLabel } : {}),
        },
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to record selection" }, { status: 500 });
  }
}
